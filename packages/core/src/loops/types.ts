export type LoopPhase =
  | 'planning'
  | 'executing'
  | 'observing'
  | 'validating'
  | 'diagnosing'
  | 'repairing'
  | 'verifying'
  | 'ready'
  | 'failed'
  | 'needs_input';

export type LoopStatus = 'success' | 'failed' | 'repairing' | 'needs_input';

export interface LoopDiagnostic {
  code: string;
  path: string;
  message: string;
  severity: 'error' | 'warning';
  retryable: boolean;
  repairable: boolean;
  details?: Record<string, unknown>;
  suggestedActions?: string[];
}

export interface LoopValidation {
  ok: boolean;
  errors: LoopDiagnostic[];
  warnings: LoopDiagnostic[];
}

export interface LoopTraceEntry {
  iteration: number;
  phase: LoopPhase;
  timestamp: string;
  message?: string;
  diagnostics?: LoopDiagnostic[];
}

export interface LoopContext {
  runId: string;
  operation: string;
  seed: string | number;
  iteration: number;
  maxIterations: number;
  signal?: AbortSignal;
  record: (phase: LoopPhase, message?: string, diagnostics?: LoopDiagnostic[]) => void;
}

export interface LoopDiagnosis {
  action: 'repair' | 'fail' | 'needs_input';
  reason: string;
  nextAction: string;
}

export interface LoopDefinition<TPlan, TExecution, TObservation, TResult = TObservation> {
  operation: string;
  seed: string | number;
  maxIterations: number;
  plan: (context: LoopContext) => TPlan | Promise<TPlan>;
  execute: (plan: TPlan, context: LoopContext) => TExecution | Promise<TExecution>;
  observe: (execution: TExecution, context: LoopContext) => TObservation | Promise<TObservation>;
  validate: (observation: TObservation, context: LoopContext) => LoopValidation | Promise<LoopValidation>;
  diagnose: (validation: LoopValidation, observation: TObservation, context: LoopContext) => LoopDiagnosis | Promise<LoopDiagnosis>;
  repair?: (plan: TPlan, diagnosis: LoopDiagnosis, observation: TObservation, context: LoopContext) => TPlan | Promise<TPlan>;
  verify?: (observation: TObservation, context: LoopContext) => LoopValidation | Promise<LoopValidation>;
  complete?: (observation: TObservation, context: LoopContext) => TResult | Promise<TResult>;
  onTransition?: (entry: LoopTraceEntry) => void;
}

export interface LoopResult<TResult> {
  runId: string;
  status: LoopStatus;
  operation: string;
  result?: TResult;
  validation: LoopValidation;
  errors: LoopDiagnostic[];
  warnings: LoopDiagnostic[];
  nextAction: string;
  attempts: number;
  seed: string | number;
  finalPhase: LoopPhase;
  trace: LoopTraceEntry[];
}
