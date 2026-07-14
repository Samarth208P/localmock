export function serializeTSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines: string[] = [headers.join('\t')];
  for (const row of rows) {
    const values = headers.map((h) => {
      let val = String(row[h] ?? '');
      // replace tabs and newlines with spaces to avoid breaking tsv structure
      val = val.replace(/\t/g, ' ').replace(/\n/g, ' ');
      return val;
    });
    lines.push(values.join('\t'));
  }
  return lines.join('\n');
}
