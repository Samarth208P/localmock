import { validateGenerationJob } from '../jobs/validateJob';
import type { GenerationJob } from '../jobs/types';
import { runLoop } from './runLoop';
import type { LoopDiagnostic, LoopResult, LoopValidation } from './types';

export interface SchemaLoopOptions {
  supportedTypes?: ReadonlySet<string>;
  maxIterations?: number;
}

function normalizeJob(job: GenerationJob): GenerationJob {
  return {
    ...job,
    tables: job.tables.map((table) => ({
      ...table,
      name: table.name.trim(),
      fields: table.fields.map((field) => ({
        ...field,
        name: field.name.trim(),
        type: field.type.trim(),
        foreignKey: field.foreignKey
          ? { table: field.foreignKey.table.trim(), field: field.foreignKey.field.trim() }
          : undefined,
      })),
    })),
  };
}

export function validateLoopSchema(job: GenerationJob, options: SchemaLoopOptions = {}): LoopValidation {
  const base = validateGenerationJob(job);
  const errors: LoopDiagnostic[] = base.errors.map((error) => ({
    ...error,
    retryable: false,
    repairable: false,
  }));
  const warnings: LoopDiagnostic[] = base.warnings.map((warning) => ({
    ...warning,
    retryable: false,
    repairable: false,
  }));

  job.tables.forEach((table, tableIndex) => {
    if (!table.fields.some((field) => field.primaryKey)) {
      warnings.push({
        code: 'MISSING_PRIMARY_KEY',
        path: `tables.${tableIndex}.fields`,
        message: `Table ${table.name} does not define a primary key.`,
        severity: 'warning',
        retryable: false,
        repairable: false,
        suggestedActions: ['Mark an existing unique field as the primary key if relational identity is required.'],
      });
    }

    table.fields.forEach((field, fieldIndex) => {
      const path = `tables.${tableIndex}.fields.${fieldIndex}`;
      if (options.supportedTypes && !options.supportedTypes.has(field.type)) {
        errors.push({
          code: 'UNSUPPORTED_FIELD_TYPE',
          path: `${path}.type`,
          message: `Unsupported generator type: ${field.type}`,
          severity: 'error',
          retryable: false,
          repairable: false,
          suggestedActions: ['Choose a supported LocalMock generator type.'],
        });
      }
      if (field.primaryKey && field.nullable === true) {
        errors.push({
          code: 'CONFLICTING_CONSTRAINTS',
          path,
          message: `Primary key ${table.name}.${field.name} cannot be nullable.`,
          severity: 'error',
          retryable: false,
          repairable: false,
          suggestedActions: ['Disable nullable or choose a different primary key.'],
        });
      }
    });
  });

  const tables = new Map(job.tables.map((table) => [table.name, table]));
  job.tables.forEach((table, tableIndex) => table.fields.forEach((field, fieldIndex) => {
    if (!field.foreignKey) return;
    const target = tables.get(field.foreignKey.table)?.fields.find((candidate) => candidate.name === field.foreignKey?.field);
    if (target && target.type !== field.type) {
      errors.push({
        code: 'CONFLICTING_RELATION_TYPES',
        path: `tables.${tableIndex}.fields.${fieldIndex}.foreignKey`,
        message: `${table.name}.${field.name} (${field.type}) does not match ${field.foreignKey.table}.${field.foreignKey.field} (${target.type}).`,
        severity: 'error',
        retryable: false,
        repairable: false,
        suggestedActions: ['Use compatible generator types for both sides of the relationship.'],
      });
    }
  }));

  return { ok: errors.length === 0, errors, warnings };
}

export function runSchemaLoop(
  input: GenerationJob,
  options: SchemaLoopOptions = {},
): Promise<LoopResult<GenerationJob>> {
  return runLoop({
    operation: 'schema-validation',
    seed: input.seed,
    maxIterations: options.maxIterations ?? 1,
    plan: () => normalizeJob(input),
    execute: (job) => job,
    observe: (job) => job,
    validate: (job) => validateLoopSchema(job, options),
    verify: (job) => validateLoopSchema(job, options),
    diagnose: (validation) => ({
      action: validation.errors.some((error) => error.repairable) ? 'repair' : 'needs_input',
      reason: 'Schema validation found issues that cannot be changed safely without user intent.',
      nextAction: 'Review the schema diagnostics, correct the indicated fields, and run again.',
    }),
    complete: (job) => job,
  });
}
