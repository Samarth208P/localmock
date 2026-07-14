export function serializeXML(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '<?xml version="1.0" encoding="UTF-8"?>\n<dataset></dataset>';
  const headers = Object.keys(rows[0]);
  let output = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n';
  for (const row of rows) {
    output += '  <record>\n';
    for (const h of headers) {
      const val = row[h];
      const safeVal = String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeKey = h.replace(/[^a-zA-Z0-9_-]/g, '');
      if(safeKey) output += `    <${safeKey}>${safeVal}</${safeKey}>\n`;
    }
    output += '  </record>\n';
  }
  output += '</dataset>';
  return output;
}

export function serializeDBUnitXML(rows: Record<string, unknown>[], tableName: string = 'mock_data'): string {
  if (rows.length === 0) return '<?xml version="1.0" encoding="UTF-8"?>\n<dataset></dataset>';
  const headers = Object.keys(rows[0]);
  let output = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n';
  for (const row of rows) {
    let attrs = '';
    for (const h of headers) {
      const val = row[h];
      if (val !== null && val !== undefined) {
        const safeVal = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        attrs += ` ${h}="${safeVal}"`;
      }
    }
    output += `  <${tableName}${attrs} />\n`;
  }
  output += '</dataset>';
  return output;
}
