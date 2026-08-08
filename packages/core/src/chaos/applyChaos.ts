import type { ChaosConfig } from './types';

const UNICODE_CHARS = ['é', 'ñ', 'ü', 'ö', 'ß', '中', '日', '🔥', '💀', '⚡', '🤖', '∞', '≠', '→'];
const WHITESPACE_CHARS = [' ', '\t', '\n', '  ', '\u00A0', '\u200B'];

/**
 * Applies chaos corruption to a single value based on the config.
 * Returns the original value if chaos doesn't trigger.
 */
export function applyChaos(value: unknown, config: ChaosConfig, random: () => number = Math.random): unknown {
  const pickIndex = (length: number) => Math.floor(random() * length);

  // Skip if chaos is disabled or rate is 0
  if (config.rate <= 0) return value;

  // Roll the dice: does this value get corrupted?
  if (random() * 100 >= config.rate) return value;

  // Pick a random enabled corruption type
  const enabledTypes = Object.entries(config.types)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);

  if (enabledTypes.length === 0) return value;

  const chosenType = enabledTypes[pickIndex(enabledTypes.length)];

  switch (chosenType) {
    case 'nullInjection':
      return null;

    case 'whitespace':
      if (typeof value === 'string') {
        const ws = WHITESPACE_CHARS[pickIndex(WHITESPACE_CHARS.length)];
        const position = random() > 0.5 ? 'leading' : 'trailing';
        return position === 'leading' ? ws + value : value + ws;
      }
      return value;

    case 'encoding':
      if (typeof value === 'string') {
        const insertPos = pickIndex(value.length + 1);
        const char = UNICODE_CHARS[pickIndex(UNICODE_CHARS.length)];
        return value.slice(0, insertPos) + char + value.slice(insertPos);
      }
      return value;

    case 'casing':
      if (typeof value === 'string') {
        return random() > 0.5 ? value.toUpperCase() : value.toLowerCase();
      }
      return value;

    case 'formatStrip':
      if (typeof value === 'string') {
        // Strip dashes, dots, or spaces randomly
        const chars = ['-', '.', ' ', '_'];
        const target = chars[pickIndex(chars.length)];
        return value.replaceAll(target, '');
      }
      return value;

    default:
      return value;
  }
}
