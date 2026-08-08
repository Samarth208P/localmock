import { seedFromString } from '../generators/rng';
import { GENERATION_JOB_VERSION } from './types';
import type { GenerationJob, GenerationManifest } from './types';
import { validateGenerationJob } from './validateJob';

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function createGenerationManifest(job: GenerationJob, engineVersion = '0.1.0'): GenerationManifest {
  const validation = validateGenerationJob(job);
  const schemaHash = seedFromString(stableStringify(job.tables)).toString(16).padStart(8, '0');
  return {
    generator: 'LocalMock',
    engineVersion,
    jobSchemaVersion: GENERATION_JOB_VERSION,
    seed: job.seed,
    schemaHash: `hash32:${schemaHash}`,
    generatedAt: job.generatedAt ?? new Date().toISOString(),
    tables: Object.fromEntries(job.tables.map((table) => [table.name, { rows: table.rows }])),
    warnings: validation.warnings,
    constraintsValidated: validation.ok,
  };
}
