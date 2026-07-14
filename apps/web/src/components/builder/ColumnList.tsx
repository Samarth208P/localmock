import type { ParsedColumn } from '@/store/schemaStore';
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

  /** Scoped confirm: flips confidence to 'high' only for columns within a single
   * table that are not already 'high' (i.e. the "Review Suggested" group). */
  const handleConfirmGroup = (tableName: string) => {
    const updated = {
      ...parsedSchema,
      tables: parsedSchema.tables.map((table) =>
        table.name !== tableName
          ? table
          : {
              ...table,
              columns: table.columns.map((col) =>
                col.confidence !== 'high' ? { ...col, confidence: 'high' as const } : col,
              ),
            },
      ),
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

      {parsedSchema.tables.map((table) => {
        const detected = table.columns.filter((c) => c.confidence === 'high');
        const reviewSuggested = table.columns.filter((c) => c.confidence !== 'high');

        return (
          <div key={table.name} className="space-y-3">
            {parsedSchema.tables.length > 1 && (
              <p className="text-xs font-medium text-text-secondary mt-3 mb-1">
                {table.name}
              </p>
            )}

            {detected.length > 0 && (
              <ColumnGroup
                label="Detected"
                columns={detected}
                onTypeChange={handleTypeChange}
                onConfirm={handleConfirm}
              />
            )}

            {reviewSuggested.length > 0 && (
              <ColumnGroup
                label="Review Suggested"
                columns={reviewSuggested}
                onTypeChange={handleTypeChange}
                onConfirm={handleConfirm}
                action={{
                  label: 'Confirm Group',
                  onClick: () => handleConfirmGroup(table.name),
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ColumnGroupProps {
  label: string;
  columns: ParsedColumn[];
  onTypeChange: (columnId: string, newType: string, newFakerMethod: string) => void;
  onConfirm: (columnId: string) => void;
  action?: { label: string; onClick: () => void };
}

function ColumnGroup({ label, columns, onTypeChange, onConfirm, action }: ColumnGroupProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
          {label} ({columns.length})
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      {columns.map((column) => (
        <ColumnRow
          key={column.id}
          column={column}
          onTypeChange={onTypeChange}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  );
}
