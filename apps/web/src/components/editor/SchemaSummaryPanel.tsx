import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import type { FieldRow } from './FieldBuilder';
import { getHistory, deleteFromHistory, clearHistory, type SchemaHistoryEntry } from '@/lib/schemaHistory';
import { IconChevronDown } from '@/components/shared/Icons';

interface SchemaSummaryPanelProps {
  /** Optional override — current manual-builder fields, used when no parsed schema exists yet. */
  fields?: FieldRow[];
  onRestoreHistory?: (fields: FieldRow[]) => void;
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function SchemaSummaryPanel({ fields, onRestoreHistory }: SchemaSummaryPanelProps) {
  const { parsedSchema, parseError } = useSchemaStore();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [entries, setEntries] = useState<SchemaHistoryEntry[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getHistory();
    setEntries(history);
  }, []);

  useEffect(() => {
    if (isHistoryOpen) loadHistory();
  }, [isHistoryOpen, loadHistory]);

  // Prefer the live parsed schema; fall back to raw builder fields if it hasn't synced yet.
  const columns = useMemo(() => {
    const table = parsedSchema?.tables?.[0];
    if (table && table.columns.length > 0) {
      return table.columns.map((c) => ({ name: c.name, type: c.type }));
    }
    if (fields && fields.length > 0) {
      return fields.filter((f) => f.name.trim()).map((f) => ({ name: f.name, type: f.typeId }));
    }
    return [];
  }, [parsedSchema, fields]);

  const tableCount = parsedSchema?.tables?.length || (columns.length > 0 ? 1 : 0);

  const handleDelete = async (id: string) => {
    await deleteFromHistory(id);
    await loadHistory();
  };

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
  };

  const hasContent = columns.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
        <h3 className="mb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Schema Summary
        </h3>

        {parseError && (
          <div className="mb-3 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-xs text-error">
            {parseError}
          </div>
        )}

        {!hasContent ? (
          <div className="py-6 text-center">
            <p className="text-xs text-text-muted leading-relaxed">
              Nothing to preview yet — paste a schema or add fields to see a live summary.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-2xl font-semibold text-text-primary leading-none">{columns.length}</p>
                <p className="mt-1 text-[11px] text-text-muted">Field{columns.length !== 1 ? 's' : ''}</p>
              </div>
              {tableCount > 0 && (
                <div className="border-l border-border-subtle pl-4">
                  <p className="text-2xl font-semibold text-text-primary leading-none">{tableCount}</p>
                  <p className="mt-1 text-[11px] text-text-muted">Table{tableCount !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            {columns.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-medium text-text-muted">Fields</p>
                <ul className="max-h-[280px] overflow-y-auto rounded-lg border border-border-subtle divide-y divide-border-subtle">
                  {columns.map((c, idx) => (
                    <li
                      key={`${c.name}-${idx}`}
                      className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="font-mono text-text-primary truncate">{c.name || '—'}</span>
                      <span className="shrink-0 rounded border border-border-subtle bg-bg-tertiary px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                        {c.type || 'unknown'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapsible History section */}
      <div className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden">
        <button
          onClick={() => setIsHistoryOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          aria-expanded={isHistoryOpen}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </span>
          <IconChevronDown
            size={16}
            className={`text-text-muted transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isHistoryOpen && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-border-subtle">
            <div className="flex items-center justify-end px-4 py-2">
              {entries.length > 0 && (
                <button
                  onClick={handleClear}
                  className="text-[11px] text-text-muted hover:text-error transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="px-4 pb-4 text-center">
                <p className="text-xs text-text-muted">No saved schemas yet.</p>
                <p className="mt-1 text-[11px] text-text-muted/70">Schemas are saved automatically when you generate data.</p>
              </div>
            ) : (
              <ul className="max-h-[240px] overflow-y-auto divide-y divide-border-subtle/50">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {entry.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {entry.fields.length} field{entry.fields.length !== 1 ? 's' : ''} &middot; {formatTime(entry.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRestoreHistory?.(entry.fields)}
                      className="shrink-0 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/20 transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-all"
                      aria-label={`Delete ${entry.name}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
