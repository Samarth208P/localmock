export const SITE_URL = 'https://localmock.dev';
export const SITE_NAME = 'LocalMock';
export const SITE_SUPPORT_EMAIL = 'support@localmock.dev';
export const SITE_FEATURE_REQUEST_EMAIL = 'samarth@localmock.in';
export const SITE_LINKEDIN_URL = 'https://www.linkedin.com/company/localmock/';
export const SITE_REDDIT_URL = 'https://www.reddit.com/user/localmock/';
export const SITE_TAGLINE = 'Free Client-Side Mock Data Generator';
export const SITE_DESCRIPTION =
  'Generate private mock data and test data in your browser. Build fake, sample, or dummy datasets, then export CSV, JSON, SQL, JSONL, MSW, and TypeScript.';
export const SITE_KEYWORDS = [
  'mock data generator',
  'mock data',
  'test data',
  'fake data generator',
  'test data generator',
  'sample data generator',
  'dummy data generator',
  'synthetic data generator',
  'random data generator',
  'csv generator',
  'csv test data',
  'json generator',
  'json mock data',
  'json test data',
  'sql test data',
  'prisma mock data',
  'typescript mock data',
  'sql insert generator',
  'database seed data',
  'api mock data',
  'client-side data generator',
  'free mock data',
  'relational mock data',
  'chaos testing data',
].join(', ');

export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const SITE_TWITTER_HANDLE = '@localmockdev';

export const PAGE_SEO = {
  input: {
    title: 'Free Mock Data & Test Data Generator | LocalMock',
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
