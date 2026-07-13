/**
 * Serializes rows to CSV format (RFC 4180 compliant).
 */
export function serializeCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const lines: string[] = [headers.map(escapeCSV).join(',')];

  for (const row of rows) {
    const values = headers.map((h) => escapeCSV(String(row[h] ?? '')));
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
