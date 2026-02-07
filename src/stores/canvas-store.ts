import { create } from "zustand";
import { temporal } from "zundo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CanvasObject {
  id: string;
  type: "image" | "text" | "shape" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  /** Source URL for image objects */
  src?: string;
  /** Text content for text objects */
  text?: string;
  /** Font size for text objects */
  fontSize?: number;
  /** Font family for text objects */
  fontFamily?: string;
  /** Fill color for shapes/text */
  fill?: string;
  /** Child IDs for group objects */
  children?: string[];
}

interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  zoom: number;
  panX: number;
  panY: number;

  // Actions
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<Omit<CanvasObject, "id">>) => void;
  removeObject: (id: string) => void;
  setSelection: (ids: string[]) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
}

// ---------------------------------------------------------------------------
// Store (with zundo temporal middleware for undo/redo)
// ---------------------------------------------------------------------------

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set) => ({
      objects: [],
      selectedIds: [],
      zoom: 1,
      panX: 0,
      panY: 0,

      addObject: (object) =>
        set((state) => ({ objects: [...state.objects, object] })),

      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((o) =>
            o.id === id ? { ...o, ...updates } : o,
          ),
        })),

      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((o) => o.id !== id),
          selectedIds: state.selectedIds.filter((sid) => sid !== id),
        })),

      setSelection: (ids) => set({ selectedIds: ids }),

      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

      setPan: (x, y) => set({ panX: x, panY: y }),

      resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
    }),
    {
      limit: 50,
      partialize: (state) => {
        // Only track objects for undo/redo, not viewport or selection
        const { objects } = state;
        return { objects } as CanvasState;
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
