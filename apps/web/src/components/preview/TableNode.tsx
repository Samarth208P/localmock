import { useMemo, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { generateTypedValue, createCtx } from '@localmock/core/generators';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';

interface TableNodeData {
  name: string;
  fields: Array<{
    name: string;
    typeId: string;
    options: Record<string, unknown>;
    unique?: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
  }>;
}

export function TableNode({ data }: { data: TableNodeData }) {
  // Generate 5 sample rows synchronously for preview
  const sampleRows = useMemo(() => {
    try {
      const rows = [];
      for (let i = 0; i < 5; i++) {
        const rowCtx = createCtx();
        const row: Record<string, unknown> = {};
        for (const field of data.fields) {
          if (!field.name.trim()) continue;
          row[field.name] = generateTypedValue(field.typeId, field.options || {}, rowCtx);
        }
        rows.push(row);
      }
      return rows;
    } catch (e) {
      console.error("Error generating sample data for node", e);
      return [];
      return [];
    }
  }, [data.fields]);

  const nodeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!nodeRef.current) return;
    gsap.from(nodeRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'back.out(1.7)',
    });
  }, []);

  return (
    <div ref={nodeRef} className="bg-bg-primary border border-border-subtle rounded-xl shadow-xl overflow-hidden min-w-[320px] max-w-[400px] font-sans text-sm transition-all duration-300 hover:shadow-accent/10 hover:border-accent/50 hover:scale-[1.02] cursor-grab active:cursor-grabbing group/node">
      {/* Top Handle for incoming connections */}
      <Handle type="target" position={Position.Top} className="!bg-border-subtle !w-2 !h-2 !border-bg-primary opacity-0 group-hover/node:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="bg-bg-secondary/80 backdrop-blur-sm px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <span className="font-bold text-text-primary tracking-tight">{data.name}</span>
        </div>
      </div>

      {/* Columns */}
      <div className="p-0 border-b border-border-subtle/50 bg-bg-primary">
        {data.fields.filter(f => f.name.trim()).map((field, idx) => (
          <div key={idx} className="relative flex items-center justify-between px-4 py-2 hover:bg-bg-tertiary/50 transition-colors border-b border-border-subtle/30 last:border-0 group">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">{field.name}</span>
              {field.isPrimaryKey && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500 drop-shadow-sm">
                  <title>Primary Key</title>
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
              )}
              {field.isForeignKey && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 drop-shadow-sm">
                  <title>Foreign Key</title>
                  <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
              )}
            </div>
            <div className="text-[11px] text-text-muted font-mono bg-bg-secondary px-2 py-0.5 rounded-md border border-border-subtle/50">
              {field.typeId}
            </div>
            
            {/* Handles for specific columns if we want to connect fields directly */}
            {field.isForeignKey && (
               <Handle 
                 type="source" 
                 position={Position.Right} 
                 id={field.name} 
                 className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-bg-primary !right-[-6px] opacity-0 group-hover:opacity-100 transition-all hover:scale-125" 
               />
            )}
            {field.isPrimaryKey && (
               <Handle 
                 type="target" 
                 position={Position.Left} 
                 id={field.name} 
                 className="!bg-yellow-500 !w-2.5 !h-2.5 !border-2 !border-bg-primary !left-[-6px] opacity-0 group-hover:opacity-100 transition-all hover:scale-125" 
               />
            )}
          </div>
        ))}
      </div>

      {/* Sample Data */}
      <div className="bg-bg-secondary/40 p-4">
        <p className="text-[10px] font-bold text-text-muted/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
             <polyline points="14 2 14 8 20 8"></polyline>
             <line x1="16" y1="13" x2="8" y2="13"></line>
             <line x1="16" y1="17" x2="8" y2="17"></line>
             <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Sample Data
        </p>
        <div className="overflow-x-auto custom-scrollbar pb-1">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr>
                {data.fields.filter(f => f.name.trim()).map(f => (
                  <th key={f.name} className="font-medium text-text-muted/70 pb-2 pr-4">{f.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, i) => (
                <tr key={i} className="border-t border-border-subtle/20 hover:bg-bg-tertiary/30 transition-colors">
                  {data.fields.filter(f => f.name.trim()).map(f => {
                    const val = row[f.name];
                    const displayVal = val === null ? 'null' : val === undefined ? 'undefined' : String(val);
                    return (
                      <td key={f.name} className="py-1.5 pr-4 text-text-primary/90 font-mono text-[11px] truncate max-w-[120px]" title={displayVal}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Handle for outgoing connections */}
      <Handle type="source" position={Position.Bottom} className="!bg-border-subtle !w-2 !h-2 !border-bg-primary opacity-0 group-hover/node:opacity-100 transition-opacity" />
    </div>
  );
}
