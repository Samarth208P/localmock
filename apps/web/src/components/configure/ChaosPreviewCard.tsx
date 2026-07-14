import { useMemo, useState } from 'react';
import { useChaosStore, type ColumnChaosConfig } from '@/store/chaosStore';
import { useSchemaStore } from '@/store/schemaStore';
import { IconChevronDown } from '@/components/shared/Icons';

/**
 * Self-contained replacement for the old inline Chaos Engine slider block
 * in App.tsx. Renders no props — reads/writes chaosStore + schemaStore directly.
 */
export function ChaosPreviewCard() {
  const { globalRate, enabled, setGlobalRate, setEnabled, columnOverrides, setColumnOverride } =
    useChaosStore();
  const { parsedSchema } = useSchemaStore();
  const [expanded, setExpanded] = useState(false);

  const handleToggleEnabled = () => {
    if (enabled) {
      setEnabled(false);
    } else if (globalRate === 0) {
      setGlobalRate(10);
    } else {
      setEnabled(true);
    }
  };

  const previewCells = useMemo(() => buildPreviewCells(globalRate), [globalRate]);

  const allColumns = useMemo(
    () => parsedSchema?.tables.flatMap((t) => t.columns) ?? [],
    [parsedSchema],
  );

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
      {/* Header row: title + enable toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Chaos Engine</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggleEnabled}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
            enabled ? 'bg-accent' : 'bg-bg-tertiary border border-border-subtle'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Rate slider */}
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={30}
          value={globalRate}
          onChange={(e) => setGlobalRate(parseInt(e.target.value, 10))}
          className="w-full accent-accent h-1.5 cursor-pointer"
          aria-label="Chaos corruption rate"
        />
        <span className="rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-mono text-text-muted">
          {globalRate}%
        </span>
      </div>
      <p className="mt-2 text-xs text-text-muted leading-relaxed">
        Corrupts a percentage of values with nulls, broken encoding, trailing whitespace, and mixed casing.
      </p>

      {/* Live preview strip */}
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted mb-1.5">
          Preview
        </p>
        <div className="grid grid-cols-5 gap-1 rounded-lg border border-border-subtle bg-bg-tertiary p-2">
          {previewCells.map((cell, i) => (
            <PreviewCell key={i} cell={cell} />
          ))}
        </div>
      </div>

      {/* Per-column overrides */}
      <div className="mt-4 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <span>Per-column overrides</span>
          <IconChevronDown
            size={14}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {allColumns.length === 0 ? (
              <p className="text-xs text-text-muted">No columns parsed yet.</p>
            ) : (
              allColumns.map((col) => {
                const config = columnOverrides[col.id] ?? DEFAULT_COLUMN_CHAOS;
                return (
                  <div
                    key={col.id}
                    className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                  >
                    <p className="text-xs font-mono text-text-primary mb-1.5">{col.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CHAOS_TOGGLE_KEYS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setColumnOverride(col.id, { [key]: !config[key] } as Partial<ColumnChaosConfig>)
                          }
                          className={`rounded-md px-2 py-1 text-[10px] font-medium transition-all duration-200 ${
                            config[key]
                              ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                              : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_COLUMN_CHAOS: ColumnChaosConfig = {
  nullRate: true,
  whitespace: true,
  encoding: true,
  casing: true,
  formatStrip: true,
};

const CHAOS_TOGGLE_KEYS: { key: keyof ColumnChaosConfig; label: string }[] = [
  { key: 'nullRate', label: 'Nulls' },
  { key: 'whitespace', label: 'Whitespace' },
  { key: 'encoding', label: 'Encoding' },
  { key: 'casing', label: 'Casing' },
  { key: 'formatStrip', label: 'Format Strip' },
];

// --- Preview strip helpers (purely illustrative, no real chaos engine involved) ---

type CorruptionType = 'none' | 'null' | 'encoding' | 'whitespace' | 'casing';

interface PreviewCell {
  value: string;
  corruption: CorruptionType;
}

const PREVIEW_ROWS = [
  ['Jane Doe', '42', 'jane@x.com', 'Austin', 'true'],
  ['John Smith', '29', 'john@x.com', 'Boston', 'false'],
  ['Mia Chen', '35', 'mia@x.com', 'Seattle', 'true'],
];

const CORRUPTION_CYCLE: CorruptionType[] = ['null', 'encoding', 'whitespace', 'casing'];

function buildPreviewCells(rate: number): PreviewCell[] {
  const flat = PREVIEW_ROWS.flat();
  const total = flat.length;
  const corruptCount = Math.round((rate / 100) * total);

  return flat.map((value, i) => {
    if (i >= corruptCount) {
      return { value, corruption: 'none' };
    }
    return { value, corruption: CORRUPTION_CYCLE[i % CORRUPTION_CYCLE.length] };
  });
}

function PreviewCell({ cell }: { cell: PreviewCell }) {
  const base =
    'flex h-7 items-center justify-center rounded border border-border-subtle bg-bg-secondary text-[10px] font-mono truncate px-1';

  switch (cell.corruption) {
    case 'null':
      return <div className={`${base} text-text-muted`}>&#8709;</div>;
    case 'encoding':
      return <div className={`${base} text-error`}>&#65533;?</div>;
    case 'whitespace':
      return <div className={`${base} text-text-secondary`}>&middot;&middot;{cell.value}&middot;&middot;</div>;
    case 'casing':
      return <div className={`${base} text-text-secondary`}>{cell.value.toUpperCase()}</div>;
    default:
      return <div className={`${base} text-text-secondary`}>{cell.value}</div>;
  }
}
