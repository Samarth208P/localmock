export const SITE_URL = 'https://localmock.dev';
export const SITE_NAME = 'LocalMock';
export const SITE_TAGLINE = 'Free Client-Side Mock Data Generator';
export const SITE_DESCRIPTION =
  'Generate unlimited mock data instantly in your browser. Paste Prisma, TypeScript, or JSON schemas. Export CSV, JSON, SQL, and more. No signup, no limits, 100% private.';
export const SITE_KEYWORDS = [
  'mock data generator',
  'fake data generator',
  'test data generator',
  'csv generator',
  'json mock data',
  'prisma mock data',
  'typescript mock data',
  'sql insert generator',
  'client-side data generator',
  'free mock data',
  'relational mock data',
  'chaos testing data',
].join(', ');

export const SITE_OG_IMAGE = `${SITE_URL}/og-image.svg`;
export const SITE_TWITTER_HANDLE = '@localmockdev';

export const PAGE_SEO = {
  input: {
    title: 'Free Mock Data Generator — Unlimited CSV, JSON & SQL | LocalMock',
    description: SITE_DESCRIPTION,
  },
  configure: {
    title: 'Configure Schema & Generate Mock Data | LocalMock',
    description:
      'Set row counts, enable chaos testing, and generate relational mock data with referential integrity — all in your browser.',
  },
  preview: {
    title: 'Preview & Export Mock Data | LocalMock',
    description:
      'Preview generated data and export to CSV, JSON, JSONL, SQL, MSW handlers, TypeScript arrays, and more.',
  },
} as const;
