import { AnimatedLogo } from '@/components/shared/AnimatedLogo';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <AnimatedLogo />
        <span className="text-lg font-semibold text-text-primary">LocalMock</span>
      </div>

      <nav className="flex items-center gap-4">
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-secondary px-2 py-0.5 text-xs text-text-muted font-mono">
          Ctrl+Enter
        </kbd>
        <a
          href="https://buymeacoffee.com/localmock"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          Buy me a coffee
        </a>
      </nav>
    </header>
  );
}
