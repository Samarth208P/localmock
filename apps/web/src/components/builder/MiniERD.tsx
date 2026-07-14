import { useMemo } from 'react';
import { useMultiTableStore } from '@/store/multiTableStore';

const BOX_WIDTH = 120;
const BOX_HEIGHT = 48;
const BOX_GAP = 48;
const PADDING = 16;

/**
 * Lightweight, dependency-free static SVG mini entity-relationship diagram.
 * Renders a box per table (name + field count) with curved connectors for
 * foreign keys, so multi-table setup gives instant visual feedback without
 * needing to generate first.
 */
export function MiniERD() {
  const { tables, foreignKeys, activeTableId, setActiveTable } = useMultiTableStore();

  const layout = useMemo(() => {
    return tables.map((table, idx) => ({
      id: table.id,
      name: table.name,
      fieldCount: table.fields.length,
      x: PADDING + idx * (BOX_WIDTH + BOX_GAP),
      y: PADDING,
    }));
  }, [tables]);

  const width = Math.max(
    tables.length * (BOX_WIDTH + BOX_GAP) - BOX_GAP + PADDING * 2,
    BOX_WIDTH + PADDING * 2,
  );
  const height = BOX_HEIGHT + PADDING * 2 + 24;

  const centerOf = (id: string) => {
    const box = layout.find((b) => b.id === id);
    if (!box) return null;
    return { x: box.x + BOX_WIDTH / 2, y: box.y + BOX_HEIGHT };
  };

  if (tables.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-3 overflow-x-auto" style={{ maxHeight: 200 }}>
      <p className="mb-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">Schema Map</p>
      <svg width={width} height={height} className="block" style={{ minWidth: width }}>
        {/* FK connectors */}
        {foreignKeys.map((fk) => {
          const from = centerOf(fk.fromTable);
          const to = centerOf(fk.toTable);
          if (!from || !to) return null;
          const midY = Math.max(from.y, to.y) + 24;
          const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
          return (
            <path
              key={fk.id}
              d={path}
              fill="none"
              stroke="var(--accent)"
              strokeOpacity={0.5}
              strokeWidth={1.5}
              markerEnd="url(#mini-erd-arrow)"
            />
          );
        })}

        <defs>
          <marker id="mini-erd-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--accent)" fillOpacity={0.6} />
          </marker>
        </defs>

        {/* Table boxes */}
        {layout.map((box) => {
          const isActive = box.id === activeTableId;
          return (
            <g
              key={box.id}
              transform={`translate(${box.x}, ${box.y})`}
              onClick={() => setActiveTable(box.id)}
              className="cursor-pointer"
            >
              <rect
                width={BOX_WIDTH}
                height={BOX_HEIGHT}
                rx={10}
                fill="var(--bg-tertiary)"
                stroke={isActive ? 'var(--accent)' : 'var(--border-subtle)'}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <text
                x={BOX_WIDTH / 2}
                y={20}
                textAnchor="middle"
                fill={isActive ? 'var(--accent)' : 'var(--text-primary)'}
                fontSize="11"
                fontWeight={600}
                fontFamily="ui-monospace, monospace"
              >
                {box.name.length > 14 ? `${box.name.slice(0, 13)}…` : box.name}
              </text>
              <text
                x={BOX_WIDTH / 2}
                y={36}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {box.fieldCount} field{box.fieldCount !== 1 ? 's' : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
