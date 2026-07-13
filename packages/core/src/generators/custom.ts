/**
 * Lightweight custom generators (<50KB total).
 * These replace Faker for high-frequency primitives to keep bundle size minimal.
 */

const CHARS = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const HEX = '0123456789abcdef';

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

export const customGenerators = {
  uuid(): string {
    // UUIDv4 generation
    const hex = () => randomString(4, HEX);
    return `${hex()}${hex()}-${hex()}-4${randomString(3, HEX)}-${randomElement(['8', '9', 'a', 'b'])}${randomString(3, HEX)}-${hex()}${hex()}${hex()}`;
  },

  email(): string {
    const user = randomString(randomInt(5, 10), CHARS);
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'proton.me', 'company.io'];
    return `${user}@${randomElement(domains)}`;
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

  url(): string {
    const domains = ['example.com', 'test.org', 'demo.io', 'app.dev', 'site.co'];
    const path = randomString(randomInt(3, 8), CHARS);
    return `https://${randomElement(domains)}/${path}`;
  },

  phone(): string {
    return `+1${randomString(10, DIGITS)}`;
  },

  ethAddress(): string {
    return `0x${randomString(40, HEX)}`;
  },

  hexHash(length = 64): string {
    return `0x${randomString(length, HEX)}`;
  },

  firstName(): string {
    const names = ['James', 'Maria', 'Alex', 'Sarah', 'Chen', 'Priya', 'Omar', 'Yuki', 'Lars', 'Zara', 'Noah', 'Emma', 'Liam', 'Aisha', 'Kai'];
    return randomElement(names);
  },

  lastName(): string {
    const names = ['Smith', 'Chen', 'Patel', 'Garcia', 'Kim', 'Wilson', 'Sato', 'Müller', 'Silva', 'Ahmed', 'Johnson', 'Brown', 'Taylor', 'Lee', 'Singh'];
    return randomElement(names);
  },

  company(): string {
    const prefixes = ['Tech', 'Data', 'Cloud', 'Net', 'Cyber', 'Quantum', 'Nova', 'Apex', 'Core', 'Vibe'];
    const suffixes = ['Labs', 'Corp', 'Systems', 'Solutions', 'AI', 'Works', 'Hub', 'Stack', 'Flow', 'Base'];
    return `${randomElement(prefixes)}${randomElement(suffixes)}`;
  },

  sentence(): string {
    const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'runs', 'fast', 'data', 'stream', 'cloud', 'sync', 'build', 'deploy'];
    const len = randomInt(4, 10);
    const sentence = Array.from({ length: len }, () => randomElement(words)).join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  },

  paragraph(): string {
    return Array.from({ length: randomInt(2, 4) }, () => customGenerators.sentence()).join(' ');
  },

  alphanumeric(length = 10): string {
    return randomString(length, CHARS + DIGITS);
  },
};
