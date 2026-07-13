import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register plugins (tree-shaking: only what we use)
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Global defaults matching design language
gsap.defaults({
  ease: 'power2.out',
  duration: 0.3,
});

// Respect reduced motion preference
if (typeof window !== 'undefined') {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(20); // Effectively instant
  }
}

export { gsap, ScrollTrigger, TextPlugin };
