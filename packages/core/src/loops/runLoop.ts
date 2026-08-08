import type {
  LoopContext,
  LoopDefinition,
  LoopDiagnostic,
  LoopPhase,
  LoopResult,
  LoopTraceEntry,
  LoopValidation,
} from './types';

const EMPTY_VALIDATION: LoopValidation = { ok: false, errors: [], warnings: [] };

function createRunId(operation: string, seed: string | number): string {
  const safeOperation = operation.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${safeOperation || 'loop'}-${String(seed)}-${Date.now().toString(36)}`;
}

function thrownDiagnostic(error: unknown): LoopDiagnostic {
  return {
    code: 'LOOP_EXECUTION_FAILED',
    path: '',
    message: error instanceof Error ? error.message : 'The loop failed with an unknown error.',
    severity: 'error',
    retryable: false,
    repairable: false,
    suggestedActions: ['Inspect the operation inputs and retry after correcting the reported failure.'],
  };
}

export async function runLoop<TPlan, TExecution, TObservation, TResult = TObservation>(
  definition: LoopDefinition<TPlan, TExecution, TObservation, TResult>,
): Promise<LoopResult<TResult>> {
  if (!Number.isSafeInteger(definition.maxIterations) || definition.maxIterations < 1) {
    throw new Error('maxIterations must be a positive safe integer.');
  }

  const runId = createRunId(definition.operation, definition.seed);
  const trace: LoopTraceEntry[] = [];
  let iteration = 0;
  let validation = EMPTY_VALIDATION;
  let plan!: TPlan;

  const record = (phase: LoopPhase, message?: string, diagnostics?: LoopDiagnostic[]) => {
    const entry: LoopTraceEntry = {
      iteration,
      phase,
      timestamp: new Date().toISOString(),
      message,
      diagnostics,
    };
    trace.push(entry);
    definition.onTransition?.(entry);
  };

  const context = (): LoopContext => ({
    runId,
    operation: definition.operation,
    seed: definition.seed,
    iteration,
    maxIterations: definition.maxIterations,
    record,
  });

  const finish = (
    status: LoopResult<TResult>['status'],
    finalPhase: LoopPhase,
    nextAction: string,
    result?: TResult,
  ): LoopResult<TResult> => ({
    runId,
    status,
    operation: definition.operation,
    result,
    validation,
    errors: validation.errors,
    warnings: validation.warnings,
    nextAction,
    attempts: iteration,
    seed: definition.seed,
    finalPhase,
    trace,
  });

  try {
    record('planning', 'Planning operation.');
    plan = await definition.plan(context());

    for (iteration = 1; iteration <= definition.maxIterations; iteration += 1) {
      record('executing', `Executing attempt ${iteration}.`);
      const execution = await definition.execute(plan, context());

      record('observing', 'Observing operation result.');
      const observation = await definition.observe(execution, context());

      record('validating', 'Validating observed result.');
      validation = await definition.validate(observation, context());

      if (validation.ok) {
        record('verifying', 'Independently verifying validated result.');
        validation = definition.verify
          ? await definition.verify(observation, context())
          : validation;

        if (validation.ok) {
          const result = definition.complete
            ? await definition.complete(observation, context())
            : observation as unknown as TResult;
          record('ready', 'Operation completed with current validation evidence.');
          return finish('success', 'ready', 'complete', result);
        }
      }

      record('diagnosing', 'Diagnosing validation failures.', validation.errors);
      const diagnosis = await definition.diagnose(validation, observation, context());

      if (diagnosis.action === 'needs_input') {
        record('needs_input', diagnosis.reason, validation.errors);
        return finish('needs_input', 'needs_input', diagnosis.nextAction);
      }

      if (diagnosis.action === 'fail' || !definition.repair) {
        record('failed', diagnosis.reason, validation.errors);
        return finish('failed', 'failed', diagnosis.nextAction);
      }

      if (iteration >= definition.maxIterations) {
        record('failed', 'Maximum repair attempts reached.', validation.errors);
        return finish('failed', 'failed', 'Review the validation evidence and adjust the input or constraints.');
      }

      record('repairing', diagnosis.reason, validation.errors);
      plan = await definition.repair(plan, diagnosis, observation, context());
    }
  } catch (error) {
    const diagnostic = thrownDiagnostic(error);
    validation = { ok: false, errors: [diagnostic], warnings: [] };
    record('failed', diagnostic.message, [diagnostic]);
    return finish('failed', 'failed', diagnostic.suggestedActions?.[0] ?? 'Inspect the failure and retry.');
  }

  return finish('failed', 'failed', 'Review the loop configuration.');
}
