import { describe, expect, it } from 'vitest';
import type { GenerationJob } from './types';
import { validateGenerationJob } from './validateJob';

function validJob(): GenerationJob {
  return {
    version: 1,
    seed: 'test-seed',
    tables: [{
      name: 'users',
      rows: 10,
      fields: [
        { name: 'id', type: 'uuid', unique: true, primaryKey: true },
        { name: 'email', type: 'email', unique: true },
      ],
    }],
  };
}

describe('validateGenerationJob', () => {
  it('accepts a valid deterministic job', () => {
    expect(validateGenerationJob(validJob())).toEqual({
      ok: true,
      errors: [],
      warnings: [],
      totalRows: 10,
    });
  });

  it('rejects an exhausted unique enum domain', () => {
    const job = validJob();
    job.tables[0].fields.push({
      name: 'role',
      type: 'enum',
      unique: true,
      options: { values: 'admin,member' },
    });
    const result = validateGenerationJob(job);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'UNIQUE_DOMAIN_EXHAUSTED' }));
  });

  it('rejects missing foreign-key targets', () => {
    const job = validJob();
    job.tables[0].fields.push({
      name: 'organizationId',
      type: 'uuid',
      foreignKey: { table: 'organizations', field: 'id' },
    });
    const result = validateGenerationJob(job);
    expect(result.errors).toContainEqual(expect.objectContaining({ code: 'MISSING_REFERENCED_TABLE' }));
  });
});
