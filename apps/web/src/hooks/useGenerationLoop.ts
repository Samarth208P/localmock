import { useCallback, useRef, useState } from 'react';
import type { ChaosConfig } from '@localmock/core/chaos';
import type { GenerationJob, GenerationJobField } from '@localmock/core/jobs';
import {
  runSchemaLoop,
  type CanonicalDataset,
  type LoopDiagnostic,
  type LoopPhase,
  type LoopTraceEntry,
  type LoopResult,
  type LoopValidation,
} from '@localmock/core/loops';
import { ALL_DATA_TYPES } from '@/lib/dataTypes';
import { getWorkerCount, runWorkerPool, type PoolProgress } from '@/lib/workerPool';
import type { FieldDef } from '@/workers/generation.worker';

export interface MultiTableGenDef {
  tableName: string;
  fields: FieldDef[];
  rowCount: number;
  relations: {
    fromField: string;
    toTable: string;
    toField: string;
  }[];
}

export interface GenerationRunOptions {
  seed?: string | number;
  chaos?: ChaosConfig;
  tableName?: string;
}

export interface GenerationLoopRun {
  runId: string;
  seed: string | number;
  operation: 'generation';
  status: 'running' | 'success' | 'failed' | 'needs_input';
  phase: LoopPhase;
  attempt: number;
  maxAttempts: number;
  job: GenerationJob;
  dataset: CanonicalDataset;
  validation: LoopValidation;
  errors: LoopDiagnostic[];
  warnings: LoopDiagnostic[];
  nextAction: string;
  trace: LoopTraceEntry[];
}

interface UseGenerationLoopReturn {
  generate: (fields: FieldDef[], rowCount: number, options?: GenerationRunOptions) => void;
  generateMultiTable: (tables: MultiTableGenDef[], options?: GenerationRunOptions) => void;
  cancel: () => void;
  rows: Record<string, unknown>[];
  multiTableRows: CanonicalDataset;
  activeViewTable: string | null;
  setActiveViewTable: (name: string | null) => void;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  workerCount: number;
  duration: number | null;
  loopRun: GenerationLoopRun | null;
  canExport: boolean;
}

const SUPPORTED_TYPES = new Set(ALL_DATA_TYPES.map((type) => type.id));
const EMPTY_VALIDATION: LoopValidation = { ok: false, errors: [], warnings: [] };
function validateDatasetInWorker(
  job: GenerationJob,
  dataset: CanonicalDataset,
  maxIterations: number,
  onTransition: (entry: LoopTraceEntry) => void,
): Promise<LoopResult<CanonicalDataset>> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/validation.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      if (event.data.type === 'validation-transition') {
        onTransition(event.data.entry as LoopTraceEntry);
      } else if (event.data.type === 'validation-complete') {
        resolve(event.data.result as LoopResult<CanonicalDataset>);
        worker.terminate();
      } else if (event.data.type === 'validation-error') {
        reject(new Error(event.data.message));
        worker.terminate();
      }
    };
    worker.onerror = (event) => {
      reject(new Error(event.message || 'Dataset validation worker crashed.'));
      worker.terminate();
    };
    worker.postMessage({ type: 'validate-dataset', job, dataset, maxIterations });
  });
}

function fieldToJobField(field: FieldDef, relations: MultiTableGenDef['relations'] = []): GenerationJobField {
  const relation = relations.find((candidate) => candidate.fromField === field.name);
  return {
    name: field.name,
    type: field.typeId,
    options: field.options,
    unique: field.unique,
    primaryKey: field.primaryKey,
    nullable: field.primaryKey ? false : undefined,
    foreignKey: relation ? { table: relation.toTable, field: relation.toField } : undefined,
  };
}

function makeRunId(seed: string | number): string {
  return `generation-${String(seed)}-${Date.now().toString(36)}`;
}

function initialRun(job: GenerationJob, runId: string): GenerationLoopRun {
  return {
    runId,
    seed: job.seed,
    operation: 'generation',
    status: 'running',
    phase: 'planning',
    attempt: 1,
    maxAttempts: 2,
    job,
    dataset: {},
    validation: EMPTY_VALIDATION,
    errors: [],
    warnings: [],
    nextAction: 'validate_schema',
    trace: [],
  };
}

