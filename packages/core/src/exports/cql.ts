export function serializeCassandraCQL(rows: Record<string, unknown>[], tableName: string = 'mock_data'): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const cols = headers.join(', ');
  let output = '';
  for (const row of rows) {
    const vals = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return 'null';
      if (typeof val === 'number' || typeof val === 'boolean') return String(val);
      // CQL strings use single quotes and escape single quotes by doubling them
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    output += `INSERT INTO ${tableName} (${cols}) VALUES (${vals.join(', ')});\n`;
  }
  return output;
}
