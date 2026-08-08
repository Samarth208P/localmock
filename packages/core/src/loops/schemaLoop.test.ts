import { describe, expect, it } from 'vitest';
import type { GenerationJob } from '../jobs/types';
import { runSchemaLoop } from './schemaLoop';

describe('schema loop', () => {
  it('normalizes safe whitespace and reports missing primary keys', async () => {
    const job: GenerationJob = {
      version: 1,
      seed: 'schema',
      tables: [{ name: ' users ', rows: 1, fields: [{ name: ' email ', type: ' email ' }] }],
    };
    const result = await runSchemaLoop(job, { supportedTypes: new Set(['email']) });

    expect(result.status).toBe('success');
    expect(result.result?.tables[0].name).toBe('users');
    expect(result.warnings.some((warning) => warning.code === 'MISSING_PRIMARY_KEY')).toBe(true);
  });

  it('requires human input for conflicting constraints', async () => {
    const job: GenerationJob = {
      version: 1,
      seed: 'schema',
      tables: [{
        name: 'users',
        rows: 1,
        fields: [{ name: 'id', type: 'integer', primaryKey: true, nullable: true }],
      }],
    };
    const result = await runSchemaLoop(job);

    expect(result.status).toBe('needs_input');
    expect(result.errors.some((error) => error.code === 'CONFLICTING_CONSTRAINTS')).toBe(true);
  });
});
