/**
 * Quick-start template schemas for onboarding
 */
export const QUICK_START_TEMPLATES = {
  saas: {
    name: 'SaaS Multi-Tenant',
    description: 'Users, organizations, and subscriptions',
    schema: `interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  isVerified: boolean;
  createdAt: string;
}`,
  },
  web3: {
    name: 'Web3 Transaction',
    description: 'Blockchain transactions and wallet data',
    schema: `interface Transaction {
  hash: string;
  fromAddress: string;
  toAddress: string;
  value: number;
  gasPrice: number;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}`,
  },
  ecommerce: {
    name: 'E-Commerce Orders',
    description: 'Customers, products, and order graph',
    schema: `interface Order {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
}`,
  },
} as const;

/**
 * Supported export formats
 */
export const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV', extension: '.csv' },
  { id: 'json', label: 'JSON', extension: '.json' },
  { id: 'jsonl', label: 'JSON Lines', extension: '.jsonl' },
  { id: 'sql', label: 'SQL INSERT', extension: '.sql' },
  { id: 'msw', label: 'MSW Handler', extension: '.ts' },
  { id: 'ts', label: 'TS Array', extension: '.ts' },
] as const;

/**
 * SQL dialects for INSERT export
 */
export const SQL_DIALECTS = ['postgres', 'mysql', 'sqlite'] as const;

/**
 * Preview row limit (always in memory)
 */
export const PREVIEW_ROW_LIMIT = 1_000;

/**
 * Chunk size for streaming generation
 */
export const STREAM_CHUNK_SIZE = 1_000;
