import type { DAGNode, GenerationOrder } from './types';

/**
 * Kahn's algorithm for topological sort.
 * Returns tables ordered so that parent tables are generated before children.
 * Detects cycles and returns hasCycle: true if found.
 */
export function topologicalSort(nodes: DAGNode[]): GenerationOrder {
  // Build adjacency and in-degree
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    if (!inDegree.has(node.tableName)) inDegree.set(node.tableName, 0);
    if (!adjacency.has(node.tableName)) adjacency.set(node.tableName, []);

    for (const dep of node.dependsOn) {
      if (!adjacency.has(dep)) adjacency.set(dep, []);
      adjacency.get(dep)!.push(node.tableName);
      inDegree.set(node.tableName, (inDegree.get(node.tableName) || 0) + 1);

      // Ensure parent exists in inDegree
      if (!inDegree.has(dep)) inDegree.set(dep, 0);
    }
  }

  // Queue starts with nodes that have no dependencies (leaf nodes)
  const queue: string[] = [];
  for (const [name, degree] of inDegree) {
    if (degree === 0) queue.push(name);
  }

  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    for (const neighbor of adjacency.get(current) || []) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // If not all nodes are in order, there's a cycle
  const hasCycle = order.length !== inDegree.size;

  return { order, hasCycle };
}
