import { useMemo } from 'react';
import { useSchemaStore, type ParsedColumn, type ParsedSchema } from '@/store/schemaStore';
import { useMultiTableStore } from '@/store/multiTableStore';
import type { FieldRow } from '@/components/editor/FieldBuilder';
import { ColumnRow } from './ColumnRow';

type ColumnSource = 'build' | 'paste' | 'multi-table' | 'template';

interface ColumnListProps {
  source: ColumnSource;
  onSchemaFieldsChange?: (fields: FieldRow[]) => void;
}

export function ColumnList({ source, onSchemaFieldsChange }: ColumnListProps) {
  const { parsedSchema, setParsedSchema } = useSchemaStore();
  const multiTable = useMultiTableStore();

  const schema = useMemo<ParsedSchema | null>(() => {
    if (source !== 'multi-table') return parsedSchema;

    const tableNames = new Map(multiTable.tables.map((table) => [table.id, table.name]));
    return {
      raw: '',
      format: 'multi-table',
      tables: multiTable.tables.map((table) => ({
        name: table.name,
        columns: table.fields.map((field): ParsedColumn => ({
          id: field.id,
          name: field.name,
          type: field.typeId,
          fakerMethod: field.typeId,
          confidence: 'high',
          isUnique: field.unique,
          isSequential: field.typeId === 'autoIncrement',
          isPrimaryKey: field.isPrimaryKey,
          options: field.options,
          nullPercentage: field.nullPercentage,
          enabled: field.enabled !== false,
        })),
        relations: multiTable.foreignKeys
          .filter((foreignKey) => foreignKey.fromTable === table.id)
          .map((foreignKey) => ({
            fromTable: table.name,
            fromField: foreignKey.fromField,
            toTable: tableNames.get(foreignKey.toTable) || foreignKey.toTable,
            toField: foreignKey.toField,
            cardinality: 'many-to-one',
          })),
      })),
    };
  }, [multiTable.foreignKeys, multiTable.tables, parsedSchema, source]);

  if (!schema || schema.tables.length === 0) return null;

  const commitSchema = (updated: ParsedSchema) => {
    if (source === 'multi-table') {
      updated.tables.forEach((table, tableIndex) => {
        const originalTable = multiTable.tables[tableIndex];
        if (!originalTable) return;
        multiTable.setTableFields(originalTable.id, table.columns.map((column) => {
          const original = originalTable.fields.find((field) => field.id === column.id);
          return {
            ...original,
            id: column.id,
            name: column.name,
            typeId: column.fakerMethod || column.type,
            options: column.options || {},
            unique: column.isUnique,
            isPrimaryKey: column.isPrimaryKey,
            nullPercentage: column.nullPercentage,
            enabled: column.enabled !== false,
          };
        }));
      });
      return;
    }

    setParsedSchema(updated);
    const firstTable = updated.tables[0];
    if (firstTable && onSchemaFieldsChange) {
      onSchemaFieldsChange(firstTable.columns.map((column) => ({
        id: column.id,
        name: column.name,
        typeId: column.fakerMethod || column.type,
        options: column.options || {},
        unique: column.isUnique,
        isPrimaryKey: column.isPrimaryKey,
        nullPercentage: column.nullPercentage,
        enabled: column.enabled !== false,
      })));
    }
  };

  const updateColumn = (columnId: string, update: (column: ParsedColumn) => ParsedColumn) => {
    commitSchema({
      ...schema,
      tables: schema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((column) => column.id === columnId ? update(column) : column),
      })),
    });
  };

  const handleTypeChange = (columnId: string, newType: string, newFakerMethod: string) => {
    updateColumn(columnId, (column) => ({
      ...column,
      type: newType,
      fakerMethod: newFakerMethod,
      confidence: 'high',
    }));
  };

  const handleConfirmAll = () => {
    commitSchema({
      ...schema,
      tables: schema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((column) => ({ ...column, confidence: 'high' })),
      })),
    });
  };

  const columnCount = schema.tables.reduce((count, table) => count + table.columns.length, 0);
  const hasUnconfirmed = schema.tables.some((table) =>
    table.columns.some((column) => column.confidence !== 'high'),
  );

  return (
    <section className="mt-4" aria-labelledby="detected-columns-heading">
      <div className="mb-2 flex items-center justify-between">
        <h3 id="detected-columns-heading" className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Detected Columns ({columnCount})
        </h3>
        {hasUnconfirmed && (
          <button onClick={handleConfirmAll} className="text-xs text-accent transition-colors hover:text-accent-hover">
            Accept All
          </button>
        )}
      </div>

      {schema.tables.map((table) => (
        <div key={table.name} className="space-y-1.5">
          {schema.tables.length > 1 && (
            <p className="mb-1 mt-3 text-xs font-medium text-text-secondary">{table.name}</p>
          )}
          {table.columns.map((column) => (
            <ColumnRow
              key={column.id}
              column={column}
              tableRelations={table.relations || []}
              onTypeChange={handleTypeChange}
              onUpdateOption={(columnId, key, value) => updateColumn(columnId, (current) => ({
                ...current,
                options: { ...(current.options || {}), [key]: value },
              }))}
              onUpdateNullPercentage={(columnId, percentage) => updateColumn(columnId, (current) => ({
                ...current,
                nullPercentage: percentage,
              }))}
              onConfirm={(columnId) => updateColumn(columnId, (current) => ({ ...current, confidence: 'high' }))}
              onToggleEnabled={(columnId) => updateColumn(columnId, (current) => ({
                ...current,
                enabled: current.enabled === false,
              }))}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
