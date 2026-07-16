import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  formatter?: (n: number) => string;
}

const defaultFormatter = (n: number) => Math.round(n).toLocaleString();

/**
 * Ticks a number up/down smoothly whenever `value` changes, instead of
 * snapping instantly. Used for row counts, stats, and totals.
 */
export function AnimatedCounter({ value, className, duration = 0.6, formatter = defaultFormatter }: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef({ n: 0 });

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      valueRef.current.n = value;
      el.textContent = formatter(value);
      return;
    }

    gsap.to(valueRef.current, {
      n: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) el.textContent = formatter(valueRef.current.n);
      },
    });
  }, [value, duration, formatter]);

  return <span ref={spanRef} className={`tabular-nums ${className ?? ''}`}>{formatter(0)}</span>;
}
