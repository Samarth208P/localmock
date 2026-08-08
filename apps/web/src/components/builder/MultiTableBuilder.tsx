import { useCallback, useState, useEffect } from 'react';
import { useMultiTableStore } from '@/store/multiTableStore';
import { FieldBuilder, type FieldRow } from '@/components/editor/FieldBuilder';
import { showToast } from '@/components/shared/Toast';

export function MultiTableBuilder() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fkModalFieldId, setFkModalFieldId] = useState<string | null>(null);
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

  useEffect(() => {
    if (isCreateModalOpen || fkModalFieldId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen, fkModalFieldId]);

  const activeTable = tables.find((t) => t.id === activeTableId);

  const handleFieldsChange = useCallback(
    (fields: FieldRow[]) => {
      if (activeTableId) setTableFields(activeTableId, fields);
    },
    [activeTableId, setTableFields],
  );

  const handleFkToggle = useCallback((fieldId: string) => {
    if (!activeTable) return;
    
    // Check if there is already an FK for this field
    const field = activeTable.fields.find(f => f.id === fieldId);
    if (!field) return;

    const existingFk = foreignKeys.find(fk => fk.fromTable === activeTable.id && fk.fromField === field.name);
    if (existingFk) {
      // Remove it
      removeForeignKey(existingFk.id);
      
      // Update field visually
      const newFields = activeTable.fields.map(f => f.id === fieldId ? { ...f, hasForeignKey: false } : f);
      setTableFields(activeTable.id, newFields);
    } else {
      // Open modal to create it
      setFkModalFieldId(fieldId);
    }
  }, [activeTable, foreignKeys, removeForeignKey, setTableFields]);

  const handleLinkFk = (parentTableId: string) => {
    if (!activeTable || !fkModalFieldId) return;
    const field = activeTable.fields.find(f => f.id === fkModalFieldId);
    const parentTable = tables.find(t => t.id === parentTableId);
    if (!field || !parentTable) return;

    const parentPkField = parentTable.fields.find(f => f.isPrimaryKey) || parentTable.fields[0];
    
    addForeignKey({
      fromTable: activeTable.id,
      fromField: field.name,
      toTable: parentTable.id,
      toField: parentPkField ? parentPkField.name : 'id'
    });

    const newFields = activeTable.fields.map(f => f.id === fkModalFieldId ? { ...f, hasForeignKey: true } : f);
    setTableFields(activeTable.id, newFields);
    setFkModalFieldId(null);
    showToast(`Linked ${field.name} to ${parentTable.name}.${parentPkField ? parentPkField.name : 'id'}`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Table tabs */}
      {tables.length > 0 && (
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
            onClick={() => {
              setNewTableName('new_table');
              setIsCreateModalOpen(true);
            }}
            className="shrink-0 rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted hover:border-accent/40 hover:text-accent transition-all duration-200"
          >
            + Add Table
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

          {/* Field builder for active table */}
          <FieldBuilder
            key={activeTable.id} // Re-mounts on table change
            onFieldsChange={handleFieldsChange}
            onFkToggle={handleFkToggle}
            initialFields={activeTable.fields}
            commitToSchema={false}
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
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:-translate-y-0.5 active:scale-95"
          >
            + Create First Table
          </button>
        </div>
      )}

      {/* Create Table Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Create Table</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Table Name</label>
                <input
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
              <div className="flex justify-end gap-3 pt-2">
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
            </div>
          </div>
        </div>
      )}
      {/* Link FK Modal */}
      {fkModalFieldId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Link to Parent Table</h3>
              <button
                onClick={() => setFkModalFieldId(null)}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-text-secondary">Select the parent table to link this field to.</p>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tables.filter(t => t.id !== activeTableId).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleLinkFk(t.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-bg-tertiary hover:border-accent/40 hover:bg-accent/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-text-primary">{t.name}</span>
                    <span className="text-xs font-mono text-text-muted">id</span>
                  </button>
                ))}
                
                {tables.length <= 1 && (
                  <p className="text-sm text-text-muted text-center py-4">No other tables available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
