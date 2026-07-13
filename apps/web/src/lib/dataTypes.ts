/**
 * Production-grade data type catalog.
 * Each type defines its randomization rules, configurable options, and unique-safety metadata.
 */

// --- Option field definitions ---

export type OptionType = 'select' | 'number' | 'text' | 'boolean';

export interface OptionDef {
  key: string;
  label: string;
  type: OptionType;
  default: string | number | boolean;
  choices?: string[]; // for select type
  min?: number;       // for number type
  max?: number;       // for number type
  placeholder?: string; // for text type
}

export interface DataTypeOption {
  id: string;
  label: string;
  category: string;
  /** Maximum unique values this type can produce (Infinity if unbounded) */
  uniquePool: number;
  /** Configurable options for this type */
  options: OptionDef[];
}

export interface DataTypeCategory {
  id: string;
  label: string;
  types: DataTypeOption[];
}

// --- Categories ---

export const DATA_TYPE_CATEGORIES: DataTypeCategory[] = [
  // 1. Person
  {
    id: 'person',
    label: 'Person',
    types: [
      {
        id: 'firstName', label: 'First Name', category: 'person', uniquePool: 2000,
        options: [
          { key: 'gender', label: 'Gender', type: 'select', default: 'any', choices: ['any', 'male', 'female'] },
        ],
      },
      {
        id: 'lastName', label: 'Last Name', category: 'person', uniquePool: 1500,
        options: [],
      },
      {
        id: 'fullName', label: 'Full Name', category: 'person', uniquePool: 3000000,
        options: [
          { key: 'middleInitial', label: 'Include Middle Initial', type: 'boolean', default: false },
        ],
      },
      {
        id: 'email', label: 'Email', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'domain', label: 'Domain', type: 'text', default: '', placeholder: 'Random or e.g. @acme.com' },
        ],
      },
      {
        id: 'username', label: 'Username', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'snake_case', choices: ['snake_case', 'camelCase', 'dotted'] },
        ],
      },
      {
        id: 'phone', label: 'Phone Number', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'format', label: 'Format', type: 'text', default: '+1 (###) ###-####', placeholder: '+1 (###) ###-####' },
        ],
      },
      {
        id: 'avatar', label: 'Avatar URL', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'provider', label: 'Provider', type: 'select', default: 'dicebear', choices: ['dicebear', 'robohash', 'uifaces'] },
        ],
      },
      {
        id: 'gender', label: 'Gender', category: 'person', uniquePool: 3,
        options: [],
      },
      {
        id: 'jobTitle', label: 'Job Title', category: 'person', uniquePool: 5000,
        options: [],
      },
      {
        id: 'bio', label: 'Bio / About', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'length', label: 'Length', type: 'select', default: 'medium', choices: ['short', 'medium', 'long'] },
        ],
      },
      {
        id: 'password', label: 'Password', category: 'person', uniquePool: Infinity,
        options: [
          { key: 'length', label: 'Length', type: 'number', default: 12, min: 6, max: 64 },
          { key: 'symbols', label: 'Include Symbols', type: 'boolean', default: true },
          { key: 'numbers', label: 'Include Numbers', type: 'boolean', default: true },
        ],
      },
    ],
  },

  // 2. Location
  {
    id: 'location',
    label: 'Location',
    types: [
      {
        id: 'street', label: 'Street Address', category: 'location', uniquePool: Infinity,
        options: [
          { key: 'includeApt', label: 'Include Apt/Suite', type: 'boolean', default: false },
        ],
      },
      {
        id: 'city', label: 'City', category: 'location', uniquePool: 500,
        options: [],
      },
      {
        id: 'state', label: 'State / Region', category: 'location', uniquePool: 200,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'full', choices: ['full', 'abbreviation'] },
        ],
      },
      {
        id: 'country', label: 'Country', category: 'location', uniquePool: 195,
        options: [],
      },
      {
        id: 'countryCode', label: 'Country Code', category: 'location', uniquePool: 195,
        options: [],
      },
      {
        id: 'zipCode', label: 'Zip / Postal Code', category: 'location', uniquePool: Infinity,
        options: [
          { key: 'format', label: 'Format', type: 'text', default: '#####', placeholder: '#####-####' },
        ],
      },
      {
        id: 'latitude', label: 'Latitude', category: 'location', uniquePool: Infinity,
        options: [
          { key: 'precision', label: 'Decimal Places', type: 'number', default: 6, min: 1, max: 10 },
        ],
      },
      {
        id: 'longitude', label: 'Longitude', category: 'location', uniquePool: Infinity,
        options: [
          { key: 'precision', label: 'Decimal Places', type: 'number', default: 6, min: 1, max: 10 },
        ],
      },
      {
        id: 'timezone', label: 'Timezone', category: 'location', uniquePool: 400,
        options: [],
      },
    ],
  },

  // 3. Finance
  {
    id: 'finance',
    label: 'Finance',
    types: [
      {
        id: 'amount', label: 'Amount / Price', category: 'finance', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 0, min: 0, max: 1000000 },
          { key: 'max', label: 'Max', type: 'number', default: 10000, min: 0, max: 1000000 },
          { key: 'decimals', label: 'Decimals', type: 'number', default: 2, min: 0, max: 6 },
        ],
      },
      {
        id: 'currencyCode', label: 'Currency Code', category: 'finance', uniquePool: 30,
        options: [],
      },
      {
        id: 'currencyName', label: 'Currency Name', category: 'finance', uniquePool: 30,
        options: [],
      },
      {
        id: 'creditCard', label: 'Credit Card Number', category: 'finance', uniquePool: Infinity,
        options: [
          { key: 'network', label: 'Network', type: 'select', default: 'any', choices: ['any', 'visa', 'mastercard', 'amex'] },
        ],
      },
      {
        id: 'iban', label: 'IBAN', category: 'finance', uniquePool: Infinity,
        options: [
          { key: 'country', label: 'Country', type: 'text', default: '', placeholder: 'e.g. DE, GB, FR (random if empty)' },
        ],
      },
      {
        id: 'bic', label: 'BIC / SWIFT', category: 'finance', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'bitcoinAddress', label: 'Bitcoin Address', category: 'finance', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'ethAddress', label: 'Ethereum Address', category: 'finance', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'transactionType', label: 'Transaction Type', category: 'finance', uniquePool: 5,
        options: [],
      },
    ],
  },

  // 4. Commerce
  {
    id: 'commerce',
    label: 'Commerce',
    types: [
      {
        id: 'productName', label: 'Product Name', category: 'commerce', uniquePool: 50000,
        options: [],
      },
      {
        id: 'productCategory', label: 'Product Category', category: 'commerce', uniquePool: 20,
        options: [],
      },
      {
        id: 'price', label: 'Price', category: 'commerce', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 1, min: 0, max: 100000 },
          { key: 'max', label: 'Max', type: 'number', default: 999, min: 0, max: 100000 },
          { key: 'prefix', label: 'Prefix', type: 'text', default: '$', placeholder: '$' },
        ],
      },
      {
        id: 'companyName', label: 'Company Name', category: 'commerce', uniquePool: 50000,
        options: [],
      },
      {
        id: 'companySuffix', label: 'Company Suffix', category: 'commerce', uniquePool: 5,
        options: [],
      },
      {
        id: 'catchPhrase', label: 'Catch Phrase', category: 'commerce', uniquePool: Infinity,
        options: [],
      },
    ],
  },

  // 5. Internet
  {
    id: 'internet',
    label: 'Internet',
    types: [
      {
        id: 'url', label: 'URL', category: 'internet', uniquePool: Infinity,
        options: [
          { key: 'protocol', label: 'Protocol', type: 'select', default: 'https', choices: ['https', 'http'] },
        ],
      },
      {
        id: 'domainName', label: 'Domain Name', category: 'internet', uniquePool: Infinity,
        options: [
          { key: 'tld', label: 'TLD', type: 'text', default: '', placeholder: '.com, .io, .dev (random if empty)' },
        ],
      },
      {
        id: 'ipv4', label: 'IPv4 Address', category: 'internet', uniquePool: 4294967296,
        options: [
          { key: 'cidr', label: 'CIDR Block', type: 'text', default: '', placeholder: 'e.g. 192.168.0.0/16 (optional)' },
        ],
      },
      {
        id: 'ipv6', label: 'IPv6 Address', category: 'internet', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'macAddress', label: 'MAC Address', category: 'internet', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'userAgent', label: 'User Agent', category: 'internet', uniquePool: 50,
        options: [
          { key: 'device', label: 'Device', type: 'select', default: 'any', choices: ['any', 'desktop', 'mobile'] },
        ],
      },
      {
        id: 'hexColor', label: 'Hex Color', category: 'internet', uniquePool: 16777216,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'hex', choices: ['hex', 'rgb', 'hsl'] },
        ],
      },
    ],
  },

  // 6. Date & Time
  {
    id: 'datetime',
    label: 'Date & Time',
    types: [
      {
        id: 'pastDate', label: 'Past Date', category: 'datetime', uniquePool: Infinity,
        options: [
          { key: 'yearsBack', label: 'Years Back', type: 'number', default: 1, min: 1, max: 50 },
        ],
      },
      {
        id: 'futureDate', label: 'Future Date', category: 'datetime', uniquePool: Infinity,
        options: [
          { key: 'yearsForward', label: 'Years Forward', type: 'number', default: 1, min: 1, max: 50 },
        ],
      },
      {
        id: 'recentDate', label: 'Recent Date (30 days)', category: 'datetime', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'isoTimestamp', label: 'ISO Timestamp', category: 'datetime', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'unixTimestamp', label: 'Unix Timestamp', category: 'datetime', uniquePool: Infinity,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'seconds', choices: ['seconds', 'milliseconds'] },
        ],
      },
      {
        id: 'weekday', label: 'Weekday', category: 'datetime', uniquePool: 7,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'full', choices: ['full', 'abbreviated'] },
        ],
      },
      {
        id: 'month', label: 'Month', category: 'datetime', uniquePool: 12,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'full', choices: ['full', 'abbreviated'] },
        ],
      },
    ],
  },

  // 7. IDs & Keys
  {
    id: 'ids',
    label: 'IDs & Keys',
    types: [
      {
        id: 'uuid', label: 'UUID v4', category: 'ids', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'mongoId', label: 'MongoDB ObjectId', category: 'ids', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'autoIncrement', label: 'Auto Increment', category: 'ids', uniquePool: Infinity,
        options: [
          { key: 'start', label: 'Start Value', type: 'number', default: 1, min: 0, max: 1000000 },
          { key: 'step', label: 'Step', type: 'number', default: 1, min: 1, max: 1000 },
        ],
      },
      {
        id: 'nanoid', label: 'NanoID', category: 'ids', uniquePool: Infinity,
        options: [
          { key: 'length', label: 'Length', type: 'number', default: 21, min: 6, max: 64 },
        ],
      },
      {
        id: 'hexHash', label: 'Hex Hash', category: 'ids', uniquePool: Infinity,
        options: [
          { key: 'length', label: 'Length', type: 'number', default: 64, min: 8, max: 128 },
        ],
      },
    ],
  },

  // 8. Numbers
  {
    id: 'numbers',
    label: 'Numbers',
    types: [
      {
        id: 'integer', label: 'Integer', category: 'numbers', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 0, min: -1000000, max: 1000000 },
          { key: 'max', label: 'Max', type: 'number', default: 10000, min: -1000000, max: 1000000 },
        ],
      },
      {
        id: 'float', label: 'Float / Decimal', category: 'numbers', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 0, min: -1000000, max: 1000000 },
          { key: 'max', label: 'Max', type: 'number', default: 100, min: -1000000, max: 1000000 },
          { key: 'precision', label: 'Decimal Places', type: 'number', default: 2, min: 1, max: 10 },
        ],
      },
      {
        id: 'percentage', label: 'Percentage', category: 'numbers', uniquePool: 101,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: '0-100', choices: ['0-100', '0.0-1.0'] },
        ],
      },
      {
        id: 'rating', label: 'Rating (1-5)', category: 'numbers', uniquePool: 5,
        options: [
          { key: 'halfStars', label: 'Allow Half Stars', type: 'boolean', default: false },
        ],
      },
      {
        id: 'age', label: 'Age', category: 'numbers', uniquePool: 63,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 18, min: 0, max: 120 },
          { key: 'max', label: 'Max', type: 'number', default: 80, min: 0, max: 120 },
        ],
      },
    ],
  },

  // 9. Text
  {
    id: 'text',
    label: 'Text',
    types: [
      {
        id: 'sentence', label: 'Sentence', category: 'text', uniquePool: Infinity,
        options: [
          { key: 'minWords', label: 'Min Words', type: 'number', default: 5, min: 2, max: 30 },
          { key: 'maxWords', label: 'Max Words', type: 'number', default: 15, min: 3, max: 50 },
        ],
      },
      {
        id: 'paragraph', label: 'Paragraph', category: 'text', uniquePool: Infinity,
        options: [
          { key: 'minSentences', label: 'Min Sentences', type: 'number', default: 3, min: 1, max: 10 },
          { key: 'maxSentences', label: 'Max Sentences', type: 'number', default: 7, min: 2, max: 20 },
        ],
      },
      {
        id: 'word', label: 'Word', category: 'text', uniquePool: 500,
        options: [],
      },
      {
        id: 'slug', label: 'URL Slug', category: 'text', uniquePool: Infinity,
        options: [
          { key: 'wordCount', label: 'Word Count', type: 'number', default: 3, min: 1, max: 8 },
        ],
      },
      {
        id: 'customList', label: 'Custom List', category: 'text', uniquePool: 0, // dynamic based on input
        options: [
          { key: 'values', label: 'Values (comma-separated)', type: 'text', default: '', placeholder: 'active, pending, suspended' },
        ],
      },
    ],
  },

  // 10. Boolean & Status
  {
    id: 'boolean',
    label: 'Boolean & Status',
    types: [
      {
        id: 'boolean', label: 'Boolean (true/false)', category: 'boolean', uniquePool: 2,
        options: [
          { key: 'trueWeight', label: 'True Weight %', type: 'number', default: 50, min: 0, max: 100 },
        ],
      },
      {
        id: 'yesNo', label: 'Yes / No', category: 'boolean', uniquePool: 2,
        options: [
          { key: 'trueWeight', label: 'Yes Weight %', type: 'number', default: 50, min: 0, max: 100 },
        ],
      },
      {
        id: 'status', label: 'Status', category: 'boolean', uniquePool: 4,
        options: [],
      },
      {
        id: 'priority', label: 'Priority', category: 'boolean', uniquePool: 4,
        options: [],
      },
    ],
  },

  // 11. Web3 / Crypto
  {
    id: 'web3',
    label: 'Web3 / Crypto',
    types: [
      {
        id: 'web3EthAddress', label: 'Ethereum Address', category: 'web3', uniquePool: Infinity,
        options: [
          { key: 'checksum', label: 'Checksum Casing (EIP-55)', type: 'boolean', default: false },
        ],
      },
      {
        id: 'web3BtcAddress', label: 'Bitcoin Address', category: 'web3', uniquePool: Infinity,
        options: [
          { key: 'format', label: 'Format', type: 'select', default: 'segwit', choices: ['segwit', 'legacy'] },
        ],
      },
      {
        id: 'txHash', label: 'Transaction Hash', category: 'web3', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'blockNumber', label: 'Block Number', category: 'web3', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 15000000, min: 0, max: 50000000 },
          { key: 'max', label: 'Max', type: 'number', default: 20000000, min: 0, max: 50000000 },
        ],
      },
      {
        id: 'gasPrice', label: 'Gas Price (Gwei)', category: 'web3', uniquePool: Infinity,
        options: [
          { key: 'min', label: 'Min', type: 'number', default: 15, min: 1, max: 1000 },
          { key: 'max', label: 'Max', type: 'number', default: 150, min: 1, max: 10000 },
        ],
      },
    ],
  },

  // 12. System / Files
  {
    id: 'system',
    label: 'System / Files',
    types: [
      {
        id: 'fileName', label: 'File Name', category: 'system', uniquePool: Infinity,
        options: [],
      },
      {
        id: 'fileExtension', label: 'File Extension', category: 'system', uniquePool: 20,
        options: [
          { key: 'type', label: 'Type', type: 'select', default: 'any', choices: ['any', 'image', 'document', 'code', 'video'] },
        ],
      },
      {
        id: 'mimeType', label: 'MIME Type', category: 'system', uniquePool: 50,
        options: [],
      },
      {
        id: 'filePath', label: 'File Path', category: 'system', uniquePool: Infinity,
        options: [
          { key: 'os', label: 'OS', type: 'select', default: 'posix', choices: ['posix', 'windows'] },
        ],
      },
      {
        id: 'semver', label: 'Semantic Version', category: 'system', uniquePool: Infinity,
        options: [
          { key: 'prefix', label: 'Prefix', type: 'text', default: '', placeholder: 'v (optional)' },
        ],
      },
    ],
  },
];

