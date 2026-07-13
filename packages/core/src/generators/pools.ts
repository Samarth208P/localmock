/**
 * Culturally-aware data pools organized by region.
 * Name pools imported from the massive names.ts file (50KB+, 2000+ names per category).
 */

import * as Names from './names';
import { CITIES, STREETS } from './locations';

export type CulturalRegion = 'indian' | 'anglo' | 'european' | 'east_asian' | 'latin' | 'middle_eastern' | 'african';

export const REGIONS: CulturalRegion[] = ['indian', 'anglo', 'european', 'east_asian', 'latin', 'middle_eastern', 'african'];

export interface RegionData {
  maleNames: string[];
  femaleNames: string[];
  lastNames: string[];
  cities: string[];
  countries: { name: string; code: string }[];
  phoneFormat: string;
  addressFormat: (num: number, street: string) => string;
  streets: string[];
}

export const REGION_DATA: Record<CulturalRegion, RegionData> = {
  indian: {
    maleNames: Names.INDIAN_MALE,
    femaleNames: Names.INDIAN_FEMALE,
    lastNames: Names.INDIAN_SURNAMES,
    cities: CITIES.indian,
    countries: [{ name: 'India', code: 'IN' }],
    phoneFormat: '+91 #####-#####',
    addressFormat: (num, street) => `${num}, ${street}, Sector ${Math.floor(Math.random() * 60) + 1}`,
    streets: STREETS.indian,
  },
  anglo: {
    maleNames: Names.ANGLO_MALE,
    femaleNames: Names.ANGLO_FEMALE,
    lastNames: Names.ANGLO_SURNAMES,
    cities: CITIES.anglo,
    countries: [{ name: 'United States', code: 'US' },{ name: 'United Kingdom', code: 'GB' },{ name: 'Canada', code: 'CA' },{ name: 'Australia', code: 'AU' },{ name: 'Ireland', code: 'IE' },{ name: 'New Zealand', code: 'NZ' }],
    phoneFormat: '+1 (###) ###-####',
    addressFormat: (num, street) => `${num} ${street}`,
    streets: STREETS.anglo,
  },
  european: {
    maleNames: Names.EUROPEAN_MALE,
    femaleNames: Names.EUROPEAN_FEMALE,
    lastNames: Names.EUROPEAN_SURNAMES,
    cities: CITIES.european,
    countries: [{ name: 'Germany', code: 'DE' },{ name: 'France', code: 'FR' },{ name: 'Netherlands', code: 'NL' },{ name: 'Sweden', code: 'SE' },{ name: 'Italy', code: 'IT' },{ name: 'Spain', code: 'ES' },{ name: 'Poland', code: 'PL' },{ name: 'Austria', code: 'AT' }],
    phoneFormat: '+49 ### #######',
    addressFormat: (num, street) => `${street} ${num}`,
    streets: STREETS.european,
  },
  east_asian: {
    maleNames: Names.EAST_ASIAN_MALE,
    femaleNames: Names.EAST_ASIAN_FEMALE,
    lastNames: Names.EAST_ASIAN_SURNAMES,
    cities: CITIES.east_asian,
    countries: [{ name: 'Japan', code: 'JP' },{ name: 'South Korea', code: 'KR' },{ name: 'China', code: 'CN' },{ name: 'Singapore', code: 'SG' },{ name: 'Taiwan', code: 'TW' }],
    phoneFormat: '+81 ##-####-####',
    addressFormat: (num, street) => `${street} ${num}-chome`,
    streets: STREETS.east_asian,
  },
  latin: {
    maleNames: Names.LATIN_MALE,
    femaleNames: Names.LATIN_FEMALE,
    lastNames: Names.LATIN_SURNAMES,
    cities: CITIES.latin,
    countries: [{ name: 'Mexico', code: 'MX' },{ name: 'Brazil', code: 'BR' },{ name: 'Argentina', code: 'AR' },{ name: 'Colombia', code: 'CO' },{ name: 'Chile', code: 'CL' },{ name: 'Peru', code: 'PE' }],
    phoneFormat: '+52 ## #### ####',
    addressFormat: (num, street) => `${street} ${num}`,
    streets: STREETS.latin,
  },
  middle_eastern: {
    maleNames: Names.MIDDLE_EASTERN_MALE,
    femaleNames: Names.MIDDLE_EASTERN_FEMALE,
    lastNames: Names.MIDDLE_EASTERN_SURNAMES,
    cities: CITIES.middle_eastern,
    countries: [{ name: 'UAE', code: 'AE' },{ name: 'Saudi Arabia', code: 'SA' },{ name: 'Egypt', code: 'EG' },{ name: 'Turkey', code: 'TR' },{ name: 'Iran', code: 'IR' },{ name: 'Qatar', code: 'QA' }],
    phoneFormat: '+971 ## ### ####',
    addressFormat: (num, street) => `Building ${num}, ${street}`,
    streets: STREETS.middle_eastern,
  },
  african: {
    maleNames: Names.AFRICAN_MALE,
    femaleNames: Names.AFRICAN_FEMALE,
    lastNames: Names.AFRICAN_SURNAMES,
    cities: CITIES.african,
    countries: [{ name: 'Nigeria', code: 'NG' },{ name: 'Kenya', code: 'KE' },{ name: 'South Africa', code: 'ZA' },{ name: 'Ghana', code: 'GH' },{ name: 'Tanzania', code: 'TZ' },{ name: 'Ethiopia', code: 'ET' }],
    phoneFormat: '+234 ### ### ####',
    addressFormat: (num, street) => `${num} ${street}`,
    streets: STREETS.african,
  },
};

