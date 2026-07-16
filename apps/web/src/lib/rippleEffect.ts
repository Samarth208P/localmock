/**
 * Global ripple-on-click effect for every <button> in the app.
 *
 * Uses a single delegated pointerdown listener instead of wrapping every
 * button component, so it applies uniformly (Navbar, modals, export cards,
 * template gallery, etc.) with zero per-component code.
 *
 * Respects prefers-reduced-motion and skips disabled buttons.
 */
let installed = false;

export function installRippleEffect() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      if (e.button !== 0) return; // left click / primary touch only

      const target = (e.target as HTMLElement)?.closest('button');
      if (!target || target.hasAttribute('disabled')) return;

      // Skip elements that opt out (e.g. drag handles, sortable rows)
      if (target.dataset.noRipple !== undefined) return;

      const rect = target.getBoundingClientRect();
      // Ensure the button can host an absolutely-positioned child
      const computed = window.getComputedStyle(target);
      if (computed.position === 'static') {
        target.style.position = 'relative';
      }
      if (computed.overflow !== 'hidden') {
        target.style.overflow = 'hidden';
      }

      const size = Math.max(rect.width, rect.height) * 1.8;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      target.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });

      // Safety cleanup in case animationend doesn't fire (e.g. element removed)
      setTimeout(() => dot.remove(), 700);
    },
    { passive: true },
  );
}
