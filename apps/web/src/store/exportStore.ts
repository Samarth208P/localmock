import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ExportFormat = 'csv' | 'json' | 'jsonl' | 'sql' | 'msw' | 'ts';
export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';
export type ExportStatus = 'idle' | 'generating' | 'complete' | 'error';

interface ExportState {
  format: ExportFormat;
  rowCount: number;
  sqlDialect: SqlDialect;
  status: ExportStatus;
  progress: number; // 0-100
  error: string | null;

  setFormat: (format: ExportFormat) => void;
  setRowCount: (count: number) => void;
  setSqlDialect: (dialect: SqlDialect) => void;
  setStatus: (status: ExportStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useExportStore = create<ExportState>()(
  immer((set) => ({
    format: 'json',
    rowCount: 1000,
    sqlDialect: 'postgres',
    status: 'idle',
    progress: 0,
    error: null,

    setFormat: (format) =>
      set((state) => {
        state.format = format;
      }),

    setRowCount: (count) =>
      set((state) => {
        state.rowCount = count;
      }),

    setSqlDialect: (dialect) =>
      set((state) => {
        state.sqlDialect = dialect;
      }),

    setStatus: (status) =>
      set((state) => {
        state.status = status;
      }),

    setProgress: (progress) =>
      set((state) => {
        state.progress = progress;
      }),

    setError: (error) =>
      set((state) => {
        state.error = error;
        state.status = 'error';
      }),

    reset: () =>
      set((state) => {
        state.status = 'idle';
        state.progress = 0;
        state.error = null;
      }),
  })),
);
