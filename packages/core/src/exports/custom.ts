export function serializeCustom(rows: Record<string, unknown>[], template: string = '{{id}}'): string {
  if (rows.length === 0 || !template) return '';
  let output = '';
  for (const row of rows) {
    let replaced = template;
    for (const key of Object.keys(row)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      replaced = replaced.replace(regex, String(row[key] ?? ''));
    }
    output += replaced + '\n';
  }
  return output;
}
