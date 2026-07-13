/**
 * Country-specific formatting intelligence:
 * - Phone formats with REAL area codes
 * - Postal code patterns
 * - Local email domains (culturally appropriate)
 * - State/region names
 */

// --- Phone formats with real area codes ---

export interface PhoneFormat {
  format: string; // # = digit
  areaCodes: string[]; // real area codes for this country
}

export const PHONE_FORMATS: Record<string, PhoneFormat> = {
  IN: {
    format: '+91 #####-#####',
    areaCodes: ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70', '69', '68', '67', '66', '65', '63', '62', '61', '60'],
  },
  US: {
    format: '+1 (###) ###-####',
    areaCodes: ['212', '213', '214', '215', '216', '217', '218', '219', '224', '225', '228', '229', '231', '234', '240', '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '272', '276', '281', '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '323', '325', '330', '331', '334', '336', '337', '339', '346', '347', '351', '352', '360', '361', '385', '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '440', '442', '443', '469', '470', '475', '478', '479', '480', '484', '501', '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517', '518', '520', '530', '531', '534', '539', '540', '541', '551', '559', '561', '562', '563', '567', '570', '571', '573', '574', '575', '580', '585', '586', '601', '602', '603', '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619', '620', '623', '626', '628', '629', '630', '631', '636', '641', '646', '650', '651', '657', '660', '661', '662', '667', '669', '678', '681', '682', '701', '702', '703', '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720', '724', '725', '727', '731', '732', '734', '737', '740', '743', '747', '754', '757', '760', '762', '763', '765', '769', '770', '772', '773', '774', '775', '779', '781', '785', '786', '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816', '817', '818', '828', '830', '831', '832', '843', '845', '847', '848', '850', '854', '856', '857', '858', '859', '860', '862', '863', '864', '865', '870', '872', '878', '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', '928', '929', '930', '931', '934', '936', '937', '938', '940', '941', '947', '949', '951', '952', '954', '956', '959', '970', '971', '972', '973', '975', '978', '979', '980', '984', '985', '989'],
  },
  GB: {
    format: '+44 #### ######',
    areaCodes: ['20', '21', '23', '24', '28', '29', '113', '114', '115', '116', '117', '118', '121', '131', '141', '151', '161', '171', '181', '191'],
  },
  CA: {
    format: '+1 (###) ###-####',
    areaCodes: ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '705', '709', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'],
  },
  AU: {
    format: '+61 # #### ####',
    areaCodes: ['2', '3', '4', '7', '8'],
  },
  DE: {
    format: '+49 ### #######',
    areaCodes: ['30', '40', '69', '89', '221', '211', '511', '711', '341', '351', '621', '231', '201', '241', '251', '261', '271', '281', '291', '331'],
  },
  FR: {
    format: '+33 # ## ## ## ##',
    areaCodes: ['1', '2', '3', '4', '5', '6', '7', '9'],
  },
  JP: {
    format: '+81 ##-####-####',
    areaCodes: ['03', '06', '011', '022', '042', '043', '044', '045', '048', '052', '053', '054', '055', '058', '072', '075', '076', '077', '078', '082', '083', '086', '087', '089', '092', '093', '095', '096', '097', '098', '099'],
  },
  KR: {
    format: '+82 ##-####-####',
    areaCodes: ['02', '031', '032', '033', '041', '042', '043', '044', '051', '052', '053', '054', '055', '061', '062', '063', '064'],
  },
  CN: {
    format: '+86 ### #### ####',
    areaCodes: ['010', '021', '022', '023', '024', '025', '027', '028', '029', '020', '0371', '0731', '0451', '0431', '0531', '0571', '0591', '0755', '0757', '0769'],
  },
  BR: {
    format: '+55 ## #####-####',
    areaCodes: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'],
  },
  MX: {
    format: '+52 ## #### ####',
    areaCodes: ['55', '33', '81', '222', '228', '229', '442', '443', '444', '449', '461', '462', '477', '614', '618', '656', '664', '667', '686', '722', '744', '747', '777', '812', '833', '844', '862', '867', '871', '899', '921', '951', '961', '981', '984', '993', '998', '999'],
  },
  AE: {
    format: '+971 ## ### ####',
    areaCodes: ['02', '03', '04', '06', '07', '09', '50', '52', '54', '55', '56', '58'],
  },
  SA: {
    format: '+966 ## ### ####',
    areaCodes: ['50', '53', '54', '55', '56', '57', '58', '59', '11', '12', '13', '14', '16', '17'],
  },
  NG: {
    format: '+234 ### ### ####',
    areaCodes: ['701', '702', '703', '704', '705', '706', '707', '708', '709', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '901', '902', '903', '904', '905', '906', '907', '908', '909', '912', '913', '915', '916'],
  },
  KE: {
    format: '+254 ### ######',
    areaCodes: ['700', '701', '702', '703', '704', '705', '706', '707', '708', '710', '711', '712', '713', '714', '715', '716', '717', '718', '719', '720', '721', '722', '723', '724', '725', '726', '727', '728', '729', '730', '731', '732', '733', '734', '735', '736', '737', '738', '739', '740', '741', '742', '743', '745', '746', '748', '768', '769', '790', '791', '792'],
  },
  ZA: {
    format: '+27 ## ### ####',
    areaCodes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '72', '73', '74', '76', '78', '79', '81', '82', '83', '84'],
  },
  GH: {
    format: '+233 ## ### ####',
    areaCodes: ['20', '23', '24', '25', '26', '27', '28', '50', '54', '55', '56', '57', '59'],
  },
};

