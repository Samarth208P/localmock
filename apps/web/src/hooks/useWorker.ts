import { useRef, useCallback, useState } from 'react';
import type { FieldDef, WorkerOutMessage } from '@/workers/generation.worker';

interface UseWorkerReturn {
  generate: (fields: FieldDef[], rowCount: number) => void;
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export function useWorker(): UseWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback((fields: FieldDef[], rowCount: number) => {
    // Terminate existing worker if running
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setRows([]);

    const worker = new Worker(
      new URL('../workers/generation.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const data = event.data;

      switch (data.type) {
        case 'progress':
          setProgress(Math.round((data.generated / data.total) * 100));
          break;
        case 'result':
          setRows(data.rows);
          setIsGenerating(false);
          setProgress(100);
          break;
        case 'error':
          setError(data.message);
          setIsGenerating(false);
          break;
      }
    };

    worker.onerror = (err) => {
      setError(err.message || 'Worker crashed unexpectedly');
      setIsGenerating(false);
    };

    worker.postMessage({ type: 'generate', fields, rowCount });
    workerRef.current = worker;
  }, []);

  return { generate, rows, isGenerating, progress, error };
}
