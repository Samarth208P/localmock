import { LANDING_PAGES, type LandingPage as LandingPageData } from '@/data/landingPages';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface LandingPageProps {
  page: LandingPageData;
}

function pageKindLabel(kind: LandingPageData['kind']) {
  if (kind === 'comparison') return 'Comparison';
  return kind === 'template' ? 'Template' : 'Tool';
}

export function LandingPage({ page }: LandingPageProps) {
  const pageUrl = `${SITE_URL}${page.path}`;
  const relatedPages = LANDING_PAGES.filter((item) => item.path !== page.path && item.kind === page.kind).slice(0, 4);
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': page.kind === 'tool' ? 'SoftwareApplication' : 'WebPage',
      '@id': `${pageUrl}#${page.kind}`,
      name: page.h1,
      headline: page.h1,
      url: pageUrl,
      description: page.description,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      ...(page.kind === 'tool'
        ? {
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageKindLabel(page.kind),
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto px-6 py-10 lg:py-14">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <div className="mx-auto w-full max-w-5xl">
        <nav className="mb-8 text-xs text-text-muted" aria-label="Breadcrumb">
          <a href="/" className="hover:text-text-secondary transition-colors">
            LocalMock
          </a>
          <span className="mx-2">/</span>
          <span>{pageKindLabel(page.kind)}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            <p className="mb-3 text-sm font-medium text-accent">{pageKindLabel(page.kind)}</p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {page.h1}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{page.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Generate data
              </a>
              <a
                href="mailto:samarth@localmock.in?subject=LocalMock%20data%20or%20feature%20request"
                className="inline-flex items-center rounded-md border border-border-subtle bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Request data/feature
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
            <h2 className="text-base font-semibold text-text-primary">What this page covers</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
              {page.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="mt-12 border-t border-border-subtle pt-10" aria-labelledby="use-cases">
          <h2 id="use-cases" className="text-2xl font-semibold tracking-tight text-text-primary">
            Common use cases
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {page.useCases.map((useCase) => (
              <div key={useCase} className="rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-sm text-text-secondary">
                {useCase}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" aria-labelledby="local-first">
          <div>
            <h2 id="local-first" className="text-2xl font-semibold tracking-tight text-text-primary">
              Generate private mock data locally
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              LocalMock runs in the browser, so schemas and generated data stay on your device. Use it when you need realistic sample data for tests, demos, seed files, API mocks, or data import checks.
            </p>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Start with a template or define fields manually, then export the generated dataset as CSV, JSON, JSONL, SQL, MSW handlers, or TypeScript arrays.
            </p>
          </div>

          {relatedPages.length > 0 && (
            <aside className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
              <h2 className="text-base font-semibold text-text-primary">Related pages</h2>
              <div className="mt-3 flex flex-col gap-2">
                {relatedPages.map((item) => (
                  <a key={item.path} href={item.path} className="text-sm text-text-secondary transition-colors hover:text-accent">
                    {item.h1}
                  </a>
                ))}
              </div>
            </aside>
          )}
        </section>
      </div>
    </main>
  );
}
