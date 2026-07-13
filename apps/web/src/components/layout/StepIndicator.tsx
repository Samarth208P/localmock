import { useAppStore, type AppStep } from '@/store/appStore';
import { useSchemaStore } from '@/store/schemaStore';

const STEPS: { id: AppStep; label: string; number: number }[] = [
  { id: 'input', label: 'Schema', number: 1 },
  { id: 'configure', label: 'Configure', number: 2 },
  { id: 'preview', label: 'Preview & Export', number: 3 },
];

export function StepIndicator() {
  const { step, setStep } = useAppStore();

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  const handleStepClick = (s: (typeof STEPS)[number]) => {
    if (s.id === 'input') {
      // Reset schema store so SchemaEditor shows the outermost 'choose' mode
      useSchemaStore.getState().reset();
    }
    setStep(s.id);
  };

  return (
    <div className="flex items-center gap-1 px-6 py-3 border-b border-border-subtle bg-bg-secondary/50">
      {STEPS.map((s, idx) => {
        const isActive = s.id === step;
        const isCompleted = idx < currentIdx;
        const isClickable = idx <= currentIdx;

        return (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => isClickable && handleStepClick(s)}
              disabled={!isClickable}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : isCompleted
                    ? 'text-text-secondary hover:text-accent cursor-pointer'
                    : 'text-text-muted cursor-not-allowed'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isActive
                    ? 'bg-accent text-white'
                    : isCompleted
                      ? 'bg-success/20 text-success'
                      : 'bg-bg-tertiary text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : s.number}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-6 ${
                  idx < currentIdx ? 'bg-success/40' : 'bg-border-subtle'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
