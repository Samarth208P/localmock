/**
 * Production-grade generation engine — 99/100 REALISM version.
 * Integrates: locale.ts (country-specific), intelligence.ts (smart sentences, weighted names),
 * names.ts (10,000+ names), pools.ts (regions, companies, products).
 */

import * as P from './pools';
import * as Locale from './locale';
import * as Intel from './intelligence';

// --- Utilities ---

const HEX = '0123456789abcdef';
const NANOID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}
function randElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randString(len: number, charset: string): string {
  let s = '';
  for (let i = 0; i < len; i++) s += charset[Math.floor(Math.random() * charset.length)];
  return s;
}

/** Luhn check digit for valid credit card numbers */
function luhnCheck(partial: string): string {
  let sum = 0;
  let alt = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let n = parseInt(partial[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return String((10 - (sum % 10)) % 10);
}

/** EIP-55 checksum casing for Ethereum addresses */
function eip55(addr: string): string {
  const lower = addr.toLowerCase().replace('0x', '');
  // Simple hash simulation (real EIP-55 uses keccak256, we approximate with consistent casing)
  let result = '0x';
  for (let i = 0; i < lower.length; i++) {
    const c = lower[i];
    if ('abcdef'.includes(c)) {
      // Use char code position as pseudo-hash to decide casing
      result += ((i * 7 + c.charCodeAt(0)) % 3 === 0) ? c.toUpperCase() : c;
    } else {
      result += c;
    }
  }
  return result;
}

// --- Row Context (uses weighted selection for realistic frequency) ---

export interface RowContext {
  region: P.CulturalRegion;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  company: string;
  city: string;
  country: { name: string; code: string };
  phoneFormat: string;
}

export function createRowContext(): RowContext {
  const region = randElement(P.REGIONS);
  const data = P.REGION_DATA[region];
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';

  // Weighted: common names appear more frequently (front of array = more common)
  const firstName = gender === 'male'
    ? Intel.weightedRandom(data.maleNames)
    : Intel.weightedRandom(data.femaleNames);
  const lastName = Intel.weightedRandom(data.lastNames);
  const company = randElement(P.COMPANY_NAMES);
  const city = randElement(data.cities);
  const country = randElement(data.countries);

  return { region, firstName, lastName, gender, company, city, country, phoneFormat: data.phoneFormat };
}

// --- Email (12 patterns, uses local domain per country) ---

function genEmail(ctx: RowContext, domainOverride?: string): string {
  const fn = ctx.firstName.toLowerCase().replace(/[^a-z]/g, '');
  const ln = ctx.lastName.toLowerCase().replace(/[^a-z]/g, '');
  const compSlug = ctx.company.toLowerCase().replace(/[^a-z]/g, '');

  // Pick domain: 25% company, 75% local country domain
  const domain = domainOverride?.replace(/^@/, '') || (
    Math.random() > 0.75
      ? `${compSlug}.com`
      : Locale.getLocalEmailDomain(ctx.country.code)
  );

  const yr = String(randInt(1985, 2005)).slice(2);
  const n = randInt(1, 99);

  const patterns = [
    `${fn}.${ln}@${domain}`,
    `${fn[0]}${ln}@${domain}`,
    `${fn}${ln[0]}@${domain}`,
    `${fn}${n}@${domain}`,
    `${ln}.${fn}@${domain}`,
    `${fn[0]}.${ln}${n}@${domain}`,
    `${fn}_${ln}@${domain}`,
    `${fn}${yr}@${domain}`,
    `${fn}.${ln[0]}${n}@${domain}`,
    `${ln}${fn[0]}${n}@${domain}`,
    `${fn}${ln}@${domain}`,
    `${fn[0]}${ln[0]}${randInt(100, 999)}@${domain}`,
  ];
  return randElement(patterns);
}

// --- Username ---

function genUsername(ctx: RowContext, format: string): string {
  const fn = ctx.firstName.toLowerCase().replace(/[^a-z]/g, '');
  const ln = ctx.lastName.toLowerCase().replace(/[^a-z]/g, '');
  const n = randInt(1, 9999);

  if (format === 'camelCase') return `${fn}${ln.charAt(0).toUpperCase()}${ln.slice(1)}${randInt(1, 99)}`;
  if (format === 'dotted') return `${fn}.${ln}`;

  const patterns = [
    `${fn}_${ln}`, `${fn}${n}`, `${fn}_${ln}${randInt(1, 99)}`,
    `the_${fn}`, `${fn}.${ln}.dev`, `${fn[0]}${ln}${randInt(10, 99)}`,
    `${fn}codes`, `${fn}${ln.slice(0, 4)}`, `real_${fn}`, `${fn}.${ln}.io`,
  ];
  return randElement(patterns);
}

// --- Credit card (Luhn-valid) ---

function genCreditCard(network: string): string {
  let prefix: string;
  let len: number;
  switch (network) {
    case 'visa': prefix = '4' + randString(5, '0123456789'); len = 16; break;
    case 'mastercard': prefix = '5' + String(randInt(1, 5)) + randString(4, '0123456789'); len = 16; break;
    case 'amex': prefix = '3' + randElement(['4', '7']) + randString(3, '0123456789'); len = 15; break;
    default: prefix = randElement(['4', '5']) + randString(5, '0123456789'); len = 16;
  }
  const partial = prefix + randString(len - prefix.length - 1, '0123456789');
  const full = partial + luhnCheck(partial);
  if (len === 15) return `${full.slice(0, 4)} ${full.slice(4, 10)} ${full.slice(10)}`;
  return `${full.slice(0, 4)} ${full.slice(4, 8)} ${full.slice(8, 12)} ${full.slice(12)}`;
}

// --- IBAN (country-specific length) ---

function genIBAN(cc: string): string {
  const lengths: Record<string, number> = { DE:22,GB:22,FR:27,ES:24,IT:27,NL:18,BE:16,AT:20,CH:21,SE:24,NO:15,DK:18,PL:28,IE:22,IN:24,AE:23,SA:24,US:24,BR:29,MX:18 };
  const code = cc.toUpperCase().slice(0, 2);
  const l = lengths[code] || 22;
  return `${code}${randInt(10, 99)}${randString(l - 4, '0123456789' + UPPER)}`;
}

// --- BIC ---

function genBIC(cc: string): string {
  return `${randString(4, UPPER)}${cc.toUpperCase().slice(0, 2)}${randString(2, UPPER + '23456789')}${Math.random() > 0.5 ? randString(3, UPPER + '0123456789') : ''}`;
}

// --- Bio (context-aware) ---

const BIO_SKILLS = ['cloud architecture','distributed systems','product strategy','data engineering','UX research','machine learning','team leadership','agile delivery','systems design','growth marketing','full-stack development','API design','DevOps','microservices','event-driven systems','real-time analytics','mobile development','security engineering','performance optimization','CI/CD'];
const BIO_PASSIONS = ['building scalable solutions','mentoring engineers','open-source','writing technical blogs','speaking at conferences','building developer tools','improving DX','accessible products','data-driven decisions','solving complex problems at scale'];

function genBio(ctx: RowContext, length: string): string {
  const role = randElement(P.JOB_TITLES);
  const yrs = randInt(2, 18);
  const s1 = randElement(BIO_SKILLS);
  const s2 = randElement(BIO_SKILLS.filter((s) => s !== s1));
  const passion = randElement(BIO_PASSIONS);
  const prev = randElement(P.COMPANY_NAMES.filter((c) => c !== ctx.company));

  if (length === 'short') return `${role} with ${yrs}+ years in ${s1}.`;
  if (length === 'long') return `${role} with ${yrs}+ years specializing in ${s1} and ${s2}. Passionate about ${passion}. Previously at ${prev}. Based in ${ctx.city}, ${ctx.country.name}.`;
  return `${role} at ${ctx.company}. ${yrs}+ years focused on ${s1} and ${s2}.`;
}

// --- Password (realistic patterns) ---

function genPassword(len: number, symbols: boolean, numbers: boolean): string {
  if (Math.random() > 0.7 && len >= 8) {
    const words = ['Sunshine','Thunder','Dragon','Phoenix','Crystal','Shadow','Silver','Golden','Cosmic','Quantum','Nebula','Arctic','Blazer','Cipher','Mystic'];
    const word = randElement(words);
    const num = String(randInt(1, 999));
    const sym = symbols ? randElement(['!','@','#','$','&','*','_']) : '';
    return `${word}${num}${sym}`.slice(0, len).padEnd(len, randString(1, 'abcdefghijklmnopqrstuvwxyz'));
  }
  let cs = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) cs += '0123456789';
  if (symbols) cs += '!@#$%^&*_+-=';
  return randString(len, cs);
}

// --- File names (realistic project patterns) ---

const FILE_NAMES = ['index','main','app','config','utils','helpers','types','constants','schema','migration','seed','handler','controller','service','model','middleware','routes','auth','database','logger','validator'];
const FILE_SUFFIXES = ['','.test','.spec','.config','.types','.utils','.generated','.backup','.d'];

function genFileName(): string {
  return `${randElement(FILE_NAMES)}${randElement(FILE_SUFFIXES)}.${randElement(P.FILE_EXTENSIONS.code)}`;
}

// --- URL (context-aware) ---

function genURL(ctx: RowContext, protocol: string): string {
  const slug = Intel.S_NOUNS[Math.floor(Math.random() * Intel.S_NOUNS.length)].replace(/\s/g, '-').toLowerCase();
  const comp = ctx.company.toLowerCase().replace(/[^a-z]/g, '');
  const patterns = [
    `${protocol}://${comp}.com/${slug}`,
    `${protocol}://app.${comp}.io/${slug}`,
    `${protocol}://www.${comp}.dev`,
    `${protocol}://${slug}${randElement(P.TLDS)}`,
    `${protocol}://docs.${comp}.dev/api/${slug}`,
    `${protocol}://${comp}.${randElement(['io','dev','app','co'])}/${slug}/${randElement(['overview','getting-started','docs','pricing'])}`,
  ];
  return randElement(patterns);
}

// --- Domain ---

function genDomain(tldOverride?: string): string {
  const tld = tldOverride?.trim() || randElement(P.TLDS);
  const words = ['cloud','data','flow','stack','pulse','nexus','orbit','apex','core','shift','loop','mesh','grid','wave','spark','bolt','forge','base','hub','dock','sync','dash','pixel','craft','byte'];
  const word = randElement(words);
  const suf = Math.random() > 0.6 ? randElement(['app','hq','io','labs','dev','ai','run','up']) : '';
  return `${word}${suf}${tld.startsWith('.') ? tld : '.' + tld}`;
}

// --- Catchphrases (real business taglines) ---

const TAGLINES = [
  'Empowering teams to ship faster','The modern platform for growing businesses',
  'Simplify your workflow, amplify your impact','Built for developers, loved by teams',
  'Scale without complexity','Your data, your rules',
  'From idea to production in minutes','The intelligent layer for your stack',
  'Automate what matters, focus on what counts','Enterprise-grade, startup-speed',
  'One platform, infinite possibilities','Making complex systems feel simple',
  'Trusted by thousands of engineering teams','The fastest way to go from zero to one',
  'Collaborative tools for distributed teams','Security-first, developer-friendly',
  'Real-time insights, real business impact','Where innovation meets execution',
  'Ship with confidence, iterate with speed','The backbone of modern applications',
  'Data infrastructure that just works','Your competitive advantage, automated',
  'Build better, ship faster, sleep well','The operating system for modern teams',
];

// === MAIN GENERATOR ===

export type Options = Record<string, unknown>;

export function generateTypedValue(typeId: string, opts: Options, ctx: RowContext): unknown {
  const regionData = P.REGION_DATA[ctx.region];

  switch (typeId) {
    // ══════ PERSON ══════
    case 'firstName': return ctx.firstName;
    case 'lastName': return ctx.lastName;
    case 'fullName': {
      if (opts.middleInitial) return `${ctx.firstName} ${String.fromCharCode(randInt(65, 90))}. ${ctx.lastName}`;
      return `${ctx.firstName} ${ctx.lastName}`;
    }
    case 'email': return genEmail(ctx, opts.domain as string);
    case 'username': return genUsername(ctx, (opts.format as string) || 'snake_case');
    case 'phone': return Locale.generatePhone(ctx.country.code, opts.format as string);
    case 'avatar': {
      const prov = opts.provider as string || 'dicebear';
      const seed = encodeURIComponent(`${ctx.firstName}${ctx.lastName}${randInt(1, 99)}`);
      if (prov === 'robohash') return `https://robohash.org/${seed}.png?size=200x200&set=set4`;
      if (prov === 'uifaces') return `https://i.pravatar.cc/150?u=${seed}`;
      return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
    }
    case 'gender': return ctx.gender === 'male' ? 'Male' : 'Female';
    case 'jobTitle': return randElement(P.JOB_TITLES);
    case 'bio': return genBio(ctx, (opts.length as string) || 'medium');
    case 'password': return genPassword(Number(opts.length) || 12, opts.symbols !== false, opts.numbers !== false);

    // ══════ LOCATION ══════
    case 'street': {
      const num = randInt(1, 9999);
      const street = randElement(regionData.streets);
      const base = regionData.addressFormat(num, street);
      if (opts.includeApt) return `${base}, Apt ${randInt(1, 500)}`;
      return base;
    }
    case 'city': return ctx.city;
    case 'state': return Locale.getState(ctx.country.code, (opts.format as string === 'abbreviation' ? 'abbreviation' : 'full'));
    case 'country': return ctx.country.name;
    case 'countryCode': return ctx.country.code;
    case 'zipCode': return Locale.generatePostalCode(ctx.country.code, opts.format as string);
    case 'latitude': return randFloat(-90, 90, Number(opts.precision) || 6);
    case 'longitude': return randFloat(-180, 180, Number(opts.precision) || 6);
    case 'timezone': return randElement(P.TIMEZONES);

    // ══════ FINANCE (Luhn-valid, country-specific) ══════
    case 'amount': return randFloat(Number(opts.min) || 0, Number(opts.max) || 10000, Number(opts.decimals) || 2);
    case 'currencyCode': return randElement(P.CURRENCIES).code;
    case 'currencyName': return randElement(P.CURRENCIES).name;
    case 'creditCard': return genCreditCard((opts.network as string) || 'any');
    case 'iban': return genIBAN((opts.country as string) || ctx.country.code);
    case 'bic': return genBIC(ctx.country.code);
    case 'bitcoinAddress': return Math.random() > 0.5 ? `bc1q${randString(38, BASE58.toLowerCase())}` : `3${randString(33, BASE58)}`;
    case 'ethAddress': {
      const addr = `0x${randString(40, HEX)}`;
      return opts.checksum ? eip55(addr) : addr;
    }
    case 'transactionType': return randElement(['Credit', 'Debit', 'Payment', 'Refund', 'Transfer', 'Wire', 'ACH', 'Direct Deposit']);

    // ══════ COMMERCE (realistic pricing) ══════
    case 'productName': return `${randElement(P.PRODUCT_ADJECTIVES)} ${randElement(P.PRODUCT_MATERIALS)} ${randElement(P.PRODUCT_NOUNS)}`;
    case 'productCategory': return randElement(P.PRODUCT_CATEGORIES);
    case 'price': {
      const prefix = (opts.prefix as string) || '$';
      const base = randInt(Number(opts.min) || 1, Number(opts.max) || 999);
      const ending = randElement(['.99', '.95', '.00', '.49', '.79', '.50']);
      return `${prefix}${base}${ending}`;
    }
    case 'companyName': return ctx.company;
    case 'companySuffix': return randElement(P.COMPANY_SUFFIXES);
    case 'catchPhrase': return randElement(TAGLINES);

    // ══════ INTERNET (context-aware, proper formats) ══════
    case 'url': return genURL(ctx, (opts.protocol as string) || 'https');
    case 'domainName': return genDomain(opts.tld as string);
    case 'ipv4': {
      const firsts = [23,34,45,52,54,64,72,91,104,108,142,151,162,172,185,192,203,216];
      return `${randElement(firsts)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
    }
    case 'ipv6': return Array.from({ length: 8 }, () => randString(4, HEX)).join(':');
    case 'macAddress': {
      const fb = (randInt(0, 127) * 2).toString(16).padStart(2, '0');
      return `${fb}:${Array.from({ length: 5 }, () => randString(2, HEX)).join(':')}`;
    }
    case 'userAgent': {
      const d = opts.device as string || 'any';
      if (d === 'mobile') return randElement(P.USER_AGENTS_MOBILE);
      if (d === 'desktop') return randElement(P.USER_AGENTS_DESKTOP);
      return randElement([...P.USER_AGENTS_DESKTOP, ...P.USER_AGENTS_MOBILE]);
    }
    case 'hexColor': {
      const fmt = opts.format as string || 'hex';
      const r = randInt(0, 255), g = randInt(0, 255), b = randInt(0, 255);
      if (fmt === 'rgb') return `rgb(${r}, ${g}, ${b})`;
      if (fmt === 'hsl') return `hsl(${randInt(0, 360)}, ${randInt(30, 90)}%, ${randInt(25, 75)}%)`;
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // ══════ DATE & TIME (business hour clustering) ══════
    case 'pastDate': {
      const yrs = Number(opts.yearsBack) || 1;
      const now = Date.now();
      return Intel.businessHourDate(now - yrs * 365.25 * 86400000, now).toISOString();
    }
    case 'futureDate': {
      const yrs = Number(opts.yearsForward) || 1;
      const now = Date.now();
      return Intel.businessHourDate(now, now + yrs * 365.25 * 86400000).toISOString();
    }
    case 'recentDate': return Intel.businessHourDate(Date.now() - 30 * 86400000, Date.now()).toISOString();
    case 'isoTimestamp': return Intel.businessHourDate(Date.now() - 365 * 86400000, Date.now()).toISOString();
    case 'unixTimestamp': {
      const d = Intel.businessHourDate(Date.now() - 365 * 86400000, Date.now());
      return opts.format === 'milliseconds' ? d.getTime() : Math.floor(d.getTime() / 1000);
    }
    case 'weekday': {
      const days = opts.format === 'abbreviated'
        ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
      // Weekdays more common (matching business hour logic)
      return Math.random() < 0.8 ? randElement(days.slice(0, 5)) : randElement(days.slice(5));
    }
    case 'month': {
      const months = opts.format === 'abbreviated'
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        : ['January','February','March','April','May','June','July','August','September','October','November','December'];
      return randElement(months);
    }

    // ══════ IDS & KEYS ══════
    case 'uuid': return `${randString(8, HEX)}-${randString(4, HEX)}-4${randString(3, HEX)}-${randElement(['8','9','a','b'])}${randString(3, HEX)}-${randString(12, HEX)}`;
    case 'mongoId': {
      const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
      return ts + randString(16, HEX);
    }
    case 'autoIncrement': return (Number(opts.start) || 1) + (Number(opts.__counter) || 0) * (Number(opts.step) || 1);
    case 'nanoid': return randString(Number(opts.length) || 21, NANOID_CHARS);
    case 'hexHash': return randString(Number(opts.length) || 64, HEX);

    // ══════ NUMBERS ══════
    case 'integer': return randInt(Number(opts.min) ?? 0, Number(opts.max) ?? 10000);
    case 'float': return randFloat(Number(opts.min) ?? 0, Number(opts.max) ?? 100, Number(opts.precision) ?? 2);
    case 'percentage': return opts.format === '0.0-1.0' ? randFloat(0, 1, 4) : randInt(0, 100);
    case 'rating': return opts.halfStars ? randElement([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) : randInt(1, 5);
    case 'age': return randInt(Number(opts.min) ?? 18, Number(opts.max) ?? 80);

    // ══════ TEXT (smart sentences) ══════
    case 'sentence': return Intel.smartSentence();
    case 'paragraph': return Intel.smartParagraph(Number(opts.minSentences) || 3, Number(opts.maxSentences) || 6);
    case 'word': return randElement(Intel.S_NOUNS);
    case 'slug': {
      const wc = Number(opts.wordCount) || 3;
      return Array.from({ length: wc }, () => randElement(Intel.S_NOUNS)).join('-').replace(/\s/g, '-').toLowerCase();
    }
    case 'customList': {
      const vals = String(opts.values || 'active, pending, suspended').split(',').map((v) => v.trim()).filter(Boolean);
      return randElement(vals.length > 0 ? vals : ['value']);
    }

    // ══════ BOOLEAN & STATUS ══════
    case 'boolean': return Math.random() < (Number(opts.trueWeight ?? 50) / 100);
    case 'yesNo': return Math.random() < (Number(opts.trueWeight ?? 50) / 100) ? 'Yes' : 'No';
    case 'status': return randElement(['Active', 'Pending', 'Suspended', 'Deleted', 'Archived', 'Draft']);
    case 'priority': return randElement(['Low', 'Medium', 'High', 'Critical', 'Urgent']);

    // ══════ WEB3 / CRYPTO ══════
    case 'web3EthAddress': {
      const addr = `0x${randString(40, HEX)}`;
      return opts.checksum ? eip55(addr) : addr;
    }
    case 'web3BtcAddress': return opts.format === 'legacy' ? `1${randString(33, BASE58)}` : `bc1q${randString(38, BASE58.toLowerCase())}`;
    case 'txHash': return `0x${randString(64, HEX)}`;
    case 'blockNumber': return randInt(Number(opts.min) || 15000000, Number(opts.max) || 20000000);
    case 'gasPrice': return randInt(Number(opts.min) || 15, Number(opts.max) || 150);

    // ══════ SYSTEM / FILES (realistic project files) ══════
    case 'fileName': return genFileName();
    case 'fileExtension': return randElement(P.FILE_EXTENSIONS[(opts.type as string) || 'any'] || P.FILE_EXTENSIONS.any);
    case 'mimeType': return randElement(P.MIME_TYPES);
    case 'filePath': {
      const os = opts.os as string || 'posix';
      const file = genFileName();
      const projs = ['api-service','web-app','dashboard','backend','frontend','shared','packages','scripts','infra'];
      const dirs = ['src','lib','utils','components','pages','handlers','models','tests','config','middleware'];
      if (os === 'windows') return `C:\\Users\\${ctx.firstName}\\Projects\\${randElement(projs)}\\${randElement(dirs)}\\${file}`;
      return `/home/${ctx.firstName.toLowerCase()}/projects/${randElement(projs)}/${randElement(dirs)}/${file}`;
    }
    case 'semver': {
      const prefix = (opts.prefix as string) || '';
      const major = randElement([0, 0, 1, 1, 1, 1, 2, 2, 3, 4]);
      return `${prefix}${major}.${randInt(0, 20)}.${randInt(0, 50)}`;
    }

    default: return `${ctx.firstName.toLowerCase()}_${randInt(1, 9999)}`;
  }
}
