import { useState, useCallback, useRef } from 'react';
import { runWorkerPool, getWorkerCount, type PoolProgress } from '@/lib/workerPool';
import type { FieldDef } from '@/workers/generation.worker';

interface UseWorkerPoolReturn {
  generate: (fields: FieldDef[], rowCount: number) => void;
  generateMultiTable: (tables: MultiTableGenDef[]) => void;
  rows: Record<string, unknown>[];
  multiTableRows: Record<string, Record<string, unknown>[]>;
  activeViewTable: string | null;
  setActiveViewTable: (name: string | null) => void;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  workerCount: number;
  duration: number | null;
}

export interface MultiTableGenDef {
  tableName: string;
  fields: FieldDef[];
  rowCount: number;
  /** Relations where this table is the child: fromField references toTable.toField */
  relations: {
    fromField: string;
    toTable: string;
    toField: string;
  }[];
}

/**
 * Hook that uses worker pool for parallel generation.
 * Supports single-table and multi-table relational generation.
 */
export function useWorkerPool(): UseWorkerPoolReturn {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [multiTableRows, setMultiTableRows] = useState<Record<string, Record<string, unknown>[]>>({});
  const [activeViewTable, setActiveViewTable] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const abortRef = useRef(false);

  const workerCount = getWorkerCount();

  // Single table generation (original API)
  const generate = useCallback((fields: FieldDef[], rowCount: number) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setRows([]);
    setMultiTableRows({});
    setActiveViewTable(null);
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

  // Multi-table relational generation
  const generateMultiTable = useCallback(async (tables: MultiTableGenDef[]) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setRows([]);
    setMultiTableRows({});
    setDuration(null);
    abortRef.current = false;

    const start = performance.now();
    const allResults: Record<string, Record<string, unknown>[]> = {};
    const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
    let generatedSoFar = 0;

    try {
      // Tables should already be in topological order (parents first)
      for (const tableDef of tables) {
        if (abortRef.current) break;

        // Build relational context for this table from previously generated parent tables
        const relationalContext: Record<string, unknown[]> = {};
        for (const rel of tableDef.relations) {
          const parentRows = allResults[rel.toTable];
          if (parentRows && parentRows.length > 0) {
            const key = `${rel.toTable}.${rel.toField}`;
            relationalContext[key] = parentRows.map(row => row[rel.toField]);
          }
        }

        // Mark FK fields so the worker knows to draw from context
        const fieldsWithFKRef = tableDef.fields.map(f => {
          const rel = tableDef.relations.find(r => r.fromField === f.name);
          if (rel) {
            return { ...f, foreignKeyRef: `${rel.toTable}.${rel.toField}` };
          }
          return f;
        });

        const result = await runWorkerPool({
          fields: fieldsWithFKRef,
          rowCount: tableDef.rowCount,
          relationalContext: Object.keys(relationalContext).length > 0 ? relationalContext : undefined,
          onProgress: (p: PoolProgress) => {
            if (!abortRef.current) {
              const tableProgress = (generatedSoFar + (p.generated || 0)) / totalRows;
              setProgress(Math.min(99, Math.floor(tableProgress * 100)));
            }
          },
          onPartial: (partialRows) => {
            if (!abortRef.current && Object.keys(allResults).length === 0) {
              // Show partial for first table only
              setRows(partialRows);
            }
          },
        });

        allResults[tableDef.tableName] = result.rows;
        generatedSoFar += tableDef.rowCount;
      }

      if (!abortRef.current) {
        setMultiTableRows(allResults);
        // Set rows to the first table for backward compat with ExportPanel
        const firstTableName = tables[0]?.tableName;
        if (firstTableName && allResults[firstTableName]) {
          setRows(allResults[firstTableName]);
          setActiveViewTable(firstTableName);
        }
        setIsGenerating(false);
        setProgress(100);
        setDuration(Math.round(performance.now() - start));
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : 'Multi-table generation failed');
        setIsGenerating(false);
      }
    }
  }, []);

  return {
    generate,
    generateMultiTable,
    rows,
    multiTableRows,
    activeViewTable,
    setActiveViewTable,
    isGenerating,
    progress,
    error,
    workerCount,
    duration,
  };
}
