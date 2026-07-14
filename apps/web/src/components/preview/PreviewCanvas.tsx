import { useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMultiTableStore } from '@/store/multiTableStore';
import { useSchemaStore } from '@/store/schemaStore';
import { TableNode } from './TableNode';

const nodeTypes = {
  table: TableNode,
};

export function PreviewCanvas() {
  const { tables, foreignKeys } = useMultiTableStore();
  const { parsedSchema } = useSchemaStore();

  const initialElements = useMemo(() => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    if (tables.length > 0) {
      // Multi-table mode
      nodes = tables.map((t, index) => {
        // Simple layout: arrange in a grid or row
        const x = (index % 3) * 450 + 50;
        const y = Math.floor(index / 3) * 400 + 50;

        return {
          id: t.id,
          type: 'table',
          position: { x, y },
          data: {
            name: t.name,
            fields: t.fields.map(f => ({
              name: f.name,
              typeId: f.typeId,
              options: f.options,
              unique: f.unique,
              isPrimaryKey: f.name === 'id',
              isForeignKey: foreignKeys.some(fk => fk.fromTable === t.id && fk.fromField === f.name)
            }))
          }
        };
      });

      edges = foreignKeys.map(fk => ({
        id: fk.id,
        source: fk.fromTable,
        target: fk.toTable,
        sourceHandle: fk.fromField,
        targetHandle: fk.toField,
        animated: true,
        type: 'smoothstep',
        style: { stroke: '#6366f1', strokeWidth: 2.5 },
      }));

    } else if (parsedSchema && parsedSchema.tables.length > 0) {
      // Paste mode (single table typically, or multiple if we parse them)
      nodes = parsedSchema.tables.map((t, index) => {
        const x = (index % 3) * 450 + 50;
        const y = Math.floor(index / 3) * 400 + 50;

        return {
          id: `parsed-${index}`,
          type: 'table',
          position: { x, y },
          data: {
            name: t.name,
            fields: t.columns.map(col => ({
              name: col.name,
              typeId: col.type,
              options: {},
              unique: col.isUnique,
              isPrimaryKey: col.name.toLowerCase() === 'id',
              isForeignKey: false // Not parsed yet
            }))
          }
        };
      });
    }

    return { nodes, edges };
  }, [tables, foreignKeys, parsedSchema]);

  const [nodes, , onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  // Allow manual connecting just for fun, though it won't persist to the store here
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'default' }, eds)), [setEdges]);

  return (
    <div className="w-full h-full relative bg-bg-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="react-flow-dark"
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#3f3f46" gap={16} size={1} />
        <Controls 
          className="bg-bg-tertiary border border-border-subtle shadow-xl rounded-xl overflow-hidden flex flex-col p-1 gap-1" 
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#27272a" 
          maskColor="rgba(0, 0, 0, 0.4)" 
          className="!bg-bg-secondary !border-border-subtle rounded-xl overflow-hidden" 
        />
      </ReactFlow>
      
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
                <path d="M3 10h18M3 14h18M3 6h18M3 18h18" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-secondary">No tables to preview</p>
          </div>
        </div>
      )}
    </div>
  );
}