// --- Non-regional pools ---

export const JOB_TITLES = [
  'Software Engineer','Senior Software Engineer','Staff Engineer','Principal Engineer',
  'Frontend Developer','Backend Developer','Full Stack Developer','DevOps Engineer',
  'Data Scientist','Data Analyst','Machine Learning Engineer','AI Research Scientist',
  'Product Manager','Senior Product Manager','VP of Product','Chief Product Officer',
  'UX Designer','UI Designer','Product Designer','Design Lead','Creative Director',
  'Engineering Manager','Director of Engineering','VP of Engineering','CTO',
  'Marketing Manager','Growth Lead','Content Strategist','SEO Specialist',
  'Sales Manager','Account Executive','Business Development Rep','VP of Sales',
  'HR Manager','Recruiter','People Operations Lead','Chief People Officer',
  'Financial Analyst','Controller','CFO','Accountant','Revenue Operations Manager',
  'QA Engineer','Test Automation Engineer','Security Engineer','Site Reliability Engineer',
  'Solutions Architect','Cloud Architect','Systems Administrator','Network Engineer',
  'Technical Writer','Developer Advocate','Community Manager','Support Engineer',
  'iOS Developer','Android Developer','Mobile Engineer','React Native Developer',
  'Database Administrator','Data Engineer','Analytics Engineer','BI Developer',
  'Scrum Master','Agile Coach','Project Manager','Program Manager',
  'Penetration Tester','Security Analyst','CISO','Compliance Officer',
];

export const COMPANY_NAMES = [
  'Stripe','Notion','Linear','Figma','Vercel','Supabase','Railway','PlanetScale',
  'Datadog','Cloudflare','Twilio','Plaid','Brex','Rippling','Gusto','Deel',
  'Acme Corp','TechForge','DataMesh','CloudNova','BrightPath','NexaFlow',
  'Quantum Labs','Atlas Systems','CoreStack','VeloCity','PulseAI','InfinityLoop',
  'Synapse Digital','Apex Solutions','OmniTech','ClearView','PixelCraft','FlowState',
  'ZenithWorks','Momentum AI','Circuitry','EchoBase','NorthStar Tech','Catalyst IO',
  'Horizon Labs','Prismatic','Ember Works','SkyBridge','DeepCore','Vantage Point',
  'NovaByte','SilverLine','IronClad','BluePeak','GreenField','RedShift',
  'SwiftCode','ByteForge','CodeVault','DevSphere','TerraForm','SkyNet Solutions',
  'MindBridge','LogicGate','NeuralPath','CipherTech','VectorSpace','QuantumLeap',
];

export const PRODUCT_ADJECTIVES = ['Ergonomic','Sleek','Premium','Handcrafted','Intelligent','Minimal','Professional','Ultra','Portable','Wireless','Sustainable','Compact','Modular','Adaptive','Precision'];
export const PRODUCT_MATERIALS = ['Steel','Bamboo','Leather','Carbon Fiber','Titanium','Ceramic','Aluminum','Wood','Glass','Recycled Plastic','Copper','Brass','Silicon','Graphene','Cork'];
export const PRODUCT_NOUNS = ['Keyboard','Mouse','Monitor','Desk','Chair','Headphones','Speaker','Webcam','Laptop Stand','Notebook','Backpack','Wallet','Watch','Lamp','Charger','Microphone','Tablet','Router','Hub','Dock'];
export const PRODUCT_CATEGORIES = ['Electronics','Clothing','Home & Garden','Toys','Beauty','Sports','Books','Automotive','Health','Food & Beverage','Music','Games','Jewelry','Pet Supplies','Office Supplies','Outdoors','Baby & Kids','Arts & Crafts'];
export const COMPANY_SUFFIXES = ['Inc','LLC','Group','Ltd','Corp','Co','Technologies','Solutions','Systems','Holdings','Labs','Studio','Digital','Partners','Ventures','Global','International'];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },{ code: 'EUR', name: 'Euro' },{ code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },{ code: 'INR', name: 'Indian Rupee' },{ code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },{ code: 'CHF', name: 'Swiss Franc' },{ code: 'CNY', name: 'Chinese Yuan' },
  { code: 'BRL', name: 'Brazilian Real' },{ code: 'KRW', name: 'South Korean Won' },{ code: 'SGD', name: 'Singapore Dollar' },
  { code: 'SEK', name: 'Swedish Krona' },{ code: 'AED', name: 'UAE Dirham' },{ code: 'MXN', name: 'Mexican Peso' },
  { code: 'NOK', name: 'Norwegian Krone' },{ code: 'NZD', name: 'New Zealand Dollar' },{ code: 'ZAR', name: 'South African Rand' },
  { code: 'TRY', name: 'Turkish Lira' },{ code: 'THB', name: 'Thai Baht' },
];

