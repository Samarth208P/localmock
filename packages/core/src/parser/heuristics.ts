import type { FieldClassification, ConfidenceLevel } from './types';

interface HeuristicRule {
  pattern: RegExp;
  fakerMethod: string;
  inferredType: string;
  confidence: ConfidenceLevel;
}

/**
 * Ordered heuristic rules. First match wins.
 * More specific patterns come first to avoid false positives.
 */
const RULES: HeuristicRule[] = [
  // IDs
  { pattern: /^(uuid|guid)$/i, fakerMethod: 'string.uuid', inferredType: 'uuid', confidence: 'high' },
  { pattern: /^id$/i, fakerMethod: 'string.uuid', inferredType: 'uuid', confidence: 'medium' },
  { pattern: /^\w+Id$/i, fakerMethod: 'string.uuid', inferredType: 'uuid', confidence: 'medium' },

  // Email
  { pattern: /email/i, fakerMethod: 'internet.email', inferredType: 'email', confidence: 'high' },

  // Names
  { pattern: /^(firstName|first_name)$/i, fakerMethod: 'person.firstName', inferredType: 'firstName', confidence: 'high' },
  { pattern: /^(lastName|last_name)$/i, fakerMethod: 'person.lastName', inferredType: 'lastName', confidence: 'high' },
  { pattern: /^(fullName|full_name|name|username)$/i, fakerMethod: 'person.fullName', inferredType: 'fullName', confidence: 'high' },

  // Phone
  { pattern: /phone|mobile|tel/i, fakerMethod: 'phone.number', inferredType: 'phone', confidence: 'high' },

  // URLs & Images
  { pattern: /^(url|website|homepage|link)$/i, fakerMethod: 'internet.url', inferredType: 'url', confidence: 'high' },
  { pattern: /avatar|image|photo|picture/i, fakerMethod: 'image.avatar', inferredType: 'url', confidence: 'high' },

  // Dates
  { pattern: /(created|updated|deleted|date|timestamp|At$)/i, fakerMethod: 'date.recent', inferredType: 'date', confidence: 'high' },

  // Addresses
  { pattern: /^(street|address|addr)$/i, fakerMethod: 'location.streetAddress', inferredType: 'address', confidence: 'medium' },
  { pattern: /^(city|town)$/i, fakerMethod: 'location.city', inferredType: 'city', confidence: 'high' },
  { pattern: /^(country)$/i, fakerMethod: 'location.country', inferredType: 'country', confidence: 'high' },
  { pattern: /^(zip|zipCode|postal|postalCode)$/i, fakerMethod: 'location.zipCode', inferredType: 'zipCode', confidence: 'high' },

  // Web3 / Crypto
  { pattern: /wallet|ethAddress|evmAddress|fromAddress|toAddress/i, fakerMethod: 'finance.ethereumAddress', inferredType: 'ethAddress', confidence: 'high' },
  { pattern: /^(hash|txHash|transactionHash)$/i, fakerMethod: 'string.hexadecimal', inferredType: 'hexHash', confidence: 'high' },

  // Finance
  { pattern: /^(price|amount|cost|total|balance)$/i, fakerMethod: 'finance.amount', inferredType: 'decimal', confidence: 'high' },
  { pattern: /^(currency)$/i, fakerMethod: 'finance.currencyCode', inferredType: 'currency', confidence: 'high' },

  // Booleans
  { pattern: /^(is|has|can|should|was|enabled|active|verified)/i, fakerMethod: 'datatype.boolean', inferredType: 'boolean', confidence: 'high' },

  // Numbers
  { pattern: /^(age|count|quantity|qty|size|length|weight|height)$/i, fakerMethod: 'number.int', inferredType: 'integer', confidence: 'high' },
  { pattern: /^(lat|latitude)$/i, fakerMethod: 'location.latitude', inferredType: 'latitude', confidence: 'high' },
  { pattern: /^(lng|lon|longitude)$/i, fakerMethod: 'location.longitude', inferredType: 'longitude', confidence: 'high' },

  // Company
  { pattern: /^(company|companyName|organization|org)$/i, fakerMethod: 'company.name', inferredType: 'company', confidence: 'high' },

  // Description / Text
  { pattern: /^(description|bio|about|summary|content|body|text|note)$/i, fakerMethod: 'lorem.paragraph', inferredType: 'text', confidence: 'high' },
  { pattern: /^(title|subject|headline)$/i, fakerMethod: 'lorem.sentence', inferredType: 'sentence', confidence: 'medium' },

  // Status / Enum (generic fallback)
  { pattern: /^(status|state|type|role|category|tier|level)$/i, fakerMethod: 'helpers.arrayElement', inferredType: 'enum', confidence: 'low' },
];

/**
 * Classifies a single field name into a Faker method using heuristic rules.
 * Falls back to alphanumeric string with low confidence.
 */
export function classifyField(fieldName: string, typeHint?: string): FieldClassification {
  // If we have a type hint that's a union of string literals, treat as enum
  if (typeHint && /^['"]/.test(typeHint.trim())) {
    const values = typeHint.match(/['"]([^'"]+)['"]/g);
    if (values && values.length > 0) {
      return {
        name: fieldName,
        inferredType: 'enum',
        fakerMethod: 'helpers.arrayElement',
        confidence: 'high',
        originalType: typeHint,
      };
    }
  }

  // If type hint is a primitive
  if (typeHint) {
    const lower = typeHint.toLowerCase().trim();
    if (lower === 'boolean' || lower === 'bool') {
      return { name: fieldName, inferredType: 'boolean', fakerMethod: 'datatype.boolean', confidence: 'high', originalType: typeHint };
    }
    if (lower === 'number' || lower === 'int' || lower === 'integer' || lower === 'float') {
      // Still check field name for more specific type
      const rule = RULES.find((r) => r.pattern.test(fieldName));
      if (rule && (rule.inferredType === 'integer' || rule.inferredType === 'decimal' || rule.inferredType === 'latitude' || rule.inferredType === 'longitude')) {
        return { name: fieldName, ...rule, originalType: typeHint };
      }
      return { name: fieldName, inferredType: 'integer', fakerMethod: 'number.int', confidence: 'medium', originalType: typeHint };
    }
  }

  // Run heuristic rules
  for (const rule of RULES) {
    if (rule.pattern.test(fieldName)) {
      return {
        name: fieldName,
        inferredType: rule.inferredType,
        fakerMethod: rule.fakerMethod,
        confidence: rule.confidence,
        originalType: typeHint,
      };
    }
  }

  // Fallback: generic string
  return {
    name: fieldName,
    inferredType: 'string',
    fakerMethod: 'string.alphanumeric',
    confidence: 'low',
    originalType: typeHint,
  };
}
