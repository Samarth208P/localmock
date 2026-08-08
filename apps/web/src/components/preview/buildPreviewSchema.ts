import type { FieldDef } from '@/workers/generation.worker';
import type { ForeignKey, TableDef } from '@/store/multiTableStore';
import type { ParsedSchema } from '@/store/schemaStore';
import type { PreviewSchemaModel } from './types';

export function buildSingleTablePreviewSchema(
  name: string,
  fields: FieldDef[],
  configuredRowCount: number,
): PreviewSchemaModel {
  return {
    tables: [{
      id: `single:${name}`,
      name,
      configuredRowCount,
      columns: fields.map((field) => ({
        name: field.name,
        typeId: field.typeId,
        isPrimaryKey: Boolean(field.primaryKey),
        isForeignKey: Boolean(field.foreignKeyRef),
      })),
    }],
    relationships: [],
  };
}

export function buildParsedPreviewSchema(
  parsedSchema: ParsedSchema,
  configuredRowCount: number,
): PreviewSchemaModel {
  const foreignFields = new Set<string>();

  parsedSchema.tables.forEach((table) => {
    table.relations?.forEach((relation) => {
      foreignFields.add(`${table.name}.${relation.fromField}`);
    });
  });

  return {
    tables: parsedSchema.tables.map((table) => ({
      id: table.name,
      name: table.name,
      configuredRowCount,
      columns: table.columns.map((column) => ({
        name: column.name,
        typeId: column.type,
        isPrimaryKey: Boolean(column.isPrimaryKey),
        isForeignKey: foreignFields.has(`${table.name}.${column.name}`),
      })),
    })),
    relationships: parsedSchema.tables.flatMap((table) =>
      (table.relations ?? []).map((relation, index) => ({
        id: `${table.name}:${relation.fromField}:${relation.toTable}:${relation.toField}:${index}`,
        fromTable: table.name,
        fromField: relation.fromField,
        toTable: relation.toTable,
        toField: relation.toField,
      })),
    ),
  };
}

export function buildConfiguredPreviewSchema(
  tables: TableDef[],
  foreignKeys: ForeignKey[],
): PreviewSchemaModel {
  return {
    tables: tables.map((table) => ({
      id: table.id,
      name: table.name,
      configuredRowCount: table.rowCount,
      columns: table.fields.map((field) => ({
        name: field.name,
        typeId: field.typeId,
        isPrimaryKey: Boolean(field.isPrimaryKey),
        isForeignKey: foreignKeys.some((foreignKey) =>
          foreignKey.fromTable === table.id && foreignKey.fromField === field.name),
      })),
    })),
    relationships: foreignKeys.map((foreignKey) => ({
      id: foreignKey.id,
      fromTable: foreignKey.fromTable,
      fromField: foreignKey.fromField,
      toTable: foreignKey.toTable,
      toField: foreignKey.toField,
    })),
  };
}
