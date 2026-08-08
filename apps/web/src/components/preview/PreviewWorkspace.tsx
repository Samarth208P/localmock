import { useState } from 'react';
import { PreviewCanvas } from './PreviewCanvas';
import { TablePreviewView } from './TablePreviewView';
import type { PreviewRowsByTable, PreviewSchemaModel } from './types';

interface PreviewWorkspaceProps {
  schema: PreviewSchemaModel;
  rowsByTable: PreviewRowsByTable;
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export function PreviewWorkspace({ schema, rowsByTable, isGenerating, progress, error }: PreviewWorkspaceProps) {
  const [view, setView] = useState<'table' | 'map'>('table');

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-bg-primary">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-bg-secondary/70 px-4 py-3 backdrop-blur sm:px-6">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">Preview &amp; Export</h1>
          <p className="mt-0.5 text-[11px] text-text-muted">
            {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'} · first 5 generated rows per table
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border-subtle bg-bg-primary p-1" role="tablist" aria-label="Preview view">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'table'}
            onClick={() => setView('table')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'table' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            Table View
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'map'}
            onClick={() => setView('map')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${view === 'map' ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            Map View
          </button>
        </div>
      </header>

      {isGenerating && (
        <div className="h-1 w-full bg-bg-tertiary" aria-label={`Generating ${progress}%`}>
          <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-xl border border-error/20 bg-error/5 px-5 py-4 text-center text-sm text-error">
            <p className="font-medium">Generation failed</p>
            <p className="mt-1 text-xs opacity-80">{error}</p>
          </div>
        </div>
      ) : view === 'table' ? (
        <TablePreviewView schema={schema} rowsByTable={rowsByTable} isGenerating={isGenerating} />
      ) : (
        <PreviewCanvas schema={schema} />
      )}
    </section>
  );
}
