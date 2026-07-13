import { useState, useCallback, useRef } from 'react';
import { runWorkerPool, getWorkerCount, type PoolProgress } from '@/lib/workerPool';
import type { FieldDef } from '@/workers/generation.worker';

interface UseWorkerPoolReturn {
  generate: (fields: FieldDef[], rowCount: number) => void;
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
  workerCount: number;
  duration: number | null;
}

/**
 * Hook that uses worker pool for parallel generation.
 * Automatically splits work across available CPU cores.
 */
export function useWorkerPool(): UseWorkerPoolReturn {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const abortRef = useRef(false);

  const workerCount = getWorkerCount();

  const generate = useCallback((fields: FieldDef[], rowCount: number) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setRows([]);
    setDuration(null);
    abortRef.current = false;

    runWorkerPool({
      fields,
      rowCount,
      onProgress: (p: PoolProgress) => {
        if (!abortRef.current) {
          setProgress(p.percent);
        }
      },
      onPartial: (partialRows) => {
        // Show first rows immediately for incremental preview
        if (!abortRef.current) {
          setRows(partialRows);
        }
      },
    })
      .then((result) => {
        if (!abortRef.current) {
          setRows(result.rows);
          setIsGenerating(false);
          setProgress(100);
          setDuration(result.duration);
        }
      })
      .catch((err) => {
        if (!abortRef.current) {
          setError(err.message);
          setIsGenerating(false);
        }
      });
  }, []);

  return { generate, rows, isGenerating, progress, error, workerCount, duration };
}
