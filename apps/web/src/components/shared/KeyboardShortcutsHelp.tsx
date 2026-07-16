import { useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { SHORTCUTS } from '@/lib/shortcuts';

function formatKey(key: string): string {
  if (key === 'Enter') return '↵ Enter';
  if (key === 'Escape') return 'Esc';
  return key.toUpperCase();
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M8 13h8" />
        </svg>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Keyboard shortcuts" maxWidth="max-w-sm">
        <ul className="p-5 space-y-3">
          {SHORTCUTS.map((s) => (
            <li key={s.action} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.ctrl && (
                  <kbd className="rounded-md border border-border-subtle bg-bg-tertiary px-1.5 py-0.5 text-[11px] font-mono text-text-primary">
                    Ctrl
                  </kbd>
                )}
                <kbd className="rounded-md border border-border-subtle bg-bg-tertiary px-1.5 py-0.5 text-[11px] font-mono text-text-primary">
                  {formatKey(s.key)}
                </kbd>
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
