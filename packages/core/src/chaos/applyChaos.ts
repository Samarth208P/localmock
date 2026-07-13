import type { ChaosConfig } from './types';

const UNICODE_CHARS = ['é', 'ñ', 'ü', 'ö', 'ß', '中', '日', '🔥', '💀', '⚡', '🤖', '∞', '≠', '→'];
const WHITESPACE_CHARS = [' ', '\t', '\n', '  ', '\u00A0', '\u200B'];

/**
 * Applies chaos corruption to a single value based on the config.
 * Returns the original value if chaos doesn't trigger.
 */
export function applyChaos(value: unknown, config: ChaosConfig): unknown {
  // Skip if chaos is disabled or rate is 0
  if (config.rate <= 0) return value;

  // Roll the dice: does this value get corrupted?
  if (Math.random() * 100 > config.rate) return value;

  // Pick a random enabled corruption type
  const enabledTypes = Object.entries(config.types)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);

  if (enabledTypes.length === 0) return value;

  const chosenType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

  switch (chosenType) {
    case 'nullInjection':
      return null;

    case 'whitespace':
      if (typeof value === 'string') {
        const ws = WHITESPACE_CHARS[Math.floor(Math.random() * WHITESPACE_CHARS.length)];
        const position = Math.random() > 0.5 ? 'leading' : 'trailing';
        return position === 'leading' ? ws + value : value + ws;
      }
      return value;

    case 'encoding':
      if (typeof value === 'string') {
        const insertPos = Math.floor(Math.random() * value.length);
        const char = UNICODE_CHARS[Math.floor(Math.random() * UNICODE_CHARS.length)];
        return value.slice(0, insertPos) + char + value.slice(insertPos);
      }
      return value;

    case 'casing':
      if (typeof value === 'string') {
        return Math.random() > 0.5 ? value.toUpperCase() : value.toLowerCase();
      }
      return value;

    case 'formatStrip':
      if (typeof value === 'string') {
        // Strip dashes, dots, or spaces randomly
        const chars = ['-', '.', ' ', '_'];
        const target = chars[Math.floor(Math.random() * chars.length)];
        return value.replaceAll(target, '');
      }
      return value;

    default:
      return value;
  }
}
