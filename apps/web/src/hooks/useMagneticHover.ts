import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Subtle magnetic-hover effect: the element drifts a few pixels toward the
 * cursor while hovered, and springs back on leave. Intended for a small
 * number of high-emphasis CTAs (primary Generate/Configure buttons) — not
 * meant to be applied everywhere.
 *
 * @param strength Max pixel offset (default 10)
 */
export function useMagneticHover<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function onMouseMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      xTo((relX / rect.width) * strength * 2);
      yTo((relY / rect.height) * strength * 2);
    }

    function onMouseLeave() {
      xTo(0);
      yTo(0);
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [strength]);

  return ref;
}
