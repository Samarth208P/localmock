import type { GenerationJob } from '@localmock/core/jobs';
import type { PreviewSchemaModel } from './types';

export function buildJobPreviewSchema(job: GenerationJob): PreviewSchemaModel {
  return {
    tables: job.tables.map((table) => ({
      id: table.name,
      name: table.name,
      configuredRowCount: table.rows,
      columns: table.fields.map((field) => ({
        name: field.name,
        typeId: field.type,
        isPrimaryKey: Boolean(field.primaryKey),
        isForeignKey: Boolean(field.foreignKey),
      })),
    })),
    relationships: job.tables.flatMap((table) => table.fields.flatMap((field, index) => field.foreignKey ? [{
      id: `${table.name}:${field.name}:${field.foreignKey.table}:${field.foreignKey.field}:${index}`,
      fromTable: table.name,
      fromField: field.name,
      toTable: field.foreignKey.table,
      toField: field.foreignKey.field,
    }] : [])),
  };
}
