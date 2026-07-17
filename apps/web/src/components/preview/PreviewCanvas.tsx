import { useMemo, useCallback, useState, useEffect } from 'react';
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

export function PreviewCanvas({ fieldDefs, tableName = 'data' }: { fieldDefs?: any[], tableName?: string }) {
  const { tables, foreignKeys } = useMultiTableStore();
  const { parsedSchema } = useSchemaStore();

  const initialElements = useMemo(() => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    if (tables.length > 0) {
      // Multi-table mode
      nodes = tables.map((t, index) => {
        // Reverse layout horizontally so dependents (sources) are on the left
        const reverseIndex = tables.length - 1 - index;
        const x = (reverseIndex % 3) * 800 + 50;
        const y = Math.floor(reverseIndex / 3) * 600 + 50;

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
        type: 'default',
        style: { stroke: '#6366f1', strokeWidth: 2.5 },
      }));

    } else if (parsedSchema && parsedSchema.tables.length > 0) {
      // Collect all fields that are targets of foreign keys (i.e., referenced PKs)
      const referencedFields = new Set<string>(); // "tableName.fieldName"
      for (const t of parsedSchema.tables) {
        if (t.relations) {
          for (const r of t.relations) {
            referencedFields.add(`${r.toTable}.${r.toField}`);
          }
        }
      }

      // Collect all FK source fields
      const fkSourceFields = new Set<string>(); // "tableName.fieldName"
      for (const t of parsedSchema.tables) {
        if (t.relations) {
          for (const r of t.relations) {
            fkSourceFields.add(`${t.name}.${r.fromField}`);
          }
        }
      }

      nodes = parsedSchema.tables.map((t, index) => {
        const reverseIndex = parsedSchema.tables.length - 1 - index;
        const x = (reverseIndex % 3) * 800 + 50;
        const y = Math.floor(reverseIndex / 3) * 600 + 50;

        return {
          id: t.name,
          type: 'table',
          position: { x, y },
          data: {
            name: t.name,
            fields: t.columns.map(col => ({
              name: col.name,
              typeId: col.type,
              options: {},
              unique: col.isUnique,
              isPrimaryKey: referencedFields.has(`${t.name}.${col.name}`),
              isForeignKey: fkSourceFields.has(`${t.name}.${col.name}`),
            }))
          }
        };
      });
      
      parsedSchema.tables.forEach((t) => {
        if (t.relations) {
          t.relations.forEach((r, rIdx) => {
            edges.push({
              id: `${t.name}-${r.fromField}-${r.toTable}-${rIdx}`,
              source: t.name,
              target: r.toTable,
              sourceHandle: r.fromField,
              targetHandle: r.toField,
              animated: true,
              type: 'default',
              style: { stroke: '#6366f1', strokeWidth: 2.5 },
            });
          });
        }
      });
    } else if (fieldDefs && fieldDefs.length > 0) {
      nodes = [{
        id: 'manual-table',
        type: 'table',
        position: { x: 50, y: 50 },
        data: {
          name: tableName,
          fields: fieldDefs.map(f => ({
            name: f.name,
            typeId: f.typeId,
            options: f.options,
            unique: f.unique,
            isPrimaryKey: f.name === 'id',
            isForeignKey: false,
          }))
        }
      }];
    }

    return { nodes, edges };
  }, [tables, foreignKeys, parsedSchema, fieldDefs, tableName]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);
  }, [initialElements, setNodes, setEdges]);

  // Allow manual connecting just for fun, though it won't persist to the store here
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'default' }, eds)), [setEdges]);

  const [rfInstance, setRfInstance] = useState<any>(null);

  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 800, minZoom: 0.01 }), 50);
    }
  }, [rfInstance, parsedSchema, tables.length]);

  return (
    <div className="w-full h-full relative bg-bg-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.01 }}
        className="react-flow-dark"
        minZoom={0.01}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#3f3f46" gap={16} size={1} />
        <Controls 
          className="bg-bg-tertiary border border-border-subtle shadow-xl rounded-xl overflow-hidden flex flex-col p-1 gap-1" 
          showInteractive={false}
          fitViewOptions={{ padding: 0.2, minZoom: 0.01 }}
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
