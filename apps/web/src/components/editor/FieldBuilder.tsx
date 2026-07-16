import { useState, useCallback, useEffect } from 'react';
import { DATA_TYPE_CATEGORIES, ALL_DATA_TYPES, findDataType, type DataTypeOption } from '@/lib/dataTypes';
import { useSchemaStore } from '@/store/schemaStore';
import { useChaosStore, type ColumnChaosConfig } from '@/store/chaosStore';
import { CATEGORY_ICONS } from '@/components/shared/Icons';
import { Select } from '@/components/shared/Select';
import { showToast } from '@/components/shared/Toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableFieldRow } from './SortableFieldRow';
import { saveToHistory } from '@/lib/schemaHistory';
import { Modal } from '@/components/shared/Modal';

export interface FieldRow {
  id: string;
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
  nullPercentage?: number;
}

interface FieldBuilderProps {
  onFieldsChange?: (fields: FieldRow[]) => void;
  initialFields?: FieldRow[];
}

const CHAOS_TYPE_LABELS: { key: keyof ColumnChaosConfig; label: string }[] = [
  { key: 'nullRate', label: 'Null injection' },
  { key: 'whitespace', label: 'Whitespace chaos' },
  { key: 'encoding', label: 'Encoding stress' },
  { key: 'casing', label: 'Mixed casing' },
  { key: 'formatStrip', label: 'Format stripping' },
];

