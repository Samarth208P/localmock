import { useState, useCallback } from 'react';
import { useSchemaStore } from '@/store/schemaStore';
import { parseSchema } from '@localmock/core';
import { FieldBuilder, type FieldRow } from './FieldBuilder';
import { QuickStartCards } from './QuickStartCards';
import { SchemaSummaryPanel } from './SchemaSummaryPanel';
import { MultiTableBuilder } from '@/components/builder/MultiTableBuilder';
import { IconClipboard, IconWrench } from '@/components/shared/Icons';

type InputMode = 'paste' | 'build' | 'multi-table';

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
  // Incremented on each mode switch so the newly-active panel header remounts → plays animate-in
  const [modeGen, setModeGen] = useState<Record<InputMode, number>>({ build: 0, paste: 0, 'multi-table': 0 });
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
            relations: t.relations || [],
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

  const handleRestoreFromHistory = useCallback(
    (fields: FieldRow[]) => {
      setRestoredFields(fields);
      setMode('build');
      if (onFieldsChange) onFieldsChange(fields);
    },
    [onFieldsChange],
  );

  const tabs: { id: InputMode; label: string; icon: (props: { size?: number }) => JSX.Element }[] = [
    { id: 'build', label: 'Builder', icon: (p) => <IconWrench {...p} /> },
    { id: 'paste', label: 'Paste Schema', icon: (p) => <IconClipboard {...p} /> },
    {
      id: 'multi-table',
      label: 'Multi-Table Setup',
      icon: ({ size = 16 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="10" y1="6.5" x2="14" y2="6.5" /><line x1="6.5" y1="10" x2="6.5" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header: mode tab row — stays in the same position across all modes */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== mode) {
                  setMode(tab.id);
                  setModeGen((prev) => ({ ...prev, [tab.id]: prev[tab.id] + 1 }));
                }
              }}
              className={`group flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-border-active hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isActive ? 'bg-accent/10 text-accent' : 'bg-bg-tertiary text-text-muted group-hover:text-text-primary'} transition-colors`}>
                <Icon size={15} />
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main content: the only region that swaps per mode. All three modes stay
            mounted (toggled via `hidden`) so their local state is never reset when
            switching tabs — only the active one is visible. */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className={mode === 'build' ? 'flex flex-col' : 'hidden'}>
            <div key={modeGen.build} className="animate-rise mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Manual Builder</h2>
              <button
                onClick={handleResetBuilder}
                className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-error/40 hover:text-error transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
                Reset Fields
              </button>
            </div>
            <FieldBuilder key={`builder-${resetKey}`} onFieldsChange={onFieldsChange} initialFields={restoredFields} />
          </div>

          <div className={mode === 'multi-table' ? 'flex flex-col' : 'hidden'}>
            <div key={modeGen['multi-table']} className="animate-rise mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Multi-Table Setup</h2>
            </div>
            <MultiTableBuilder />
          </div>

          <div className={mode === 'paste' ? 'flex flex-col gap-4' : 'hidden'}>
            <div key={modeGen.paste} className="animate-rise flex items-center justify-between mb-2">
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

            {!rawInput && (
              <div className="mb-2">
                <p className="mb-3 text-xs font-medium text-text-muted">Quick start with a template:</p>
                <QuickStartCards onSelect={handleChange} />
              </div>
            )}

            <div className="relative">
              <div
                className={`
                  relative overflow-hidden rounded-lg border transition-colors
                  ${isFocused ? 'border-accent' : 'border-border-subtle hover:border-border-active'}
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
                  <span className="inline-flex items-center rounded-md bg-bg-tertiary px-2 py-0.5 text-[10px] font-medium text-text-muted">
                    {useSchemaStore.getState().parsedSchema?.format || 'detecting...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata/Properties + Actions: persistent right column. Always mounted,
            never conditionally rendered per mode, so it never unmounts/remounts. */}
        <div className="lg:col-span-4 flex flex-col">
          <SchemaSummaryPanel fields={restoredFields} onRestoreHistory={handleRestoreFromHistory} />

          {hasSchema && onGenerate && (
            <div className="mt-6">
              <button
                onClick={onGenerate}
                className="group w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                <span className="whitespace-nowrap">Configure</span>
                <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
