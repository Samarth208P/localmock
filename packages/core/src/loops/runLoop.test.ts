import { describe, expect, it } from 'vitest';
import { runLoop } from './runLoop';

describe('runLoop', () => {
  it('repairs, re-executes, verifies, and completes within the bound', async () => {
    const result = await runLoop({
      operation: 'bounded-repair',
      seed: 'test',
      maxIterations: 3,
      plan: () => 0,
      execute: (value) => value,
      observe: (value) => value,
      validate: (value) => ({
        ok: value >= 1,
        errors: value >= 1 ? [] : [{
          code: 'TOO_SMALL', path: 'value', message: 'Value is too small.', severity: 'error', retryable: true, repairable: true,
        }],
        warnings: [],
      }),
      diagnose: () => ({ action: 'repair', reason: 'Increment safely.', nextAction: 'increment' }),
      repair: (value) => value + 1,
      verify: (value) => ({ ok: value === 1, errors: [], warnings: [] }),
    });

    expect(result.status).toBe('success');
    expect(result.result).toBe(1);
    expect(result.attempts).toBe(2);
    expect(result.trace.map((entry) => entry.phase)).toContain('repairing');
    expect(result.finalPhase).toBe('ready');
  });

  it('pauses for human input instead of applying an unsafe repair', async () => {
    const result = await runLoop({
      operation: 'human-gate',
      seed: 1,
      maxIterations: 2,
      plan: () => 'ambiguous',
      execute: (value) => value,
      observe: (value) => value,
      validate: () => ({
        ok: false,
        errors: [{ code: 'AMBIGUOUS', path: 'schema', message: 'Choose a target.', severity: 'error', retryable: false, repairable: false }],
        warnings: [],
      }),
      diagnose: () => ({ action: 'needs_input', reason: 'User intent is required.', nextAction: 'choose_target' }),
    });

    expect(result.status).toBe('needs_input');
    expect(result.finalPhase).toBe('needs_input');
    expect(result.nextAction).toBe('choose_target');
  });
});
