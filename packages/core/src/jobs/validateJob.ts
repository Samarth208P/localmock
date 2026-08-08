import { GENERATION_JOB_VERSION } from './types';
import type { GenerationDiagnostic, GenerationJob, GenerationJobValidation } from './types';

const MAX_ROWS_PER_TABLE = 1_000_000;

function diagnostic(code: GenerationDiagnostic['code'], path: string, message: string, details?: Record<string, unknown>): GenerationDiagnostic {
  return { code, path, message, severity: 'error', details };
}

export function validateGenerationJob(job: GenerationJob): GenerationJobValidation {
  const errors: GenerationDiagnostic[] = [];
  const warnings: GenerationDiagnostic[] = [];
  if (job.version !== GENERATION_JOB_VERSION) errors.push(diagnostic('UNSUPPORTED_JOB_VERSION', 'version', `Unsupported generation job version: ${String(job.version)}`, { supported: GENERATION_JOB_VERSION }));
  if (!Array.isArray(job.tables) || job.tables.length === 0) {
    errors.push(diagnostic('INVALID_JOB', 'tables', 'At least one table is required.'));
    return { ok: false, errors, warnings, totalRows: 0 };
  }

  const tableNames = new Set<string>();
  const fieldsByTable = new Map<string, Set<string>>();
  let totalRows = 0;
  job.tables.forEach((table, tableIndex) => {
    const tablePath = `tables.${tableIndex}`;
    const tableName = table.name.trim();
    if (!tableName) errors.push(diagnostic('INVALID_JOB', `${tablePath}.name`, 'Table name is required.'));
    else if (tableNames.has(tableName)) errors.push(diagnostic('DUPLICATE_TABLE', `${tablePath}.name`, `Duplicate table name: ${tableName}`));
    tableNames.add(tableName);
    if (!Number.isSafeInteger(table.rows) || table.rows < 1 || table.rows > MAX_ROWS_PER_TABLE) errors.push(diagnostic('INVALID_ROW_COUNT', `${tablePath}.rows`, `Row count must be an integer between 1 and ${MAX_ROWS_PER_TABLE.toLocaleString()}.`, { value: table.rows }));
    else totalRows += table.rows;

    const fieldNames = new Set<string>();
    fieldsByTable.set(tableName, fieldNames);
    if (!Array.isArray(table.fields) || table.fields.length === 0) {
      errors.push(diagnostic('INVALID_JOB', `${tablePath}.fields`, 'At least one field is required.'));
      return;
    }
    table.fields.forEach((field, fieldIndex) => {
      const fieldPath = `${tablePath}.fields.${fieldIndex}`;
      const fieldName = field.name.trim();
      if (!fieldName) errors.push(diagnostic('INVALID_JOB', `${fieldPath}.name`, 'Field name is required.'));
      else if (fieldNames.has(fieldName)) errors.push(diagnostic('DUPLICATE_FIELD', `${fieldPath}.name`, `Duplicate field name: ${fieldName}`));
      fieldNames.add(fieldName);
      if (!field.type.trim()) errors.push(diagnostic('INVALID_JOB', `${fieldPath}.type`, 'Field type is required.'));
      if (field.unique && field.type === 'enum') {
        const values = String(field.options?.values ?? '').split(',').map((value) => value.trim()).filter(Boolean);
        if (values.length < table.rows) errors.push(diagnostic('UNIQUE_DOMAIN_EXHAUSTED', fieldPath, `Cannot generate ${table.rows} unique values from an enum containing ${values.length} values.`, { requested: table.rows, available: values.length }));
      }
    });
  });

  job.tables.forEach((table, tableIndex) => table.fields.forEach((field, fieldIndex) => {
    if (!field.foreignKey) return;
    const path = `tables.${tableIndex}.fields.${fieldIndex}.foreignKey`;
    const targetFields = fieldsByTable.get(field.foreignKey.table);
    if (!targetFields) errors.push(diagnostic('MISSING_REFERENCED_TABLE', `${path}.table`, `Referenced table does not exist: ${field.foreignKey.table}`));
    else if (!targetFields.has(field.foreignKey.field)) errors.push(diagnostic('MISSING_REFERENCED_FIELD', `${path}.field`, `Referenced field does not exist: ${field.foreignKey.table}.${field.foreignKey.field}`));
  }));
  const dependencies = new Map(job.tables.map((table) => [
    table.name,
    table.fields.flatMap((field) => field.foreignKey ? [field.foreignKey.table] : []),
  ]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const hasCycle = (tableName: string): boolean => {
    if (visiting.has(tableName)) return true;
    if (visited.has(tableName)) return false;
    visiting.add(tableName);
    const cyclic = (dependencies.get(tableName) ?? []).some(hasCycle);
    visiting.delete(tableName);
    visited.add(tableName);
    return cyclic;
  };
  if (job.tables.some((table) => hasCycle(table.name))) {
    errors.push(diagnostic('RELATION_CYCLE', 'tables', 'Circular foreign-key dependency detected.', undefined));
  }

  return { ok: errors.length === 0, errors, warnings, totalRows };
}
