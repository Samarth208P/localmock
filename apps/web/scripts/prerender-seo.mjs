#!/usr/bin/env node
/**
 * Build-time SEO prerender.
 *
 * LocalMock is a pure client-side SPA (Vite + React, no SSR). All per-route
 * <title>/<meta>/canonical/JSON-LD tags are set at runtime via usePageSeo(),
 * which means crawlers or tools that don't execute JS (social share bots,
 * curl-based link checkers, some SEO auditors) only ever see the homepage's
 * meta tags for every route (/tools/*, /templates/*, /mockaroo-alternative).
 *
 * This script runs after `vite build` and writes a static index.html for
 * each indexable route with the correct title, description, canonical URL,
 * Open Graph / Twitter tags, and JSON-LD already baked in. Netlify serves
 * these static files directly (they take priority over the SPA catch-all
 * redirect in netlify.toml), and React hydrates over them on load — no
 * behavior change for users, just correct tags for crawlers/bots.
 *
 * NOTE: keep the LANDING_PAGES data below in sync with
 * src/data/landingPages.ts (kept as a plain JS mirror here so this script
 * has zero build-tool dependencies and can run with plain Node).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const SITE_URL = 'https://localmock.dev';
const SITE_NAME = 'LocalMock';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const LANDING_PAGES = [
  {
    path: '/tools/csv-test-data-generator',
    kind: 'tool',
    title: 'CSV Test Data Generator | LocalMock',
    description:
      'Generate private CSV test data in your browser from manual fields, templates, Prisma schemas, TypeScript types, or JSON schemas.',
    h1: 'CSV test data generator',
  },
  {
    path: '/tools/json-mock-data-generator',
    kind: 'tool',
    title: 'JSON Mock Data Generator | LocalMock',
    description: 'Build realistic JSON mock data locally for APIs, frontend states, prototypes, and automated tests.',
    h1: 'JSON mock data generator',
  },
  {
    path: '/tools/sql-seed-data-generator',
    kind: 'tool',
    title: 'SQL Seed Data Generator | LocalMock',
    description:
      'Generate SQL insert seed data for local databases, demos, and integration tests with browser-private schema handling.',
    h1: 'SQL seed data generator',
  },
  {
    path: '/mockaroo-alternative',
    kind: 'comparison',
    title: 'Mockaroo Alternative for Private Test Data | LocalMock',
    description:
      'Use LocalMock as a browser-private Mockaroo alternative for schema-aware mock data, relational fixtures, and developer exports.',
    h1: 'Mockaroo alternative for local test data',
  },
  {
    path: '/templates/users',
    kind: 'template',
    title: 'User Mock Data Template | LocalMock',
    description: 'Start with a user mock data template for names, emails, roles, signup dates, and account states.',
    h1: 'User mock data template',
  },
  {
    path: '/templates/products',
    kind: 'template',
    title: 'Product Mock Data Template | LocalMock',
    description: 'Generate product catalog mock data with names, SKUs, prices, categories, and inventory fields.',
    h1: 'Product mock data template',
  },
  {
    path: '/templates/orders',
    kind: 'template',
    title: 'Order Mock Data Template | LocalMock',
    description: 'Generate order mock data for commerce, fulfillment, analytics, and relational test scenarios.',
    h1: 'Order mock data template',
  },
  {
    path: '/templates/invoices',
    kind: 'template',
    title: 'Invoice Mock Data Template | LocalMock',
    description: 'Generate invoice mock data for billing screens, accounting demos, payment tests, and export workflows.',
    h1: 'Invoice mock data template',
  },
  {
    path: '/templates/api-logs',
    kind: 'template',
    title: 'API Log Mock Data Template | LocalMock',
    description: 'Generate API log mock data with methods, paths, statuses, latency, IPs, and timestamps.',
    h1: 'API log mock data template',
  },
];

function kindLabel(kind) {
  if (kind === 'comparison') return 'Comparison';
  return kind === 'template' ? 'Template' : 'Tool';
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildJsonLd(page, pageUrl) {
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': page.kind === 'tool' ? 'SoftwareApplication' : 'WebPage',
      '@id': `${pageUrl}#${page.kind}`,
      name: page.h1,
      headline: page.h1,
      url: pageUrl,
      description: page.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      ...(page.kind === 'tool'
        ? {
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: kindLabel(page.kind), item: pageUrl },
      ],
    },
  ];
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function injectHead(html, page) {
  const pageUrl = `${SITE_URL}${page.path}`;
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);

  let out = html;

  // <title>
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // meta description
  out = out.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description}" />`,
  );

  // canonical
  out = out.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${pageUrl}" />`,
  );

  // Open Graph
  out = out.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${pageUrl}" />`);
  out = out.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  out = out.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`,
  );

  // Twitter
  out = out.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`);
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`,
  );

  // Replace the three homepage JSON-LD <script> blocks with page-specific ones.
  // The homepage ships Organization + WebSite + WebApplication blocks; landing
  // pages need Organization + WebSite (site-wide identity) plus their own
  // SoftwareApplication/WebPage + BreadcrumbList — so we keep the first two
  // (Organization, WebSite) and swap out the third (WebApplication) for the
  // page-specific schema.
  const scriptBlocks = [...out.matchAll(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g)];
  if (scriptBlocks.length >= 3) {
    const keep = scriptBlocks.slice(0, 2).map((m) => m[0]).join('\n    ');
    const replacement = `${keep}\n    ${buildJsonLd(page, pageUrl)}`;
    out = out.replace(
      new RegExp(
        scriptBlocks.map((m) => m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'),
      ),
      replacement,
    );
  }

  return out;
}

async function main() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('[prerender-seo] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }

  const baseHtml = await readFile(indexPath, 'utf-8');

  for (const page of LANDING_PAGES) {
    const outDir = path.join(DIST_DIR, page.path.replace(/^\//, ''));
    await mkdir(outDir, { recursive: true });
    const html = injectHead(baseHtml, page);
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`[prerender-seo] wrote ${page.path}/index.html`);
  }

  console.log(`[prerender-seo] done — ${LANDING_PAGES.length} routes prerendered with page-specific SEO tags.`);
}

main();
