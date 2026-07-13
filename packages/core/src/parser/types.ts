export type DetectedFormat = 'json' | 'typescript' | 'prisma' | 'go' | 'python' | 'rust' | 'sql' | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldClassification {
  name: string;
  inferredType: string;
  fakerMethod: string;
  confidence: ConfidenceLevel;
  originalType?: string;
}

export interface RelationEdge {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  cardinality: '1:1' | '1:N';
}

export interface ParsedTable {
  name: string;
  fields: FieldClassification[];
  relations: RelationEdge[];
}

export interface ParseResult {
  format: DetectedFormat;
  tables: ParsedTable[];
  errors: string[];
}
