export function serializeFirebase(rows: Record<string, unknown>[], tableName: string = 'mock_data'): string {
  if (rows.length === 0) return '{}';
  const data: Record<string, any> = {};
  for (const row of rows) {
    // Generate a simple push-like ID
    const id = 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    data[row.id ? String(row.id) : id] = row;
  }
  return JSON.stringify({ [tableName]: data }, null, 2);
}
