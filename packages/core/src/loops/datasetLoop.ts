import type { GenerationJob, GenerationJobField } from '../jobs/types';
import { createRng, seedFromString } from '../generators/rng';
import { runLoop } from './runLoop';
import type { LoopDiagnostic, LoopResult, LoopTraceEntry, LoopValidation } from './types';

export type DataRow = Record<string, unknown>;
export type CanonicalDataset = Record<string, DataRow[]>;

const NUMERIC_TYPES = new Set(['number', 'integer', 'float', 'age', 'autoIncrement', 'latitude', 'longitude', 'percentage']);
const BOOLEAN_TYPES = new Set(['boolean']);
const OBJECT_TYPES = new Set(['json', 'object']);

function stableValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') return JSON.stringify(value);
  return `${typeof value}:${String(value)}`;
}

function diagnostic(
  code: string,
  path: string,
  message: string,
  repairable: boolean,
  details?: Record<string, unknown>,
  suggestedActions?: string[],
): LoopDiagnostic {
  return { code, path, message, severity: 'error', retryable: repairable, repairable, details, suggestedActions };
}

function valueMatchesType(field: GenerationJobField, value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (NUMERIC_TYPES.has(field.type)) return typeof value === 'number' && Number.isFinite(value);
  if (BOOLEAN_TYPES.has(field.type)) return typeof value === 'boolean';
  if (OBJECT_TYPES.has(field.type)) return typeof value === 'object';
  return true;
}

export function validateGeneratedDataset(job: GenerationJob, dataset: CanonicalDataset): LoopValidation {
  const errors: LoopDiagnostic[] = [];
  const warnings: LoopDiagnostic[] = [];
  const tableMap = new Map(job.tables.map((table) => [table.name, table]));

  job.tables.forEach((table) => {
    const rows = dataset[table.name];
    if (!rows) {
      errors.push(diagnostic('MISSING_TABLE_OUTPUT', `data.${table.name}`, `No generated output exists for table ${table.name}.`, false));
      return;
    }
    if (rows.length !== table.rows) {
      errors.push(diagnostic(
        'ROW_COUNT_MISMATCH',
        `data.${table.name}`,
        `Expected ${table.rows} rows for ${table.name}, received ${rows.length}.`,
        false,
        { expected: table.rows, actual: rows.length },
        ['Regenerate the table using the configured row count.'],
      ));
    }

    const uniqueValues = new Map<string, Map<string, number>>();
    table.fields.filter((field) => field.primaryKey || field.unique).forEach((field) => uniqueValues.set(field.name, new Map()));

    rows.forEach((row, rowIndex) => table.fields.forEach((field) => {
      const value = row[field.name];
      const path = `data.${table.name}.${rowIndex}.${field.name}`;
      if ((field.primaryKey || field.nullable === false) && (value === null || value === undefined)) {
        errors.push(diagnostic('REQUIRED_VALUE_MISSING', path, `${table.name}.${field.name} cannot be null or missing.`, false));
        return;
      }
      if (!valueMatchesType(field, value)) {
        errors.push(diagnostic('TYPE_MISMATCH', path, `${table.name}.${field.name} does not match generator type ${field.type}.`, false, { valueType: typeof value }));
      }
      if (field.type === 'enum' && value !== null && value !== undefined) {
        const allowed = String(field.options?.values ?? '').split(',').map((item) => item.trim()).filter(Boolean);
        if (allowed.length > 0 && !allowed.includes(String(value))) {
          errors.push(diagnostic('ENUM_VALUE_INVALID', path, `${String(value)} is not an allowed value for ${table.name}.${field.name}.`, false, { allowed }));
        }
      }
      const seen = uniqueValues.get(field.name);
      if (seen && value !== null && value !== undefined) {
        const key = stableValue(value);
        const previous = seen.get(key);
        if (previous !== undefined) {
          errors.push(diagnostic(
            field.primaryKey ? 'DUPLICATE_PRIMARY_KEY' : 'DUPLICATE_UNIQUE_VALUE',
            path,
            `${table.name}.${field.name} duplicates row ${previous + 1}.`,
            false,
            { rowIndex, previousRowIndex: previous },
          ));
        } else {
          seen.set(key, rowIndex);
        }
      }
    }));
  });

  job.tables.forEach((table) => {
    const rows = dataset[table.name] ?? [];
    table.fields.forEach((field) => {
      if (!field.foreignKey) return;
      const targetTable = tableMap.get(field.foreignKey.table);
      const targetRows = dataset[field.foreignKey.table] ?? [];
      if (!targetTable) return;
      const targetValues = new Set(targetRows.map((row) => stableValue(row[field.foreignKey!.field])));
      rows.forEach((row, rowIndex) => {
        const value = row[field.name];
        if (value === null || value === undefined) return;
        if (!targetValues.has(stableValue(value))) {
          errors.push(diagnostic(
            'INVALID_FOREIGN_KEY',
            `data.${table.name}.${rowIndex}.${field.name}`,
            `${table.name}.${field.name} does not reference an existing ${field.foreignKey!.table}.${field.foreignKey!.field}.`,
            targetRows.length > 0,
            {
              table: table.name,
              rowIndex,
              field: field.name,
              targetTable: field.foreignKey!.table,
              targetField: field.foreignKey!.field,
            },
            targetRows.length > 0
              ? ['Replace the value deterministically with an existing parent key.']
              : ['Generate valid parent rows before generating this child table.'],
          ));
        }
      });
    });
  });

  return { ok: errors.length === 0, errors, warnings };
}

