"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCanvasStore, type CanvasNode } from "@/stores/canvas-store";
import { ImageNode } from "./image-node";
import { CanvasToolbar } from "./canvas-toolbar";

// ---------------------------------------------------------------------------
// Custom node types
// ---------------------------------------------------------------------------

const nodeTypes = {
  image: ImageNode,
} as const;

// ---------------------------------------------------------------------------
// CanvasWorkspace - ReactFlow canvas with image nodes
// ---------------------------------------------------------------------------

export function CanvasWorkspace() {
  const nodes = useCanvasStore((s) => s.nodes);
  const viewport = useCanvasStore((s) => s.viewport);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setViewport = useCanvasStore((s) => s.setViewport);

  // Handle node changes (position, selection, removal)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes as Node[]);
      setNodes(updatedNodes as CanvasNode[]);
    },
    [nodes, setNodes]
  );

  // Memoize node types to prevent unnecessary re-renders
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={[]}
        nodeTypes={memoizedNodeTypes}
        onNodesChange={onNodesChange}
        onViewportChange={setViewport}
        defaultViewport={viewport}
        fitView={false}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={5}
        snapToGrid
        snapGrid={[10, 10]}
        className="bg-muted"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d1d5db"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bg-white !shadow-md !border !border-gray-200"
        />
        <MiniMap
          position="bottom-left"
          className="!bg-white !shadow-md !border !border-gray-200"
          maskColor="rgba(0, 0, 0, 0.1)"
          nodeColor="#6366f1"
          pannable
          zoomable
        />
      </ReactFlow>
      <CanvasToolbar />
    </div>
  );
}
