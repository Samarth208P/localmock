import { LANDING_PAGES, type LandingPage as LandingPageData } from '@/data/landingPages';
import { SITE_NAME, SITE_URL } from '@/lib/site';

interface LandingPageProps {
  page: LandingPageData;
}

function pageKindLabel(kind: LandingPageData['kind']) {
  if (kind === 'comparison') return 'Comparison';
  return kind === 'template' ? 'Template' : 'Tool';
}

/** Generate 3 contextual FAQ items per page based on its kind and h1 */
function getPageFaq(page: LandingPageData) {
  const toolName = page.h1;
  if (page.kind === 'tool') {
    return [
      {
        q: `Is the ${toolName} free?`,
        a: `Yes. LocalMock's ${toolName} is completely free with no signup, no account, and no row limits. All generation happens client-side in your browser.`,
      },
      {
        q: `What formats can I export from the ${toolName}?`,
        a: `You can export generated data as CSV, JSON, JSONL, SQL INSERT statements, MSW handler code, and TypeScript arrays — all from within your browser session.`,
      },
      {
        q: `Does the ${toolName} keep my schema private?`,
        a: `Yes. LocalMock runs entirely in your browser. Your schema and generated data never leave your device — there is no server upload required.`,
      },
    ];
  }
  if (page.kind === 'template') {
    return [
      {
        q: `How do I use the ${toolName}?`,
        a: `Open LocalMock, click the template that matches your use case, review or customize the fields, set a row count, generate, and download as CSV, JSON, SQL, or another format.`,
      },
      {
        q: `Can I customize the ${toolName} fields?`,
        a: `Yes. After loading the template you can add, remove, or rename fields and change data types before generating. Templates are a starting point, not a fixed schema.`,
      },
      {
        q: `What export formats work with this template?`,
        a: `All LocalMock templates export to CSV, JSON, JSONL, SQL INSERT statements, MSW handler code, and TypeScript arrays. Choose the format that fits your workflow.`,
      },
    ];
  }
  // comparison
  return [
    {
      q: `How does LocalMock compare to alternatives?`,
      a: `LocalMock focuses on privacy-first, browser-based generation with no signup, no server upload, and no free-tier row cap. It also supports Prisma schemas, TypeScript types, relational data, and chaos testing — features that many alternatives lack.`,
    },
    {
      q: `Is LocalMock free compared to other tools?`,
      a: `Yes. LocalMock is completely free with no account required and no row limits. Many alternative tools enforce row caps on free tiers or require account registration.`,
    },
    {
      q: `Does LocalMock keep schema data private?`,
      a: `Yes. LocalMock generates data entirely in your browser. Schemas and generated rows never reach a server, making it suitable for internal, private, or sensitive database models.`,
    },
  ];
}

export function LandingPage({ page }: LandingPageProps) {
  const pageUrl = `${SITE_URL}${page.path}`;
  const pageFaq = getPageFaq(page);

  // Show related pages across kinds to maximise internal linking
  const relatedPages = LANDING_PAGES.filter((item) => item.path !== page.path).slice(0, 5);

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
        {
          '@type': 'ListItem',
          position: 3,
          name: page.h1,
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pageFaq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
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
          <span className="hover:text-text-secondary transition-colors">{pageKindLabel(page.kind)}</span>
          <span className="mx-2">/</span>
          <span className="text-text-secondary">{page.h1}</span>
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
                Generate data →
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
                <li key={highlight} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent text-xs">✓</span>
                  {highlight}
                </li>
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
              Generate private data locally — no upload, no limits
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              LocalMock runs entirely in your browser so schemas and generated data stay on your device. Use it to generate mock data, sample data, dummy data, or random test data for testing, demos, seed files, API mocks, or import checks — with no signup and no free-tier row limit.
            </p>
            <p className="mt-3 text-sm leading-7 text-text-secondary">
              Start with a template or define fields manually using 80+ data types, then export the generated dataset as CSV, JSON, JSONL, SQL INSERT statements, MSW handlers, or TypeScript arrays.
            </p>
          </div>

          {relatedPages.length > 0 && (
            <aside className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
              <h2 className="text-base font-semibold text-text-primary">Related tools &amp; templates</h2>
              <div className="mt-3 flex flex-col gap-2">
                {relatedPages.map((item) => (
                  <a key={item.path} href={item.path} className="text-sm text-text-secondary transition-colors hover:text-accent">
                    {item.h1}
                  </a>
                ))}
              </div>
              <a href="/" className="mt-4 block text-xs text-accent hover:underline">
                Open mock data generator →
              </a>
            </aside>
          )}
        </section>

        {/* Per-page FAQ section with FAQPage JSON-LD already injected above */}
        <section className="mt-12 border-t border-border-subtle pt-10" aria-labelledby={`${page.kind}-faq`}>
          <h2 id={`${page.kind}-faq`} className="text-2xl font-semibold tracking-tight text-text-primary">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {pageFaq.map(({ q, a }) => (
              <article key={q} className="rounded-lg border border-border-subtle bg-bg-secondary p-5">
                <h3 className="text-sm font-semibold text-text-primary leading-snug">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{a}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
