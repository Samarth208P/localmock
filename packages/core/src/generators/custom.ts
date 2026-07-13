/**
 * Lightweight custom generators (<50KB total).
 * These replace Faker for high-frequency primitives to keep bundle size minimal.
 */

const DIGITS = '0123456789';
const HEX = '0123456789abcdef';
const CHARS = 'abcdefghijklmnopqrstuvwxyz';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomString(length: number, charset: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

// --- Name pools (diverse, realistic) ---

const FIRST_NAMES = [
  'James', 'Maria', 'Alex', 'Sarah', 'Chen', 'Priya', 'Omar', 'Yuki', 'Lars', 'Zara',
  'Noah', 'Emma', 'Liam', 'Aisha', 'Kai', 'Rahul', 'Ananya', 'David', 'Sofia', 'Arjun',
  'Mei', 'Hassan', 'Elena', 'Ravi', 'Fatima', 'Lucas', 'Nina', 'Vikram', 'Chloe', 'Sanjay',
  'Olivia', 'Mateo', 'Isla', 'Hiroshi', 'Amara', 'Felix', 'Leila', 'Rohan', 'Anya', 'Diego',
];

const LAST_NAMES = [
  'Smith', 'Chen', 'Patel', 'Garcia', 'Kim', 'Wilson', 'Sato', 'Müller', 'Silva', 'Ahmed',
  'Johnson', 'Brown', 'Taylor', 'Lee', 'Singh', 'Sharma', 'Kumar', 'Williams', 'Martinez', 'Gupta',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Nakamura', 'Costa', 'Ali', 'Nguyen', 'Park',
];

const COMPANY_PREFIXES = ['Tech', 'Data', 'Cloud', 'Net', 'Cyber', 'Quantum', 'Nova', 'Apex', 'Core', 'Vibe', 'Pixel', 'Stack', 'Sync', 'Flow', 'Atlas'];
const COMPANY_SUFFIXES = ['Labs', 'Corp', 'Systems', 'Solutions', 'AI', 'Works', 'Hub', 'IO', 'Base', 'HQ', 'Digital', 'Software', 'Tech', 'Group', 'Inc'];

const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'icloud.com'];

const STREET_NAMES = ['Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Park', 'Lake', 'Hill', 'River', 'Main', 'Market', 'Church', 'High', 'King', 'Queen'];
const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Way', 'Rd', 'Ct', 'Pl'];
const CITIES = ['New York', 'London', 'Tokyo', 'Mumbai', 'Berlin', 'Paris', 'Toronto', 'Sydney', 'Singapore', 'Dubai', 'San Francisco', 'Amsterdam', 'Seoul', 'Bangalore', 'Chicago'];
const COUNTRIES = ['US', 'UK', 'DE', 'FR', 'JP', 'IN', 'BR', 'CA', 'AU', 'KR', 'SG', 'NL', 'AE', 'SE', 'NZ'];

/**
 * RowContext holds correlated values for a single row.
 * This ensures email matches name, company matches domain, etc.
 */
export interface RowContext {
  firstName: string;
  lastName: string;
  company: string;
  city: string;
  country: string;
}

/**
 * Generate a fresh row context with correlated identity data.
 */
export function createRowContext(): RowContext {
  return {
    firstName: randomElement(FIRST_NAMES),
    lastName: randomElement(LAST_NAMES),
    company: `${randomElement(COMPANY_PREFIXES)}${randomElement(COMPANY_SUFFIXES)}`,
    city: randomElement(CITIES),
    country: randomElement(COUNTRIES),
  };
}

export const customGenerators = {
  uuid(): string {
    const hex = () => randomString(4, HEX);
    return `${hex()}${hex()}-${hex()}-4${randomString(3, HEX)}-${randomElement(['8', '9', 'a', 'b'])}${randomString(3, HEX)}-${hex()}${hex()}${hex()}`;
  },

  /**
   * Email derived from row context (firstName + lastName + optional digits)
   */
  email(ctx: RowContext): string {
    const first = ctx.firstName.toLowerCase();
    const last = ctx.lastName.toLowerCase().replace(/[^a-z]/g, '');
    const separator = randomElement(['.', '_', '']);
    const suffix = Math.random() > 0.5 ? String(randomInt(1, 99)) : '';
    const domain = Math.random() > 0.3
      ? randomElement(EMAIL_DOMAINS)
      : `${ctx.company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    return `${first}${separator}${last}${suffix}@${domain}`;
  },

  firstName(ctx: RowContext): string {
    return ctx.firstName;
  },

  lastName(ctx: RowContext): string {
    return ctx.lastName;
  },

  fullName(ctx: RowContext): string {
    return `${ctx.firstName} ${ctx.lastName}`;
  },

  /**
   * Username derived from name
   */
  username(ctx: RowContext): string {
    const styles = [
      () => `${ctx.firstName.toLowerCase()}${ctx.lastName.toLowerCase().slice(0, 3)}${randomInt(1, 999)}`,
      () => `${ctx.firstName.toLowerCase()}_${randomInt(10, 99)}`,
      () => `${ctx.firstName.toLowerCase()}.${ctx.lastName.toLowerCase()}`,
    ];
    return randomElement(styles)();
  },

  phone(): string {
    return `+1${randomString(10, DIGITS)}`;
  },

  boolean(): boolean {
    return Math.random() > 0.5;
  },

  integer(min = 0, max = 10000): number {
    return randomInt(min, max);
  },

  float(min = 0, max = 10000, decimals = 2): number {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
  },

  date(startYear = 2020, endYear = 2025): string {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    return new Date(randomInt(start, end)).toISOString();
  },

  url(ctx: RowContext): string {
    const domain = `${ctx.company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    return `https://${domain}`;
  },

  avatar(ctx: RowContext): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${ctx.firstName}+${ctx.lastName}`;
  },

  streetAddress(): string {
    return `${randomInt(100, 9999)} ${randomElement(STREET_NAMES)} ${randomElement(STREET_TYPES)}`;
  },

  city(ctx: RowContext): string {
    return ctx.city;
  },

  country(ctx: RowContext): string {
    return ctx.country;
  },

  zipCode(): string {
    return randomString(5, DIGITS);
  },

  company(ctx: RowContext): string {
    return ctx.company;
  },

  ethAddress(): string {
    return `0x${randomString(40, HEX)}`;
  },

  hexHash(length = 64): string {
    return `0x${randomString(length, HEX)}`;
  },

  sentence(): string {
    const words = ['the', 'quick', 'data', 'stream', 'cloud', 'sync', 'build', 'deploy', 'mock', 'test', 'schema', 'table', 'query', 'fast', 'real', 'edge'];
    const len = randomInt(5, 12);
    const sentence = Array.from({ length: len }, () => randomElement(words)).join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  },

  paragraph(): string {
    return Array.from({ length: randomInt(2, 4) }, () => customGenerators.sentence()).join(' ');
  },

  alphanumeric(length = 10): string {
    return randomString(length, CHARS + DIGITS);
  },

  latitude(): number {
    return customGenerators.float(-90, 90, 6);
  },

  longitude(): number {
    return customGenerators.float(-180, 180, 6);
  },

  currencyCode(): string {
    return randomElement(['USD', 'EUR', 'GBP', 'JPY', 'INR', 'BRL', 'AUD', 'CAD']);
  },

  amount(): number {
    return customGenerators.float(1, 10000, 2);
  },
};
