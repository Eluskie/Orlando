"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import type { ImageNodeData } from "@/stores/canvas-store";

interface ImageNodeProps {
  data: ImageNodeData;
  selected?: boolean;
}

/**
 * Custom ReactFlow node for displaying images on the canvas.
 * Supports selection, resizing, and drag-to-move (built into ReactFlow).
 */
function ImageNodeComponent({ data, selected }: ImageNodeProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {/* Resize handles - only show when selected */}
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={50}
        minHeight={50}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 2,
        }}
      />

      {/* Image container */}
      <div
        className="relative w-full h-full overflow-hidden rounded-sm"
        style={{ opacity: data.opacity }}
      >
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
            Failed to load
          </div>
        )}

        {/* Image */}
        <img
          src={data.src}
          alt={data.label || "Canvas image"}
          className="w-full h-full object-cover"
          style={{
            display: imageLoaded ? "block" : "none",
            pointerEvents: data.locked ? "none" : "auto",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          draggable={false}
        />

        {/* Selection ring */}
        {selected && (
          <div className="absolute inset-0 ring-2 ring-blue-500 ring-offset-1 rounded-sm pointer-events-none" />
        )}

        {/* Locked indicator */}
        {data.locked && (
          <div className="absolute top-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
            🔒
          </div>
        )}
      </div>
    </>
  );
}

export const ImageNode = memo(ImageNodeComponent);
