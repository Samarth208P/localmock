/**
 * Comlink-wrapped generation worker.
 * Exposes a clean async API via Comlink.expose().
 *
 * Usage from main thread:
 *   const worker = new Worker(...)
 *   const api = Comlink.wrap<GenerationAPI>(worker)
 *   const rows = await api.generate(fields, 1000)
 */

import * as Comlink from 'comlink';
import { generateTypedValue, createCtx } from '@localmock/core/generators';

export interface FieldDef {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
}

export interface GenerationAPI {
  generate: (fields: FieldDef[], rowCount: number) => Record<string, unknown>[];
  generateChunk: (fields: FieldDef[], rowCount: number, startCounter: number) => Record<string, unknown>[];
}

const COLLISION_LIMIT = 50;

const api: GenerationAPI = {
  /**
   * Generate a full set of rows.
   */
  generate(fields: FieldDef[], rowCount: number): Record<string, unknown>[] {
    return generateRows(fields, rowCount, 0);
  },

  /**
   * Generate a chunk with an offset counter (for worker pool coordination).
   */
  generateChunk(fields: FieldDef[], rowCount: number, startCounter: number): Record<string, unknown>[] {
    return generateRows(fields, rowCount, startCounter);
  },
};

function generateRows(fields: FieldDef[], rowCount: number, counterOffset: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  // Unique tracking
  const uniqueSets = new Map<string, Set<unknown>>();
  for (const field of fields) {
    if (field.unique) uniqueSets.set(field.name, new Set());
  }

  // Auto-increment counters
  const counters = new Map<string, number>();
  for (const field of fields) {
    if (field.typeId === 'autoIncrement') {
      counters.set(field.name, counterOffset);
    }
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

          if (attempts > COLLISION_LIMIT) {
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

Comlink.expose(api);
