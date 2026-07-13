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
  urlFields?: FieldRow[];
}

export function SchemaEditor({ onFieldsChange, urlFields }: SchemaEditorProps) {
  const { rawInput, setRawInput, setParsedSchema, setParseError, parsedSchema } = useSchemaStore();
  const [mode, setMode] = useState<InputMode>(
    urlFields && urlFields.length > 0 ? 'build' : rawInput || parsedSchema ? 'paste' : 'choose'
  );
  const [isFocused, setIsFocused] = useState(false);
  const [restoredFields, setRestoredFields] = useState<FieldRow[] | undefined>(urlFields);

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
      <div className="space-y-6">
        {/* Two mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setMode('paste')}
            className="group rounded-xl border border-border-subtle bg-bg-secondary p-5 text-left transition-all duration-300 ease-out hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
          >
            <div className="mb-3 text-text-muted group-hover:text-accent transition-colors">
              <IconClipboard size={24} />
            </div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              Paste Schema
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              TypeScript, Prisma, JSON, Go, Python, Rust, SQL — we detect it all.
            </p>
          </button>

          <button
            onClick={() => setMode('build')}
            className="group rounded-xl border border-border-subtle bg-bg-secondary p-5 text-left transition-all duration-300 ease-out hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
          >
            <div className="mb-3 text-text-muted group-hover:text-accent transition-colors">
              <IconWrench size={24} />
            </div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              Build Manually
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              Add fields one by one. Pick from 80+ data types across 12 categories.
            </p>
          </button>

          <button
            onClick={() => setMode('multi-table')}
            className="group rounded-xl border border-border-subtle bg-bg-secondary p-5 text-left transition-all duration-300 ease-out hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
          >
            <div className="mb-3 text-text-muted group-hover:text-accent transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="10" y1="6.5" x2="14" y2="6.5" /><line x1="6.5" y1="10" x2="6.5" y2="14" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              Multi-Table
            </p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              Define related tables with foreign keys. Generates in dependency order.
            </p>
          </button>
        </div>

        {/* Templates */}
        <div>
          <p className="mb-3 text-xs font-medium text-text-muted uppercase tracking-wider">
            Start from a template
          </p>
          <TemplateGallery onSelect={handleTemplateLoad} />
        </div>

        {/* Schema history */}
        <div>
          <HistoryPanel onRestore={handleRestoreFromHistory} />
        </div>
      </div>
    );
  }

  // Mode: Build manually
  if (mode === 'build') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back
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
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back
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
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          ← Back
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
