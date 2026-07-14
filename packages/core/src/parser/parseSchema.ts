import type { ParseResult, ParsedTable, RelationEdge } from './types';
import { detectFormat } from './detectFormat';
import { classifyField } from './heuristics';

/**
 * Main entry point for the schema parser pipeline.
 * Accepts raw input string and returns structured ParseResult.
 * Supports: JSON, TypeScript, Prisma, Go, Python, Rust, SQL.
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
      case 'go':
        return { format, tables: parseGo(input), errors };
      case 'python':
        return { format, tables: parsePython(input), errors };
      case 'rust':
        return { format, tables: parseRust(input), errors };
      case 'sql':
        return { format, tables: parseSQL(input), errors };
      default:
        // Try a generic fallback: treat as key-type pairs
        const fallback = parseGenericKeyValue(input);
        if (fallback.length > 0) {
          return { format: 'unknown', tables: fallback, errors };
        }
        errors.push('Could not detect schema format. Try TypeScript, Prisma, JSON, Go, Python, Rust, or SQL.');
        return { format: 'unknown', tables: [], errors };
    }
  } catch (err) {
    errors.push(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return { format, tables: [], errors };
  }
}

// --- JSON ---

function parseJSON(input: string): ParsedTable[] {
  const parsed = JSON.parse(input, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
  const obj = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!obj || typeof obj !== 'object') return [];

  const fields = Object.entries(obj).map(([key, value]) => {
    const typeHint = typeof value === 'string' ? value : typeof value;
    return classifyField(key, typeHint);
  });

  return [{ name: 'data', fields, relations: [] }];
}

// --- TypeScript ---

function parseTypeScript(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = interfaceRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseInterfaceBody(body);
    tables.push({ name, fields, relations: [] });
  }

  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{([^}]+)\}/g;
  while ((match = typeRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseInterfaceBody(body);
    tables.push({ name, fields, relations: [] });
  }

  return tables;
}

function parseInterfaceBody(body: string) {
  const lines = body.split(/[;\n]/).filter((l) => l.trim());

  return lines
    .map((line) => {
      const trimmed = line.trim();
      const fieldMatch = trimmed.match(/^(\w+)\??\s*:\s*(.+)$/);
      if (!fieldMatch) return null;

      const [, name, typeStr] = fieldMatch;
      const cleanType = typeStr.replace(/[,;]$/, '').trim();
      return classifyField(name, cleanType);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

// --- Prisma ---

function parsePrisma(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
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

function parsePrismaBody(tableName: string, body: string) {
  const lines = body.split('\n').filter((l) => l.trim());
  const fields: ReturnType<typeof classifyField>[] = [];
  const relations: RelationEdge[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;

    const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\?|\[\])?\s*(.*)?$/);
    if (!fieldMatch) continue;

    const [, fieldName, prismaType, , decorators = ''] = fieldMatch;

    const relationMatch = decorators.match(/@relation\(.*?references:\s*\[(\w+)\].*?\)/);
    if (relationMatch) {
      relations.push({
        fromTable: tableName,
        fromField: fieldName,
        toTable: prismaType,
        toField: relationMatch[1],
        cardinality: '1:N',
      });
      continue;
    }

    if (decorators.includes('@default(autoincrement())')) {
      fields.push(classifyField(fieldName, 'integer'));
      continue;
    }

    const typeMap: Record<string, string> = {
      String: 'string', Int: 'number', Float: 'number', Boolean: 'boolean',
      DateTime: 'date', Json: 'string', BigInt: 'number', Decimal: 'number',
    };

    const typeHint = typeMap[prismaType] || 'string';
    fields.push(classifyField(fieldName, typeHint));
  }

  return { fields, relations };
}

// --- Go ---

function parseGo(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const structRegex = /type\s+(\w+)\s+struct\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = structRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseGoBody(body);
    tables.push({ name, fields, relations: [] });
  }

  return tables;
}

function parseGoBody(body: string) {
  const lines = body.split('\n').filter((l) => l.trim());

  return lines
    .map((line) => {
      const trimmed = line.trim();
      // Go field: FieldName Type `json:"field_name"`
      const fieldMatch = trimmed.match(/^(\w+)\s+(\S+)/);
      if (!fieldMatch) return null;

      const [, name, goType] = fieldMatch;
      const typeMap: Record<string, string> = {
        string: 'string', int: 'number', int32: 'number', int64: 'number',
        float32: 'number', float64: 'number', bool: 'boolean',
        'time.Time': 'date', uuid: 'string',
      };

      // Extract json tag for field name
      const jsonTag = trimmed.match(/`json:"(\w+)/);
      const fieldName = jsonTag ? jsonTag[1] : name.charAt(0).toLowerCase() + name.slice(1);

      const typeHint = typeMap[goType] || 'string';
      return classifyField(fieldName, typeHint);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

// --- Python ---

function parsePython(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Match class Name: or @dataclass class Name:
  const classRegex = /class\s+(\w+)[^:]*:\s*\n((?:\s+.+\n?)*)/g;
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parsePythonBody(body);
    if (fields.length > 0) {
      tables.push({ name, fields, relations: [] });
    }
  }

  return tables;
}

function parsePythonBody(body: string) {
  const lines = body.split('\n').filter((l) => l.trim());

  return lines
    .map((line) => {
      const trimmed = line.trim();
      // Python type hint: field_name: Type or field_name: Type = default
      const fieldMatch = trimmed.match(/^(\w+)\s*:\s*(\w+)/);
      if (!fieldMatch) return null;

      const [, name, pyType] = fieldMatch;
      if (name.startsWith('_') || name === 'class') return null;

      const typeMap: Record<string, string> = {
        str: 'string', int: 'number', float: 'number', bool: 'boolean',
        datetime: 'date', Optional: 'string', List: 'string', Dict: 'string',
        UUID: 'string', Decimal: 'number',
      };

      const typeHint = typeMap[pyType] || 'string';
      return classifyField(name, typeHint);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

// --- Rust ---

function parseRust(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const structRegex = /(pub\s+)?struct\s+(\w+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = structRegex.exec(input)) !== null) {
    const name = match[2];
    const body = match[3];
    const fields = parseRustBody(body);
    tables.push({ name, fields, relations: [] });
  }

  return tables;
}

function parseRustBody(body: string) {
  const lines = body.split(',').map((l) => l.trim()).filter(Boolean);

  return lines
    .map((line) => {
      // pub field_name: Type
      const fieldMatch = line.match(/(?:pub\s+)?(\w+)\s*:\s*(\S+)/);
      if (!fieldMatch) return null;

      const [, name, rustType] = fieldMatch;
      const typeMap: Record<string, string> = {
        String: 'string', '&str': 'string', i32: 'number', i64: 'number',
        u32: 'number', u64: 'number', f32: 'number', f64: 'number',
        bool: 'boolean', Uuid: 'string', NaiveDateTime: 'date',
        'chrono::DateTime': 'date',
      };

      // Clean generic wrappers: Option<String> -> String
      const cleanType = rustType.replace(/Option<(.+)>/, '$1').replace(/Vec<(.+)>/, '$1');
      const typeHint = typeMap[cleanType] || 'string';
      return classifyField(name, typeHint);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

// --- SQL CREATE TABLE ---

function parseSQL(input: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([^)]+)\)/gi;
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(input)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = parseSQLBody(body);
    tables.push({ name, fields, relations: [] });
  }

  return tables;
}

function parseSQLBody(body: string) {
  const lines = body.split(',').map((l) => l.trim()).filter(Boolean);

  return lines
    .map((line) => {
      // Skip constraints
      if (/^\s*(PRIMARY|FOREIGN|UNIQUE|INDEX|KEY|CONSTRAINT|CHECK)/i.test(line)) return null;

      const fieldMatch = line.match(/[`"']?(\w+)[`"']?\s+(\w+)/);
      if (!fieldMatch) return null;

      const [, name, sqlType] = fieldMatch;
      const upper = sqlType.toUpperCase();

      let typeHint = 'string';
      if (['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'SERIAL'].includes(upper)) typeHint = 'number';
      else if (['FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC', 'REAL'].includes(upper)) typeHint = 'number';
      else if (['BOOLEAN', 'BOOL'].includes(upper)) typeHint = 'boolean';
      else if (['DATE', 'DATETIME', 'TIMESTAMP', 'TIMESTAMPTZ'].includes(upper)) typeHint = 'date';
      else if (['UUID'].includes(upper)) typeHint = 'string';

      return classifyField(name, typeHint);
    })
    .filter(Boolean) as ReturnType<typeof classifyField>[];
}

// --- Generic fallback: key-value pairs ---

function parseGenericKeyValue(input: string): ParsedTable[] {
  const lines = input.split('\n').filter((l) => l.trim());
  const fields: ReturnType<typeof classifyField>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Try: "key: type" or "key = type" or "key type"
    const match = trimmed.match(/^[`"']?(\w+)[`"']?\s*[:=]\s*[`"']?(\w+)/);
    if (match) {
      fields.push(classifyField(match[1], match[2]));
    }
  }

  if (fields.length === 0) return [];
  return [{ name: 'data', fields, relations: [] }];
}
