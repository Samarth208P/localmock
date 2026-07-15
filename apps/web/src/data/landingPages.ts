export interface LandingPage {
  path: string;
  kind: 'tool' | 'template' | 'comparison';
  title: string;
  description: string;
  h1: string;
  intro: string;
  highlights: string[];
  useCases: string[];
}

export const LANDING_PAGES: LandingPage[] = [
  {
    path: '/tools/csv-test-data-generator',
    kind: 'tool',
    title: 'CSV Test Data Generator | LocalMock',
    description:
      'Generate private CSV test data in your browser from manual fields, templates, Prisma schemas, TypeScript types, or JSON schemas.',
    h1: 'CSV test data generator',
    intro:
      'Create realistic CSV files for imports, QA checks, spreadsheet demos, and backend seed workflows without uploading your schema.',
    highlights: ['Client-side CSV generation', 'Custom columns and reusable templates', 'Large exports without chat token waste'],
    useCases: ['Import pipeline testing', 'Spreadsheet demos', 'QA fixtures', 'Seed data handoffs'],
  },
  {
    path: '/tools/json-mock-data-generator',
    kind: 'tool',
    title: 'JSON Mock Data Generator | LocalMock',
    description:
      'Build realistic JSON mock data locally for APIs, frontend states, prototypes, and automated tests.',
    h1: 'JSON mock data generator',
    intro:
      'Generate nested-looking records and predictable field shapes for API mocks, demos, docs, and test suites from the browser.',
    highlights: ['JSON exports for API workflows', 'Schema-aware field setup', 'Private browser-based generation'],
    useCases: ['Frontend API mocks', 'Prototype payloads', 'Docs examples', 'Integration tests'],
  },
  {
    path: '/tools/sql-seed-data-generator',
    kind: 'tool',
    title: 'SQL Seed Data Generator | LocalMock',
    description:
      'Generate SQL insert seed data for local databases, demos, and integration tests with browser-private schema handling.',
    h1: 'SQL seed data generator',
    intro:
      'Turn table fields into SQL insert data that fits local development, demos, CI fixtures, and database testing.',
    highlights: ['SQL insert exports', 'Relational mock data support', 'Chaos data for validation testing'],
    useCases: ['Local database seeding', 'Integration test fixtures', 'Demo environments', 'Migration checks'],
  },
  {
    path: '/mockaroo-alternative',
    kind: 'comparison',
    title: 'Mockaroo Alternative for Private Test Data | LocalMock',
    description:
      'Use LocalMock as a browser-private Mockaroo alternative for schema-aware mock data, relational fixtures, and developer exports.',
    h1: 'Mockaroo alternative for local test data',
    intro:
      'LocalMock focuses on private, no-signup generation for developers who need CSV, JSON, SQL, JSONL, MSW, and TypeScript exports.',
    highlights: ['No upload required for schemas', 'Prisma, TypeScript, JSON, and manual inputs', 'Developer-first export formats'],
    useCases: ['Private schema workflows', 'AI-assisted fixture creation', 'Relational QA data', 'Fast no-account data generation'],
  },
  {
    path: '/templates/users',
    kind: 'template',
    title: 'User Mock Data Template | LocalMock',
    description:
      'Start with a user mock data template for names, emails, roles, signup dates, and account states.',
    h1: 'User mock data template',
    intro:
      'Generate realistic user records for auth flows, CRM screens, admin dashboards, onboarding tests, and demo accounts.',
    highlights: ['Names, emails, roles, and status fields', 'Export users as CSV, JSON, or SQL', 'Useful for UI and backend tests'],
    useCases: ['User table demos', 'Auth testing', 'Admin dashboards', 'Account lifecycle fixtures'],
  },
  {
    path: '/templates/products',
    kind: 'template',
    title: 'Product Mock Data Template | LocalMock',
    description:
      'Generate product catalog mock data with names, SKUs, prices, categories, and inventory fields.',
    h1: 'Product mock data template',
    intro:
      'Create product catalog data for commerce demos, inventory screens, recommendation prototypes, and import testing.',
    highlights: ['Catalog-ready product fields', 'CSV and JSON exports', 'Pairs well with orders and invoices'],
    useCases: ['Commerce prototypes', 'Inventory tests', 'Catalog imports', 'Pricing demos'],
  },
  {
    path: '/templates/orders',
    kind: 'template',
    title: 'Order Mock Data Template | LocalMock',
    description:
      'Generate order mock data for commerce, fulfillment, analytics, and relational test scenarios.',
    h1: 'Order mock data template',
    intro:
      'Build order records with totals, statuses, dates, and customer-like fields for realistic commerce and operations testing.',
    highlights: ['Order status and amount fields', 'Works with user and product datasets', 'Useful for relational seed data'],
    useCases: ['Checkout testing', 'Fulfillment demos', 'Revenue dashboards', 'Order import QA'],
  },
  {
    path: '/templates/invoices',
    kind: 'template',
    title: 'Invoice Mock Data Template | LocalMock',
    description:
      'Generate invoice mock data for billing screens, accounting demos, payment tests, and export workflows.',
    h1: 'Invoice mock data template',
    intro:
      'Create invoice-like records with dates, amounts, statuses, and customer fields for billing workflows and demos.',
    highlights: ['Billing-friendly fields', 'CSV, JSON, and SQL exports', 'Good for finance UI testing'],
    useCases: ['Billing dashboards', 'Payment state tests', 'Accounting imports', 'Demo invoice lists'],
  },
  {
    path: '/templates/api-logs',
    kind: 'template',
    title: 'API Log Mock Data Template | LocalMock',
    description:
      'Generate API log mock data with methods, paths, statuses, latency, IPs, and timestamps.',
    h1: 'API log mock data template',
    intro:
      'Produce log-like records for observability demos, dashboard testing, incident views, and data pipeline checks.',
    highlights: ['HTTP method and status fields', 'Latency and timestamp data', 'Useful for JSONL and analytics tests'],
    useCases: ['Observability dashboards', 'Log pipeline testing', 'Incident demos', 'API analytics'],
  },
];

export function findLandingPage(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return LANDING_PAGES.find((page) => page.path === normalized);
}
