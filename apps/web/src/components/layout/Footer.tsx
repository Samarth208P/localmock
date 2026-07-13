export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border-subtle px-6 py-3 text-xs text-text-muted">
      <span>LocalMock — Client-side data generation. No data leaves your browser.</span>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/Samarth208P/localmock"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://buymeacoffee.com/samarth208p"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-secondary transition-colors"
        >
          Support
        </a>
      </div>
    </footer>
  );
}
