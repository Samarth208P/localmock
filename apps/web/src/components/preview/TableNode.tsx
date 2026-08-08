import { useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';

interface TableNodeData {
  name: string;
  fields: Array<{
    name: string;
    typeId: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
  }>;
}

export function TableNode({ data }: { data: TableNodeData }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!nodeRef.current) return;
    gsap.from(nodeRef.current, {
      scale: 0.96,
      opacity: 0,
      y: 8,
      duration: 0.3,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div
      ref={nodeRef}
      className="w-[340px] overflow-hidden rounded-xl border border-border-subtle bg-bg-primary font-sans text-sm shadow-xl transition-colors hover:border-accent/50 hover:shadow-accent/10"
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-bg-secondary/85 px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 flex-none items-center justify-center rounded-md bg-accent/10 text-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 9v12" />
            </svg>
          </div>
          <span className="truncate font-mono font-semibold text-text-primary">{data.name}</span>
        </div>
        <span className="text-[10px] text-text-muted">{data.fields.length} columns</span>
      </div>

      <div>
        {data.fields.filter((field) => field.name.trim()).map((field) => (
          <div
            key={field.name}
            className="group relative flex items-center justify-between gap-3 border-b border-border-subtle/40 px-4 py-2 last:border-0 hover:bg-bg-tertiary/50"
          >
            <div className="flex min-w-0 items-center gap-1.5">
              {field.isPrimaryKey && (
                <span className="rounded bg-yellow-500/10 px-1 py-0.5 text-[8px] font-bold text-yellow-400" title="Primary Key">PK</span>
              )}
              {field.isForeignKey && (
                <span className="rounded bg-blue-500/10 px-1 py-0.5 text-[8px] font-bold text-blue-400" title="Foreign Key">FK</span>
              )}
              <span className="truncate font-medium text-text-secondary">{field.name}</span>
            </div>
            <span className="flex-none rounded-md border border-border-subtle/60 bg-bg-secondary px-2 py-0.5 font-mono text-[10px] text-text-muted">
              {field.typeId}
            </span>

            <Handle
              type="source"
              position={Position.Right}
              id={field.name}
              className={'!right-[-6px] !h-2.5 !w-2.5 !border-2 !border-bg-primary ' + (field.isForeignKey ? '!bg-blue-500 opacity-80' : '!bg-border-subtle opacity-0')}
            />
            <Handle
              type="target"
              position={Position.Left}
              id={field.name}
              className={'!left-[-6px] !h-2.5 !w-2.5 !border-2 !border-bg-primary ' + (field.isPrimaryKey ? '!bg-yellow-500 opacity-80' : '!bg-border-subtle opacity-0')}
            />
          </div>
        ))}
      </div>
    </div>
  );
}