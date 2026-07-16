import { AnimatedLogo } from '@/components/shared/AnimatedLogo';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface NavbarProps {
  showSteps?: boolean;
}

export function Navbar({ showSteps = true }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm px-6">
      <a
        href={SITE_URL}
        className="group flex items-center gap-3 lg:w-[200px] transition-transform duration-300 hover:scale-[1.02]"
        aria-label={`${SITE_NAME} home`}
      >
        <span className="transition-transform duration-300 group-hover:rotate-[8deg]">
          <AnimatedLogo />
        </span>
        <span className="text-lg font-semibold text-text-primary hidden lg:block transition-colors duration-200 group-hover:text-accent">{SITE_NAME}</span>
      </a>

      <div className="flex-1 flex justify-center">
        {showSteps && <StepIndicator />}
      </div>

      <nav className="flex items-center gap-3 lg:w-[200px] justify-end">
        <a
          href="https://buymeacoffee.com/samarth208p"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-secondary px-3 py-1.5 text-sm text-text-secondary transition-all duration-200 hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-12"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          <span className="hidden sm:inline">Support</span>
        </a>
      </nav>
    </header>
  );
}
