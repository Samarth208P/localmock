import type { ParsedTable } from '../parser/types';
import { topologicalSort } from './topologicalSort';
import { createRowContext } from '../generators/engine';
import type { DAGNode } from './types';
import type { RowContext } from '../generators/engine';

/**
 * Generates data for multiple related tables in dependency order.
 * Parent tables are generated first; child tables sample FK values from parent ID pools.
 */
export function generateRelational(
  tables: ParsedTable[],
  rowCounts: Record<string, number>,
  generateRow: (table: ParsedTable, ctx: RowContext, idPools: Record<string, string[]>) => Record<string, unknown>,
): Record<string, Record<string, unknown>[]> {
  // Build DAG nodes from table relations
  const dagNodes: DAGNode[] = tables.map((table) => ({
    tableName: table.name,
    dependsOn: table.relations.map((r) => r.toTable),
  }));

  const { order, hasCycle } = topologicalSort(dagNodes);

  if (hasCycle) {
    throw new Error('Circular dependency detected between tables. Cannot generate relational data.');
  }

  // ID pools: store generated primary keys per table
  const idPools: Record<string, string[]> = {};
  const results: Record<string, Record<string, unknown>[]> = {};

  for (const tableName of order) {
    const table = tables.find((t) => t.name === tableName);
    if (!table) continue;

    const rowCount = rowCounts[tableName] || 1000;
    const rows: Record<string, unknown>[] = [];

    for (let i = 0; i < rowCount; i++) {
      const ctx = createRowContext();
      const row = generateRow(table, ctx, idPools);
      rows.push(row);

      // Extract ID for pool (first field that looks like an ID)
      const idField = table.fields.find(
        (f) => f.name === 'id' || f.inferredType === 'uuid',
      );
      if (idField && row[idField.name]) {
        if (!idPools[tableName]) idPools[tableName] = [];
        idPools[tableName].push(String(row[idField.name]));
      }
    }

    results[tableName] = rows;
  }

  return results;
}