export function FieldBuilder({ onFieldsChange, initialFields }: FieldBuilderProps) {
  const { setParsedSchema } = useSchemaStore();
  const { globalRate: chaosGlobalRate, columnOverrides, setColumnOverride } = useChaosStore();
  const [fields, setFields] = useState<FieldRow[]>(initialFields && initialFields.length > 0 ? initialFields : [
    { id: crypto.randomUUID(), name: 'id', typeId: 'uuid', options: {}, unique: true },
    { id: crypto.randomUUID(), name: 'name', typeId: 'fullName', options: {}, unique: false },
    { id: crypto.randomUUID(), name: 'email', typeId: 'email', options: {}, unique: true },
  ]);
  const [search, setSearch] = useState('');
  const [openPickerIdx, setOpenPickerIdx] = useState<number | null>(null);
  const [editModalIdx, setEditModalIdx] = useState<number | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('My Custom Template');

  // Sync initial fields to parent on mount so "Next" button appears immediately
  // if default fields are present.
  useEffect(() => {
    if (fields.length > 0) {
      onFieldsChange?.(fields);
    }
  }, []);

  // Listen for global keyboard shortcuts (Ctrl+N add field, Ctrl+S save template)
  useEffect(() => {
    const onAddField = () => addField();
    const onSaveTemplate = () => {
      setTemplateName('My Custom Template');
      setIsSaveModalOpen(true);
    };
    window.addEventListener('shortcut-add-field', onAddField);
    window.addEventListener('shortcut-save-template', onSaveTemplate);
    return () => {
      window.removeEventListener('shortcut-add-field', onAddField);
      window.removeEventListener('shortcut-save-template', onSaveTemplate);
    };
  }, [fields]);

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
            nullPercentage: f.nullPercentage || 0,
          })),
        }],
      });
    }
  }, [setParsedSchema, onFieldsChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        updateAndCommit(newItems);
        return newItems;
      });
    }
  };

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {/* Field rows */}
            {fields.map((field, idx) => {
              const typeDef = findDataType(field.typeId);

              return (
                <SortableFieldRow key={field.id} id={field.id} isExpanded={false} hideHandle={fields.length <= 1}>
                  {/* Main row */}
                  <div className="flex items-center gap-2 p-3 pl-2">
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
                }}
                className={`btn-press h-8 flex-1 flex items-center gap-2 rounded-lg border px-2.5 text-left text-xs transition-all duration-200 ${
                  openPickerIdx === idx
                    ? 'border-accent bg-accent/[0.04] shadow-sm shadow-accent/10'
                    : 'border-border-subtle bg-bg-tertiary hover:border-border-active'
                }`}
              >
                <span className="text-text-primary font-medium truncate">
                  {typeDef?.label || 'Select type'}
                </span>
                <span className={`ml-auto text-text-muted text-[10px] transition-transform duration-200 ${openPickerIdx === idx ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {/* Unique toggle */}
              <button
                onClick={() => toggleUnique(field.id)}
                title={field.unique ? 'Unique: ON' : 'Unique: OFF'}
                className={`btn-press h-8 px-2 rounded-lg border text-[10px] font-medium transition-all duration-200 ${
                  field.unique
                    ? 'border-accent/40 bg-accent/10 text-accent scale-105'
                    : 'border-border-subtle bg-bg-tertiary text-text-muted hover:text-text-secondary'
                }`}
              >
                U
              </button>

              {/* Settings toggle (always show since we have general settings) */}
              <button
                onClick={() => setEditModalIdx(idx)}
                title="Edit field settings"
                className="btn-press group h-8 w-10 flex items-center justify-center rounded-lg border text-sm transition-all duration-200 border-border-subtle bg-bg-tertiary text-text-muted hover:text-text-secondary hover:bg-bg-secondary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-12"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>

              {/* Remove */}
              <button
                onClick={() => removeField(field.id)}
                className="btn-press h-8 w-10 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 hover:rotate-90 transition-all duration-200 text-base font-bold"
                aria-label="Remove field"
              >
                ×
              </button>
            </div>
          </SortableFieldRow>
        );
      })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add field / Save template buttons */}
      <div className="flex gap-3">
        <button
          onClick={addField}
          className="btn-press group flex-1 rounded-xl border border-dashed border-border-subtle py-3 text-xs font-medium text-text-muted transition-all duration-200 hover:text-accent hover:border-accent/40 hover:bg-accent/[0.03]"
        >
          <span className="inline-block transition-transform duration-200 group-hover:rotate-90 mr-1">+</span>
          Add Field
        </button>
        <button
          onClick={() => {
            setTemplateName('My Custom Template');
            setIsSaveModalOpen(true);
          }}
          className="btn-press flex-1 rounded-xl border border-border-subtle py-3 text-xs font-medium text-text-muted transition-all duration-200 hover:text-accent hover:border-accent/40 hover:bg-accent/[0.03]"
        >
          Save as Template
        </button>
      </div>

      {/* Type Picker Modal */}
      <Modal
        isOpen={openPickerIdx !== null && !!fields[openPickerIdx ?? -1]}
        onClose={() => { setOpenPickerIdx(null); setSearch(''); }}
        maxWidth="max-w-2xl"
        title={<>Select Type for <span className="text-accent font-mono ml-1">{openPickerIdx !== null ? (fields[openPickerIdx]?.name || 'field') : 'field'}</span></>}
      >
        {openPickerIdx !== null && fields[openPickerIdx] && (
          <>
            <div className="p-4 border-b border-border-subtle bg-bg-tertiary/30">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 80+ types..."
                className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-200"
                autoFocus
              />
            </div>

            <div className="px-5 pb-5">
              {filteredTypes ? (
                // Filtered search results
                <div className="space-y-1 pt-4">
                  {filteredTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => updateFieldType(fields[openPickerIdx].id, type)}
                      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-bg-tertiary transition-colors group"
                    >
                      <span className="text-sm text-text-primary font-medium group-hover:text-accent transition-colors">{type.label}</span>
                      <span className="ml-auto text-xs text-text-muted">{type.category}</span>
                    </button>
                  ))}
                  {filteredTypes.length === 0 && (
                    <p className="text-sm text-text-muted text-center py-8">No types match "{search}"</p>
                  )}
                </div>
              ) : (
                // Category grid
                <div className="space-y-8">
                {DATA_TYPE_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 sticky top-0 bg-bg-secondary pt-5 pb-2 z-10 border-b border-border-subtle/50">
                      {CATEGORY_ICONS[cat.id] && (() => { const Icon = CATEGORY_ICONS[cat.id]; return <Icon size={14} className="opacity-60" />; })()}
                      <span>{cat.label}</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {cat.types.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateFieldType(fields[openPickerIdx].id, type)}
                          className="rounded-xl px-4 py-3 text-left text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all border border-transparent hover:border-border-subtle hover:shadow-sm"
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Save Template Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        maxWidth="max-w-sm"
        title="Save Template"
        footer={
          <div className="flex justify-end gap-3 p-4">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (templateName.trim()) {
                  saveToHistory(fields, templateName.trim());
                  window.dispatchEvent(new CustomEvent('template-saved'));
                  setIsSaveModalOpen(false);
                  showToast(`Saved "${templateName.trim()}" template`);
                }
              }}
              disabled={!templateName.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="template-name-input" className="block text-sm font-medium text-text-primary mb-1.5">Template Name</label>
            <input
              id="template-name-input"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-200"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && templateName.trim()) {
                  saveToHistory(fields, templateName.trim());
                  window.dispatchEvent(new CustomEvent('template-saved'));
                  setIsSaveModalOpen(false);
                  showToast(`Saved "${templateName.trim()}" template`);
                }
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Options Modal */}
      <Modal
        isOpen={editModalIdx !== null && !!fields[editModalIdx ?? -1]}
        onClose={() => setEditModalIdx(null)}
        maxWidth="max-w-lg"
        title={<>Edit <span className="text-accent font-mono mx-1">{editModalIdx !== null ? (fields[editModalIdx]?.name || 'field') : 'field'}</span> Options</>}
        footer={
          <div className="p-4 flex justify-end">
            <button
              onClick={() => setEditModalIdx(null)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
            >
              Done
            </button>
          </div>
        }
      >
        {editModalIdx !== null && fields[editModalIdx] && (
            <div className="p-5 space-y-5">
              {(() => {
                const field = fields[editModalIdx];
                const typeDef = findDataType(field.typeId);

                return (
                  <div className="space-y-6 pb-2">
                    {/* General Settings */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-text-primary">Null Percentage</label>
                            <span className="text-xs font-mono text-text-muted">{field.nullPercentage || 0}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={field.nullPercentage || 0}
                            onChange={(e) => {
                              updateAndCommit(fields.map(f => f.id === field.id ? { ...f, nullPercentage: parseInt(e.target.value) } : f));
                            }}
                            className="w-full accent-accent h-1.5 cursor-pointer"
                          />
                          <p className="mt-1.5 text-[11px] text-text-muted">Probability of this field being empty (null).</p>
                        </div>

                        <div className={chaosGlobalRate === 0 ? 'opacity-50' : ''}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-text-primary">Chaos overrides</label>
                            <span className="text-[10px] font-mono text-text-muted">
                              {chaosGlobalRate === 0 ? 'Chaos off' : `${chaosGlobalRate}% global rate`}
                            </span>
                          </div>
                          <p className="mb-3 text-[11px] text-text-muted">
                            Choose which corruption types this field is allowed to receive. Only active when the Chaos Engine rate is above 0%.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {CHAOS_TYPE_LABELS.map(({ key, label }) => {
                              const override = columnOverrides[field.id];
                              const isOn = override ? override[key] : true;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  disabled={chaosGlobalRate === 0}
                                  onClick={() => setColumnOverride(field.id, { [key]: !isOn })}
                                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-200 disabled:cursor-not-allowed ${
                                    isOn
                                      ? 'border-warning/40 bg-warning/10 text-warning'
                                      : 'border-border-subtle bg-bg-tertiary text-text-muted'
                                  }`}
                                >
                                  <span>{label}</span>
                                  <span
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${
                                      isOn ? 'bg-warning' : 'bg-border-subtle'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        isOn ? 'translate-x-3.5' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Type Specific Options */}
                    {typeDef && typeDef.options.length > 0 && (
                      <div className="pt-6 border-t border-border-subtle/50">
                        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">Type Options</h4>
                        <div className="space-y-3">
                          {typeDef.options.map((opt) => (
                            <div key={opt.key} className={opt.type === 'boolean' ? "flex items-center justify-between py-1" : "flex flex-col gap-2"}>
                              <label className="text-sm font-medium text-text-primary">{opt.label}</label>

                              {opt.type === 'select' && (
                                <Select
                                  value={String(field.options[opt.key] ?? opt.default)}
                                  onChange={(val) => updateFieldOption(field.id, opt.key, val)}
                                  options={opt.choices?.map(c => ({ value: c, label: c })) || []}
                                  className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                                />
                              )}

                              {opt.type === 'number' && (
                                <input
                                  type="number"
                                  value={Number(field.options[opt.key] ?? opt.default)}
                                  onChange={(e) => updateFieldOption(field.id, opt.key, parseInt(e.target.value) || 0)}
                                  min={opt.min}
                                  max={opt.max}
                                  className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm font-mono text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                                />
                              )}

                              {opt.type === 'text' && (
                                <input
                                  type="text"
                                  value={String(field.options[opt.key] ?? opt.default)}
                                  onChange={(e) => updateFieldOption(field.id, opt.key, e.target.value)}
                                  placeholder={opt.placeholder}
                                  className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-accent focus:outline-none transition-all duration-200"
                                />
                              )}

                              {opt.type === 'boolean' && (
                                <div>
                                  <button
                                    onClick={() => updateFieldOption(field.id, opt.key, !(field.options[opt.key] ?? opt.default))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                      (field.options[opt.key] ?? opt.default) ? 'bg-accent' : 'bg-bg-tertiary border border-border-subtle'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        (field.options[opt.key] ?? opt.default) ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
        )}
      </Modal>
    </div>
  );
}
