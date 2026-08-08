/**
 * Backward-compatible entry point. All generation now runs through the bounded,
 * validated Loop Engineering orchestrator.
 */
export { useGenerationLoop as useWorkerPool } from './useGenerationLoop';
export type { GenerationRunOptions, MultiTableGenDef, GenerationLoopRun } from './useGenerationLoop';