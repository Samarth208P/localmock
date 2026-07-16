import { SITE_FEATURE_REQUEST_EMAIL, SITE_LINKEDIN_URL, SITE_REDDIT_URL, SITE_SUPPORT_EMAIL, SITE_URL } from '@/lib/site';

export function Footer() {
  const requestHref = `mailto:${SITE_FEATURE_REQUEST_EMAIL}?subject=${encodeURIComponent(
    'LocalMock data or feature request',
  )}`;

  return (
    <footer className="flex flex-col gap-3 border-t border-border-subtle px-6 py-3 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        <a href={SITE_URL} className="link-sweep hover:text-text-secondary transition-colors">
          localmock.dev
        </a>
        {' — '}Client-side data generation. No data leaves your browser.
      </span>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <a href="/tools/csv-test-data-generator" className="link-sweep hover:text-text-secondary transition-colors">
          CSV
        </a>
        <a href="/templates/users" className="link-sweep hover:text-text-secondary transition-colors">
          Templates
        </a>
        <a href="/mockaroo-alternative" className="link-sweep hover:text-text-secondary transition-colors">
          Mockaroo alt
        </a>
        <a
          href={requestHref}
          className="btn-press inline-flex items-center rounded-md border border-accent/40 bg-accent-subtle px-3 py-1.5 font-medium text-text-secondary transition-all hover:border-accent hover:text-text-primary hover:shadow-md hover:shadow-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Request data/feature
        </a>
        <a href={`mailto:${SITE_SUPPORT_EMAIL}`} className="link-sweep hover:text-text-secondary transition-colors">
          Email
        </a>
        <a
          href={SITE_LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-sweep hover:text-text-secondary transition-colors"
        >
          LinkedIn
        </a>
        <a
          href={SITE_REDDIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-sweep hover:text-text-secondary transition-colors"
        >
          Reddit
        </a>
        <a
          href="https://github.com/Samarth208P/localmock"
          target="_blank"
          rel="noopener noreferrer"
          className="link-sweep hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://buymeacoffee.com/samarth208p"
          target="_blank"
          rel="noopener noreferrer"
          className="link-sweep hover:text-text-secondary transition-colors"
        >
          Support
        </a>
      </div>
    </footer>
  );
}
