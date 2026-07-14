import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface PreviewTableProps {
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

const COL_WIDTH = 180;
const ROW_HEIGHT = 32;

type SortDir = 'asc' | 'desc';

export function PreviewTable({ rows, isGenerating, progress, error }: PreviewTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      const aEmpty = av === null || av === undefined;
      const bEmpty = bv === null || bv === undefined;
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        return (av === bv ? 0 : av ? -1 : 1) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortColumn, sortDir]);

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  });

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  // Empty state
  if (!isGenerating && rows.length === 0 && !error) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-text-muted">
        <div className="rounded-2xl border border-border-subtle bg-bg-secondary/50 p-8 text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
              <path d="M3 10h18M3 14h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-secondary">No data yet</p>
          <p className="text-xs mt-1.5 text-text-muted">Paste a schema and generate to see a preview</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-scale-in rounded-xl border border-error/20 bg-error/5 px-5 py-4 text-sm text-error max-w-md text-center">
          <p className="font-medium">Generation failed</p>
          <p className="mt-1 text-xs opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  // Generating state
  if (isGenerating) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-text-muted">Generating... {progress}%</p>
      </div>
    );
  }

  const gridWidth = columns.length * COL_WIDTH;

  return (
    <div className="animate-in flex h-full flex-col">
      {/* Summary header */}
      <div className="mb-4 flex-shrink-0 rounded-xl border border-success/20 bg-success/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <span className="text-success text-sm">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {rows.length.toLocaleString()} rows generated
            </p>
            <p className="text-xs text-text-muted">
              {columns.length} columns · Ready to download
            </p>
          </div>
        </div>
      </div>

      {/* Virtualized data grid */}
      <div className="min-h-0 flex-1 rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden flex flex-col">
        <div ref={parentRef} className="custom-scrollbar flex-1 overflow-auto">
          <div style={{ width: gridWidth, minWidth: '100%' }}>
            {/* Header row */}
            <div
              className="sticky top-0 z-10 flex border-b border-border-subtle bg-bg-tertiary"
              style={{ width: gridWidth }}
            >
              {columns.map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{ width: COL_WIDTH }}
                  className="flex flex-shrink-0 items-center gap-1 truncate px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted transition-colors hover:text-text-primary"
                  title={`Sort by ${col}`}
                >
                  <span className="truncate">{col}</span>
                  {sortColumn === col && (
                    <span className="text-accent">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Virtualized rows */}
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative', width: gridWidth }}>
              {virtualizer.getVirtualItems().map((vRow) => {
                const row = sortedRows[vRow.index];
                return (
                  <div
                    key={vRow.index}
                    className="absolute left-0 flex border-b border-border-subtle/30 hover:bg-bg-tertiary/40"
                    style={{
                      top: 0,
                      transform: `translateY(${vRow.start}px)`,
                      height: vRow.size,
                      width: gridWidth,
                    }}
                  >
                    {columns.map((col) => {
                      const val = row[col];
                      const corrupted = isChaosCorrupted(val);
                      const display = formatValue(val);
                      return (
                        <div
                          key={col}
                          style={{ width: COL_WIDTH }}
                          title={display}
                          className={`flex flex-shrink-0 items-center truncate px-3 font-mono text-xs ${
                            corrupted ? 'bg-warning/10 text-warning' : 'text-text-primary'
                          }`}
                        >
                          {display}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="mt-3 flex-shrink-0 text-center text-[11px] text-text-muted">
        Use the export panel on the left to download your full dataset.
      </p>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return String(value);
}

/** Heuristic for likely chaos-engine corrupted cells. */
function isChaosCorrupted(value: unknown): boolean {
  if (value === null) return true;
  if (typeof value === 'string') {
    if (value.trim() === '') return true;
    if (value.includes('�')) return true;
  }
  return false;
}
