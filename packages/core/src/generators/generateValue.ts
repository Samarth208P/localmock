import { customGenerators, type RowContext } from './custom';
import type { FieldClassification } from '../parser/types';

/**
 * Generates a single value for a field based on its classification.
 * Uses RowContext to produce correlated data (email matches name, etc).
 */
export function generateValue(
  field: FieldClassification,
  ctx: RowContext,
  enumValues?: string[],
): unknown {
  const { fakerMethod, inferredType } = field;

  // Handle enums (union types)
  if (inferredType === 'enum' && enumValues && enumValues.length > 0) {
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }

  // Map faker methods to context-aware generators
  switch (fakerMethod) {
    case 'string.uuid':
      return customGenerators.uuid();
    case 'internet.email':
      return customGenerators.email(ctx);
    case 'person.firstName':
      return customGenerators.firstName(ctx);
    case 'person.lastName':
      return customGenerators.lastName(ctx);
    case 'person.fullName':
      return customGenerators.fullName(ctx);
    case 'phone.number':
      return customGenerators.phone();
    case 'internet.url':
      return customGenerators.url(ctx);
    case 'image.avatar':
      return customGenerators.avatar(ctx);
    case 'date.recent':
      return customGenerators.date();
    case 'location.streetAddress':
      return customGenerators.streetAddress();
    case 'location.city':
      return customGenerators.city(ctx);
    case 'location.country':
      return customGenerators.country(ctx);
    case 'location.zipCode':
      return customGenerators.zipCode();
    case 'location.latitude':
      return customGenerators.latitude();
    case 'location.longitude':
      return customGenerators.longitude();
    case 'finance.ethereumAddress':
      return customGenerators.ethAddress();
    case 'string.hexadecimal':
      return customGenerators.hexHash();
    case 'finance.amount':
      return customGenerators.amount();
    case 'finance.currencyCode':
      return customGenerators.currencyCode();
    case 'datatype.boolean':
      return customGenerators.boolean();
    case 'number.int':
      return customGenerators.integer(1, 10000);
    case 'company.name':
      return customGenerators.company(ctx);
    case 'lorem.paragraph':
      return customGenerators.paragraph();
    case 'lorem.sentence':
      return customGenerators.sentence();
    case 'helpers.arrayElement':
      const defaults = ['active', 'inactive', 'pending', 'archived'];
      return defaults[Math.floor(Math.random() * defaults.length)];
    case 'string.alphanumeric':
    default:
      return customGenerators.alphanumeric(12);
  }
}
