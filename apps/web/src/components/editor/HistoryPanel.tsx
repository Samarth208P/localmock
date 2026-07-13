import { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteFromHistory, clearHistory, type SchemaHistoryEntry } from '@/lib/schemaHistory';
import type { FieldRow } from '@/components/editor/FieldBuilder';

interface HistoryPanelProps {
  onRestore: (fields: FieldRow[]) => void;
}

export function HistoryPanel({ onRestore }: HistoryPanelProps) {
  const [entries, setEntries] = useState<SchemaHistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    const history = await getHistory();
    setEntries(history);
  }, []);

  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen, loadHistory]);

  const handleDelete = async (id: string) => {
    await deleteFromHistory(id);
    await loadHistory();
  };

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - ts;

    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
        aria-label="Open schema history"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        History
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h3 className="text-sm font-medium text-text-primary">Schema History</h3>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[11px] text-text-muted hover:text-error transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close history"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-6 text-center">
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
                onClick={() => onRestore(entry.fields)}
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
  );
}
