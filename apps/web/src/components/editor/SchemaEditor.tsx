import { useState, useCallback } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { parseSchema } from '@localmock/core';
import { TemplateGallery } from './TemplateGallery';
import { FieldBuilder, type FieldRow } from './FieldBuilder';
import { MultiTableBuilder } from '@/components/builder/MultiTableBuilder';
import { IconClipboard, IconFileText, IconWrench } from '@/components/shared/Icons';

type InputMode = 'paste' | 'build' | 'multi-table' | 'template';

interface SchemaEditorProps {
  onFieldsChange?: (fields: FieldRow[]) => void;
  initialFields?: FieldRow[];
  onGenerate?: () => void;
  hasSchema?: boolean;
}

export function SchemaEditor({ onFieldsChange, initialFields, onGenerate, hasSchema }: SchemaEditorProps) {
  const { rawInput, setRawInput, setParsedSchema, setParseError, parsedSchema } = useSchemaStore();
  const [mode, setMode] = useState<InputMode>(
    initialFields && initialFields.length > 0 ? 'build' : rawInput || parsedSchema ? 'paste' : 'build'
  );
  const [isFocused, setIsFocused] = useState(false);
  const [restoredFields, setRestoredFields] = useState<FieldRow[] | undefined>(initialFields);
  const [resetKey, setResetKey] = useState(0);

  const handleResetBuilder = useCallback(() => {
    setRestoredFields(undefined);
    if (onFieldsChange) onFieldsChange([]);
    setResetKey(k => k + 1);
  }, [onFieldsChange]);

  const handleParse = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setParseError(null);
        return;
      }

      const result = parseSchema(input);

      if (result.errors.length > 0) {
        setParseError(result.errors[0]);
      } else if (result.tables.length > 0) {
        setParsedSchema({
          raw: input,
          format: result.format,
          tables: result.tables.map((t) => ({
            name: t.name,
            columns: t.fields.map((f) => ({
              id: `${t.name}-${f.name}-${Math.random().toString(36).slice(2, 8)}`,
              name: f.name,
              type: f.inferredType,
              fakerMethod: f.fakerMethod,
              confidence: f.confidence,
              isUnique: false,
              isSequential: false,
            })),
          })),
        });
      }
    },
    [setParsedSchema, setParseError],
  );

  const handleChange = useCallback(
    (value: string) => {
      setRawInput(value);
      handleParse(value);
    },
    [setRawInput, handleParse],
  );

  const handleTemplateLoad = useCallback(
    (fields: FieldRow[]) => {
      setRestoredFields(fields);
      setMode('build');
      if (onFieldsChange) onFieldsChange(fields);
    },
    [onFieldsChange],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-200">
      {/* Main Workspace */}
      <div className="lg:col-span-8 xl:col-span-9 flex flex-col space-y-4">
        {mode === 'build' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Manual Builder</h2>
              <button
                onClick={handleResetBuilder}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-error/30 hover:text-error hover:bg-error/5 transition-all duration-200"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
                Reset Fields
              </button>
            </div>
            <FieldBuilder key={`builder-${resetKey}`} onFieldsChange={onFieldsChange} initialFields={restoredFields} />
          </div>
        )}

        {mode === 'template' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Template Gallery</h2>
            </div>
            <div className="mt-2">
              <TemplateGallery onSelect={handleTemplateLoad} />
            </div>
          </div>
        )}

        {mode === 'multi-table' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Multi-Table Setup</h2>
            </div>
            <MultiTableBuilder />
          </div>
        )}

        {mode === 'paste' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-text-primary">Paste Schema</h2>
              {rawInput && (
                <button
                  onClick={() => {
                    setRawInput('');
                    useSchemaStore.getState().reset();
                  }}
                  className="text-xs text-text-muted hover:text-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative">
              <div
                className={`
                  relative overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-300 ease-out
                  ${isFocused
                    ? 'border-accent/60 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]'
                    : 'border-border-subtle hover:border-border-active'
                  }
                  bg-bg-secondary
                `}
              >
                <textarea
                  value={rawInput}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={`// Paste any schema here...\n\ninterface User {\n  id: string;\n  email: string;\n  name: string;\n  role: 'admin' | 'member' | 'viewer';\n  isVerified: boolean;\n  createdAt: string;\n}`}
                  className="
                    block w-full resize-none bg-transparent p-5 font-mono text-[13px] leading-relaxed
                    text-text-primary placeholder:text-text-muted/50
                    focus:outline-none
                    min-h-[400px]
                  "
                  style={{ overflow: 'hidden', overflowY: 'auto', scrollbarWidth: 'none' }}
                  spellCheck={false}
                  aria-label="Schema input editor"
                />
              </div>

              {rawInput && (
                <div className="absolute left-4 bottom-3 pointer-events-none">
                  <span className="inline-flex items-center rounded-md bg-bg-tertiary/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    {useSchemaStore.getState().parsedSchema?.format || 'detecting...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-8 border-t lg:border-t-0 lg:border-l border-border-subtle pt-8 lg:pt-0 lg:pl-8">
        <div>
          <h3 className="mb-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Input Methods
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('build')}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                mode === 'build'
                  ? 'border-accent bg-accent/5 text-accent shadow-sm'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/40 hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode === 'build' ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-muted group-hover:bg-accent/10 group-hover:text-accent'} transition-colors`}>
                <IconWrench size={16} />
              </div>
              <span className="text-sm font-medium">Builder</span>
            </button>

            <button
              onClick={() => setMode('paste')}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                mode === 'paste'
                  ? 'border-accent bg-accent/5 text-accent shadow-sm'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/40 hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode === 'paste' ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-muted group-hover:bg-accent/10 group-hover:text-accent'} transition-colors`}>
                <IconClipboard size={16} />
              </div>
              <span className="text-sm font-medium">Paste Schema</span>
            </button>

            <button
              onClick={() => setMode('multi-table')}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                mode === 'multi-table'
                  ? 'border-accent bg-accent/5 text-accent shadow-sm'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/40 hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode === 'multi-table' ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-muted group-hover:bg-accent/10 group-hover:text-accent'} transition-colors`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="10" y1="6.5" x2="14" y2="6.5" /><line x1="6.5" y1="10" x2="6.5" y2="14" />
                </svg>
              </div>
              <span className="text-sm font-medium">Multi-Table Setup</span>
            </button>

            <button
              onClick={() => setMode('template')}
              className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                mode === 'template'
                  ? 'border-accent bg-accent/5 text-accent shadow-sm'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/40 hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${mode === 'template' ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-muted group-hover:bg-accent/10 group-hover:text-accent'} transition-colors`}>
                <IconFileText size={16} />
              </div>
              <span className="text-sm font-medium">Templates</span>
            </button>
          </div>
          
          {hasSchema && onGenerate && (
            <div className="mt-12">
              <button
                onClick={onGenerate}
                className="group animate-in fade-in slide-in-from-bottom-2 w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="whitespace-nowrap">Configure</span>
                <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
