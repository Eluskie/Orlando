"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import type Konva from "konva";
import { useCanvasStore } from "@/stores/canvas-store";
import { CanvasImage } from "./canvas-image";

// ---------------------------------------------------------------------------
// CanvasWorkspace - Main Stage container with responsive dimensions
// ---------------------------------------------------------------------------

export function CanvasWorkspace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const objects = useCanvasStore((s) => s.objects);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const zoom = useCanvasStore((s) => s.zoom);
  const panX = useCanvasStore((s) => s.panX);
  const panY = useCanvasStore((s) => s.panY);
  const setPan = useCanvasStore((s) => s.setPan);

  // Measure container and update dimensions on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };

    // Initial measurement
    updateDimensions();

    // Observe resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle stage drag end (panning)
  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    setPan(stage.x(), stage.y());
  };

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-muted">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          scale={{ x: zoom, y: zoom }}
          x={panX}
          y={panY}
          draggable
          onDragEnd={handleStageDragEnd}
        >
          <Layer>
            {objects.map((obj) => {
              if (obj.type === "image") {
                return (
                  <CanvasImage
                    key={obj.id}
                    object={obj}
                    isSelected={selectedIds.includes(obj.id)}
                  />
                );
              }
              // Other object types will be added in future plans
              return null;
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
