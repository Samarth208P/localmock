import { useCallback, useState } from 'react';
import { useMultiTableStore } from '@/store/multiTableStore';
import { FieldBuilder, type FieldRow } from '@/components/editor/FieldBuilder';
import { Modal } from '@/components/shared/Modal';

export function MultiTableBuilder() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('users');
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
      {tables.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tables.map((table, idx) => (
          <button
            key={table.id}
            onClick={() => setActiveTable(table.id)}
            style={{ '--stagger-delay': `${idx * 40}ms` } as React.CSSProperties}
            className={`btn-press animate-stagger-in shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              table.id === activeTableId
                ? 'bg-accent/15 text-accent ring-1 ring-accent/30 scale-105'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary hover:bg-bg-tertiary/70'
            }`}
          >
            {table.name}
          </button>
        ))}
          <button
            onClick={() => {
              setNewTableName('new_table');
              setIsCreateModalOpen(true);
            }}
            className="btn-press group shrink-0 rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/[0.03] transition-all duration-200"
          >
            <span className="inline-block transition-transform duration-200 group-hover:rotate-90 mr-1">+</span>
            Add Table
          </button>
        </div>
      )}

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
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border-subtle bg-bg-secondary/50">
          <p className="text-sm text-text-secondary mb-4">No tables yet. Add your first table to get started.</p>
          <button
            onClick={() => {
              setNewTableName('users');
              setIsCreateModalOpen(true);
            }}
            className="btn-press rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
          >
            + Create First Table
          </button>
        </div>
      )}

      {/* Create Table Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="max-w-sm"
        title="Create Table"
        footer={
          <div className="flex justify-end gap-3 p-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newTableName.trim()) {
                  addTable(newTableName.trim());
                  setIsCreateModalOpen(false);
                }
              }}
              disabled={!newTableName.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        }
      >
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="new-table-name-input" className="block text-sm font-medium text-text-primary mb-1.5">Table Name</label>
            <input
              id="new-table-name-input"
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-200"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTableName.trim()) {
                  addTable(newTableName.trim());
                  setIsCreateModalOpen(false);
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
