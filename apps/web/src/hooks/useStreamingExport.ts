import { useState, useCallback, useRef } from 'react';
import { supportsFileSystemAccess } from '@/lib/browserDetect';
import type { FieldDef } from '@/workers/generation.worker';

interface StreamingProgress {
  generated: number;
  total: number;
  eta: number; // seconds remaining
  percent: number;
}

interface UseStreamingExportReturn {
  startStreaming: (
    fields: FieldDef[],
    rowCount: number,
    format: 'csv' | 'json' | 'jsonl' | 'sql',
    tableName: string,
    sqlDialect?: 'postgres' | 'mysql' | 'sqlite',
  ) => Promise<void>;
  isStreaming: boolean;
  progress: StreamingProgress | null;
  error: string | null;
  isAvailable: boolean;
}

export function useStreamingExport(): UseStreamingExportReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<StreamingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const isAvailable = supportsFileSystemAccess();

  const startStreaming = useCallback(
    async (
      fields: FieldDef[],
      rowCount: number,
      format: 'csv' | 'json' | 'jsonl' | 'sql',
      tableName: string,
      sqlDialect?: 'postgres' | 'mysql' | 'sqlite',
    ) => {
      if (!isAvailable) {
        setError('File System Access API not supported in this browser');
        return;
      }

      const ext = format === 'sql' ? 'sql' : format === 'jsonl' ? 'jsonl' : format;

      try {
        // Request file handle from user
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `localmock_${rowCount.toLocaleString()}.${ext}`,
          types: [
            {
              description: 'Export file',
              accept: { 'application/octet-stream': [`.${ext}`] },
            },
          ],
        });

        const writable = await handle.createWritable();

        setIsStreaming(true);
        setProgress({ generated: 0, total: rowCount, eta: 0, percent: 0 });
        setError(null);

        // Spawn streaming worker
        const worker = new Worker(
          new URL('../workers/streaming.worker.ts', import.meta.url),
          { type: 'module' },
        );
        workerRef.current = worker;
        let writeChain: Promise<void> = Promise.resolve();

        worker.onmessage = async (event) => {
          const data = event.data;

          switch (data.type) {
            case 'chunk':
              writeChain = writeChain.then(() => writable.write(data.text));
              await writeChain;
              break;

            case 'stream-progress':
              setProgress({
                generated: data.generated,
                total: data.total,
                eta: data.eta,
                percent: Math.round((data.generated / data.total) * 100),
              });
              break;

            case 'stream-done':
              await writeChain;
              await writable.close();
              setIsStreaming(false);
              setProgress({ generated: data.totalRows, total: data.totalRows, eta: 0, percent: 100 });
              worker.terminate();
              break;

            case 'stream-error':
              await writable.abort();
              setError(data.message);
              setIsStreaming(false);
              worker.terminate();
              break;
          }
        };

        worker.onerror = async (err) => {
          await writable.abort();
          setError(err.message || 'Streaming worker crashed');
          setIsStreaming(false);
        };

        // Start generation
        worker.postMessage({
          type: 'stream-generate',
          fields,
          rowCount,
          format,
          tableName,
          sqlDialect,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User cancelled file picker
          return;
        }
        setError(err?.message || 'Failed to start streaming export');
        setIsStreaming(false);
      }
    },
    [isAvailable],
  );

  return { startStreaming, isStreaming, progress, error, isAvailable };
}
