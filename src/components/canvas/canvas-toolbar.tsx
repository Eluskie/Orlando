"use client";

import { useEffect, useState } from "react";
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useCanvasStore } from "@/stores/canvas-store";

// ---------------------------------------------------------------------------
// CanvasToolbar - Floating toolbar with zoom and undo/redo controls
// ---------------------------------------------------------------------------

export function CanvasToolbar() {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();
  const { zoom } = useViewport();
  const resetView = useCanvasStore((s) => s.resetView);

  // Get undo/redo functions from temporal state
  const { undo, redo } = useCanvasStore.temporal.getState();

  // Subscribe to temporal state for reactive canUndo/canRedo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    // Check initial state
    const temporal = useCanvasStore.temporal.getState();
    setCanUndo(temporal.pastStates.length > 0);
    setCanRedo(temporal.futureStates.length > 0);

    // Subscribe to changes
    const unsubscribe = useCanvasStore.temporal.subscribe((state) => {
      setCanUndo(state.pastStates.length > 0);
      setCanRedo(state.futureStates.length > 0);
    });

    return unsubscribe;
  }, []);

  const handleReset = () => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 });
    resetView();
  };

  const buttonClass =
    "p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const iconClass = "w-4 h-4";

  return (
    <div className="absolute top-4 left-4 flex items-center gap-1 bg-white rounded-lg shadow-md border border-gray-200 p-1 z-10">
      {/* Undo/Redo controls */}
      <button
        className={buttonClass}
        onClick={() => undo()}
        disabled={!canUndo}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 className={iconClass} />
      </button>
      <button
        className={buttonClass}
        onClick={() => redo()}
        disabled={!canRedo}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 className={iconClass} />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Zoom controls */}
      <button
        className={buttonClass}
        onClick={() => zoomOut({ duration: 150 })}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className={iconClass} />
      </button>

      <span className="text-sm text-gray-500 px-2 min-w-[50px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        className={buttonClass}
        onClick={() => zoomIn({ duration: 150 })}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className={iconClass} />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Reset view */}
      <button
        className={buttonClass}
        onClick={handleReset}
        title="Reset view"
        aria-label="Reset view"
      >
        <Maximize2 className={iconClass} />
      </button>
    </div>
  );
}
