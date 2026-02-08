import { create } from "zustand";
import { temporal } from "zundo";
import type { Node, Viewport } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Custom data for image nodes */
export interface ImageNodeData extends Record<string, unknown> {
  src: string;
  width: number;
  height: number;
  opacity: number;
  locked: boolean;
  label?: string;
}

/** Canvas node types */
export type CanvasNode = Node<ImageNodeData, "image">;

interface CanvasState {
  nodes: CanvasNode[];
  viewport: Viewport;

  // Actions
  addNode: (node: CanvasNode) => void;
  updateNode: (id: string, updates: Partial<CanvasNode>) => void;
  updateNodeData: (id: string, data: Partial<ImageNodeData>) => void;
  removeNode: (id: string) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  setViewport: (viewport: Viewport) => void;
  resetView: () => void;
  clearNodes: () => void;
}

// ---------------------------------------------------------------------------
// Store (with zundo temporal middleware for undo/redo)
// ---------------------------------------------------------------------------

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set) => ({
      nodes: [],
      viewport: { x: 0, y: 0, zoom: 1 },

      addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node] })),

      updateNode: (id, updates) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, ...updates } : n,
          ),
        })),

      updateNodeData: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        })),

      removeNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
        })),

      setNodes: (nodes) => set({ nodes }),

      setViewport: (viewport) => set({ viewport }),

      resetView: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),

      clearNodes: () => set({ nodes: [] }),
    }),
    {
      limit: 50,
      partialize: (state) => {
        // Only track nodes for undo/redo, not viewport
        const { nodes } = state;
        return { nodes } as CanvasState;
      },
    },
  ),
);

// ---------------------------------------------------------------------------
// Undo/redo helpers
// ---------------------------------------------------------------------------

export const canvasUndo = () => useCanvasStore.temporal.getState().undo();
export const canvasRedo = () => useCanvasStore.temporal.getState().redo();
export const canvasClearHistory = () =>
  useCanvasStore.temporal.getState().clear();
