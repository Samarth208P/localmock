import { create } from 'zustand';

export type AppStep = 'input' | 'configure' | 'preview';
export type StepDirection = 'forward' | 'backward';

interface AppState {
  step: AppStep;
  direction: StepDirection;
  setStep: (step: AppStep) => void;
  goBack: () => void;
}

const STEP_ORDER: AppStep[] = ['input', 'configure', 'preview'];

export const useAppStore = create<AppState>((set, get) => ({
  step: 'input',
  direction: 'forward',

  setStep: (step) => {
    const current = get().step;
    const direction: StepDirection =
      STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf(current) ? 'forward' : 'backward';
    set({ step, direction });
  },

  goBack: () => {
    const current = get().step;
    const idx = STEP_ORDER.indexOf(current);
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1], direction: 'backward' });
    }
  },
}));
