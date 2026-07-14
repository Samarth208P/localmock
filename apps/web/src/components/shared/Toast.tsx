import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'warning' | 'error';

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

const MAX_VISIBLE_TOASTS = 3;

let toastId = 0;
const listeners: Set<(msg: ToastMessage) => void> = new Set();

export function showToast(text: string, type: ToastType = 'success') {
  const msg: ToastMessage = { id: ++toastId, text, type };
  listeners.forEach((fn) => fn(msg));
}

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'bg-success', icon: '✓' },
  warning: { bg: 'bg-warning', icon: '⚠' },
  error: { bg: 'bg-error', icon: '✕' },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: ToastMessage) => {
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE_TOASTS - 1)), msg]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== msg.id));
    }, 2500);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const style = TOAST_STYLES[t.type];
        return (
          <div
            key={t.id}
            className={`animate-slide-up flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-medium shadow-sm ${style.bg} text-white`}
          >
            <span className="text-xs leading-none">{style.icon}</span>
            <span>{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}