// --- Postal code formats per country ---

export interface PostalFormat {
  pattern: string; // A=letter, #=digit
  examples: string[];
}

export const POSTAL_FORMATS: Record<string, PostalFormat> = {
  IN: { pattern: '######', examples: ['110001', '400001', '560001', '500001', '600001'] },
  US: { pattern: '#####', examples: ['10001', '90210', '94102', '60601', '02101'] },
  GB: { pattern: 'AA## #AA', examples: ['SW1A 1AA', 'EC2R 8AH', 'W1D 3QU', 'M1 1AE', 'B1 1BB'] },
  CA: { pattern: 'A#A #A#', examples: ['M5V 3L9', 'V6B 1A1', 'K1A 0B1', 'T2P 1J9', 'H3B 1A1'] },
  AU: { pattern: '####', examples: ['2000', '3000', '4000', '5000', '6000'] },
  DE: { pattern: '#####', examples: ['10115', '20095', '60311', '80331', '50667'] },
  FR: { pattern: '#####', examples: ['75001', '13001', '69001', '33000', '31000'] },
  JP: { pattern: '###-####', examples: ['100-0001', '530-0001', '460-0001', '812-0011', '060-0001'] },
  KR: { pattern: '#####', examples: ['04524', '06164', '48058', '41068', '34130'] },
  CN: { pattern: '######', examples: ['100000', '200000', '510000', '610000', '310000'] },
  BR: { pattern: '#####-###', examples: ['01001-000', '20040-020', '30130-000', '40015-060', '80010-000'] },
  MX: { pattern: '#####', examples: ['06600', '11000', '44100', '64000', '72000'] },
  AE: { pattern: '', examples: [''] }, // UAE doesn't use postal codes widely
  SA: { pattern: '#####', examples: ['11564', '21411', '31952', '41411', '51411'] },
  NG: { pattern: '######', examples: ['100001', '200001', '300001', '400001', '500001'] },
  KE: { pattern: '#####', examples: ['00100', '00200', '00300', '00400', '00500'] },
  ZA: { pattern: '####', examples: ['2000', '4001', '5001', '6001', '7001'] },
  NL: { pattern: '#### AA', examples: ['1012 AB', '3011 AA', '1017 CD', '2511 AB', '6211 EM'] },
  SE: { pattern: '### ##', examples: ['111 22', '411 06', '211 35', '753 10', '602 21'] },
  IT: { pattern: '#####', examples: ['00118', '20121', '50122', '80121', '10121'] },
  ES: { pattern: '#####', examples: ['28001', '08001', '41001', '46001', '29001'] },
  PL: { pattern: '##-###', examples: ['00-001', '30-001', '50-001', '60-001', '80-001'] },
};

// --- Country-specific local email domains ---

