import { useState, useEffect } from 'react';

const DISMISS_KEY = 'localmock:mobile-notice-dismissed';

/**
 * Soft, dismissible advisory for small screens. Large-row generation and the
 * multi-table diagram are easiest on a bigger screen, but we don't hard-block
 * anything — this just sets expectations.
 */
export function MobileNotice() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem(DISMISS_KEY) === '1';
    const isNarrow = window.matchMedia('(max-width: 640px)').matches;
    setDismissed(alreadyDismissed || !isNarrow);
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="note"
      className="mx-auto mb-6 flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3 text-xs text-text-secondary"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-warning">
        <path d="M12 9v4" /><path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
      <p className="flex-1 leading-relaxed">
        LocalMock works on mobile, but large row counts and the schema diagram are easier to use on a
        bigger screen. For heavy generation, we'd recommend switching to desktop.
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notice"
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