export const TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Toronto',
  'Europe/London','Europe/Berlin','Europe/Paris','Europe/Amsterdam','Europe/Stockholm',
  'Asia/Tokyo','Asia/Shanghai','Asia/Kolkata','Asia/Singapore','Asia/Dubai','Asia/Seoul',
  'Australia/Sydney','Australia/Melbourne','Pacific/Auckland','Africa/Lagos','America/Sao_Paulo',
  'America/Mexico_City','Europe/Moscow','Asia/Hong_Kong','Asia/Jakarta',
];

export const EMAIL_DOMAINS = ['gmail.com','outlook.com','yahoo.com','proton.me','icloud.com','hotmail.com','fastmail.com','hey.com','zoho.com','mail.com'];
export const TLDS = ['.com','.net','.io','.dev','.org','.co','.app','.ai','.tech','.xyz','.me','.so'];

export const USER_AGENTS_DESKTOP = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];
export const USER_AGENTS_MOBILE = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
];

export const FILE_EXTENSIONS: Record<string, string[]> = {
  any: ['jpg','png','pdf','docx','xlsx','mp4','json','csv','tsx','py','go','rs','sql','md','svg','heic'],
  image: ['jpg','png','gif','webp','svg','avif','heic','tiff','bmp'],
  document: ['pdf','docx','xlsx','pptx','txt','md','rtf','odt','csv'],
  code: ['ts','tsx','js','jsx','py','go','rs','java','cpp','rb','swift','kt','scala','zig'],
  video: ['mp4','mov','avi','mkv','webm','m4v','flv','wmv'],
};
export const MIME_TYPES = ['application/json','application/pdf','text/html','text/plain','text/csv','image/png','image/jpeg','image/webp','image/svg+xml','video/mp4','audio/mpeg','application/zip','application/xml','application/javascript','text/css'];

// --- Realistic sentence templates ---

export const SENTENCE_TEMPLATES = [
  'The {noun} was {verb_past} by the {role} during the {event}.',
  'We need to {verb} the {noun} before the {event} starts.',
  'The {role} suggested {verb_ing} the {noun} for better results.',
  'After the {event}, the team decided to {verb} the {adjective} {noun}.',
  'Our {adjective} {noun} helped the {role} achieve their quarterly goals.',
  'The {role} reviewed the {adjective} {noun} and approved the changes.',
  'Please {verb} the {noun} and share it with the {role} by Friday.',
  'The new {adjective} {noun} reduced processing time by forty percent.',
  'During the {event}, we discovered that the {noun} needed to be {verb_past}.',
  'The {role} recommended a {adjective} approach to handling the {noun}.',
  'It took three weeks to {verb} the {adjective} {noun} from scratch.',
  'The {event} highlighted the importance of a reliable {noun}.',
  'We successfully {verb_past} the {noun} ahead of the deadline.',
  'The {adjective} {noun} outperformed expectations during the {event}.',
  'Every {role} should {verb} the {noun} at least once per quarter.',
  'The client requested that we {verb} the {adjective} {noun} by next week.',
  'Our {role} identified three issues with the current {noun}.',
  'The {adjective} {noun} was the key deliverable for this sprint.',
];

export const TEMPLATE_NOUNS = ['report','dashboard','pipeline','deployment','feature','integration','API','database','workflow','strategy','budget','prototype','architecture','roadmap','migration','microservice','endpoint','schema','module','service','platform','release','benchmark','audit','specification'];
export const TEMPLATE_VERBS = ['update','review','deploy','refactor','optimize','migrate','redesign','implement','document','automate','scale','monitor','validate','configure','ship','launch','test','debug','profile','benchmark'];
export const TEMPLATE_VERBS_ING = ['updating','reviewing','deploying','refactoring','optimizing','migrating','redesigning','implementing','documenting','automating','scaling','monitoring','validating','configuring','shipping','launching','testing','debugging'];
export const TEMPLATE_VERBS_PAST = ['updated','reviewed','deployed','refactored','optimized','migrated','redesigned','implemented','documented','automated','scaled','monitored','validated','configured','shipped','launched','tested','debugged'];
export const TEMPLATE_ADJECTIVES = ['quarterly','new','existing','critical','automated','comprehensive','streamlined','scalable','robust','efficient','modular','secure','real-time','cloud-native','distributed','high-priority','cross-functional','data-driven'];
export const TEMPLATE_ROLES = ['manager','engineer','designer','analyst','architect','lead','director','coordinator','specialist','consultant','stakeholder','client','VP','founder','intern','contractor'];
export const TEMPLATE_EVENTS = ['sprint review','quarterly planning','product launch','team sync','board meeting','standup','retrospective','design review','code review','demo day','all-hands','hackathon','offsite','onboarding session','performance review'];
