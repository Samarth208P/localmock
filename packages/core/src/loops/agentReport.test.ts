import { describe, expect, it } from 'vitest';
import { createAgentLoopReport } from './agentReport';

describe('createAgentLoopReport', () => {
  it('returns the stable machine-readable loop envelope', () => {
    const report = createAgentLoopReport({
      runId: 'run-1',
      status: 'needs_input',
      operation: 'schema-validation',
      validation: { ok: false, errors: [], warnings: [] },
      errors: [],
      warnings: [],
      nextAction: 'choose_target',
      attempts: 1,
      seed: 'seed',
      finalPhase: 'needs_input',
      trace: [],
    });

    expect(report).toMatchObject({
      version: 1,
      status: 'needs_input',
      operation: 'schema-validation',
      run_id: 'run-1',
      iteration: 1,
      result: null,
      next_action: 'choose_target',
    });
  });
});
