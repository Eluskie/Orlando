"use client";

import { Image } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import { useCanvasStore, type CanvasObject } from "@/stores/canvas-store";

// ---------------------------------------------------------------------------
// CanvasImage - Renders an image object with drag support
// ---------------------------------------------------------------------------

interface CanvasImageProps {
  object: CanvasObject;
  isSelected: boolean;
}

export function CanvasImage({ object, isSelected }: CanvasImageProps) {
  // Load image with CORS anonymous to allow cross-origin images
  const [image, status] = useImage(object.src ?? "", "anonymous");
  const updateObject = useCanvasStore((s) => s.updateObject);

  // Handle drag end - update position in store
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateObject(object.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Don't render while loading or if failed
  if (status === "loading" || status === "failed") {
    return null;
  }

  return (
    <Image
      id={object.id}
      image={image}
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rotation={object.rotation}
      scaleX={object.scaleX}
      scaleY={object.scaleY}
      opacity={object.opacity}
      visible={object.visible}
      draggable={!object.locked}
      onDragEnd={handleDragEnd}
    />
  );
}
