import { useCallback, useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StepIndicator } from '@/components/layout/StepIndicator';
import { SchemaEditor } from '@/components/editor/SchemaEditor';
import { ColumnList } from '@/components/builder/ColumnList';
import { PreviewTable } from '@/components/preview/PreviewTable';
import { ExportPanel } from '@/components/export/ExportPanel';
import { ToastContainer } from '@/components/shared/Toast';
import { useSchemaStore } from '@/store/schemaStore';
import { useChaosStore } from '@/store/chaosStore';
import { useAppStore } from '@/store/appStore';
import { useMultiTableStore } from '@/store/multiTableStore';
import { useWorker } from '@/hooks/useWorker';
import { saveToHistory } from '@/lib/schemaHistory';
import { decodeSchemaFromUrl, encodeSchemaToUrl } from '@/lib/shareableUrl';
import type { FieldRow } from '@/components/editor/FieldBuilder';
import type { FieldDef } from '@/workers/generation.worker';

function App() {
  const { parsedSchema, parseError } = useSchemaStore();
  const chaosStore = useChaosStore();
  const { step, setStep, goBack } = useAppStore();
  const multiTable = useMultiTableStore();
  const { generate, rows, isGenerating, progress, error } = useWorker();
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
  const tableName = parsedSchema?.tables[0]?.name || multiTable.tables[0]?.name || 'data';

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
      // Fallback: use parsed schema columns (from paste mode)
      const table = parsedSchema.tables[0];
      fieldDefs = table.columns.map((col) => ({
        name: col.name,
        typeId: col.type,
        options: {},
        unique: col.isUnique,
      }));
    }

    if (fieldDefs.length === 0) return;

    // Save to IndexedDB history
    const historyFields: FieldRow[] = fieldDefs.map((f, i) => ({
      id: `hist-${i}`,
      name: f.name,
      typeId: f.typeId,
      options: f.options,
      unique: f.unique,
    }));
    saveToHistory(historyFields, tableName);

    // Encode schema into shareable URL
    encodeSchemaToUrl(historyFields);

    lastFieldDefsRef.current = fieldDefs;
    generate(fieldDefs, rowCount);
    setStep('preview');
  }, [parsedSchema, generate, setStep, rowCount]);

  const handleProceedToConfigure = useCallback(() => {
    if (hasSchema) setStep('configure');
  }, [hasSchema, setStep]);

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Navbar />
      <StepIndicator />
      <ToastContainer />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Step 1: Schema Input */}
        {step === 'input' && (
          <div className="animate-in flex flex-1 flex-col overflow-y-auto px-6 py-8 lg:py-12">
            <div className="w-full max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-2">
                  Define your data
                </h1>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                  Paste a schema from any language, or build fields manually with 80+ data types.
                </p>
              </div>

              <div className="mt-8">
                <SchemaEditor onFieldsChange={handleFieldsChange} initialFields={fieldsRef.current.length > 0 ? fieldsRef.current : urlFields} />
              </div>

              {parseError && (
                <div className="animate-scale-in mt-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {parseError}
                </div>
              )}

              {hasSchema && (
                <div className="sticky bottom-6 mt-8 flex justify-center sm:justify-end pb-4">
                  <button
                    onClick={handleProceedToConfigure}
                    className="animate-slide-up flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent-hover hover:-translate-y-0.5 active:scale-95"
                  >
                    Configure & Generate
                    <span className="text-lg leading-none">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Configure Row Count + Chaos + Generate */}
        {step === 'configure' && (
          <div className="animate-in flex flex-1 flex-col items-center overflow-y-auto px-6 py-10">
            <div className="w-full max-w-2xl">
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

              {/* Column summary from parsed schema (paste mode) */}
              <div className="mt-8">
                <ColumnList />
              </div>

              {/* Row count + Chaos side by side */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Chaos slider */}
                <div className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">Chaos Engine</span>
                    <span className="rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-mono text-text-muted">
                      {chaosStore.globalRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={chaosStore.globalRate}
                    onChange={(e) => chaosStore.setGlobalRate(parseInt(e.target.value))}
                    className="mt-3 w-full accent-accent h-1.5 cursor-pointer"
                    aria-label="Chaos corruption rate"
                  />
                  <p className="mt-2 text-xs text-text-muted leading-relaxed">
                    Corrupts a percentage of values with nulls, broken encoding, trailing whitespace, and mixed casing.
                  </p>
                </div>
              </div>

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-8 w-full rounded-xl bg-accent py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {isGenerating
                  ? 'Generating...'
                  : `Generate ${rowCount.toLocaleString()} Rows →`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview + Export */}
        {step === 'preview' && (
          <div className="animate-in flex flex-1 overflow-hidden">
            <aside className="w-[300px] flex-shrink-0 border-r border-border-subtle overflow-y-auto p-5">
              <button
                onClick={goBack}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 hover:-translate-x-1"
              >
                <span className="text-base leading-none">←</span>
                <span>Back</span>
              </button>

              <ExportPanel rows={rows} tableName={tableName} fieldDefs={lastFieldDefsRef.current} totalRowCount={rowCount} />

              <button
                onClick={() => setStep('configure')}
                className="mt-5 w-full rounded-lg border border-border-subtle py-2.5 text-xs font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200"
              >
                ← Edit & Regenerate
              </button>
            </aside>

            <section className="flex flex-1 flex-col p-5">
              <PreviewTable
                rows={rows}
                isGenerating={isGenerating}
                progress={progress}
                error={error}
              />
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
