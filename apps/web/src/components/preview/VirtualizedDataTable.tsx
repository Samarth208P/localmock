import { useRef, useMemo, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { showToast } from '@/components/shared/Toast';

interface VirtualizedDataTableProps {
  rows: Record<string, unknown>[];
  totalRowCount?: number;
}

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 38;

function formatCell(value: unknown): { text: string; isNull: boolean } {
  if (value === null) return { text: 'null', isNull: true };
  if (value === undefined) return { text: 'undefined', isNull: true };
  if (typeof value === 'boolean') return { text: String(value), isNull: false };
  if (typeof value === 'number') return { text: String(value), isNull: false };
  return { text: String(value), isNull: false };
}

/**
 * High-performance virtualized data grid. Only renders visible rows in the DOM,
 * so it stays smooth even with 100k+ row datasets.
 */
export function VirtualizedDataTable({ rows, totalRowCount }: VirtualizedDataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  /** Max 5 rows in preview by default; show all on toggle */
  const PREVIEW_LIMIT = 5;

  const columns = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]) : []), [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = rows.filter((row) =>
        columns.some((col) => String(row[col] ?? '').toLowerCase().includes(q)),
      );
    }
    if (!showAll && !search.trim()) {
      return result.slice(0, PREVIEW_LIMIT);
    }
    return result;
  }, [rows, columns, search, showAll]);

  const virtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const handleCellClick = useCallback((rowIdx: number, col: string, value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    navigator.clipboard.writeText(text).then(() => {
      const key = `${rowIdx}-${col}`;
      setCopiedCell(key);
      setTimeout(() => setCopiedCell((k) => (k === key ? null : k)), 900);
    }).catch(() => {
      showToast('Failed to copy cell', 'error');
    });
  }, []);

  if (rows.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-text-muted">
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-8 text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
              <path d="M3 10h18M3 14h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-secondary">No data yet</p>
          <p className="text-xs mt-1.5 text-text-muted">Generate a dataset to see a live, scrollable preview here</p>
        </div>
      </div>
    );
  }

  const gridTemplate = `56px repeat(${columns.length}, minmax(140px, 1fr))`;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter visible rows..."
            aria-label="Filter preview rows"
            className="w-full rounded-lg border border-border-subtle bg-bg-tertiary pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none transition-all duration-200"
          />
        </div>
        <span className="text-[11px] text-text-muted shrink-0 font-mono">
          {search
            ? `${filteredRows.length.toLocaleString()} / ${rows.length.toLocaleString()} shown`
            : showAll
              ? `${rows.length.toLocaleString()} rows · ${columns.length} cols`
              : `Sample ${Math.min(PREVIEW_LIMIT, rows.length)} of ${(totalRowCount ?? rows.length).toLocaleString()} rows · ${columns.length} cols`}
        </span>
      </div>

      {/* Grid */}
      <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
        <div style={{ minWidth: 56 + columns.length * 140 }}>
          {/* Header row */}
          <div
            className="sticky top-0 z-10 grid border-b border-border-subtle bg-bg-secondary text-[11px] font-semibold text-text-muted uppercase tracking-wide"
            style={{ gridTemplateColumns: gridTemplate, height: HEADER_HEIGHT }}
          >
            <div className="flex items-center justify-center border-r border-border-subtle/50">#</div>
            {columns.map((col) => (
              <div key={col} className="flex items-center px-3 border-r border-border-subtle/50 truncate" title={col}>
                {col}
              </div>
            ))}
          </div>

          {/* Virtualized rows */}
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = filteredRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  className="grid absolute left-0 right-0 border-b border-border-subtle/30 hover:bg-bg-tertiary/40 transition-colors"
                  style={{
                    gridTemplateColumns: gridTemplate,
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="flex items-center justify-center text-[11px] text-text-muted/70 font-mono border-r border-border-subtle/30">
                    {virtualRow.index + 1}
                  </div>
                  {columns.map((col) => {
                    const { text, isNull } = formatCell(row[col]);
                    const cellKey = `${virtualRow.index}-${col}`;
                    const isCopied = copiedCell === cellKey;
                    return (
                      <button
                        key={col}
                        onClick={() => handleCellClick(virtualRow.index, col, row[col])}
                        title={`Click to copy: ${text}`}
                        className={`flex items-center px-3 truncate text-left border-r border-border-subtle/30 font-mono text-[12px] transition-colors ${
                          isNull ? 'text-text-muted/50 italic' : 'text-text-primary'
                        } ${isCopied ? 'bg-accent/15' : ''}`}
                      >
                        <span className="truncate">{isCopied ? 'Copied!' : text}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {filteredRows.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-text-muted">
              No rows match "{search}"
            </div>
          )}
        </div>
      </div>

      {/* Show all / Show sample toggle */}
      {rows.length > PREVIEW_LIMIT && !search.trim() && (
        <div className="shrink-0 border-t border-border-subtle px-4 py-2.5 flex items-center justify-between bg-bg-secondary/80 backdrop-blur-sm">
          <p className="text-[11px] text-text-muted">
            {showAll
              ? `Showing all ${rows.length.toLocaleString()} rows`
              : `Showing ${PREVIEW_LIMIT} of ${(totalRowCount ?? rows.length).toLocaleString()} rows`}
          </p>
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-press rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-[11px] font-medium text-text-secondary hover:text-accent hover:border-accent/40 transition-all duration-200"
          >
            {showAll ? 'Show sample (5 rows)' : `Show all ${rows.length.toLocaleString()} rows`}
          </button>
        </div>
      )}
    </div>
  );
}
