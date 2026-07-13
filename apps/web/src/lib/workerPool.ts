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
  const { fields, rowCount, onProgress, onPartial, maxWorkers } = options;
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
        const data = event.data;

        switch (data.type) {
          case 'progress':
            progress[i] = data.generated;
            if (onProgress) {
              const totalGenerated = progress.reduce((a, b) => a + b, 0);
              onProgress({
                generated: totalGenerated,
                total: rowCount,
                percent: Math.round((totalGenerated / rowCount) * 100),
              });
            }
            break;

          case 'result':
            results[i] = data.rows;
            completedWorkers++;

            // Send partial results from first worker immediately
            if (i === 0 && onPartial && data.rows.length > 0) {
              onPartial(data.rows.slice(0, 10));
            }

            if (completedWorkers === workerCount) {
              // Merge all results in order
              const merged: Record<string, unknown>[] = [];
              for (const chunk of results) {
                if (chunk) merged.push(...chunk);
              }

              // Terminate all workers
              workers.forEach((w) => w.terminate());

              resolve({
                rows: merged,
                duration: performance.now() - start,
              });
            }
            break;

          case 'error':
            hasError = true;
            workers.forEach((w) => w.terminate());
            reject(new Error(data.message));
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
      });
    }
  });
}
