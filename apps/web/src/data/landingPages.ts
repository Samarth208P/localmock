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
  // --- Keyword-targeted tool pages ---
  {
    path: '/tools/dummy-data-generator',
    kind: 'tool',
    title: 'Free Dummy Data Generator — No Signup, No Row Limits | LocalMock',
    description:
      'Generate unlimited dummy data in your browser. Build dummy datasets with custom fields, export CSV, JSON, SQL, and more — no account, no server upload.',
    h1: 'Free dummy data generator',
    intro:
      'Create unlimited dummy data for testing, prototyping, and demos directly in your browser. No signup, no row limits. Define fields manually, paste a schema, or choose a template to get started.',
    highlights: ['No account or signup required', 'Unlimited dummy data generation', 'CSV, JSON, SQL, TypeScript exports', '80+ realistic data types'],
    useCases: ['Prototype testing', 'Demo environments', 'QA fixtures', 'Seed data for local databases'],
  },
  {
    path: '/tools/fake-data-generator',
    kind: 'tool',
    title: 'Free Fake Data Generator Online — CSV, JSON, SQL | LocalMock',
    description:
      'Generate fake data online for free. Create realistic fake names, emails, addresses, UUIDs, and custom fields. Export fake data as CSV, JSON, SQL inserts, or TypeScript arrays.',
    h1: 'Free fake data generator',
    intro:
      'Generate realistic fake data online without uploading your schema. LocalMock creates fake names, emails, addresses, products, orders, and 80+ other field types entirely in your browser.',
    highlights: ['Fake data with 80+ field types', 'Client-side — no data leaves your browser', 'Export as CSV, JSON, SQL, JSONL, MSW, or TypeScript', 'Works as a Mockaroo alternative with no limits'],
    useCases: ['API mock payloads', 'Frontend state fixtures', 'Demo data', 'QA test datasets'],
  },
  {
    path: '/tools/random-data-generator',
    kind: 'tool',
    title: 'Free Random Data Generator — Bulk Random Test Data | LocalMock',
    description:
      'Generate random data in bulk for testing and development. LocalMock produces random names, numbers, dates, UUIDs, and custom fields client-side — no signup needed.',
    h1: 'Free random data generator',
    intro:
      'Create large volumes of random test data directly in your browser. LocalMock uses Web Workers to generate random names, emails, numbers, UUIDs, dates, and custom fields without blocking the UI.',
    highlights: ['Bulk random data generation', 'Web Worker streaming — no UI freeze', '80+ random field types', 'Export random data as CSV, JSON, or SQL'],
    useCases: ['Load testing datasets', 'Performance benchmarks', 'Random seed data', 'Chaos testing scenarios'],
  },
  {
    path: '/tools/sample-data-generator',
    kind: 'tool',
    title: 'Free Sample Data Generator — Realistic Sample Datasets | LocalMock',
    description:
      'Generate realistic sample data for testing, prototyping, and demos. Build sample datasets with custom fields, templates, or schema parsing and export as CSV, JSON, or SQL.',
    h1: 'Free sample data generator',
    intro:
      'Create representative sample datasets for any use case — user records, product catalogs, orders, invoices, API logs, and more. LocalMock generates sample data with realistic values for testing, demos, and prototyping.',
    highlights: ['Realistic sample datasets for any domain', 'Templates for common data shapes', 'Schema-aware generation from Prisma or TypeScript', 'Export sample data as CSV, JSON, SQL, or TypeScript'],
    useCases: ['Demo datasets', 'Import pipeline testing', 'Prototype datasets', 'Documentation examples'],
  },
  {
    path: '/tools/database-test-data-generator',
    kind: 'tool',
    title: 'Database Test Data Generator — SQL Seed Data | LocalMock',
    description:
      'Generate database test data with referential integrity. Create relational SQL seed data for Postgres, MySQL, and SQLite from Prisma schemas, TypeScript types, or manual fields.',
    h1: 'Database test data generator',
    intro:
      'Generate realistic database test data with multi-table support and foreign key integrity. LocalMock parses Prisma schemas and TypeScript types to produce SQL insert statements for local databases, CI fixtures, and integration tests.',
    highlights: ['Relational SQL seed data with FK integrity', 'Prisma and TypeScript schema parsing', 'Postgres, MySQL, and SQLite inserts', 'Chaos data for validation testing'],
    useCases: ['Database seeding', 'Integration test fixtures', 'Migration validation', 'Local development databases'],
  },
  // --- Comparison pages ---
  {
    path: '/generatedata-alternative',
    kind: 'comparison',
    title: 'GenerateData Alternative — Browser-Private Data Generation | LocalMock',
    description:
      'LocalMock is a GenerateData alternative for teams who want private, browser-based data generation with Prisma support, relational data, and developer export formats.',
    h1: 'GenerateData alternative for local-first data generation',
    intro:
      'GenerateData.com is a popular online data tool. LocalMock offers a modern alternative focused on privacy, developer schemas, relational multi-table data, and no signup.',
    highlights: ['No server upload — data stays in browser', 'Prisma, TypeScript, and JSON schema support', 'Relational mock data with FK integrity', 'Developer-first CSV, JSON, SQL, MSW, TypeScript exports'],
    useCases: ['Private schema workflows', 'Relational database seeding', 'Developer-first data generation', 'Fast no-account data generation'],
  },
  // --- Template pages ---
  {
    path: '/templates/ecommerce',
    kind: 'template',
    title: 'E-Commerce Test Data Template — Products, Orders, Users | LocalMock',
    description:
      'Generate e-commerce test data including products, orders, users, and invoices with relational integrity. Export as CSV, JSON, or SQL for commerce testing.',
    h1: 'E-commerce test data template',
    intro:
      'Create complete e-commerce datasets with relational products, orders, users, and invoices. Perfect for testing checkout flows, analytics dashboards, and commerce API integrations.',
    highlights: ['Products, orders, users, and invoices in one dataset', 'Relational mock data with FK integrity', 'Realistic prices, SKUs, statuses, and dates', 'CSV, JSON, and SQL exports'],
    useCases: ['Checkout flow testing', 'Commerce dashboard demos', 'Order management QA', 'Analytics pipeline testing'],
  },
  {
    path: '/templates/employees',
    kind: 'template',
    title: 'Employee Mock Data Template — HR & Workforce Data | LocalMock',
    description:
      'Generate employee mock data for HR systems, directory demos, payroll testing, and org chart prototypes with realistic names, departments, roles, and salaries.',
    h1: 'Employee mock data template',
    intro:
      'Create realistic employee datasets for HR demos, directory applications, onboarding workflows, and payroll system testing. Fields include names, emails, departments, roles, salaries, and hire dates.',
    highlights: ['Realistic employee fields (name, role, dept, salary)', 'CSV, JSON, and SQL exports', 'Good for HR and workforce app testing', 'Pairs well with user and order templates'],
    useCases: ['HR system demos', 'Directory app testing', 'Payroll validation', 'Org chart prototypes'],
  },
];

export function findLandingPage(pathname: string) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return LANDING_PAGES.find((page) => page.path === normalized);
}
