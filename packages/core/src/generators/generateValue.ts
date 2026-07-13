import { customGenerators } from './custom';
import type { FieldClassification } from '../parser/types';

/**
 * Generates a single value for a field based on its classification.
 * Uses custom lightweight generators for common types.
 * Falls back to Faker (loaded separately in Worker) for complex types.
 */
export function generateValue(
  field: FieldClassification,
  _idPools?: Record<string, string[]>,
  enumValues?: string[],
): unknown {
  const { fakerMethod, inferredType } = field;

  // Handle enums (union types)
  if (inferredType === 'enum' && enumValues && enumValues.length > 0) {
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }

  // Map faker methods to custom generators
  switch (fakerMethod) {
    case 'string.uuid':
      return customGenerators.uuid();
    case 'internet.email':
      return customGenerators.email();
    case 'person.firstName':
      return customGenerators.firstName();
    case 'person.lastName':
      return customGenerators.lastName();
    case 'person.fullName':
      return `${customGenerators.firstName()} ${customGenerators.lastName()}`;
    case 'phone.number':
      return customGenerators.phone();
    case 'internet.url':
    case 'image.avatar':
      return customGenerators.url();
    case 'date.recent':
      return customGenerators.date();
    case 'location.streetAddress':
      return `${customGenerators.integer(100, 9999)} ${customGenerators.lastName()} St`;
    case 'location.city':
      return customGenerators.sentence().replace('.', '').split(' ')[0];
    case 'location.country':
      const countries = ['US', 'UK', 'DE', 'FR', 'JP', 'IN', 'BR', 'CA', 'AU', 'KR'];
      return countries[Math.floor(Math.random() * countries.length)];
    case 'location.zipCode':
      return customGenerators.alphanumeric(5).toUpperCase();
    case 'location.latitude':
      return customGenerators.float(-90, 90, 6);
    case 'location.longitude':
      return customGenerators.float(-180, 180, 6);
    case 'finance.ethereumAddress':
      return customGenerators.ethAddress();
    case 'string.hexadecimal':
      return customGenerators.hexHash();
    case 'finance.amount':
      return customGenerators.float(1, 10000, 2);
    case 'finance.currencyCode':
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'BRL', 'AUD'];
      return currencies[Math.floor(Math.random() * currencies.length)];
    case 'datatype.boolean':
      return customGenerators.boolean();
    case 'number.int':
      return customGenerators.integer(1, 10000);
    case 'company.name':
      return customGenerators.company();
    case 'lorem.paragraph':
      return customGenerators.paragraph();
    case 'lorem.sentence':
      return customGenerators.sentence();
    case 'helpers.arrayElement':
      // Generic enum without explicit values
      const defaults = ['active', 'inactive', 'pending', 'archived'];
      return defaults[Math.floor(Math.random() * defaults.length)];
    case 'string.alphanumeric':
    default:
      return customGenerators.alphanumeric(12);
  }
}
