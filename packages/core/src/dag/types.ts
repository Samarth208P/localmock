export interface DAGNode {
  tableName: string;
  dependsOn: string[]; // table names this node depends on (parents)
}

export interface GenerationOrder {
  order: string[]; // table names in generation order (leaves first)
  hasCycle: boolean;
}
