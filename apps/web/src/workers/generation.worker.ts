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
 */

import { generateTypedValue, createCtx } from '@localmock/core/generators';

// --- Message types ---

export interface FieldDef {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
}

export interface GenerateMessage {
  type: 'generate';
  fields: FieldDef[];
  rowCount: number;
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

const COLLISION_LIMIT = 50;
const CHUNK_SIZE = 1000;
const PARTIAL_PREVIEW_SIZE = 10;

// --- Worker handler ---

self.onmessage = (event: MessageEvent<GenerateMessage>) => {
  const { fields, rowCount } = event.data;

  try {
    const rows: Record<string, unknown>[] = [];

    // Unique tracking: one Set per unique-enabled column
    const uniqueSets: Map<string, Set<unknown>> = new Map();
    for (const field of fields) {
      if (field.unique) {
        uniqueSets.set(field.name, new Set());
      }
    }

    // Auto-increment counters per column
    const counters: Map<string, number> = new Map();
    for (const field of fields) {
      if (field.typeId === 'autoIncrement') {
        counters.set(field.name, 0);
      }
    }

    for (let i = 0; i < rowCount; i++) {
      // Fresh context per row — correlated identity data
      const ctx = createCtx();
      const row: Record<string, unknown> = {};

      for (const field of fields) {
        // Build options with internal counter for autoIncrement
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
            // For unique retries, create fresh context to get different correlated values
            const retryCtx = attempts === 0 ? ctx : createCtx();
            value = generateTypedValue(field.typeId, opts, retryCtx);
            attempts++;

            if (attempts > COLLISION_LIMIT) {
              const error: GenerateError = {
                type: 'error',
                message: `Cannot generate ${rowCount.toLocaleString()} unique values for "${field.name}" (${field.typeId}). Pool exhausted after ${seen.size} unique values. Reduce row count or disable Unique for this field.`,
              };
              self.postMessage(error);
              return;
            }
          } while (seen.has(value));

          seen.add(value);
        } else {
          value = generateTypedValue(field.typeId, opts, ctx);
        }

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
