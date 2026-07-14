/// <reference types="vite/client" />

/**
 * All 30 schema templates bundled for the app.
 * Each template has: name, description, fields[].
 */

export interface TemplateField {
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
}

export interface SchemaTemplate {
  name: string;
  description: string;
  fields: TemplateField[];
}

// Import all template JSON files using Vite's glob import
const modules = import.meta.glob<{ default: SchemaTemplate }>('./*.json', { eager: true });

export const TEMPLATES: SchemaTemplate[] = Object.values(modules)
  .map((mod) => mod.default)
  .sort((a, b) => a.name.localeCompare(b.name));
