export function serializeInfluxDB(rows: Record<string, unknown>[], tableName: string = 'measurement'): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  let output = '';
  // Influx format: measurement,tag1=val1 field1=val1 timestamp
  // We'll treat all string columns as tags and numbers as fields for a simple representation,
  // or just treat all as fields since we don't know the schema.
  for (const row of rows) {
    const fields = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return `${h}=""`;
      if (typeof val === 'number') return `${h}=${val}`;
      if (typeof val === 'boolean') return `${h}=${val}`;
      return `${h}="${String(val).replace(/"/g, '\\"')}"`;
    }).join(',');
    // Mock timestamp
    const timestamp = Date.now() * 1000000;
    output += `${tableName} ${fields} ${timestamp}\n`;
  }
  return output;
}
