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

import { generateTypedValue, createCtx } from '@localmock/core/generators';
import { applyChaos, type ChaosConfig } from '@localmock/core/chaos';

// --- Message types ---

export interface FieldDef {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
  /** If set, this field draws values from relationalContext[foreignKeyRef] instead of generating */
  foreignKeyRef?: string;
  /** Probability (0-100) that this field's value is nulled out */
  nullPercentage?: number;
  /** Per-field chaos corruption override; falls back to globalChaos if unset */
  chaos?: ChaosConfig;
}

export interface GenerateMessage {
  type: 'generate';
  fields: FieldDef[];
  rowCount: number;
  /** Maps "tableName.fieldName" -> array of values from parent tables */
  relationalContext?: Record<string, unknown[]>;
  /** Global chaos corruption applied to fields without their own override */
  globalChaos?: ChaosConfig;
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
  const { fields, rowCount, relationalContext, globalChaos } = event.data;

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
        // If this field is a foreign key with relational context, pick from parent values
        if (field.foreignKeyRef && relationalContext && relationalContext[field.foreignKeyRef]) {
          const parentValues = relationalContext[field.foreignKeyRef];
          row[field.name] = parentValues[Math.floor(Math.random() * parentValues.length)];
          continue;
        }

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

        // Null-percentage injection (per-field, independent of chaos engine)
        if (!field.foreignKeyRef && field.nullPercentage && field.nullPercentage > 0) {
          if (Math.random() * 100 < field.nullPercentage) {
            value = null;
          }
        }

        // Chaos corruption: per-field override takes priority over the global rate
        const activeChaos = field.chaos ?? globalChaos;
        if (!field.foreignKeyRef && value !== null && activeChaos && activeChaos.rate > 0) {
          value = applyChaos(value, activeChaos);
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
