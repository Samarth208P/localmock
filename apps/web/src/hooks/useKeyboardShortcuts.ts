import { useEffect } from 'react';
import { SHORTCUTS, type ShortcutAction } from '@/lib/shortcuts';

type ShortcutHandler = (action: ShortcutAction) => void;

/**
 * Global keyboard shortcut listener.
 * Prevents default browser behavior for registered shortcuts.
 */
export function useKeyboardShortcuts(handler: ShortcutHandler) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const shortcut of SHORTCUTS) {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;
        const keyMatch = e.key === shortcut.key;

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          handler(shortcut.action);
          return;
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler]);
}
