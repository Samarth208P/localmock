import { AnimatedLogo } from '@/components/shared/AnimatedLogo';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { useEffect } from 'react';

export function Navbar() {
  useEffect(() => {
    // Load Buy Me a Coffee widget script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', 'samarth208p');
    script.setAttribute('data-color', '#6366f1');
    script.setAttribute('data-emoji', '');
    script.setAttribute('data-font', 'Inter');
    script.setAttribute('data-text', 'Buy me a coffee');
    script.setAttribute('data-outline-color', '#2a2a2e');
    script.setAttribute('data-font-color', '#fafafa');
    script.setAttribute('data-coffee-color', '#818cf8');
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3 lg:w-[200px]">
        <AnimatedLogo />
        <span className="text-lg font-semibold text-text-primary hidden lg:block">LocalMock</span>
      </div>

      <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar">
        <StepIndicator />
      </div>

      <nav className="flex items-center gap-4 lg:w-[200px] justify-end">
        <a
          href="https://buymeacoffee.com/samarth208p"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-secondary px-3 py-1.5 text-sm text-text-secondary hover:border-accent/50 hover:text-accent transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          <span className="hidden sm:inline">Support</span>
        </a>
      </nav>
    </header>
  );
}
