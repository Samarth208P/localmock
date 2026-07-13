import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { FieldRow } from '@/components/editor/FieldBuilder';

export interface TableDef {
  id: string;
  name: string;
  fields: FieldRow[];
  rowCount: number;
}

export interface ForeignKey {
  id: string;
  fromTable: string; // child table id
  fromField: string; // field name in child
  toTable: string;   // parent table id
  toField: string;   // field name in parent (usually 'id')
}

interface MultiTableState {
  tables: TableDef[];
  foreignKeys: ForeignKey[];
  activeTableId: string | null;

  addTable: (name?: string) => void;
  removeTable: (id: string) => void;
  renameTable: (id: string, name: string) => void;
  setTableFields: (id: string, fields: FieldRow[]) => void;
  setTableRowCount: (id: string, count: number) => void;
  setActiveTable: (id: string | null) => void;

  addForeignKey: (fk: Omit<ForeignKey, 'id'>) => void;
  removeForeignKey: (id: string) => void;

  reset: () => void;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export const useMultiTableStore = create<MultiTableState>()(
  immer((set) => ({
    tables: [],
    foreignKeys: [],
    activeTableId: null,

    addTable: (name) =>
      set((state) => {
        const id = genId();
        state.tables.push({
          id,
          name: name || `table_${state.tables.length + 1}`,
          fields: [
            { id: genId(), name: 'id', typeId: 'uuid', options: {}, unique: true },
          ],
          rowCount: 1000,
        });
        state.activeTableId = id;
      }),

    removeTable: (id) =>
      set((state) => {
        state.tables = state.tables.filter((t) => t.id !== id);
        state.foreignKeys = state.foreignKeys.filter(
          (fk) => fk.fromTable !== id && fk.toTable !== id,
        );
        if (state.activeTableId === id) {
          state.activeTableId = state.tables[0]?.id || null;
        }
      }),

    renameTable: (id, name) =>
      set((state) => {
        const table = state.tables.find((t) => t.id === id);
        if (table) table.name = name;
      }),

    setTableFields: (id, fields) =>
      set((state) => {
        const table = state.tables.find((t) => t.id === id);
        if (table) table.fields = fields;
      }),

    setTableRowCount: (id, count) =>
      set((state) => {
        const table = state.tables.find((t) => t.id === id);
        if (table) table.rowCount = Math.max(1, Math.min(1000000, count));
      }),

    setActiveTable: (id) =>
      set((state) => {
        state.activeTableId = id;
      }),

    addForeignKey: (fk) =>
      set((state) => {
        state.foreignKeys.push({ ...fk, id: genId() });
      }),

    removeForeignKey: (id) =>
      set((state) => {
        state.foreignKeys = state.foreignKeys.filter((fk) => fk.id !== id);
      }),

    reset: () =>
      set((state) => {
        state.tables = [];
        state.foreignKeys = [];
        state.activeTableId = null;
      }),
  })),
);
