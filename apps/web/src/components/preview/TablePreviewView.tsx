import type { PreviewRowsByTable, PreviewSchemaModel } from './types';

interface TablePreviewViewProps {
  schema: PreviewSchemaModel;
  rowsByTable: PreviewRowsByTable;
  isGenerating: boolean;
}

function displayValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function TablePreviewView({ schema, rowsByTable, isGenerating }: TablePreviewViewProps) {
  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
        {schema.tables.map((table) => {
          const rows = rowsByTable[table.name] ?? [];
          const previewRows = rows.slice(0, 5);

          return (
            <article
              key={table.id}
              className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M3 10h18M9 10v10" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-mono text-sm font-semibold text-text-primary">{table.name}</h2>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {table.columns.length} columns · {rows.length.toLocaleString()} generated rows
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-border-subtle bg-bg-tertiary px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Showing {Math.min(5, rows.length)} of {rows.length.toLocaleString()}
                </span>
              </header>

              <div className="border-b border-border-subtle/70 bg-bg-primary/35 px-4 py-2.5">
                <div className="flex flex-wrap gap-2">
                  {table.columns.map((column) => (
                    <div
                      key={column.name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-secondary px-2 py-1 text-[11px]"
                    >
                      {column.isPrimaryKey && (
                        <span className="rounded bg-yellow-500/10 px-1 py-0.5 text-[9px] font-bold text-yellow-400">PK</span>
                      )}
                      {column.isForeignKey && (
                        <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[9px] font-bold text-blue-400">FK</span>
                      )}
                      <span className="font-medium text-text-secondary">{column.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">{column.typeId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left">
                  <thead>
                    <tr className="bg-bg-tertiary/45">
                      <th className="w-10 border-b border-border-subtle px-3 py-2 text-[10px] font-semibold text-text-muted">#</th>
                      {table.columns.map((column) => (
                        <th key={column.name} className="border-b border-border-subtle px-3 py-2 text-[10px] font-semibold text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            {column.name}
                            {column.isPrimaryKey && <span className="text-[8px] font-bold text-yellow-400">PK</span>}
                            {column.isForeignKey && <span className="text-[8px] font-bold text-blue-400">FK</span>}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border-subtle/40 last:border-0 hover:bg-bg-tertiary/35">
                        <td className="px-3 py-2 font-mono text-[10px] text-text-muted">{rowIndex + 1}</td>
                        {table.columns.map((column) => {
                          const value = displayValue(row[column.name]);
                          return (
                            <td key={column.name} className="max-w-[260px] px-3 py-2 font-mono text-[11px] text-text-primary">
                              <span className="block truncate" title={value}>{value}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewRows.length === 0 && (
                <div className="px-4 py-7 text-center text-xs text-text-muted">
                  {isGenerating ? 'Generating preview rows…' : 'This table has no generated rows.'}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