function repairForeignKeys(job: GenerationJob, dataset: CanonicalDataset): CanonicalDataset {
  const repaired: CanonicalDataset = Object.fromEntries(
    Object.entries(dataset).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))]),
  );
  const validation = validateGeneratedDataset(job, repaired);
  const rng = createRng(seedFromString(`${String(job.seed)}:foreign-key-repair`));

  validation.errors.filter((error) => error.code === 'INVALID_FOREIGN_KEY' && error.repairable).forEach((error) => {
    const details = error.details;
    const table = String(details?.table ?? '');
    const field = String(details?.field ?? '');
    const targetTable = String(details?.targetTable ?? '');
    const targetField = String(details?.targetField ?? '');
    const rowIndex = Number(details?.rowIndex);
    const parentRows = repaired[targetTable] ?? [];
    if (!Number.isSafeInteger(rowIndex) || !repaired[table]?.[rowIndex] || parentRows.length === 0) return;
    const parent = parentRows[Math.floor(rng.next() * parentRows.length)];
    repaired[table][rowIndex][field] = parent[targetField];
  });

  return repaired;
}

export function runDatasetLoop(
  job: GenerationJob,
  input: CanonicalDataset,
  maxIterations = 2,
  onTransition?: (entry: LoopTraceEntry) => void,
): Promise<LoopResult<CanonicalDataset>> {
  return runLoop({
    operation: 'dataset-validation',
    onTransition,
    seed: job.seed,
    maxIterations,
    plan: () => input,
    execute: (dataset) => dataset,
    observe: (dataset) => dataset,
    validate: (dataset) => validateGeneratedDataset(job, dataset),
    verify: (dataset) => validateGeneratedDataset(job, dataset),
    diagnose: (validation) => {
      const repairable = validation.errors.filter((error) => error.repairable);
      const unsafe = validation.errors.filter((error) => !error.repairable);
      if (unsafe.length > 0) {
        return {
          action: 'needs_input',
          reason: 'Dataset validation found constraints that cannot be repaired without changing user intent.',
          nextAction: unsafe[0].suggestedActions?.[0] ?? 'Review the failed constraints and regenerate.',
        };
      }
      if (repairable.length > 0) {
        return {
          action: 'repair',
          reason: `Repairing ${repairable.length} invalid foreign-key reference${repairable.length === 1 ? '' : 's'}.`,
          nextAction: 'repair_foreign_keys',
        };
      }
      return { action: 'fail', reason: 'Validation failed without a safe repair.', nextAction: 'Review the validation evidence.' };
    },
    repair: (dataset) => repairForeignKeys(job, dataset),
    complete: (dataset) => dataset,
  });
}
