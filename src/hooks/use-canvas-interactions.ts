"use client";

import { useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { useCanvasStore } from "@/stores/canvas-store";

// ---------------------------------------------------------------------------
// useCanvasInteractions - Handles wheel zoom with pointer anchoring
// ---------------------------------------------------------------------------

export function useCanvasInteractions() {
  const setZoom = useCanvasStore((s) => s.setZoom);
  const setPan = useCanvasStore((s) => s.setPan);

  // Handle wheel event for zooming toward pointer position
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const scaleBy = 1.05;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Support both trackpad pinch (ctrlKey) and mouse wheel
      // Trackpad pinch sends deltaY with ctrlKey=true
      const direction = e.evt.ctrlKey
        ? -e.evt.deltaY > 0
          ? 1
          : -1
        : e.evt.deltaY > 0
          ? -1
          : 1;

      // Calculate new scale with bounds (0.1x to 5x)
      const newScale = Math.max(
        0.1,
        Math.min(5, direction > 0 ? oldScale * scaleBy : oldScale / scaleBy)
      );

      // Calculate mouse position relative to stage in old scale
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // Calculate new position to zoom toward pointer
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      // Update Konva Stage directly (imperative)
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);

      // Update Zustand store (for persistence/reactivity)
      setZoom(newScale);
      setPan(newPos.x, newPos.y);
    },
    [setZoom, setPan]
  );

  return {
    handleWheel,
  };
}
