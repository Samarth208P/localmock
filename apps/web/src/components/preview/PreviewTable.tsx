interface PreviewTableProps {
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export function PreviewTable({ rows, isGenerating, progress, error }: PreviewTableProps) {
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

  // Success: show sample row + summary
  const columns = Object.keys(rows[0]);
  const sampleRow = rows[0];

  return (
    <div className="animate-in flex h-full flex-col">
      {/* Summary header */}
      <div className="mb-6 rounded-xl border border-success/20 bg-success/5 p-4">
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

      {/* Sample row preview */}
      <div className="mb-4">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          Sample row (row 1 of {rows.length.toLocaleString()})
        </p>
        <div className="rounded-xl border border-border-subtle bg-bg-secondary overflow-hidden">
          {columns.map((col, idx) => (
            <div
              key={col}
              className={`flex items-center gap-4 px-4 py-2.5 ${
                idx < columns.length - 1 ? 'border-b border-border-subtle/50' : ''
              }`}
            >
              <span className="min-w-[140px] text-xs font-medium text-text-secondary">
                {col}
              </span>
              <span className="flex-1 truncate font-mono text-xs text-text-primary">
                {formatValue(sampleRow[col])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <p className="text-[11px] text-text-muted text-center mt-auto pt-4">
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
