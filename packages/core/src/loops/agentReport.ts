import type { LoopDiagnostic, LoopResult, LoopValidation } from './types';

export interface AgentLoopReport<TResult = unknown> {
  version: 1;
  status: 'success' | 'failed' | 'repairing' | 'needs_input';
  operation: string;
  run_id: string;
  seed: string | number;
  iteration: number;
  result: TResult | null;
  validation: LoopValidation;
  errors: LoopDiagnostic[];
  warnings: LoopDiagnostic[];
  next_action: string;
}

export function createAgentLoopReport<TResult>(result: LoopResult<TResult>): AgentLoopReport<TResult> {
  return {
    version: 1,
    status: result.status,
    operation: result.operation,
    run_id: result.runId,
    seed: result.seed,
    iteration: result.attempts,
    result: result.result ?? null,
    validation: result.validation,
    errors: result.errors,
    warnings: result.warnings,
    next_action: result.nextAction,
  };
}
