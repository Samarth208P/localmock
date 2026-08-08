import type { GenerationOutputFormat } from '../jobs/types';
import type { LoopValidation } from './types';

export interface ExportArtifact {
  content: string;
  format: GenerationOutputFormat | 'excel' | 'firebase' | 'influx' | 'custom' | 'dbunit';
  expectedRows: number;
}

function error(code: string, message: string): LoopValidation {
  return {
    ok: false,
    errors: [{ code, path: 'export', message, severity: 'error', retryable: false, repairable: false }],
    warnings: [],
  };
}

export function verifyExportArtifact(artifact: ExportArtifact): LoopValidation {
  if (!artifact.content.trim()) return error('EMPTY_EXPORT', 'The prepared export artifact is empty.');
  try {
    if (artifact.format === 'json') {
      const parsed = JSON.parse(artifact.content);
      if (!Array.isArray(parsed)) return error('INVALID_JSON_EXPORT', 'JSON export must contain an array of rows.');
      if (parsed.length !== artifact.expectedRows) return error('EXPORT_ROW_COUNT_MISMATCH', `Expected ${artifact.expectedRows} exported rows, received ${parsed.length}.`);
    }
    if (artifact.format === 'jsonl') {
      const lines = artifact.content.split(/\r?\n/).filter(Boolean);
      lines.forEach((line) => JSON.parse(line));
      if (lines.length !== artifact.expectedRows) return error('EXPORT_ROW_COUNT_MISMATCH', `Expected ${artifact.expectedRows} exported rows, received ${lines.length}.`);
    }
  } catch (cause) {
    return error('INVALID_EXPORT_ARTIFACT', cause instanceof Error ? cause.message : 'The export artifact could not be parsed.');
  }
  return { ok: true, errors: [], warnings: [] };
}
