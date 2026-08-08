import type { ChaosConfig } from '../chaos/types';

export const GENERATION_JOB_VERSION = 1 as const;

export type GenerationOutputFormat = 'csv' | 'json' | 'jsonl' | 'sql' | 'tsv' | 'xml' | 'cql' | 'msw' | 'typescript';

export interface GenerationJobField {
  id?: string;
  name: string;
  type: string;
  options?: Record<string, unknown>;
  unique?: boolean;
  primaryKey?: boolean;
  nullable?: boolean;
  foreignKey?: { table: string; field: string };
}

export interface GenerationJobTable {
  id?: string;
  name: string;
  rows: number;
  fields: GenerationJobField[];
}

export interface GenerationJob {
  version: typeof GENERATION_JOB_VERSION;
  seed: string | number;
  generatedAt?: string;
  tables: GenerationJobTable[];
  chaos?: ChaosConfig;
  output?: {
    format: GenerationOutputFormat;
    dialect?: 'postgres' | 'mysql' | 'sqlite';
    fileName?: string;
  };
}

export type GenerationErrorCode =
  | 'INVALID_JOB'
  | 'UNSUPPORTED_JOB_VERSION'
  | 'DUPLICATE_TABLE'
  | 'DUPLICATE_FIELD'
  | 'INVALID_ROW_COUNT'
  | 'INVALID_FIELD_OPTION'
  | 'UNIQUE_DOMAIN_EXHAUSTED'
  | 'MISSING_REFERENCED_TABLE'
  | 'MISSING_REFERENCED_FIELD'
  | 'RELATION_CYCLE'
  | 'GENERATION_FAILED'
  | 'GENERATION_CANCELLED'
  | 'EXPORT_FAILED';

export interface GenerationDiagnostic {
  code: GenerationErrorCode;
  path: string;
  message: string;
  severity: 'error' | 'warning';
  details?: Record<string, unknown>;
  suggestedActions?: string[];
}

export interface GenerationJobValidation {
  ok: boolean;
  errors: GenerationDiagnostic[];
  warnings: GenerationDiagnostic[];
  totalRows: number;
}

export interface GenerationManifest {
  generator: 'LocalMock';
  engineVersion: string;
  jobSchemaVersion: typeof GENERATION_JOB_VERSION;
  seed: string | number;
  schemaHash: string;
  generatedAt: string;
  tables: Record<string, { rows: number }>;
  warnings: GenerationDiagnostic[];
  constraintsValidated: boolean;
}