export const LOCAL_EMAIL_DOMAINS: Record<string, string[]> = {
  IN: ['gmail.com', 'yahoo.co.in', 'rediffmail.com', 'outlook.com', 'hotmail.com', 'zoho.com', 'sify.com'],
  US: ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'aol.com', 'hotmail.com', 'proton.me', 'hey.com'],
  GB: ['gmail.com', 'outlook.com', 'yahoo.co.uk', 'btinternet.com', 'sky.com', 'hotmail.co.uk', 'virgin.net'],
  CA: ['gmail.com', 'outlook.com', 'yahoo.ca', 'shaw.ca', 'rogers.com', 'bell.net', 'hotmail.com'],
  AU: ['gmail.com', 'outlook.com', 'yahoo.com.au', 'bigpond.com', 'optusnet.com.au', 'iinet.net.au'],
  DE: ['gmail.com', 'web.de', 'gmx.de', 'gmx.net', 't-online.de', 'outlook.de', 'freenet.de', 'posteo.de'],
  FR: ['gmail.com', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr', 'outlook.fr'],
  NL: ['gmail.com', 'outlook.com', 'hotmail.nl', 'ziggo.nl', 'kpnmail.nl', 'xs4all.nl', 'live.nl'],
  SE: ['gmail.com', 'outlook.com', 'hotmail.se', 'telia.com', 'comhem.se', 'spray.se', 'bredband.net'],
  IT: ['gmail.com', 'libero.it', 'virgilio.it', 'alice.it', 'tin.it', 'outlook.it', 'tiscali.it'],
  ES: ['gmail.com', 'hotmail.es', 'yahoo.es', 'outlook.es', 'telefonica.net', 'terra.es'],
  JP: ['gmail.com', 'yahoo.co.jp', 'docomo.ne.jp', 'softbank.ne.jp', 'ezweb.ne.jp', 'icloud.com', 'nifty.com'],
  KR: ['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'kakao.com', 'nate.com', 'outlook.com'],
  CN: ['gmail.com', 'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com', 'foxmail.com', 'aliyun.com'],
  BR: ['gmail.com', 'outlook.com', 'hotmail.com', 'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br'],
  MX: ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.mx', 'prodigy.net.mx', 'live.com.mx'],
  AE: ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'emirates.net.ae', 'etisalat.ae'],
  SA: ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'stc.com.sa'],
  NG: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
  KE: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
  ZA: ['gmail.com', 'outlook.com', 'yahoo.com', 'mweb.co.za', 'webmail.co.za', 'vodamail.co.za'],
  GH: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'],
};

// --- States/regions per country ---

export interface StateEntry {
  full: string;
  abbr: string;
}

export const STATES: Record<string, StateEntry[]> = {
  IN: [
    { full: 'Maharashtra', abbr: 'MH' }, { full: 'Karnataka', abbr: 'KA' },
    { full: 'Tamil Nadu', abbr: 'TN' }, { full: 'Telangana', abbr: 'TS' },
    { full: 'Delhi', abbr: 'DL' }, { full: 'Gujarat', abbr: 'GJ' },
    { full: 'Rajasthan', abbr: 'RJ' }, { full: 'Uttar Pradesh', abbr: 'UP' },
    { full: 'West Bengal', abbr: 'WB' }, { full: 'Kerala', abbr: 'KL' },
    { full: 'Madhya Pradesh', abbr: 'MP' }, { full: 'Punjab', abbr: 'PB' },
    { full: 'Haryana', abbr: 'HR' }, { full: 'Bihar', abbr: 'BR' },
    { full: 'Andhra Pradesh', abbr: 'AP' }, { full: 'Odisha', abbr: 'OD' },
  ],
  US: [
    { full: 'California', abbr: 'CA' }, { full: 'Texas', abbr: 'TX' },
    { full: 'Florida', abbr: 'FL' }, { full: 'New York', abbr: 'NY' },
    { full: 'Pennsylvania', abbr: 'PA' }, { full: 'Illinois', abbr: 'IL' },
    { full: 'Ohio', abbr: 'OH' }, { full: 'Georgia', abbr: 'GA' },
    { full: 'North Carolina', abbr: 'NC' }, { full: 'Michigan', abbr: 'MI' },
    { full: 'New Jersey', abbr: 'NJ' }, { full: 'Virginia', abbr: 'VA' },
    { full: 'Washington', abbr: 'WA' }, { full: 'Arizona', abbr: 'AZ' },
    { full: 'Massachusetts', abbr: 'MA' }, { full: 'Colorado', abbr: 'CO' },
    { full: 'Tennessee', abbr: 'TN' }, { full: 'Indiana', abbr: 'IN' },
    { full: 'Maryland', abbr: 'MD' }, { full: 'Minnesota', abbr: 'MN' },
    { full: 'Oregon', abbr: 'OR' }, { full: 'Wisconsin', abbr: 'WI' },
  ],
  GB: [
    { full: 'England', abbr: 'ENG' }, { full: 'Scotland', abbr: 'SCT' },
    { full: 'Wales', abbr: 'WLS' }, { full: 'Northern Ireland', abbr: 'NIR' },
    { full: 'Greater London', abbr: 'LDN' }, { full: 'West Midlands', abbr: 'WMD' },
    { full: 'Greater Manchester', abbr: 'MAN' }, { full: 'West Yorkshire', abbr: 'WYK' },
  ],
  DE: [
    { full: 'Bayern', abbr: 'BY' }, { full: 'Nordrhein-Westfalen', abbr: 'NW' },
    { full: 'Baden-Württemberg', abbr: 'BW' }, { full: 'Niedersachsen', abbr: 'NI' },
    { full: 'Hessen', abbr: 'HE' }, { full: 'Sachsen', abbr: 'SN' },
    { full: 'Berlin', abbr: 'BE' }, { full: 'Hamburg', abbr: 'HH' },
  ],
  CA: [
    { full: 'Ontario', abbr: 'ON' }, { full: 'Quebec', abbr: 'QC' },
    { full: 'British Columbia', abbr: 'BC' }, { full: 'Alberta', abbr: 'AB' },
    { full: 'Manitoba', abbr: 'MB' }, { full: 'Saskatchewan', abbr: 'SK' },
    { full: 'Nova Scotia', abbr: 'NS' }, { full: 'New Brunswick', abbr: 'NB' },
  ],
  AU: [
    { full: 'New South Wales', abbr: 'NSW' }, { full: 'Victoria', abbr: 'VIC' },
    { full: 'Queensland', abbr: 'QLD' }, { full: 'Western Australia', abbr: 'WA' },
    { full: 'South Australia', abbr: 'SA' }, { full: 'Tasmania', abbr: 'TAS' },
  ],
  BR: [
    { full: 'São Paulo', abbr: 'SP' }, { full: 'Rio de Janeiro', abbr: 'RJ' },
    { full: 'Minas Gerais', abbr: 'MG' }, { full: 'Bahia', abbr: 'BA' },
    { full: 'Paraná', abbr: 'PR' }, { full: 'Rio Grande do Sul', abbr: 'RS' },
  ],
  JP: [
    { full: 'Tokyo', abbr: '東京' }, { full: 'Osaka', abbr: '大阪' },
    { full: 'Kanagawa', abbr: '神奈川' }, { full: 'Aichi', abbr: '愛知' },
    { full: 'Hokkaido', abbr: '北海道' }, { full: 'Fukuoka', abbr: '福岡' },
  ],
};

