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
  const setSelection = useCanvasStore((s) => s.setSelection);

  // Handle drag end - update position in store
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateObject(object.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Handle click - select this object
  const handleClick = () => {
    setSelection([object.id]);
  };

  // Handle transform end - update dimensions after resize/rotate
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale on the node (we store actual dimensions instead)
    node.scaleX(1);
    node.scaleY(1);

    // Update object with new position, dimensions, and rotation
    updateObject(object.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
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
      onClick={handleClick}
      onTap={handleClick}
      onTransformEnd={handleTransformEnd}
    />
  );
}
