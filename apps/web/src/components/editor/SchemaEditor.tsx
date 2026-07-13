import { useState, useCallback } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { parseSchema } from '@localmock/core';
import { TemplateGallery } from './TemplateGallery';
import { FieldBuilder, type FieldRow } from './FieldBuilder';
import { HistoryPanel } from './HistoryPanel';
import { MultiTableBuilder } from '@/components/builder/MultiTableBuilder';
import { IconClipboard, IconWrench } from '@/components/shared/Icons';

type InputMode = 'choose' | 'paste' | 'build' | 'multi-table';

interface SchemaEditorProps {
  onFieldsChange?: (fields: FieldRow[]) => void;
  initialFields?: FieldRow[];
}

export function SchemaEditor({ onFieldsChange, initialFields }: SchemaEditorProps) {
  const { rawInput, setRawInput, setParsedSchema, setParseError, parsedSchema } = useSchemaStore();
  const [mode, setMode] = useState<InputMode>(
    initialFields && initialFields.length > 0 ? 'build' : rawInput || parsedSchema ? 'paste' : 'choose'
  );
  const [isFocused, setIsFocused] = useState(false);
  const [restoredFields, setRestoredFields] = useState<FieldRow[] | undefined>(initialFields);

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

  const handleReset = () => {
    setMode('choose');
    setRawInput('');
    useSchemaStore.getState().reset();
  };

  const handleRestoreFromHistory = useCallback(
    (fields: FieldRow[]) => {
      setRestoredFields(fields);
      setMode('build');
      if (onFieldsChange) onFieldsChange(fields);
    },
    [onFieldsChange],
  );

  const handleTemplateLoad = useCallback(
    (fields: FieldRow[]) => {
      setRestoredFields(fields);
      setMode('build');
      if (onFieldsChange) onFieldsChange(fields);
    },
    [onFieldsChange],
  );

  // Mode: Choose (initial)
  if (mode === 'choose') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 animate-in fade-in zoom-in-95 duration-200">
        {/* Left Column: Main Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode('paste')}
              className="group col-span-1 sm:col-span-2 rounded-2xl border border-accent/40 bg-bg-secondary p-5 sm:p-6 text-left transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-accent hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-8 opacity-5 group-hover:opacity-10 transition-opacity duration-300 text-accent">
                <IconClipboard size={140} />
              </div>
              <div className="relative z-10">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <IconClipboard size={20} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                  Paste your Schema
                </h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed max-w-xl">
                  The fastest way to start. Paste TypeScript, Prisma, JSON, Go, Python, Rust, or SQL. We auto-detect the format and instantly configure your generators.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode('build')}
              className="group rounded-2xl border border-border-subtle bg-bg-secondary p-5 text-left transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out hover:border-accent/40 hover:bg-bg-tertiary hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
            >
              <div className="mb-3 text-text-muted group-hover:text-accent transition-colors">
                <IconWrench size={22} />
              </div>
              <p className="text-base font-medium text-text-primary group-hover:text-accent transition-colors">
                Build Manually
              </p>
              <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                Construct fields one by one using our library of 80+ data types.
              </p>
            </button>

            <button
              onClick={() => setMode('multi-table')}
              className="group rounded-2xl border border-border-subtle bg-bg-secondary p-5 text-left transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out hover:border-accent/40 hover:bg-bg-tertiary hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
            >
              <div className="mb-3 text-text-muted group-hover:text-accent transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="10" y1="6.5" x2="14" y2="6.5" /><line x1="6.5" y1="10" x2="6.5" y2="14" />
                </svg>
              </div>
              <p className="text-base font-medium text-text-primary group-hover:text-accent transition-colors">
                Multi-Table Setup
              </p>
              <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
                Define relational data with foreign keys and dependencies.
              </p>
            </button>
          </div>
        </div>

        {/* Right Column: Templates & History */}
        <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-border-subtle pt-8 lg:pt-0 lg:pl-10">
          <div>
            <p className="mb-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Start from a template
            </p>
            <TemplateGallery onSelect={handleTemplateLoad} />
          </div>

          <div className="pt-4">
            <HistoryPanel onRestore={handleRestoreFromHistory} />
          </div>
        </div>
      </div>
    );
  }

  // Mode: Build manually
  if (mode === 'build') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode('choose')}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-0.5"
          >
            <span className="text-sm leading-none">←</span> Back to Options
          </button>
          <span className="text-xs text-text-muted">Manual Builder</span>
        </div>

        <FieldBuilder onFieldsChange={onFieldsChange} initialFields={restoredFields} />
      </div>
    );
  }

  // Mode: Multi-table relational
  if (mode === 'multi-table') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode('choose')}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-0.5"
          >
            <span className="text-sm leading-none">←</span> Back to Options
          </button>
          <span className="text-xs text-text-muted">Multi-Table Builder</span>
        </div>

        <MultiTableBuilder />
      </div>
    );
  }

  // Mode: Paste schema
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            // Only go back to menu without completely wiping store state so it survives
            setMode('choose');
          }}
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-0.5"
        >
          <span className="text-sm leading-none">←</span> Back to Options
        </button>
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

      {/* Editor area */}
      <div className="relative">
        <div
          className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 ease-out
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
              min-h-[320px]
            "
            style={{ overflow: 'hidden', overflowY: 'auto', scrollbarWidth: 'none' }}
            spellCheck={false}
            aria-label="Schema input editor"
          />
        </div>

        {/* Format badge */}
        {rawInput && (
          <div className="absolute left-4 bottom-3 pointer-events-none">
            <span className="inline-flex items-center rounded-md bg-bg-tertiary/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-text-muted">
              {useSchemaStore.getState().parsedSchema?.format || 'detecting...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