/**
 * Generate a phone number with a REAL area code for the given country.
 */
export function generatePhone(countryCode: string, formatOverride?: string): string {
  const phoneData = PHONE_FORMATS[countryCode] || PHONE_FORMATS['US'];
  const format = formatOverride || phoneData.format;
  const areaCode = phoneData.areaCodes[Math.floor(Math.random() * phoneData.areaCodes.length)];

  // Replace first N hashes with area code digits, rest random
  let result = '';
  let areaIdx = 0;
  let hashCount = 0;

  for (const ch of format) {
    if (ch === '#') {
      if (areaIdx < areaCode.length) {
        result += areaCode[areaIdx];
        areaIdx++;
      } else {
        result += String(Math.floor(Math.random() * 10));
      }
      hashCount++;
    } else {
      result += ch;
    }
  }

  return result;
}

/**
 * Generate a postal code matching the country's real format.
 */
export function generatePostalCode(countryCode: string, formatOverride?: string): string {
  const postalData = POSTAL_FORMATS[countryCode];

  // If user provided a format, use that
  if (formatOverride && formatOverride.trim()) {
    return replacePattern(formatOverride);
  }

  // If we have examples, 30% chance to use a real one
  if (postalData && postalData.examples.length > 0 && postalData.examples[0] && Math.random() > 0.7) {
    return postalData.examples[Math.floor(Math.random() * postalData.examples.length)];
  }

  // Generate from pattern
  if (postalData && postalData.pattern) {
    return replacePattern(postalData.pattern);
  }

  // Fallback
  return String(Math.floor(Math.random() * 90000) + 10000);
}

function replacePattern(pattern: string): string {
  let result = '';
  for (const ch of pattern) {
    if (ch === '#') result += String(Math.floor(Math.random() * 10));
    else if (ch === 'A') result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    else result += ch;
  }
  return result;
}

/**
 * Get a culturally appropriate email domain for the country.
 */
export function getLocalEmailDomain(countryCode: string): string {
  const domains = LOCAL_EMAIL_DOMAINS[countryCode] || LOCAL_EMAIL_DOMAINS['US'];
  return domains[Math.floor(Math.random() * domains.length)];
}

/**
 * Get a state/region for the given country.
 */
export function getState(countryCode: string, format: 'full' | 'abbreviation'): string {
  const states = STATES[countryCode] || STATES['US'];
  const state = states[Math.floor(Math.random() * states.length)];
  return format === 'abbreviation' ? state.abbr : state.full;
}
