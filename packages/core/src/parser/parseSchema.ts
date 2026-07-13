import type { ParseResult, ParsedTable, RelationEdge } from './types';
import { detectFormat } from './detectFormat';
import { classifyField } from './heuristics';

/**
 * Main entry point for the schema parser pipeline.
 * Accepts raw input string and returns structured ParseResult.
 */
export function parseSchema(input: string): ParseResult {
  const format = detectFormat(input);
  const errors: string[] = [];

  try {
    switch (format) {
      case 'json':
        return { format, tables: parseJSON(input), errors };
      case 'typescript':
        return { format, tables: parseTypeScript(input), errors };
      case 'prisma':
        return { format, tables: parsePrisma(input), errors };
      default:
        errors.push('Unable to detect schema format. Try JSON, TypeScript interface, or Prisma schema.');
        return { format: 'unknown', tables: [], errors };
    }
  } catch (err) {
    errors.push(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return { format, tables: [], errors };
  }
}

/**
 * Parse a JSON object/array into table definitions.
 * Supports: { key: "type" } or { key: value } or [{ key: value }]
 */
function parseJSON(input: string): ParsedTable[] {
  const parsed = JSON.parse(input);

  // Array of objects: treat first element as schema
  const obj = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!obj || typeof obj !== 'object') return [];

  const fields = Object.entries(obj).map(([key, value]) => {
    const typeHint = typeof value === 'string' ? value : typeof value;
    return classifyField(key, typeHint);
  });

  return [{ name: 'data', fields, relations: [] }];
}

/**
 * Parse TypeScript interface(s) into table definitions.
 * Uses regex-based tokenization (not full AST).
 */
function parseTypeScript(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Match interface blocks
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = interfaceRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseInterfaceBody(body);
    tables.push({ name, fields, relations: [] });
  }

  // Also match type aliases with object literals
  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{([^}]+)\}/g;
  while ((match = typeRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseInterfaceBody(body);
    tables.push({ name, fields, relations: [] });
  }

  return tables;
}

/**
 * Parse the body of a TypeScript interface into field classifications.
 */
function parseInterfaceBody(body: string) {
  const lines = body.split(/[;\n]/).filter((l) => l.trim());

  return lines
    .map((line) => {
      const trimmed = line.trim();
      // Match: fieldName: Type or fieldName?: Type
      const fieldMatch = trimmed.match(/^(\w+)\??\s*:\s*(.+)$/);
      if (!fieldMatch) return null;

      const [, name, typeStr] = fieldMatch;
      const cleanType = typeStr.replace(/[,;]$/, '').trim();
      return classifyField(name, cleanType);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

/**
 * Parse Prisma schema model(s) into table definitions.
 * Detects @relation directives for DAG edge creation.
 */
function parsePrisma(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Match model blocks
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const { fields, relations } = parsePrismaBody(name, body);
    tables.push({ name, fields, relations });
  }

  return tables;
}

/**
 * Parse Prisma model body, extracting fields and @relation edges.
 */
function parsePrismaBody(tableName: string, body: string) {
  const lines = body.split('\n').filter((l) => l.trim());
  const fields: ReturnType<typeof classifyField>[] = [];
  const relations: RelationEdge[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and decorators-only lines
    if (trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;

    // Match: fieldName Type @decorators
    const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\?|\[\])?\s*(.*)?$/);
    if (!fieldMatch) continue;

    const [, fieldName, prismaType, , decorators = ''] = fieldMatch;

    // Detect @relation
    const relationMatch = decorators.match(/@relation\(.*?references:\s*\[(\w+)\].*?\)/);
    if (relationMatch) {
      // This field is a relation reference
      relations.push({
        fromTable: tableName,
        fromField: fieldName,
        toTable: prismaType,
        toField: relationMatch[1],
        cardinality: '1:N',
      });
      continue; // Don't add relation fields as data columns
    }

    // Skip @id primary keys that are autoincrement
    if (decorators.includes('@default(autoincrement())')) {
      fields.push(classifyField(fieldName, 'integer'));
      continue;
    }

    // Map Prisma types to hints
    const typeMap: Record<string, string> = {
      String: 'string',
      Int: 'number',
      Float: 'number',
      Boolean: 'boolean',
      DateTime: 'date',
      Json: 'string',
      BigInt: 'number',
      Decimal: 'number',
    };

    const typeHint = typeMap[prismaType] || 'string';
    fields.push(classifyField(fieldName, typeHint));
  }

  return { fields, relations };
}
