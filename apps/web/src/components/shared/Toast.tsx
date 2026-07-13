import { useState, useEffect, useCallback } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let toastId = 0;
const listeners: Set<(msg: ToastMessage) => void> = new Set();

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  const msg: ToastMessage = { id: ++toastId, text, type };
  listeners.forEach((fn) => fn(msg));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: ToastMessage) => {
    setToasts((prev) => [...prev, msg]);
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
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-sm ${
            t.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-error/90 text-white'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
