import { generateTypedValue, type RowContext } from './engine';
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

  // Quick mapping from fakerMethod to local typeId
  let typeId = 'string';
  const opts: Record<string, unknown> = {};

  switch (fakerMethod) {
    case 'string.uuid': typeId = 'uuid'; break;
    case 'internet.email': typeId = 'email'; break;
    case 'person.firstName': typeId = 'firstName'; break;
    case 'person.lastName': typeId = 'lastName'; break;
    case 'person.fullName': typeId = 'fullName'; break;
    case 'phone.number': typeId = 'phone'; break;
    case 'internet.url': typeId = 'url'; break;
    case 'image.avatar': typeId = 'avatar'; break;
    case 'date.recent': typeId = 'date'; break;
    case 'location.streetAddress': typeId = 'streetAddress'; break;
    case 'location.city': typeId = 'city'; break;
    case 'location.country': typeId = 'country'; break;
    case 'location.zipCode': typeId = 'zipCode'; break;
    case 'location.latitude': typeId = 'latitude'; break;
    case 'location.longitude': typeId = 'longitude'; break;
    case 'finance.ethereumAddress': typeId = 'web3EthAddress'; break;
    case 'string.hexadecimal': typeId = 'hexHash'; break;
    case 'finance.amount': typeId = 'amount'; break;
    case 'finance.currencyCode': typeId = 'currencyCode'; break;
    case 'datatype.boolean': typeId = 'boolean'; break;
    case 'number.int': typeId = 'integer'; break;
    case 'company.name': typeId = 'company'; break;
    case 'lorem.paragraph': typeId = 'paragraph'; break;
    case 'lorem.sentence': typeId = 'sentence'; break;
    case 'helpers.arrayElement': typeId = 'enum'; opts.values = 'active, inactive, pending, archived'; break;
    case 'string.alphanumeric': typeId = 'alphanumeric'; break;
    default: typeId = 'alphanumeric'; break;
  }

  return generateTypedValue(typeId, opts, ctx);
}
