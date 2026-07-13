/**
 * Serializes rows as a JSON array.
 */
export function serializeJSON(rows: Record<string, unknown>[]): string {
  return JSON.stringify(rows, null, 2);
}

/**
 * Serializes rows as JSON Lines (one JSON object per line).
 */
export function serializeJSONL(rows: Record<string, unknown>[]): string {
  return rows.map((row) => JSON.stringify(row)).join('\n');
}
