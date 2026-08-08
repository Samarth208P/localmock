import { useState } from 'react';
import type { ParsedColumn } from '@/store/schemaStore';
import { TypePickerModal } from '../shared/TypePickerModal';
import { SettingsModal } from '../shared/SettingsModal';
import { ALL_DATA_TYPES } from '@/lib/dataTypes';

interface ColumnRowProps {
  column: ParsedColumn;
  tableRelations?: { fromField: string; toTable: string; toField: string }[];
  onTypeChange: (columnId: string, newType: string, newFakerMethod: string) => void;
  onUpdateOption: (columnId: string, key: string, value: any) => void;
  onUpdateNullPercentage: (columnId: string, percentage: number) => void;
  onConfirm: (columnId: string) => void;
  onToggleEnabled: (columnId: string) => void;
}

export function ColumnRow({
  column,
  tableRelations = [],
  onTypeChange,
  onUpdateOption,
  onUpdateNullPercentage,
  onConfirm,
  onToggleEnabled,
}: ColumnRowProps) {
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const confidenceColor =
    column.confidence === 'high'
      ? 'bg-success/10 text-success border-success/20'
      : column.confidence === 'medium'
        ? 'bg-warning/10 text-warning border-warning/20'
        : 'bg-error/10 text-error border-error/20';

  const isPK = column.isPrimaryKey || column.name.toLowerCase() === 'id';
  const isUnique = column.isUnique;
  const fkRelation = tableRelations.find((r) => r.fromField === column.name);

  // Find the label for the current type
  const typeLabel = ALL_DATA_TYPES.find((t) => t.id === column.fakerMethod)?.label || column.type || 'Unknown';

  return (
    <>
      <div className={`grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] items-center gap-3 rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2.5 transition-all hover:border-border-active ${column.enabled === false ? 'opacity-55' : ''}`}>
        {/* Field name and badges */}
        <div className="flex items-center gap-2 overflow-hidden h-8 w-full rounded-lg border border-transparent bg-transparent px-2.5 focus-within:border-accent focus-within:bg-bg-tertiary transition-all duration-200">
          <input
            type="text"
            value={column.name}
            readOnly
            className="bg-transparent font-mono text-xs text-text-primary focus:outline-none w-auto min-w-[60px]"
          />
          {/* Badges */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-visible">
            {isPK && (
              <div className="group relative flex items-center">
                <span className="inline-flex items-center rounded-sm bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider cursor-default">
                  PK
                </span>
                <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-bg-inverse px-2 py-1 text-[10px] font-medium text-text-inverse opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                  Primary Key
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-inverse"></div>
                </div>
              </div>
            )}
            {fkRelation && (
              <div className="group relative flex items-center">
                <span className="inline-flex items-center rounded-sm bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning uppercase tracking-wider cursor-default">
                  FK
                </span>
                <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-bg-inverse px-2 py-1 text-[10px] font-medium text-text-inverse opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                  Foreign Key → {fkRelation.toTable}.{fkRelation.toField}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-inverse"></div>
                </div>
              </div>
            )}
            {isUnique && !isPK && (
              <div className="group relative flex items-center">
                <span className="inline-flex items-center rounded-sm bg-border-strong/30 px-1.5 py-0.5 text-[9px] font-bold text-text-muted uppercase tracking-wider cursor-default">
                  UQ
                </span>
                <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-bg-inverse px-2 py-1 text-[10px] font-medium text-text-inverse opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10">
                  Unique Constraint
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-inverse"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Type selector button (replaces old Select) */}
        <button
          onClick={() => setIsTypePickerOpen(true)}
          className={`flex h-8 w-[140px] items-center justify-between rounded-lg border px-2.5 text-xs transition-all duration-200 font-medium focus:outline-none ${
            column.confidence === 'high'
              ? 'opacity-60 cursor-not-allowed border-border-subtle bg-bg-tertiary text-text-primary'
              : 'border-border-subtle bg-bg-tertiary hover:border-border-active focus:border-accent focus:bg-accent/[0.04] text-accent'
          }`}
        >
          <span className="truncate">{typeLabel}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 shrink-0 ml-2"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="rounded p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors focus:outline-none"
          title="Field Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>

        {/* Confidence badge */}
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-medium ${confidenceColor}`}
          title={column.confidence === 'high' ? 'High Confidence' : 'Review Needed'}
        >
          {column.confidence === 'high' ? '✓' : column.confidence === 'medium' ? '~' : '?'}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={column.enabled !== false}
          aria-label={`${column.enabled === false ? 'Enable' : 'Disable'} ${column.name}`}
          onClick={() => onToggleEnabled(column.id)}
          className={`relative h-5 w-9 rounded-full transition-colors ${column.enabled === false ? 'bg-bg-tertiary ring-1 ring-border-subtle' : 'bg-accent'}`}
          title={column.enabled === false ? 'Column disabled' : 'Column enabled'}
        >
          <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${column.enabled === false ? '' : 'translate-x-4'}`} />
        </button>

        {/* Confirm button for low/medium confidence */}
        {column.confidence !== 'high' ? (
          <button
            onClick={() => onConfirm(column.id)}
            className="text-[10px] text-accent hover:text-accent-hover transition-colors w-[50px] text-left"
          >
            Confirm
          </button>
        ) : (
          <span className="w-[50px]" />
        )}
      </div>

      {isTypePickerOpen && (
        <TypePickerModal
          fieldName={column.name}
          onSelect={(type) => {
            onTypeChange(column.id, type.label, type.id);
            setIsTypePickerOpen(false);
          }}
          onClose={() => setIsTypePickerOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          fieldName={column.name}
          typeId={column.fakerMethod}
          options={column.options || {}}
          nullPercentage={column.nullPercentage || 0}
          onUpdateOption={(key, value) => onUpdateOption(column.id, key, value)}
          onUpdateNullPercentage={(percentage) => onUpdateNullPercentage(column.id, percentage)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}
