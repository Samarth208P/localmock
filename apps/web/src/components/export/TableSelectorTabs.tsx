interface TableSelectorTabsProps {
  tableNames: string[];
  activeTable: string;
  rowCounts: Record<string, number>;
  onSelect: (name: string) => void;
}

/**
 * Horizontal pill tab group for switching between generated tables in
 * multi-table mode. Replaces the old vertical dropdown-like button list.
 */
export function TableSelectorTabs({ tableNames, activeTable, rowCounts, onSelect }: TableSelectorTabsProps) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Viewing Table
      </label>
      <div className="flex flex-wrap gap-1.5">
        {tableNames.map((name) => {
          const active = activeTable === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'border-accent/30 bg-accent/15 text-accent ring-1 ring-accent/30'
                  : 'border-border-subtle bg-bg-secondary text-text-secondary hover:border-accent/30 hover:text-text-primary'
              }`}
            >
              <span className="font-mono">{name}</span>
              <span className="ml-1.5 text-text-muted">({(rowCounts[name] || 0).toLocaleString()})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
