/**
 * Worker Pool for parallel data generation.
 *
 * Detects navigator.hardwareConcurrency, spawns N workers,
 * splits rowCount evenly, each worker generates its chunk,
 * main thread merges results in order.
 */

import type { FieldDef, WorkerOutMessage } from '@/workers/generation.worker';

export interface PoolProgress {
  generated: number;
  total: number;
  percent: number;
}

export interface WorkerPoolOptions {
  fields: FieldDef[];
  rowCount: number;
  onProgress?: (progress: PoolProgress) => void;
  onPartial?: (rows: Record<string, unknown>[]) => void;
  maxWorkers?: number;
  relationalContext?: Record<string, unknown[]>;
}

export interface WorkerPoolResult {
  rows: Record<string, unknown>[];
  duration: number; // ms
}

/**
 * Get optimal worker count for the current machine.
 */
export function getWorkerCount(maxOverride?: number): number {
  const cores = navigator.hardwareConcurrency || 4;
  // Use cores - 1 to leave one thread for the main thread, min 2, max 8
  const optimal = Math.max(2, Math.min(8, cores - 1));
  return maxOverride ? Math.min(optimal, maxOverride) : optimal;
}

/**
 * Split a total count into N roughly-equal chunks.
 */
function splitWork(total: number, chunks: number): number[] {
  const base = Math.floor(total / chunks);
  const remainder = total % chunks;
  return Array.from({ length: chunks }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Run generation across a pool of workers in parallel.
 */
export function runWorkerPool(options: WorkerPoolOptions): Promise<WorkerPoolResult> {
  const { fields, rowCount, onProgress, onPartial, maxWorkers, relationalContext } = options;
  const workerCount = getWorkerCount(maxWorkers);
  const chunks = splitWork(rowCount, workerCount);
  const start = performance.now();

  return new Promise((resolve, reject) => {
    const results: (Record<string, unknown>[] | null)[] = new Array(workerCount).fill(null);
    const progress: number[] = new Array(workerCount).fill(0);
    let completedWorkers = 0;
    let hasError = false;

    const workers: Worker[] = [];

    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        new URL('../workers/generation.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workers.push(worker);

      worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
        if (hasError) return;
        const msg = event.data;

        switch (msg.type) {
          case 'partial':
            // Send partial results from first worker immediately
            if (i === 0 && onPartial) {
              onPartial(msg.rows);
            }
            break;
          case 'progress':
            progress[i] = msg.generated;
            if (onProgress) {
              const totalGenerated = progress.reduce((a, b) => a + b, 0);
              onProgress({
                generated: totalGenerated,
                total: rowCount,
                percent: Math.min(100, Math.floor((totalGenerated / rowCount) * 100)),
              });
            }
            break;
          case 'result':
            results[i] = msg.rows;
            completedWorkers++;
            if (completedWorkers === workerCount) {
              const allRows = results.reduce((acc: Record<string, unknown>[], curr) => {
                if (curr) acc.push(...curr);
                return acc;
              }, []);
              
              // Terminate all workers
              workers.forEach((w) => w.terminate());
              resolve({
                rows: allRows,
                duration: Math.round(performance.now() - start),
              });
            }
            break;
          case 'error':
            if (hasError) return;
            hasError = true;
            workers.forEach((w) => w.terminate());
            reject(new Error(msg.message));
            break;
        }
      };

      worker.onerror = (err) => {
        if (hasError) return;
        hasError = true;
        workers.forEach((w) => w.terminate());
        reject(new Error(err.message || `Worker ${i} crashed`));
      };

      // Send work to this worker
      worker.postMessage({
        type: 'generate',
        fields,
        rowCount: chunks[i],
        relationalContext,
      });
    }
  });
}
