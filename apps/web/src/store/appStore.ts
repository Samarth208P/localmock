import { create } from 'zustand';

export type AppStep = 'input' | 'configure' | 'preview';

interface AppState {
  step: AppStep;
  setStep: (step: AppStep) => void;
  goBack: () => void;
}

const STEP_ORDER: AppStep[] = ['input', 'configure', 'preview'];

export const useAppStore = create<AppState>((set, get) => ({
  step: 'input',

  setStep: (step) => set({ step }),

  goBack: () => {
    const current = get().step;
    const idx = STEP_ORDER.indexOf(current);
    if (idx > 0) {
      set({ step: STEP_ORDER[idx - 1] });
    }
  },
}));
