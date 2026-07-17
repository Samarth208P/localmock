import { useSchemaStore } from '@/store/schemaStore';
import { ColumnRow } from './ColumnRow';

export function ColumnList() {
  const { parsedSchema, setParsedSchema } = useSchemaStore();

  if (!parsedSchema || parsedSchema.tables.length === 0) return null;

  const handleTypeChange = (columnId: string, newType: string, newFakerMethod: string) => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((col) =>
          col.id === columnId
            ? { ...col, type: newType, fakerMethod: newFakerMethod, confidence: 'high' as const }
            : col,
        ),
      })),
    };
    setParsedSchema(updated);
  };

  const handleUpdateOption = (columnId: string, key: string, value: any) => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((col) =>
          col.id === columnId
            ? { ...col, options: { ...(col.options || {}), [key]: value } }
            : col,
        ),
      })),
    };
    setParsedSchema(updated);
  };

  const handleUpdateNullPercentage = (columnId: string, percentage: number) => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((col) =>
          col.id === columnId ? { ...col, nullPercentage: percentage } : col,
        ),
      })),
    };
    setParsedSchema(updated);
  };

  const handleConfirm = (columnId: string) => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((col) =>
          col.id === columnId ? { ...col, confidence: 'high' as const } : col,
        ),
      })),
    };
    setParsedSchema(updated);
  };

  const handleConfirmAll = () => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) => ({
        ...table,
        columns: table.columns.map((col) => ({ ...col, confidence: 'high' as const })),
      })),
    };
    setParsedSchema(updated);
  };

  const hasUnconfirmed = parsedSchema.tables.some((t) =>
    t.columns.some((c) => c.confidence !== 'high'),
  );

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Detected Columns ({parsedSchema.tables[0]?.columns.length || 0})
        </h3>
        {hasUnconfirmed && (
          <button
            onClick={handleConfirmAll}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            Accept All
          </button>
        )}
      </div>

      {parsedSchema.tables.map((table) => (
        <div key={table.name} className="space-y-1.5">
          {parsedSchema.tables.length > 1 && (
            <p className="text-xs font-medium text-text-secondary mt-3 mb-1">
              {table.name}
            </p>
          )}
          {table.columns.map((column) => (
            <ColumnRow
              key={column.id}
              column={column}
              tableRelations={table.relations || []}
              onTypeChange={handleTypeChange}
              onUpdateOption={handleUpdateOption}
              onUpdateNullPercentage={handleUpdateNullPercentage}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
