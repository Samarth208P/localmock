import { useState, useCallback, useEffect } from 'react';
import { findDataType, type DataTypeOption } from '@/lib/dataTypes';
import { useSchemaStore } from '@/store/schemaStore';
import { TypePickerModal } from '@/components/shared/TypePickerModal';
import { SettingsModal } from '@/components/shared/SettingsModal';
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

export interface FieldRow {
  id: string;
  name: string;
  typeId: string;
  options: Record<string, unknown>;
  unique: boolean;
  isPrimaryKey?: boolean;
  hasForeignKey?: boolean;
  nullPercentage?: number;
}

interface FieldBuilderProps {
  onFieldsChange?: (fields: FieldRow[]) => void;
  onFkToggle?: (fieldId: string) => void;
  initialFields?: FieldRow[];
}

export function FieldBuilder({ onFieldsChange, onFkToggle, initialFields }: FieldBuilderProps) {
  const { setParsedSchema } = useSchemaStore();
  const [fields, setFields] = useState<FieldRow[]>(initialFields && initialFields.length > 0 ? initialFields : [
    { id: crypto.randomUUID(), name: 'id', typeId: 'uuid', options: {}, unique: true },
    { id: crypto.randomUUID(), name: 'name', typeId: 'fullName', options: {}, unique: false },
    { id: crypto.randomUUID(), name: 'email', typeId: 'email', options: {}, unique: true },
  ]);
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

  // Disable background scrolling when any modal is open
  useEffect(() => {
    if (openPickerIdx !== null || isSaveModalOpen || editModalIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openPickerIdx, isSaveModalOpen, editModalIdx]);

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
            isPrimaryKey: f.isPrimaryKey,
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
  };

  const updateFieldOption = (id: string, key: string, value: unknown) => {
    updateAndCommit(fields.map((f) =>
      f.id === id ? { ...f, options: { ...f.options, [key]: value } } : f,
    ));
  };

  const toggleUnique = (id: string) => {
    updateAndCommit(fields.map((f) => {
      if (f.id === id) {
        const newUnique = !f.unique;
        // If turning OFF unique, it can no longer be a Primary Key
        if (!newUnique && f.isPrimaryKey) {
          showToast('Primary Keys must be unique. Primary Key removed.', 'error');
          return { ...f, unique: newUnique, isPrimaryKey: false };
        }
        return { ...f, unique: newUnique };
      }
      return f;
    }));
  };

  const togglePrimaryKey = (id: string) => {
    let oldPkRemoved = false;
    let newPkAdded = false;

    const newFields = fields.map((f) => {
      if (f.id === id) {
        const newPk = !f.isPrimaryKey;
        if (newPk) newPkAdded = true;
        // If turning ON PK, it MUST be unique
        return { ...f, isPrimaryKey: newPk, unique: newPk ? true : f.unique };
      }
      // Only one PK allowed per table!
      if (newPkAdded && f.isPrimaryKey) {
        oldPkRemoved = true;
      }
      return { ...f, isPrimaryKey: false };
    });

    if (oldPkRemoved) {
      showToast('Only one Primary Key allowed per table. Previous PK removed.', 'success');
    } else if (newPkAdded) {
      showToast('Primary Key set (Unique constraint automatically applied).', 'success');
    }

    updateAndCommit(newFields);
  };



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

              {/* Keys/Constraints Toggle Group */}
              <div className="flex items-center gap-1 bg-bg-secondary rounded-lg border border-border-subtle p-0.5">
                <button
                  onClick={() => togglePrimaryKey(field.id)}
                  title={field.isPrimaryKey ? 'Primary Key: ON' : 'Primary Key: OFF'}
                  className={`h-7 px-2 rounded-md text-[10px] font-bold transition-all duration-200 ${
                    field.isPrimaryKey
                      ? 'bg-amber-500/20 text-amber-500 shadow-sm shadow-amber-500/10'
                      : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  PK
                </button>
                <div className="w-px h-4 bg-border-subtle/50" />
                <button
                  onClick={() => toggleUnique(field.id)}
                  title={field.unique ? 'Unique: ON' : 'Unique: OFF'}
                  className={`h-7 px-2 rounded-md text-[10px] font-bold transition-all duration-200 ${
                    field.unique
                      ? 'bg-accent/20 text-accent shadow-sm shadow-accent/10'
                      : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  UQ
                </button>
                {onFkToggle && (
                  <>
                    <div className="w-px h-4 bg-border-subtle/50" />
                    <button
                      onClick={() => onFkToggle(field.id)}
                      title={field.hasForeignKey ? 'Foreign Key: Linked' : 'Foreign Key: Unlinked'}
                      className={`h-7 px-2 rounded-md text-[10px] font-bold transition-all duration-200 ${
                        field.hasForeignKey
                          ? 'bg-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/10'
                          : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
                      }`}
                    >
                      FK
                    </button>
                  </>
                )}
              </div>

              {/* Settings toggle (always show since we have general settings) */}
              <button
                onClick={() => setEditModalIdx(idx)}
                title="Edit field settings"
                className={`h-8 w-10 flex items-center justify-center rounded-lg border text-sm transition-all duration-200 border-border-subtle bg-bg-tertiary text-text-muted hover:text-text-secondary hover:bg-bg-secondary`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>

              {/* Remove */}
              <button
                onClick={() => removeField(field.id)}
                className="h-8 w-10 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200 text-base font-bold"
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
          className="flex-1 rounded-xl border border-dashed border-border-subtle py-3 text-xs font-medium text-text-muted hover:text-accent hover:border-accent/40 transition-all duration-200"
        >
          + Add Field
        </button>
        <button
          onClick={() => {
            setTemplateName('My Custom Template');
            setIsSaveModalOpen(true);
          }}
          className="flex-1 rounded-xl border border-border-subtle py-3 text-xs font-medium text-text-muted hover:text-accent hover:border-accent/40 transition-all duration-200"
        >
          Save as Template
        </button>
      </div>

      {/* Type Picker Modal */}
      {openPickerIdx !== null && fields[openPickerIdx] && (
        <TypePickerModal
          fieldName={fields[openPickerIdx].name}
          onSelect={(type) => updateFieldType(fields[openPickerIdx].id, type)}
          onClose={() => { setOpenPickerIdx(null); }}
        />
      )}

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 className="text-lg font-semibold text-text-primary">Save Template</h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Template Name</label>
                <input
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
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
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
                    }
                  }}
                  disabled={!templateName.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {editModalIdx !== null && fields[editModalIdx] && (
        <SettingsModal
          fieldName={fields[editModalIdx].name}
          typeId={fields[editModalIdx].typeId}
          options={fields[editModalIdx].options}
          nullPercentage={fields[editModalIdx].nullPercentage || 0}
          onUpdateOption={(key, value) => updateFieldOption(fields[editModalIdx].id, key, value)}
          onUpdateNullPercentage={(percentage) => {
            updateAndCommit(fields.map(f => f.id === fields[editModalIdx].id ? { ...f, nullPercentage: percentage } : f));
          }}
          onClose={() => setEditModalIdx(null)}
        />
      )}
    </div>
  );
}
