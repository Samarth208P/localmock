import type { DetectedFormat } from './types';

/**
 * Detects the input format by examining structural patterns.
 * Returns the most likely format for the parser pipeline.
 */
export function detectFormat(input: string): DetectedFormat {
  const trimmed = input.trim();

  // JSON: starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // May still be JSON-like but malformed, continue checking
    }
  }

  // Prisma: contains "model" keyword with block syntax
  if (/^\s*model\s+\w+\s*\{/m.test(trimmed)) {
    return 'prisma';
  }

  // TypeScript: contains "interface" or "type" keyword
  if (/^\s*(export\s+)?(interface|type)\s+\w+/m.test(trimmed)) {
    return 'typescript';
  }

  return 'unknown';
}
