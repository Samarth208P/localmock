#!/usr/bin/env node

/**
 * LocalMock CLI — Generate mock data from the command line.
 *
 * Usage:
 *   localmock --schema schema.json --rows 1000 --format json
 *   localmock --schema schema.json --rows 5000 --format csv -o output.csv
 *   cat schema.json | localmock --rows 100 --format sql --table users
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'node:fs';
import { parseSchema } from '@localmock/core/parser';
import { generateTypedValue, createCtx } from '@localmock/core/generators';
import { serializeCSV, serializeJSON, serializeJSONL, serializeSQL } from '@localmock/core/exports';

interface FieldDef {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
}

const program = new Command();

program
  .name('localmock')
  .description('Generate mock data from schema definitions')
  .version('0.1.0')
  .option('-s, --schema <path>', 'Path to schema JSON file (or pipe via stdin)')
  .option('-r, --rows <number>', 'Number of rows to generate', '1000')
  .option('-f, --format <type>', 'Output format: json, csv, jsonl, sql', 'json')
  .option('-o, --output <path>', 'Output file path (defaults to stdout)')
  .option('-t, --table <name>', 'Table name for SQL output', 'data')
  .option('--dialect <dialect>', 'SQL dialect: postgres, mysql, sqlite', 'postgres')
  .action(async (opts) => {
    try {
      const fields = loadSchema(opts.schema);
      const rowCount = parseInt(opts.rows, 10);

      if (isNaN(rowCount) || rowCount < 1) {
        console.error('Error: --rows must be a positive integer');
        process.exit(1);
      }

      const rows = generateRows(fields, rowCount);
      const output = serialize(rows, opts.format, opts.table, opts.dialect);

      if (opts.output) {
        writeFileSync(opts.output, output, 'utf-8');
        console.error(`Written ${rowCount.toLocaleString()} rows to ${opts.output}`);
      } else {
        process.stdout.write(output);
      }
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();

// --- Helpers ---

function loadSchema(schemaPath?: string): FieldDef[] {
  let raw: string;

  if (schemaPath) {
    raw = readFileSync(schemaPath, 'utf-8');
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    raw = readFileSync(0, 'utf-8');
  } else {
    throw new Error('No schema provided. Use --schema <path> or pipe JSON to stdin.');
  }

  // Try JSON field array format first
  try {
    const parsed = JSON.parse(raw);

    // Direct field array: [{ name, typeId, options, unique }]
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].typeId) {
      return parsed.map((f: any) => ({
        name: f.name || f.n,
        typeId: f.typeId || f.t,
        options: f.options || f.o || {},
        unique: f.unique || f.u || false,
      }));
    }

    // Template format: { name, description, fields: [...] }
    if (parsed.fields && Array.isArray(parsed.fields)) {
      return parsed.fields.map((f: any) => ({
        name: f.name,
        typeId: f.typeId,
        options: f.options || {},
        unique: f.unique || false,
      }));
    }
  } catch {
    // Not JSON — try schema parsing (TypeScript, Prisma, etc.)
  }

  // Fallback: use core schema parser
  const result = parseSchema(raw);
  if (result.errors.length > 0) {
    throw new Error(`Schema parse error: ${result.errors[0]}`);
  }
  if (result.tables.length === 0) {
    throw new Error('No tables found in schema');
  }

  return result.tables[0].fields.map((f) => ({
    name: f.name,
    typeId: f.inferredType,
    options: {},
    unique: false,
  }));
}

function generateRows(fields: FieldDef[], rowCount: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const uniqueSets = new Map<string, Set<unknown>>();
  const counters = new Map<string, number>();

  for (const field of fields) {
    if (field.unique) uniqueSets.set(field.name, new Set());
    if (field.typeId === 'autoIncrement') counters.set(field.name, 0);
  }

  for (let i = 0; i < rowCount; i++) {
    const ctx = createCtx();
    const row: Record<string, unknown> = {};

    for (const field of fields) {
      const opts = { ...field.options };

      if (field.typeId === 'autoIncrement') {
        const count = counters.get(field.name) || 0;
        opts.__counter = count;
        counters.set(field.name, count + 1);
      }

      let value: unknown;

      if (field.unique) {
        const seen = uniqueSets.get(field.name)!;
        let attempts = 0;
        do {
          const retryCtx = attempts === 0 ? ctx : createCtx();
          value = generateTypedValue(field.typeId, opts, retryCtx);
          attempts++;
          if (attempts > 50) {
            throw new Error(
              `Unique pool exhausted for "${field.name}" (${field.typeId}) at row ${i}`,
            );
          }
        } while (seen.has(value));
        seen.add(value);
      } else {
        value = generateTypedValue(field.typeId, opts, ctx);
      }

      row[field.name] = value;
    }

    rows.push(row);
  }

  return rows;
}

function serialize(
  rows: Record<string, unknown>[],
  format: string,
  tableName: string,
  dialect: string,
): string {
  switch (format) {
    case 'csv':
      return serializeCSV(rows);
    case 'json':
      return serializeJSON(rows);
    case 'jsonl':
      return serializeJSONL(rows);
    case 'sql':
      return serializeSQL(rows, tableName, dialect as 'postgres' | 'mysql' | 'sqlite');
    default:
      throw new Error(`Unsupported format: ${format}. Use json, csv, jsonl, or sql.`);
  }
}
