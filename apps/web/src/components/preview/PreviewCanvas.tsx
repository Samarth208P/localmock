import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type ReactFlowInstance,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';
import type { PreviewSchemaModel } from './types';

const nodeTypes = { table: TableNode };

export function PreviewCanvas({ schema }: { schema: PreviewSchemaModel }) {
  const initialElements = useMemo(() => {
    const nodes: Node[] = schema.tables.map((table, index) => ({
      id: table.id,
      type: 'table',
      position: {
        x: (index % 3) * 440 + 60,
        y: Math.floor(index / 3) * 420 + 60,
      },
      data: {
        name: table.name,
        fields: table.columns.map((column) => ({
          name: column.name,
          typeId: column.typeId,
          isPrimaryKey: column.isPrimaryKey,
          isForeignKey: column.isForeignKey,
        })),
      },
    }));

    const edges: Edge[] = schema.relationships.map((relationship) => ({
      id: relationship.id,
      source: relationship.fromTable,
      target: relationship.toTable,
      sourceHandle: relationship.fromField,
      targetHandle: relationship.toField,
      animated: true,
      type: 'default',
      style: { stroke: '#6366f1', strokeWidth: 2.25 },
    }));

    return { nodes, edges };
  }, [schema]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);
  }, [initialElements, setNodes, setEdges]);

  useEffect(() => {
    if (!instance || nodes.length === 0) return;
    const timer = window.setTimeout(() => {
      void instance.fitView({ padding: 0.18, duration: 450, minZoom: 0.15 });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [instance, nodes.length]);

  return (
    <div className="relative h-full w-full bg-bg-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setInstance}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.15 }}
        minZoom={0.1}
        maxZoom={1.8}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        className="react-flow-dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#3f3f46" gap={18} size={1} />
        <Controls
          className="overflow-hidden rounded-xl border border-border-subtle bg-bg-tertiary p-1 shadow-xl"
          showInteractive={false}
          fitViewOptions={{ padding: 0.18, minZoom: 0.15 }}
        />
        <MiniMap
          nodeColor="#27272a"
          maskColor="rgba(0, 0, 0, 0.45)"
          className="!rounded-xl !border-border-subtle !bg-bg-secondary"
          pannable
          zoomable
        />
      </ReactFlow>

      {schema.tables.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-text-muted">Preview schema is unavailable.</p>
        </div>
      )}
    </div>
  );
}