// --- Utilities ---

export const ALL_DATA_TYPES: DataTypeOption[] = DATA_TYPE_CATEGORIES.flatMap((cat) => cat.types);

export function findDataType(id: string): DataTypeOption | undefined {
  return ALL_DATA_TYPES.find((t) => t.id === id);
}

/**
 * Calculate the effective unique pool size given a type and its options.
 * For custom lists, the pool equals the number of comma-separated values.
 */
export function getEffectivePool(typeId: string, options: Record<string, unknown>): number {
  const typeDef = findDataType(typeId);
  if (!typeDef) return Infinity;

  if (typeId === 'customList') {
    const values = String(options['values'] || '');
    return values.split(',').filter((v) => v.trim()).length || 1;
  }

  if (typeId === 'age' || typeId === 'integer') {
    const min = Number(options['min'] ?? typeDef.options.find((o) => o.key === 'min')?.default ?? 0);
    const max = Number(options['max'] ?? typeDef.options.find((o) => o.key === 'max')?.default ?? 10000);
    return Math.abs(max - min) + 1;
  }

  if (typeId === 'rating') {
    return options['halfStars'] ? 9 : 5;
  }

  if (typeId === 'percentage') {
    return options['format'] === '0.0-1.0' ? Infinity : 101;
  }

  return typeDef.uniquePool;
}
