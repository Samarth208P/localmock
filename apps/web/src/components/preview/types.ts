export interface PreviewColumn {
  name: string;
  typeId: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface PreviewTableSchema {
  id: string;
  name: string;
  columns: PreviewColumn[];
  configuredRowCount: number;
}

export interface PreviewRelationship {
  id: string;
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
}

export interface PreviewSchemaModel {
  tables: PreviewTableSchema[];
  relationships: PreviewRelationship[];
}

export type PreviewRowsByTable = Record<string, Record<string, unknown>[]>;
