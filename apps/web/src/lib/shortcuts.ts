export type ShortcutAction = 'generate' | 'save' | 'addColumn' | 'close';

export interface Shortcut {
  key: string;
  ctrl: boolean;
  shift?: boolean;
  action: ShortcutAction;
  label: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'Enter', ctrl: true, action: 'generate', label: 'Generate / Export' },
  { key: 's', ctrl: true, action: 'save', label: 'Save schema' },
  { key: 'n', ctrl: true, action: 'addColumn', label: 'Add column' },
  { key: 'Escape', ctrl: false, action: 'close', label: 'Close modal' },
];
