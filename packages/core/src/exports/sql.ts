export type SqlDialect = 'postgres' | 'mysql' | 'sqlite';

/**
 * Serializes rows as SQL INSERT statements.
 * Wraps in transactions every 1000 rows.
 */
export function serializeSQL(
  rows: Record<string, unknown>[],
  tableName: string,
  dialect: SqlDialect = 'postgres',
): string {
  if (rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map((c) => quoteIdentifier(c, dialect));
  const header = `INSERT INTO ${quoteIdentifier(tableName, dialect)} (${quotedColumns.join(', ')}) VALUES`;

  const lines: string[] = [];
  lines.push('BEGIN;');
  lines.push('');

  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && i % 1000 === 0) {
      lines.push('COMMIT;');
      lines.push('BEGIN;');
      lines.push('');
    }

    const values = columns.map((col) => formatValue(rows[i][col], dialect));
    lines.push(`${header}\n  (${values.join(', ')});`);
  }

  lines.push('');
  lines.push('COMMIT;');

  return lines.join('\n');
}

function quoteIdentifier(name: string, dialect: SqlDialect): string {
  switch (dialect) {
    case 'mysql':
      return `\`${name}\``;
    case 'postgres':
    case 'sqlite':
    default:
      return `"${name}"`;
  }
}

function formatValue(value: unknown, _dialect: SqlDialect): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  // String: escape single quotes
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
}
