import { useRef, useEffect, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

/**
 * Custom hook for GSAP animations with automatic cleanup.
 * Creates a GSAP context scoped to the container ref.
 */
export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      callback(ctx);
    }, containerRef.current);

    return () => ctx.revert();
  }, deps);

  return containerRef;
}

/**
 * Hook to animate an element entrance (slide + fade).
 */
export function useEntranceAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    if (!ref.current) return;

    gsap.from(ref.current, {
      opacity: 0,
      y: 12,
      duration: 0.25,
      ease: 'power2.out',
    });
  }, []);

  return { ref, animate };
}
