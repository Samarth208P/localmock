import { useEffect, useRef, useState } from 'react';

interface StreamingProgressProps {
  generated: number;
  total: number;
  eta: number;
  percent: number;
}

export function StreamingProgress({ generated, total, eta, percent }: StreamingProgressProps) {
  const [rate, setRate] = useState<number | null>(null);
  const lastSampleRef = useRef<{ generated: number; time: number } | null>(null);

  // Track rows/sec throughput from deltas between progress updates.
  useEffect(() => {
    const now = performance.now();
    const last = lastSampleRef.current;
    if (last) {
      const deltaRows = generated - last.generated;
      const deltaSeconds = (now - last.time) / 1000;
      if (deltaSeconds > 0.05 && deltaRows > 0) {
        setRate(Math.round(deltaRows / deltaSeconds));
      }
    }
    lastSampleRef.current = { generated, time: now };
  }, [generated]);

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
        <span className="flex items-center gap-2">
          {rate !== null && rate > 0 && <span className="font-mono">{rate.toLocaleString()} rows/s</span>}
          {eta > 0 && <span>ETA: {formatEta(eta)}</span>}
        </span>
      </div>
    </div>
  );
}
