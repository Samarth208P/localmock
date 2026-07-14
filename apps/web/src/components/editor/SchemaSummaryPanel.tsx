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

/** Very rough placeholder value per inferred type — cosmetic only, not the real generator. */
function sampleValueFor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('email')) return 'jane@example.com';
  if (t.includes('uuid') || t.includes('id')) return 'a1b2c3d4-...';
  if (t.includes('bool')) return 'true';
  if (t.includes('date') || t.includes('time')) return '2024-03-11';
  if (t.includes('phone')) return '+1 555-0182';
  if (t.includes('url') || t.includes('link') || t.includes('website')) return 'https://example.com';
  if (t.includes('name')) return 'Jane Doe';
  if (t.includes('address') || t.includes('city') || t.includes('country')) return '123 Main St';
  if (t.includes('num') || t.includes('int') || t.includes('float') || t.includes('price') || t.includes('amount')) return '482';
  if (t.includes('string') || t.includes('sentence') || t.includes('text') || t.includes('word')) return 'Lorem ipsum';
  return '—';
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

  const distinctTypes = useMemo(() => {
    const seen = new Set<string>();
    for (const c of columns) {
      if (c.type) seen.add(c.type);
      if (seen.size >= 8) break;
    }
    return Array.from(seen).slice(0, 8);
  }, [columns]);

  const previewColumns = columns.slice(0, 3);
  const previewRows = previewColumns.length > 0 ? [0, 1, 2] : [];

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

            {distinctTypes.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-[11px] font-medium text-text-muted">Detected types</p>
                <div className="flex flex-wrap gap-1.5">
                  {distinctTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-md border border-border-subtle bg-bg-tertiary px-2 py-0.5 text-[10px] font-mono text-text-secondary"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {previewColumns.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-medium text-text-muted">Live preview</p>
                <div className="overflow-x-auto rounded-lg border border-border-subtle">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border-subtle bg-bg-tertiary/50">
                        {previewColumns.map((c) => (
                          <th key={c.name} className="px-2.5 py-1.5 text-left font-medium text-text-secondary truncate max-w-[100px]">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((rowIdx) => (
                        <tr key={rowIdx} className={rowIdx !== previewRows.length - 1 ? 'border-b border-border-subtle/50' : ''}>
                          {previewColumns.map((c) => (
                            <td key={c.name} className="px-2.5 py-1.5 font-mono text-text-muted truncate max-w-[100px]">
                              {sampleValueFor(c.type)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
