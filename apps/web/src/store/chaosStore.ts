import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface ColumnChaosConfig {
  nullRate: boolean;
  whitespace: boolean;
  encoding: boolean;
  casing: boolean;
  formatStrip: boolean;
}

interface ChaosState {
  globalRate: number; // 0-30
  enabled: boolean;
  columnOverrides: Record<string, ColumnChaosConfig>;

  setGlobalRate: (rate: number) => void;
  setEnabled: (enabled: boolean) => void;
  setColumnOverride: (columnId: string, config: Partial<ColumnChaosConfig>) => void;
  removeColumnOverride: (columnId: string) => void;
  reset: () => void;
}

const DEFAULT_COLUMN_CHAOS: ColumnChaosConfig = {
  nullRate: true,
  whitespace: true,
  encoding: true,
  casing: true,
  formatStrip: true,
};

export const useChaosStore = create<ChaosState>()(
  immer((set) => ({
    globalRate: 0,
    enabled: false,
    columnOverrides: {},

    setGlobalRate: (rate) =>
      set((state) => {
        state.globalRate = Math.max(0, Math.min(30, rate));
        state.enabled = rate > 0;
      }),

    setEnabled: (enabled) =>
      set((state) => {
        state.enabled = enabled;
      }),

    setColumnOverride: (columnId, config) =>
      set((state) => {
        state.columnOverrides[columnId] = {
          ...(state.columnOverrides[columnId] || DEFAULT_COLUMN_CHAOS),
          ...config,
        };
      }),

    removeColumnOverride: (columnId) =>
      set((state) => {
        delete state.columnOverrides[columnId];
      }),

    reset: () =>
      set((state) => {
        state.globalRate = 0;
        state.enabled = false;
        state.columnOverrides = {};
      }),
  })),
);
