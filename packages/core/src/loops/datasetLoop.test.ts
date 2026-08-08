import { describe, expect, it } from 'vitest';
import type { GenerationJob } from '../jobs/types';
import { runDatasetLoop, validateGeneratedDataset } from './datasetLoop';

const job: GenerationJob = {
  version: 1,
  seed: 'relations',
  tables: [
    {
      name: 'users',
      rows: 2,
      fields: [{ name: 'id', type: 'integer', primaryKey: true, unique: true, nullable: false }],
    },
    {
      name: 'orders',
      rows: 1,
      fields: [
        { name: 'id', type: 'integer', primaryKey: true, unique: true, nullable: false },
        { name: 'user_id', type: 'integer', foreignKey: { table: 'users', field: 'id' }, nullable: false },
      ],
    },
  ],
};

describe('dataset loop', () => {
  it('detects and deterministically repairs invalid foreign keys', async () => {
    const result = await runDatasetLoop(job, {
      users: [{ id: 1 }, { id: 2 }],
      orders: [{ id: 1, user_id: 999 }],
    });

    expect(result.status).toBe('success');
    expect([1, 2]).toContain(result.result?.orders[0].user_id);
    expect(result.attempts).toBe(2);
  });

  it('requires input for unsafe uniqueness failures', async () => {
    const result = await runDatasetLoop(job, {
      users: [{ id: 1 }, { id: 1 }],
      orders: [{ id: 1, user_id: 1 }],
    });

    expect(result.status).toBe('needs_input');
    expect(result.errors.some((error) => error.code === 'DUPLICATE_PRIMARY_KEY')).toBe(true);
  });

  it('validates row counts and required values', () => {
    const validation = validateGeneratedDataset(job, { users: [{ id: 1 }], orders: [{ id: null, user_id: 1 }] });
    expect(validation.errors.map((error) => error.code)).toEqual(expect.arrayContaining([
      'ROW_COUNT_MISMATCH',
      'REQUIRED_VALUE_MISSING',
    ]));
  });
});
