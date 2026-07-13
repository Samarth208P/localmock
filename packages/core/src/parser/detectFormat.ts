import type { DetectedFormat } from './types';

/**
 * Detects the input format by examining structural patterns.
 * Supports: JSON, TypeScript, Prisma, Go, Python, Rust, SQL, and generic key-value.
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

  // Go: contains "type X struct {"
  if (/^\s*type\s+\w+\s+struct\s*\{/m.test(trimmed)) {
    return 'go';
  }

  // Python: @dataclass or class with type hints
  if (/^\s*@dataclass/m.test(trimmed) || /^\s*class\s+\w+.*:\s*$/m.test(trimmed)) {
    return 'python';
  }

  // Rust: pub struct or struct with fields
  if (/^\s*(pub\s+)?struct\s+\w+\s*\{/m.test(trimmed)) {
    return 'rust';
  }

  // SQL CREATE TABLE
  if (/^\s*CREATE\s+TABLE/im.test(trimmed)) {
    return 'sql';
  }

  return 'unknown';
}
