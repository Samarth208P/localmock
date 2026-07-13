import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface ParsedColumn {
  id: string;
  name: string;
  type: string;
  fakerMethod: string;
  confidence: 'high' | 'medium' | 'low';
  isUnique: boolean;
  isSequential: boolean;
}

export interface ParsedSchema {
  raw: string;
  format: string;
  tables: ParsedTable[];
}

export interface ParsedTable {
  name: string;
  columns: ParsedColumn[];
}

interface SchemaState {
  rawInput: string;
  parsedSchema: ParsedSchema | null;
  parseError: string | null;

  setRawInput: (input: string) => void;
  setParsedSchema: (schema: ParsedSchema) => void;
  setParseError: (error: string | null) => void;
  reset: () => void;
}

export const useSchemaStore = create<SchemaState>()(
  immer((set) => ({
    rawInput: '',
    parsedSchema: null,
    parseError: null,

    setRawInput: (input) =>
      set((state) => {
        state.rawInput = input;
      }),

    setParsedSchema: (schema) =>
      set((state) => {
        state.parsedSchema = schema;
        state.parseError = null;
      }),

    setParseError: (error) =>
      set((state) => {
        state.parseError = error;
      }),

    reset: () =>
      set((state) => {
        state.rawInput = '';
        state.parsedSchema = null;
        state.parseError = null;
      }),
  })),
);
