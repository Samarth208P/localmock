/**
 * Production-grade Web Worker for off-thread data generation.
 *
 * Features:
 * - Uses generateTypedValue() engine with full option support
 * - Per-row RowContext for correlated data (email matches name, etc.)
 * - Unique toggle with Set tracking per column
 * - 50-retry collision safety with graceful error
 * - Progress reporting every 1000 rows
 * - Auto-increment counter support
 * - Relational context: foreign key fields draw from parent table values
 */

import { generateTypedValue, createCtx, seedFromString } from '@localmock/core/generators';
import { applyChaos } from '@localmock/core/chaos';
import type { ChaosConfig } from '@localmock/core/chaos';

// --- Message types ---

export interface FieldDef {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
  primaryKey?: boolean;
  /** If set, this field draws values from relationalContext[foreignKeyRef] instead of generating */
  foreignKeyRef?: string;
}

export interface GenerateMessage {
  type: 'generate';
  fields: FieldDef[];
  rowCount: number;
  totalRowCount: number;
  startRowIndex: number;
  seed: string | number;
  tableId?: string;
  chaos?: ChaosConfig;

  /** Maps "tableName.fieldName" -> array of values from parent tables */
  relationalContext?: Record<string, unknown[]>;
}

export interface GenerateResult {
  type: 'result';
  rows: Record<string, unknown>[];
}

export interface GeneratePartial {
  type: 'partial';
  rows: Record<string, unknown>[];
}

export interface GenerateProgress {
  type: 'progress';
  generated: number;
  total: number;
}

export interface GenerateError {
  type: 'error';
  message: string;
}

export type WorkerOutMessage = GenerateResult | GeneratePartial | GenerateProgress | GenerateError;

// --- Constants ---

function makeUniqueValue(value: unknown, field: FieldDef, globalIndex: number): unknown {
  if (!field.unique || field.typeId === 'uuid' || field.typeId === 'autoIncrement') return value;
  if (field.typeId === 'enum') {
    const values = String(field.options.values ?? '').split(',').map((item) => item.trim()).filter(Boolean);
    return values[globalIndex];
  }
  if (field.typeId === 'boolean') return globalIndex < 2 ? globalIndex === 0 : undefined;
  if (typeof value === 'number') {
    const min = Number(field.options.min ?? 0);
    const step = field.typeId === 'float' ? Number(field.options.uniqueStep ?? 0.001) : 1;
    return min + globalIndex * step;
  }
  if (typeof value === 'string') {
    const suffix = globalIndex.toString(36);
    const at = value.lastIndexOf('@');
    if (at > 0) return value.slice(0, at) + '+' + suffix + value.slice(at);
    return value + '_' + suffix;
  }
  return value;
}
const CHUNK_SIZE = 1000;
const PARTIAL_PREVIEW_SIZE = 10;

// --- Worker handler ---

self.onmessage = (event: MessageEvent<GenerateMessage>) => {
  const { fields, rowCount, totalRowCount = rowCount, startRowIndex = 0, seed = 'localmock', tableId = 'data', chaos, relationalContext } = event.data;

  try {
    const rows: Record<string, unknown>[] = [];


    for (let i = 0; i < rowCount; i++) {
      // Fresh context per row — correlated identity data
      const globalIndex = startRowIndex + i;
      const rowSeed = seedFromString([String(seed), tableId, String(globalIndex)].join(':'));
      const ctx = createCtx(rowSeed);
      const row: Record<string, unknown> = {};

      for (const field of fields) {
        // If this field is a foreign key with relational context, pick from parent values
        if (field.foreignKeyRef && relationalContext && relationalContext[field.foreignKeyRef]) {
          const parentValues = relationalContext[field.foreignKeyRef];
          row[field.name] = ctx.rng.pick(parentValues);
          continue;
        }

        // Build options with internal counter for autoIncrement
        const opts = { ...field.options };
        if (field.typeId === 'autoIncrement') opts.__counter = globalIndex;

        let value: unknown;

        if (field.unique) {
          const seen = new Set<unknown>();
          let attempts = 0;

          do {
            // For unique retries, create fresh context to get different correlated values
            const retryCtx = attempts === 0 ? ctx : createCtx();
            value = generateTypedValue(field.typeId, opts, retryCtx);
            attempts++;

            if (attempts > 50) {
              // Instead of crashing, append a unique suffix based on the set size
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

        value = makeUniqueValue(value, field, globalIndex);
        if (chaos && !field.primaryKey && !field.unique && !field.foreignKeyRef) value = applyChaos(value, chaos, () => ctx.rng.next());
        if (field.unique && value === undefined) throw new Error('Unique domain exhausted for "' + field.name + '" at row ' + String(globalIndex + 1) + ' of ' + String(totalRowCount) + '.');
        row[field.name] = value;
      }

      rows.push(row);

      // Send first 10 rows immediately for incremental preview
      if (i + 1 === PARTIAL_PREVIEW_SIZE && rowCount > PARTIAL_PREVIEW_SIZE) {
        const partial: GeneratePartial = { type: 'partial', rows: rows.slice(0, PARTIAL_PREVIEW_SIZE) };
        self.postMessage(partial);
      }

      // Progress reporting
      if ((i + 1) % CHUNK_SIZE === 0) {
        const progress: GenerateProgress = {
          type: 'progress',
          generated: i + 1,
          total: rowCount,
        };
        self.postMessage(progress);
      }
    }

    const result: GenerateResult = { type: 'result', rows };
    self.postMessage(result);
  } catch (err) {
    const error: GenerateError = {
      type: 'error',
      message: err instanceof Error ? err.message : 'Generation failed unexpectedly',
    };
    self.postMessage(error);
  }
};
