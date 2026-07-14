/**
 * Topologically sorts tables based on foreign key dependencies.
 * Parents (tables being referenced) are placed before children (tables that reference them).
 */
export interface DependencyEdge {
  from: string; // child (depends on parent)
  to: string;   // parent (is referenced by child)
}

export function sortTablesTopologically(
  tableIds: string[],
  dependencies: DependencyEdge[]
): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  // Map each table to its list of parents it depends on
  const adjList = new Map<string, string[]>();
  for (const id of tableIds) {
    adjList.set(id, []);
  }

  for (const edge of dependencies) {
    // Only include dependencies between tables that actually exist in tableIds
    if (adjList.has(edge.from) && adjList.has(edge.to)) {
      adjList.get(edge.from)!.push(edge.to);
    }
  }

  function visit(node: string) {
    if (visited.has(node)) return;
    if (visiting.has(node)) {
      // Cycle detected! Break it gracefully to avoid infinite loop
      return;
    }

    visiting.add(node);

    const parents = adjList.get(node) || [];
    for (const parent of parents) {
      visit(parent);
    }

    visiting.delete(node);
    visited.add(node);
    sorted.push(node);
  }

  for (const id of tableIds) {
    visit(id);
  }

  return sorted;
}
