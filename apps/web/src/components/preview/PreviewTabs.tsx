import { useMemo, useState } from 'react';
import { useMultiTableStore } from '@/store/multiTableStore';
import { useSchemaStore } from '@/store/schemaStore';
import { PreviewCanvas } from './PreviewCanvas';
import { PreviewTable } from './PreviewTable';

type PreviewTab = 'erd' | 'data';

interface PreviewTabsProps {
  rows: Record<string, unknown>[];
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

/**
 * Tab switcher for the right-side preview area.
 * Lets the user flip between the database diagram (table relationship canvas) and a flat data grid.
 */
export function PreviewTabs({ rows, isGenerating, progress, error }: PreviewTabsProps) {
  const { tables, foreignKeys } = useMultiTableStore();
  const { parsedSchema } = useSchemaStore();

  // Mirrors PreviewCanvas's own logic for "is there anything meaningful to draw?"
  const hasErdContent = useMemo(() => {
    if (tables.length > 0) return true;
    if (parsedSchema && parsedSchema.tables.length > 0) {
      if (parsedSchema.tables.length > 1) return true;
      return parsedSchema.tables.some((t) => t.relations && t.relations.length > 0);
    }
    return foreignKeys.length > 0;
  }, [tables, foreignKeys, parsedSchema]);

  const [tab, setTab] = useState<PreviewTab>(() => (hasErdContent ? 'erd' : 'data'));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Pill tab switcher */}
      <div className="flex-shrink-0 px-4 pt-4">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-secondary p-1">
          <button
            onClick={() => setTab('erd')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
              tab === 'erd'
                ? 'bg-accent/15 text-accent shadow-sm'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            Database Diagram
          </button>
          <button
            onClick={() => setTab('data')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
              tab === 'data'
                ? 'bg-accent/15 text-accent shadow-sm'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            Data Preview
          </button>
        </div>
      </div>

      {/* Active tab content — keyed so the entering panel fades in on every switch */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div key={tab} className="animate-fade h-full overflow-hidden">
          {tab === 'erd' ? (
            <PreviewCanvas />
          ) : (
            <div className="h-full overflow-hidden p-4">
              <PreviewTable rows={rows} isGenerating={isGenerating} progress={progress} error={error} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
