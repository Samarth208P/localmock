interface StreamingProgressProps {
  generated: number;
  total: number;
  eta: number;
  percent: number;
}

export function StreamingProgress({ generated, total, eta, percent }: StreamingProgressProps) {
  const formatEta = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-text-primary">Streaming to file...</span>
        <span className="text-text-muted font-mono">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>
          {generated.toLocaleString()} / {total.toLocaleString()} rows
        </span>
        {eta > 0 && <span>ETA: {formatEta(eta)}</span>}
      </div>
    </div>
  );
}
