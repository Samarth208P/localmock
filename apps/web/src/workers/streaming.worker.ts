/**
 * Streaming generation worker.
 * For large datasets (>50k rows), generates data in chunks and streams text
 * back to the main thread which writes it to a file via File System Access API.
 *
 * Messages:
 *  IN:  { type: 'stream-generate', fields, rowCount, format, tableName, sqlDialect }
 *  OUT: { type: 'chunk', text }          — a chunk of serialized text
 *  OUT: { type: 'stream-progress', generated, total, eta }
 *  OUT: { type: 'stream-done', totalRows }
 *  OUT: { type: 'stream-error', message }
 */

import { generateTypedValue, createCtx } from '@localmock/core/generators';
import type { FieldDef } from './generation.worker';

const CHUNK_SIZE = 1000;

interface StreamMessage {
  type: 'stream-generate';
  fields: FieldDef[];
  rowCount: number;
  format: 'csv' | 'json' | 'jsonl' | 'sql';
  tableName: string;
  sqlDialect?: 'postgres' | 'mysql' | 'sqlite';
}

self.onmessage = (event: MessageEvent<StreamMessage>) => {
  const { fields, rowCount, format, tableName } = event.data;

  try {
    const startTime = performance.now();
    let generated = 0;

    // Write header
    const header = getHeader(fields, format);
    if (header) {
      self.postMessage({ type: 'chunk', text: header });
    }

    // Unique tracking
    const uniqueSets: Map<string, Set<unknown>> = new Map();
    for (const field of fields) {
      if (field.unique) uniqueSets.set(field.name, new Set());
    }

    // Auto-increment counters
    const counters: Map<string, number> = new Map();
    for (const field of fields) {
      if (field.typeId === 'autoIncrement') counters.set(field.name, 0);
    }

    // Generate in chunks
    for (let chunkStart = 0; chunkStart < rowCount; chunkStart += CHUNK_SIZE) {
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, rowCount);
      let chunkText = '';

      for (let i = chunkStart; i < chunkEnd; i++) {
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
                value = typeof value === 'string' 
                  ? `${value}_${seen.size}`
                  : typeof value === 'number' 
                    ? value + seen.size 
                    : value;
                break;
              }
            } while (seen.has(value));
            seen.add(value);
          } else {
            value = generateTypedValue(field.typeId, opts, ctx);
          }
          row[field.name] = value;
        }

        chunkText += serializeRow(row, fields, format, tableName, i === 0 && chunkStart === 0);
        generated++;
      }

      self.postMessage({ type: 'chunk', text: chunkText });

      // Progress with ETA
      const elapsed = performance.now() - startTime;
      const rate = generated / elapsed; // rows per ms
      const remaining = rowCount - generated;
      const eta = Math.round(remaining / rate / 1000); // seconds

      self.postMessage({
        type: 'stream-progress',
        generated,
        total: rowCount,
        eta,
      });
    }

    // Write footer
    const footer = getFooter(format);
    if (footer) {
      self.postMessage({ type: 'chunk', text: footer });
    }

    self.postMessage({ type: 'stream-done', totalRows: generated });
  } catch (err) {
    self.postMessage({
      type: 'stream-error',
      message: err instanceof Error ? err.message : 'Streaming generation failed',
    });
  }
};

function getHeader(fields: FieldDef[], format: string): string {
  switch (format) {
    case 'csv':
      return fields.map((f) => f.name).join(',') + '\n';
    case 'json':
      return '[\n';
    case 'jsonl':
      return '';
    case 'sql':
      return '';
    default:
      return '';
  }
}

function getFooter(format: string): string {
  switch (format) {
    case 'json':
      return ']\n';
    default:
      return '';
  }
}

function serializeRow(
  row: Record<string, unknown>,
  fields: FieldDef[],
  format: string,
  tableName: string,
  isFirst?: boolean,
): string {
  switch (format) {
    case 'csv':
      return fields.map((f) => csvEscape(row[f.name])).join(',') + '\n';
    case 'json':
      return (isFirst ? '  ' : ',\n  ') + JSON.stringify(row);
    case 'jsonl':
      return JSON.stringify(row) + '\n';
    case 'sql': {
      const cols = fields.map((f) => f.name).join(', ');
      const vals = fields.map((f) => sqlEscape(row[f.name])).join(', ');
      return `INSERT INTO ${tableName} (${cols}) VALUES (${vals});\n`;
    }
    default:
      return JSON.stringify(row) + '\n';
  }
}

function csvEscape(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function sqlEscape(value: unknown): string {
  if (value == null) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return "'" + String(value).replace(/'/g, "''") + "'";
}
