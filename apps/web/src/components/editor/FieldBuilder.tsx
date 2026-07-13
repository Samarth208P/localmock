import { useState, useCallback, useEffect } from 'react';
import { DATA_TYPE_CATEGORIES, ALL_DATA_TYPES, findDataType, type DataTypeOption } from '@/lib/dataTypes';
import { useSchemaStore } from '@/store/schemaStore';
import { CATEGORY_ICONS } from '@/components/shared/Icons';

export interface FieldRow {
  id: string;
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
}

interface FieldBuilderProps {
  onFieldsChange?: (fields: FieldRow[]) => void;
  initialFields?: FieldRow[];
}

export function FieldBuilder({ onFieldsChange, initialFields }: FieldBuilderProps) {
  const { setParsedSchema } = useSchemaStore();
  const [fields, setFields] = useState<FieldRow[]>(initialFields && initialFields.length > 0 ? initialFields : [
    { id: crypto.randomUUID(), name: 'id', typeId: 'uuid', options: {}, unique: true },
    { id: crypto.randomUUID(), name: 'name', typeId: 'fullName', options: {}, unique: false },
    { id: crypto.randomUUID(), name: 'email', typeId: 'email', options: {}, unique: true },
  ]);
  const [search, setSearch] = useState('');
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Sync initial fields to parent on mount so "Next" button appears immediately
  // if default fields are present.
  useEffect(() => {
    if (fields.length > 0) {
      onFieldsChange?.(fields);
    }
  }, []);

  const updateAndCommit = useCallback((newFields: FieldRow[]) => {
    setFields(newFields);
    onFieldsChange?.(newFields);

    // Commit valid fields to schema store
    const validFields = newFields.filter((f) => f.name.trim());
    if (validFields.length > 0) {
      setParsedSchema({
        raw: '',
        format: 'manual',
        tables: [{
          name: 'data',
          columns: validFields.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.typeId,
            fakerMethod: f.typeId,
            confidence: 'high' as const,
            isUnique: f.unique,
            isSequential: f.typeId === 'autoIncrement',
          })),
        }],
      });
    }
  }, [setParsedSchema, onFieldsChange]);

  const addField = () => {
    const newFields = [...fields, {
      id: crypto.randomUUID(),
      name: '',
      typeId: 'sentence',
      options: {},
      unique: false,
    }];
    updateAndCommit(newFields);
  };

  const removeField = (id: string) => {
    updateAndCommit(fields.filter((f) => f.id !== id));
  };

  const updateFieldName = (id: string, name: string) => {
    updateAndCommit(fields.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const updateFieldType = (id: string, type: DataTypeOption) => {
    // Reset options to defaults when type changes
    const defaults: Record<string, unknown> = {};
    for (const opt of type.options) {
      defaults[opt.key] = opt.default;
    }
    updateAndCommit(fields.map((f) => (f.id === id ? { ...f, typeId: type.id, options: defaults } : f)));
    setOpenPickerIdx(null);
    setSearch('');
  };

  const updateFieldOption = (id: string, key: string, value: unknown) => {
    updateAndCommit(fields.map((f) =>
      f.id === id ? { ...f, options: { ...f.options, [key]: value } } : f,
    ));
  };

  const toggleUnique = (id: string) => {
    updateAndCommit(fields.map((f) => (f.id === id ? { ...f, unique: !f.unique } : f)));
  };

  // Filter types by search
  const filteredTypes = search.trim()
    ? ALL_DATA_TYPES.filter((t) =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  return (
    <div className="space-y-3">
      {/* Field rows */}
      {fields.map((field, idx) => {
        const typeDef = findDataType(field.typeId);
        const isExpanded = expandedIdx === idx;
        const hasOptions = typeDef && typeDef.options.length > 0;

        return (
          <div
            key={field.id}
            className={`animate-in rounded-xl border transition-all duration-200 ${
              isExpanded ? 'border-accent/30 bg-accent/[0.02]' : 'border-border-subtle bg-bg-secondary'
            }`}
          >
            {/* Main row */}
            <div className="flex items-center gap-2 p-3">
              {/* Field name */}
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateFieldName(field.id, e.target.value)}
                placeholder="field_name"
                className="h-8 w-[140px] rounded-lg border border-border-subtle bg-bg-tertiary px-2.5 font-mono text-xs text-text-primary placeholder:text-text-muted/40 focus:border-accent focus:outline-none transition-all duration-200"
              />

              {/* Type selector */}
              <button
                onClick={() => {
                  setOpenPickerIdx(openPickerIdx === idx ? null : idx);
                  setExpandedIdx(null);
                }}
                className={`h-8 flex-1 flex items-center gap-2 rounded-lg border px-2.5 text-left text-xs transition-all duration-200 ${
                  openPickerIdx === idx
                    ? 'border-accent bg-accent/[0.04]'
                    : 'border-border-subtle bg-bg-tertiary hover:border-border-active'
                }`}
              >
                <span className="text-text-primary font-medium truncate">
                  {typeDef?.label || 'Select type'}
                </span>
                <span className="ml-auto text-text-muted text-[10px]">▾</span>
              </button>

              {/* Unique toggle */}
              <button
                onClick={() => toggleUnique(field.id)}
                title={field.unique ? 'Unique: ON' : 'Unique: OFF'}
                className={`h-8 px-2 rounded-lg border text-[10px] font-medium transition-all duration-200 ${
                  field.unique
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border-subtle bg-bg-tertiary text-text-muted hover:text-text-secondary'
                }`}
              >
                U
              </button>

              {/* Settings toggle (if type has options) */}
              {hasOptions && (
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  title="Configure options"
                  className={`h-8 w-10 flex items-center justify-center rounded-lg border text-sm transition-all duration-200 ${
                    isExpanded
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-border-subtle bg-bg-tertiary text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  ⚙
                </button>
              )}

              {/* Remove */}
              <button
                onClick={() => removeField(field.id)}
                className="h-8 w-10 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 text-base font-bold"
                aria-label="Remove field"
              >
                ×
              </button>
            </div>

            {/* Expanded options panel */}
            {isExpanded && typeDef && typeDef.options.length > 0 && openPickerIdx !== idx && (
              <div className="animate-scale-in border-t border-border-subtle/50 px-3 pb-3 pt-2.5">
                <div className="grid grid-cols-2 gap-2">
                  {typeDef.options.map((opt) => (
                    <div key={opt.key} className={opt.type === 'text' ? 'col-span-2' : ''}>
                      <label className="text-[10px] text-text-muted mb-1 block">{opt.label}</label>

                      {opt.type === 'select' && (
                        <select
                          value={String(field.options[opt.key] ?? opt.default)}
                          onChange={(e) => updateFieldOption(field.id, opt.key, e.target.value)}
                          className="w-full h-7 rounded-md border border-border-subtle bg-bg-tertiary px-2 text-[11px] text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                        >
                          {opt.choices?.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}

                      {opt.type === 'number' && (
                        <input
                          type="number"
                          value={Number(field.options[opt.key] ?? opt.default)}
                          onChange={(e) => updateFieldOption(field.id, opt.key, parseInt(e.target.value) || 0)}
                          min={opt.min}
                          max={opt.max}
                          className="w-full h-7 rounded-md border border-border-subtle bg-bg-tertiary px-2 text-[11px] font-mono text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                        />
                      )}

                      {opt.type === 'text' && (
                        <input
                          type="text"
                          value={String(field.options[opt.key] ?? opt.default)}
                          onChange={(e) => updateFieldOption(field.id, opt.key, e.target.value)}
                          placeholder={opt.placeholder}
                          className="w-full h-7 rounded-md border border-border-subtle bg-bg-tertiary px-2 text-[11px] text-text-primary placeholder:text-text-muted/40 focus:border-accent focus:outline-none transition-all duration-200"
                        />
                      )}

                      {opt.type === 'boolean' && (
                        <button
                          onClick={() => updateFieldOption(field.id, opt.key, !field.options[opt.key])}
                          className={`h-7 w-full rounded-md border text-[11px] font-medium transition-all duration-200 ${
                            field.options[opt.key]
                              ? 'border-accent/40 bg-accent/10 text-accent'
                              : 'border-border-subtle bg-bg-tertiary text-text-muted'
                          }`}
                        >
                          {field.options[opt.key] ? 'Yes' : 'No'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Type picker inline panel */}
            {openPickerIdx === idx && (
              <div className="animate-scale-in border-t border-border-subtle/50 p-3 space-y-3 relative bg-bg-secondary/30">
                <div className="flex items-center justify-between gap-3">
                  {/* Search */}
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search 80+ types..."
                    className="flex-1 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none transition-all duration-200"
                    autoFocus
                  />
                  
                  {/* Close */}
                  <button
                    onClick={() => { setOpenPickerIdx(null); setSearch(''); }}
                    className="flex-shrink-0 rounded-md bg-error/10 px-3 py-2 text-[11px] font-semibold text-error hover:bg-error/20 transition-all duration-200"
                  >
                    Close
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto space-y-2" style={{ scrollbarWidth: 'none' }}>
                  {filteredTypes ? (
                    // Filtered search results
                    <>
                      {filteredTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFieldType(field.id, type)}
                          className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-bg-tertiary transition-colors"
                        >
                          <span className="text-text-primary font-medium">{type.label}</span>
                          <span className="ml-auto text-[10px] text-text-muted">{type.category}</span>
                        </button>
                      ))}
                      {filteredTypes.length === 0 && (
                        <p className="text-xs text-text-muted text-center py-4">No types match "{search}"</p>
                      )}
                    </>
                  ) : (
                    // Category grid
                    DATA_TYPE_CATEGORIES.map((cat) => (
                      <div key={cat.id}>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5 sticky top-0 bg-bg-secondary py-1">
                          {CATEGORY_ICONS[cat.id] && (() => { const Icon = CATEGORY_ICONS[cat.id]; return <Icon size={12} className="opacity-60" />; })()}
                          <span>{cat.label}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-0.5">
                          {cat.types.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => updateFieldType(field.id, type)}
                              className="rounded-md px-2 py-1.5 text-left text-[11px] text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors truncate"
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add field button */}
      <button
        onClick={addField}
        className="w-full rounded-xl border border-dashed border-border-subtle py-3 text-xs font-medium text-text-muted hover:text-accent hover:border-accent/40 transition-all duration-200"
      >
        + Add Field
      </button>
    </div>
  );
}