export function useGenerationLoop(): UseGenerationLoopReturn {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [multiTableRows, setMultiTableRows] = useState<CanonicalDataset>({});
  const [activeViewTable, setActiveViewTable] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loopRun, setLoopRun] = useState<GenerationLoopRun | null>(null);
  const generationRef = useRef(0);

  const workerCount = getWorkerCount();

  const cancel = useCallback(() => {
    generationRef.current += 1;
    setIsGenerating(false);
    setError('Generation cancelled.');
    setLoopRun((current) => current ? {
      ...current,
      status: 'failed',
      phase: 'failed',
      nextAction: 'Start a new generation run when ready.',
      errors: [{
        code: 'GENERATION_CANCELLED',
        path: '',
        message: 'Generation was cancelled by the user.',
        severity: 'error',
        retryable: true,
        repairable: false,
      }],
    } : current);
  }, []);

  const runGeneration = useCallback(async (
    job: GenerationJob,
    producer: (seed: string | number, generationId: number) => Promise<CanonicalDataset>,
  ) => {
    const generationId = generationRef.current + 1;
    generationRef.current = generationId;
    const runId = makeRunId(job.seed);
    const start = performance.now();
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setRows([]);
    setMultiTableRows({});
    setActiveViewTable(null);
    setDuration(null);
    setLoopRun(initialRun(job, runId));

    const schemaResult = await runSchemaLoop(job, { supportedTypes: SUPPORTED_TYPES });
    if (generationRef.current !== generationId) return;
    if (schemaResult.status !== 'success' || !schemaResult.result) {
      const message = schemaResult.errors[0]?.message ?? 'Schema validation requires input.';
      setIsGenerating(false);
      setError(null);
      setLoopRun({
        ...initialRun(job, runId),
        status: schemaResult.status === 'needs_input' ? 'needs_input' : 'failed',
        phase: schemaResult.finalPhase,
        validation: schemaResult.validation,
        errors: schemaResult.errors,
        warnings: schemaResult.warnings,
        nextAction: schemaResult.nextAction,
        trace: schemaResult.trace,
      });
      if (schemaResult.status === 'failed') setError(message);
      return;
    }

    const normalizedJob = schemaResult.result;
    setProgress(5);
    setLoopRun((current) => current ? {
      ...current,
      job: normalizedJob,
      phase: 'executing',
      warnings: schemaResult.warnings,
      trace: schemaResult.trace,
      nextAction: 'generate_data',
    } : current);

    try {
      const generated = await producer(normalizedJob.seed, generationId);
      if (generationRef.current !== generationId) return;
      setProgress(92);
      setLoopRun((current) => current ? {
        ...current,
        phase: 'validating',
        dataset: generated,
        nextAction: 'validate_dataset',
      } : current);

      const datasetResult = await validateDatasetInWorker(normalizedJob, generated, 2, (entry) => {
        if (generationRef.current !== generationId) return;
        setLoopRun((current) => current ? {
          ...current,
          phase: entry.phase,
          attempt: Math.max(1, entry.iteration),
          nextAction: entry.message ?? current.nextAction,
        } : current);
      });
      if (generationRef.current !== generationId) return;
      const canonicalDataset = datasetResult.result ?? generated;
      const firstTable = normalizedJob.tables[0]?.name;
      setMultiTableRows(canonicalDataset);
      setRows(firstTable ? canonicalDataset[firstTable] ?? [] : []);
      setActiveViewTable(firstTable ?? null);
      setProgress(100);
      setDuration(Math.round(performance.now() - start));
      setIsGenerating(false);
      setLoopRun({
        runId,
        seed: normalizedJob.seed,
        operation: 'generation',
        status: datasetResult.status === 'repairing' ? 'running' : datasetResult.status,
        phase: datasetResult.finalPhase,
        attempt: datasetResult.attempts,
        maxAttempts: 2,
        job: normalizedJob,
        dataset: canonicalDataset,
        validation: datasetResult.validation,
        errors: datasetResult.errors,
        warnings: [...schemaResult.warnings, ...datasetResult.warnings],
        nextAction: datasetResult.nextAction,
        trace: [...schemaResult.trace, ...datasetResult.trace],
      });
      if (datasetResult.status === 'failed') {
        setError(datasetResult.errors[0]?.message ?? 'Dataset validation failed.');
      }
    } catch (cause) {
      if (generationRef.current !== generationId) return;
      const message = cause instanceof Error ? cause.message : 'Generation failed.';
      const failure: LoopDiagnostic = {
        code: 'GENERATION_FAILED',
        path: '',
        message,
        severity: 'error',
        retryable: true,
        repairable: false,
      };
      setIsGenerating(false);
      setError(message);
      setLoopRun((current) => current ? {
        ...current,
        status: 'failed',
        phase: 'failed',
        validation: { ok: false, errors: [failure], warnings: current.warnings },
        errors: [failure],
        nextAction: 'Review the error and retry the generation run.',
      } : current);
    }
  }, []);

  const generate = useCallback((fields: FieldDef[], rowCount: number, options: GenerationRunOptions = {}) => {
    const seed = options.seed ?? crypto.randomUUID();
    const tableName = options.tableName ?? 'data';
    const job: GenerationJob = {
      version: 1,
      seed,
      tables: [{ name: tableName, rows: rowCount, fields: fields.map((field) => fieldToJobField(field)) }],
      chaos: options.chaos,
    };

    void runGeneration(job, async (runSeed, generationId) => {
      const result = await runWorkerPool({
        fields,
        rowCount,
        seed: runSeed,
        chaos: options.chaos,
        tableId: tableName,
        onProgress: (poolProgress: PoolProgress) => {
          if (generationRef.current === generationId) setProgress(Math.min(90, 5 + Math.floor(poolProgress.percent * 0.85)));
        },
      });
      return { [tableName]: result.rows };
    });
  }, [runGeneration]);

  const generateMultiTable = useCallback((tables: MultiTableGenDef[], options: GenerationRunOptions = {}) => {
    const seed = options.seed ?? crypto.randomUUID();
    const job: GenerationJob = {
      version: 1,
      seed,
      chaos: options.chaos,
      tables: tables.map((table) => ({
        name: table.tableName,
        rows: table.rowCount,
        fields: table.fields.map((field) => fieldToJobField(field, table.relations)),
      })),
    };

    void runGeneration(job, async (runSeed, generationId) => {
      const result: CanonicalDataset = {};
      const totalRows = tables.reduce((sum, table) => sum + table.rowCount, 0);
      let generatedRows = 0;
      for (const table of tables) {
        if (generationRef.current !== generationId) throw new Error('Generation cancelled.');
        const relationalContext: Record<string, unknown[]> = {};
        table.relations.forEach((relation) => {
          const parentRows = result[relation.toTable] ?? [];
          if (parentRows.length > 0) relationalContext[`${relation.toTable}.${relation.toField}`] = parentRows.map((row) => row[relation.toField]);
        });
        const fields = table.fields.map((field) => {
          const relation = table.relations.find((candidate) => candidate.fromField === field.name);
          return relation ? { ...field, foreignKeyRef: `${relation.toTable}.${relation.toField}` } : field;
        });
        const tableResult = await runWorkerPool({
          fields,
          rowCount: table.rowCount,
          relationalContext: Object.keys(relationalContext).length > 0 ? relationalContext : undefined,
          seed: runSeed,
          chaos: options.chaos,
          tableId: table.tableName,
          onProgress: (poolProgress: PoolProgress) => {
            if (generationRef.current !== generationId) return;
            const generated = generatedRows + (poolProgress.generated || 0);
            setProgress(Math.min(90, 5 + Math.floor((generated / Math.max(1, totalRows)) * 85)));
          },
        });
        result[table.tableName] = tableResult.rows;
        generatedRows += table.rowCount;
      }
      return result;
    });
  }, [runGeneration]);

  return {
    generate,
    generateMultiTable,
    cancel,
    rows,
    multiTableRows,
    activeViewTable,
    setActiveViewTable,
    isGenerating,
    progress,
    error,
    workerCount,
    duration,
    loopRun,
    canExport: loopRun?.status === 'success' && loopRun.validation.ok,
  };
}
