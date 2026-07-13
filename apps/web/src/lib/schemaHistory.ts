import { get, set } from 'idb-keyval';
import type { FieldRow } from '@/components/editor/FieldBuilder';

const HISTORY_KEY = 'localmock:schema-history';
const MAX_ENTRIES = 20;

export interface SchemaHistoryEntry {
  id: string;
  timestamp: number;
  name: string;
  fields: FieldRow[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function getHistory(): Promise<SchemaHistoryEntry[]> {
  const entries = await get<SchemaHistoryEntry[]>(HISTORY_KEY);
  return entries || [];
}

export async function saveToHistory(fields: FieldRow[], name?: string): Promise<void> {
  const entries = await getHistory();

  const entry: SchemaHistoryEntry = {
    id: generateId(),
    timestamp: Date.now(),
    name: name || `Schema ${entries.length + 1}`,
    fields: fields.filter((f) => f.name.trim()),
  };

  // Prepend new entry, enforce max limit (FIFO)
  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);
  await set(HISTORY_KEY, updated);
}

export async function deleteFromHistory(id: string): Promise<void> {
  const entries = await getHistory();
  const updated = entries.filter((e) => e.id !== id);
  await set(HISTORY_KEY, updated);
}

export async function clearHistory(): Promise<void> {
  await set(HISTORY_KEY, []);
}
