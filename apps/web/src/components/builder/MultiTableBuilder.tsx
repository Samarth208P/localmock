import { useCallback } from 'react';
import { useMultiTableStore, type TableDef } from '@/store/multiTableStore';
import { FieldBuilder, type FieldRow } from '@/components/editor/FieldBuilder';

export function MultiTableBuilder() {
  const {
    tables,
    foreignKeys,
    activeTableId,
    addTable,
    removeTable,
    renameTable,
    setTableFields,
    setTableRowCount,
    setActiveTable,
    addForeignKey,
    removeForeignKey,
  } = useMultiTableStore();

  const activeTable = tables.find((t) => t.id === activeTableId);

  const handleFieldsChange = useCallback(
    (fields: FieldRow[]) => {
      if (activeTableId) setTableFields(activeTableId, fields);
    },
    [activeTableId, setTableFields],
  );

  const handleAddFK = useCallback(() => {
    if (!activeTable || tables.length < 2) return;
    const parentTable = tables.find((t) => t.id !== activeTableId);
    if (!parentTable) return;

    addForeignKey({
      fromTable: activeTable.id,
      fromField: `${parentTable.name}_id`,
      toTable: parentTable.id,
      toField: 'id',
    });

    // Add FK field to current table
    const fkField: FieldRow = {
      id: Math.random().toString(36).slice(2, 10),
      name: `${parentTable.name}_id`,
      typeId: 'uuid',
      options: {},
      unique: false,
    };
    setTableFields(activeTable.id, [...activeTable.fields, fkField]);
  }, [activeTable, activeTableId, tables, addForeignKey, setTableFields]);

  return (
    <div className="space-y-4">
      {/* Table tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => setActiveTable(table.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              table.id === activeTableId
                ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {table.name}
          </button>
        ))}
        <button
          onClick={() => addTable()}
          className="shrink-0 rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted hover:border-accent/40 hover:text-accent transition-all duration-200"
        >
          + Add Table
        </button>
      </div>

      {/* Active table editor */}
      {activeTable && (
        <div className="space-y-4">
          {/* Table header */}
          <div className="flex items-center gap-3">
            <input
              value={activeTable.name}
              onChange={(e) => renameTable(activeTable.id, e.target.value)}
              className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-sm font-mono text-text-primary focus:border-accent focus:outline-none transition-all"
              aria-label="Table name"
            />
            <input
              type="number"
              value={activeTable.rowCount}
              onChange={(e) => setTableRowCount(activeTable.id, parseInt(e.target.value) || 1)}
              min={1}
              max={1000000}
              className="w-24 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-sm font-mono text-text-primary focus:border-accent focus:outline-none transition-all"
              aria-label="Row count"
            />
            <span className="text-[11px] text-text-muted">rows</span>
            <div className="flex-1" />
            {tables.length > 1 && (
              <button
                onClick={() => removeTable(activeTable.id)}
                className="text-xs text-text-muted hover:text-error transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {/* FK section */}
          <div className="rounded-lg border border-border-subtle bg-bg-secondary p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Foreign Keys</span>
              <button
                onClick={handleAddFK}
                disabled={tables.length < 2}
                className="text-[11px] text-accent hover:text-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Link FK
              </button>
            </div>

            {foreignKeys
              .filter((fk) => fk.fromTable === activeTable.id)
              .map((fk) => {
                const parentTable = tables.find((t) => t.id === fk.toTable);
                return (
                  <div
                    key={fk.id}
                    className="flex items-center gap-2 rounded-md bg-bg-tertiary px-2.5 py-1.5 text-[11px]"
                  >
                    <span className="text-text-muted">
                      <span className="font-mono text-text-secondary">{fk.fromField}</span>
                      {' → '}
                      <span className="font-mono text-accent">{parentTable?.name || '?'}.{fk.toField}</span>
                    </span>
                    <button
                      onClick={() => removeForeignKey(fk.id)}
                      className="ml-auto text-text-muted hover:text-error transition-colors"
                      aria-label="Remove FK"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}

            {foreignKeys.filter((fk) => fk.fromTable === activeTable.id).length === 0 && (
              <p className="text-[11px] text-text-muted">No foreign keys. Link this table to a parent.</p>
            )}
          </div>

          {/* Field builder for active table */}
          <FieldBuilder
            key={activeTable.id}
            onFieldsChange={handleFieldsChange}
            initialFields={activeTable.fields}
          />
        </div>
      )}

      {tables.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-text-muted">No tables yet. Add your first table to get started.</p>
          <button
            onClick={() => addTable('users')}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Create "users" table
          </button>
        </div>
      )}
    </div>
  );
}
