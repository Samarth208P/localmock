import { useState, useCallback, useRef } from 'react';
import * as Comlink from 'comlink';
import type { GenerationAPI, FieldDef } from '@/workers/comlink.worker';

interface UseComlinkWorkerReturn {
  generate: (fields: FieldDef[], rowCount: number) => Promise<void>;
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook using Comlink for a clean async worker API.
 * Instead of message passing, call `worker.generate(fields, count)` directly.
 */
export function useComlinkWorker(): UseComlinkWorkerReturn {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<Comlink.Remote<GenerationAPI> | null>(null);

  const getApi = useCallback(() => {
    if (!apiRef.current) {
      const worker = new Worker(
        new URL('../workers/comlink.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerRef.current = worker;
      apiRef.current = Comlink.wrap<GenerationAPI>(worker);
    }
    return apiRef.current;
  }, []);

  const generate = useCallback(async (fields: FieldDef[], rowCount: number) => {
    setIsGenerating(true);
    setError(null);
    setRows([]);

    try {
      const api = getApi();
      const result = await api.generate(fields, rowCount);
      setRows(result as Record<string, unknown>[]);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [getApi]);

  return { generate, rows, isGenerating, error };
}
