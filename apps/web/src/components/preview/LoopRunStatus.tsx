import { useState } from 'react';
import type { GenerationLoopRun } from '@/hooks/useGenerationLoop';

interface LoopRunStatusProps {
  run: GenerationLoopRun | null;
  isGenerating: boolean;
  onCancel: () => void;
}

const PHASES = ['planning', 'executing', 'observing', 'validating', 'diagnosing', 'repairing', 'verifying', 'ready'] as const;

function phaseIndex(phase: GenerationLoopRun['phase']): number {
  if (phase === 'failed' || phase === 'needs_input') return PHASES.indexOf('validating');
  return PHASES.indexOf(phase as (typeof PHASES)[number]);
}

export function LoopRunStatus({ run, isGenerating, onCancel }: LoopRunStatusProps) {
  const [expanded, setExpanded] = useState(false);
  if (!run) return null;

  const currentIndex = phaseIndex(run.phase);
  const statusTone = run.status === 'success'
    ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-300'
    : run.status === 'needs_input'
      ? 'border-amber-500/25 bg-amber-500/5 text-amber-300'
      : run.status === 'failed'
        ? 'border-error/25 bg-error/5 text-error'
        : 'border-accent/25 bg-accent/5 text-accent';

  const copyEvidence = async () => {
    await navigator.clipboard.writeText(JSON.stringify({
      status: run.status,
      operation: run.operation,
      run_id: run.runId,
      seed: run.seed,
      iteration: run.attempt,
      validation: run.validation,
      errors: run.errors,
      warnings: run.warnings,
      next_action: run.nextAction,
      trace: run.trace,
    }, null, 2));
  };

  return (
    <div className={`border-b px-4 py-3 sm:px-6 ${statusTone}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-2 w-2 flex-none rounded-full ${isGenerating ? 'animate-pulse bg-current' : 'bg-current'}`} />
          <div className="min-w-0">
            <p className="text-xs font-semibold capitalize">{run.phase.replace('_', ' ')}</p>
            <p className="mt-0.5 truncate font-mono text-[10px] opacity-70">
              {run.runId} · seed {String(run.seed)} · attempt {run.attempt}/{run.maxAttempts}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void copyEvidence()} className="rounded-md border border-current/20 px-2 py-1 text-[10px] font-medium hover:bg-white/5">
            Copy evidence
          </button>
          <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-md border border-current/20 px-2 py-1 text-[10px] font-medium hover:bg-white/5">
            {expanded ? 'Hide details' : 'Details'}
          </button>
          {isGenerating && (
            <button type="button" onClick={onCancel} className="rounded-md border border-error/30 px-2 py-1 text-[10px] font-medium text-error hover:bg-error/10">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-1" aria-label={`Loop phase: ${run.phase}`}>
        {PHASES.map((phase, index) => (
          <div
            key={phase}
            title={phase}
            className={`h-1 flex-1 rounded-full ${index <= currentIndex ? 'bg-current opacity-80' : 'bg-current opacity-15'}`}
          />
        ))}
      </div>

      {expanded && (
        <div className="mt-3 rounded-lg border border-current/15 bg-bg-primary/35 p-3 text-[11px]">
          <div className="grid gap-2 sm:grid-cols-3">
            <span><strong>{run.validation.ok ? 'Passed' : 'Not passed'}</strong> validation</span>
            <span><strong>{run.errors.length}</strong> errors</span>
            <span><strong>{run.warnings.length}</strong> warnings</span>
          </div>
          {run.errors.slice(0, 3).map((item) => (
            <p key={`${item.code}:${item.path}`} className="mt-2 text-error">
              <span className="font-mono font-semibold">{item.code}</span> · {item.message}
            </p>
          ))}
          <p className="mt-2 opacity-80"><strong>Next:</strong> {run.nextAction}</p>
        </div>
      )}
    </div>
  );
}
