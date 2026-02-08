"use client";

import { useRef, useEffect } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";

// ---------------------------------------------------------------------------
// CanvasTransformer - Provides resize/rotate handles for selected objects
// ---------------------------------------------------------------------------

interface CanvasTransformerProps {
  selectedIds: string[];
  layerRef: React.RefObject<Konva.Layer | null>;
}

export function CanvasTransformer({
  selectedIds,
  layerRef,
}: CanvasTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  // Attach transformer to selected nodes when selection changes
  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;

    if (!transformer || !layer) return;

    // Find nodes by id from the layer
    const nodes = selectedIds
      .map((id) => layer.findOne<Konva.Node>(`#${id}`))
      .filter((node): node is Konva.Node => node !== null && node !== undefined);

    // Attach nodes to transformer
    transformer.nodes(nodes);

    // Redraw layer to show transformer
    layer.batchDraw();
  }, [selectedIds, layerRef]);

  return (
    <Transformer
      ref={transformerRef}
      // Enable rotation
      rotateEnabled
      // Keep aspect ratio when shift is held
      keepRatio={false}
      // Minimum dimensions
      boundBoxFunc={(oldBox, newBox) => {
        // Limit minimum resize
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
