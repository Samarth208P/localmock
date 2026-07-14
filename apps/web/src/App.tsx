import { useCallback, useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

import { SchemaEditor } from '@/components/editor/SchemaEditor';
import { ColumnList } from '@/components/builder/ColumnList';
import { PreviewTabs } from '@/components/preview/PreviewTabs';
import { ExportPanel } from '@/components/export/ExportPanel';
import { ChaosPreviewCard } from '@/components/configure/ChaosPreviewCard';
import { TableSelectorTabs } from '@/components/export/TableSelectorTabs';
import { ToastContainer } from '@/components/shared/Toast';
import { useSchemaStore } from '@/store/schemaStore';
import { useAppStore } from '@/store/appStore';
import { useMultiTableStore } from '@/store/multiTableStore';
import { useWorkerPool, type MultiTableGenDef } from '@/hooks/useWorkerPool';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { sortTablesTopologically, type DependencyEdge } from '@/lib/topologicalSort';
import { decodeSchemaFromUrl, encodeSchemaToUrl, clearSchemaFromUrl } from '@/lib/shareableUrl';
import type { FieldRow } from '@/components/editor/FieldBuilder';
import type { FieldDef } from '@/workers/generation.worker';

function App() {
  const { parsedSchema, parseError } = useSchemaStore();

  const { step, setStep, goBack, direction } = useAppStore();
  const multiTable = useMultiTableStore();
  const {
    generate,
    generateMultiTable,
    rows,
    multiTableRows,
    activeViewTable,
    setActiveViewTable,
    isGenerating,
    progress,
    error,
  } = useWorkerPool();
  const [rowCount, setRowCount] = useState(1000);
  const fieldsRef = useRef<FieldRow[]>([]);
  const lastFieldDefsRef = useRef<FieldDef[]>([]);
  const [urlFields, setUrlFields] = useState<FieldRow[] | undefined>(undefined);
  const [hasManualFields, setHasManualFields] = useState(false);

  // Hydrate schema from URL on initial load
  useEffect(() => {
    const fields = decodeSchemaFromUrl();
    if (fields && fields.length > 0) {
      setUrlFields(fields);
      fieldsRef.current = fields;
      setHasManualFields(fields.some((f) => f.name.trim().length > 0));
    }
  }, []);

  const hasSchema = (parsedSchema && parsedSchema.tables.length > 0) || multiTable.tables.length > 0 || hasManualFields;
  const tableName = activeViewTable || parsedSchema?.tables[0]?.name || multiTable.tables[0]?.name || 'data';

  // Get the rows for the currently active view table
  const viewRows = activeViewTable && multiTableRows[activeViewTable]
    ? multiTableRows[activeViewTable]
    : rows;
  const tableNames = Object.keys(multiTableRows);
  const isMultiTable = tableNames.length > 1;

  const handleFieldsChange = useCallback((fields: FieldRow[]) => {
    fieldsRef.current = fields;
    setHasManualFields(fields.some((f) => f.name.trim().length > 0));
  }, []);

  const handleGenerate = useCallback(() => {
    // Try manual builder fields first
    let fieldDefs: FieldDef[] = [];

    if (fieldsRef.current.length > 0 && fieldsRef.current.some((f) => f.name.trim())) {
      fieldDefs = fieldsRef.current
        .filter((f) => f.name.trim())
        .map((f) => ({
          name: f.name,
          typeId: f.typeId,
          options: f.options,
          unique: f.unique,
        }));
    } else if (multiTable.tables.length > 0) {
      // Multi-table mode: use active table or first table with fields
      const table = multiTable.tables.find((t) => t.id === multiTable.activeTableId)
        || multiTable.tables[0];
      if (table && table.fields.length > 0) {
        fieldDefs = table.fields
          .filter((f) => f.name.trim())
          .map((f) => ({
            name: f.name,
            typeId: f.typeId,
            options: f.options,
            unique: f.unique,
          }));
      }
    } else if (parsedSchema && parsedSchema.tables.length > 0) {
      // Check if we have multiple tables with relations → use multi-table generation
      const hasRelations = parsedSchema.tables.some(t => t.relations && t.relations.length > 0);

      if (parsedSchema.tables.length > 1 && hasRelations) {
        // Multi-table relational generation
        const tableNames = parsedSchema.tables.map(t => t.name);

        // Build dependency edges for topological sort
        const depEdges: DependencyEdge[] = [];
        for (const table of parsedSchema.tables) {
          if (table.relations) {
            for (const rel of table.relations) {
              depEdges.push({ from: table.name, to: rel.toTable });
            }
          }
        }

        const sortedNames = sortTablesTopologically(tableNames, depEdges);

        const multiTableDefs: MultiTableGenDef[] = sortedNames.map(name => {
          const t = parsedSchema.tables.find(pt => pt.name === name)!;
          return {
            tableName: name,
            fields: t.columns.map(col => ({
              name: col.name,
              typeId: col.type,
              options: {},
              unique: col.isUnique,
            })),
            rowCount,
            relations: (t.relations || []).map(r => ({
              fromField: r.fromField,
              toTable: r.toTable,
              toField: r.toField,
            })),
          };
        });

        // Don't encode multi-table schemas to URL — they're too large.
        // The raw SQL in schemaStore is the source of truth.
        clearSchemaFromUrl();
        lastFieldDefsRef.current = multiTableDefs[0].fields;

        generateMultiTable(multiTableDefs);
        setStep('preview');
        return;
      }

      // Single table from paste mode
      const table = parsedSchema.tables[0];
      fieldDefs = table.columns.map((col) => ({
        name: col.name,
        typeId: col.type,
        options: {},
        unique: col.isUnique,
      }));
    }

    if (fieldDefs.length === 0) return;

    const historyFields: FieldRow[] = fieldDefs.map((f, i) => ({
      id: `hist-${i}`,
      name: f.name,
      typeId: f.typeId,
      options: f.options,
      unique: f.unique,
    }));

    // Encode schema into shareable URL
    encodeSchemaToUrl(historyFields);

    lastFieldDefsRef.current = fieldDefs;
    generate(fieldDefs, rowCount);
    setStep('preview');
  }, [parsedSchema, generate, generateMultiTable, setStep, rowCount]);

  const handleProceedToConfigure = useCallback(() => {
    if (hasSchema) setStep('configure');
  }, [hasSchema, setStep]);

  // Cmd/Ctrl+Enter advances to the next step from wherever the user currently is
  useKeyboardShortcuts(
    useCallback(
      (action) => {
        if (action !== 'generate') return;
        if (step === 'input') handleProceedToConfigure();
        else if (step === 'configure') handleGenerate();
      },
      [step, handleProceedToConfigure, handleGenerate],
    ),
  );

  const stepTransitionClass = direction === 'backward' ? 'step-slide-backward' : 'step-slide-forward';

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Navbar />
      <ToastContainer />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Step 1: Schema Input */}
        {step === 'input' && (
          <div key="input" className={`${stepTransitionClass} flex flex-1 flex-col overflow-y-auto px-6 py-8 lg:py-12`}>
            <div className="w-full max-w-6xl mx-auto">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-2">
                    Define your data
                  </h1>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                    Paste a schema from any language, or build fields manually with 80+ data types.
                  </p>
                </div>

              </div>

              <div className="mt-8">
                <SchemaEditor 
                  onFieldsChange={handleFieldsChange} 
                  initialFields={fieldsRef.current.length > 0 ? fieldsRef.current : urlFields} 
                  onGenerate={handleProceedToConfigure}
                  hasSchema={hasSchema}
                />
              </div>

              {parseError && (
                <div className="animate-scale-in mt-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {parseError}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Step 2: Configure Row Count + Chaos + Generate */}
        {step === 'configure' && (
          <div key="configure" className={`${stepTransitionClass} flex flex-1 flex-col items-center overflow-y-auto px-6 py-10`}>
            <div className="w-full max-w-5xl">
              <button
                onClick={goBack}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-1"
              >
                <span className="text-base leading-none">←</span>
                <span>Back to Schema</span>
              </button>

              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                Configure & Generate
              </h1>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Review your columns, set row count and chaos level, then generate.
              </p>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left: column review */}
                <div className="lg:col-span-2">
                  {parsedSchema && parsedSchema.tables.some((t) => t.columns.length > 0) ? (
                    <ColumnList />
                  ) : (
                    <div className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-8 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
                          <path d="M3 10h18M3 14h18M3 6h18M3 18h18" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-text-secondary">No columns detected</p>
                      <p className="text-xs mt-1.5 text-text-muted">Manual builder fields will still be used when you generate.</p>
                      <button
                        onClick={goBack}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-accent hover:border-accent/40 transition-all duration-200"
                      >
                        ← Back to schema
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: generation settings */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Row count */}
                  <div className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
                    <label className="text-sm font-medium text-text-primary">
                      Number of rows
                    </label>
                    <input
                      type="number"
                      value={rowCount}
                      onChange={(e) => setRowCount(Math.max(1, Math.min(1000000, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={1000000}
                      className="mt-3 w-full rounded-lg border border-border-subtle bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary font-mono focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-200"
                      placeholder="1000"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[100, 1000, 5000, 10000, 50000, 100000].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRowCount(n)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                            rowCount === n
                              ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                              : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {n.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chaos Engine */}
                  <ChaosPreviewCard />

                  {/* Generate */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full rounded-xl bg-accent py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {isGenerating
                      ? 'Generating...'
                      : `Generate ${rowCount.toLocaleString()} Rows →`}
                  </button>
                  <p className="text-center text-[11px] text-text-muted">
                    Tip: press <kbd className="rounded border border-border-subtle bg-bg-tertiary px-1 py-0.5 font-mono">Ctrl/⌘+Enter</kbd> to generate
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview + Export */}
        {step === 'preview' && (
          <div key="preview" className={`${stepTransitionClass} flex flex-1 overflow-hidden flex-col lg:flex-row`}>
            {/* Left sidebar: scrollable export panel */}
            <aside className="w-full lg:w-[300px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border-subtle overflow-y-auto p-5 max-h-[40vh] lg:max-h-none">
              <button
                onClick={goBack}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-1"
              >
                <span className="text-base leading-none">←</span>
                <span>Back</span>
              </button>

              {/* Multi-table selector */}
              {isMultiTable && (
                <div className="mb-5">
                  <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                    Viewing Table
                  </label>
                  <TableSelectorTabs
                    tableNames={tableNames}
                    activeTable={activeViewTable ?? tableNames[0]}
                    rowCounts={Object.fromEntries(tableNames.map((n) => [n, multiTableRows[n]?.length ?? 0]))}
                    onSelect={setActiveViewTable}
                  />
                </div>
              )}

              <ExportPanel rows={viewRows} tableName={tableName} fieldDefs={lastFieldDefsRef.current} totalRowCount={rowCount} />

              <button
                onClick={() => setStep('configure')}
                className="mt-5 w-full rounded-lg border border-border-subtle py-2.5 text-xs font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
              >
                ← Edit & Regenerate
              </button>
            </aside>

            {/* Right side: ERD / Data preview */}
            <section className="flex flex-1 flex-col overflow-hidden relative min-h-[50vh] lg:min-h-0">
              {isGenerating && viewRows.length === 0 ? (
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="skeleton-block h-8 w-48 rounded-lg" />
                  <div className="skeleton-block h-full w-full rounded-xl" />
                </div>
              ) : (
                <PreviewTabs rows={viewRows} isGenerating={isGenerating} progress={progress} error={error} />
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
