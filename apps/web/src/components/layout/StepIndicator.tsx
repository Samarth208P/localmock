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
    <div className="flex justify-center items-center gap-1 sm:gap-2">
      {STEPS.map((s, idx) => {
        const isActive = s.id === step;
        const isCompleted = idx < currentIdx;
        const isClickable = idx <= currentIdx;

        return (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => isClickable && handleStepClick(s)}
              disabled={!isClickable}
              title={isCompleted ? `Back to ${s.label}` : undefined}
              className={`group flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-accent/15 text-accent ring-1 ring-accent/30 shadow-sm'
                  : isCompleted
                    ? 'text-text-primary hover:bg-bg-tertiary hover:ring-1 hover:ring-border-active cursor-pointer'
                    : 'text-text-muted cursor-not-allowed opacity-60'
              }`}
            >
              {isCompleted && (
                <span className="text-[10px] leading-none opacity-0 -ml-1 w-0 group-hover:opacity-100 group-hover:w-3 group-hover:-translate-x-0.5 transition-all duration-200 overflow-hidden">
                  ←
                </span>
              )}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors duration-300 ${
                  isActive
                    ? 'bg-accent text-white'
                    : isCompleted
                      ? 'bg-success/20 text-success'
                      : 'bg-bg-tertiary border border-border-subtle text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : s.number}
              </span>
              <span className={`${isActive ? 'opacity-100' : 'opacity-80'}`}>{s.label}</span>
            </button>

            {idx < STEPS.length - 1 && (
              <div className="relative mx-1 sm:mx-3 h-0.5 w-8 sm:w-16 rounded-full bg-border-subtle overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-accent transition-all duration-500 ease-out`}
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
