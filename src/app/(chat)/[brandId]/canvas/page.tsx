"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { CanvasWorkspace } from "@/components/canvas";
import { useCanvasStore, type CanvasNode, type ImageNodeData } from "@/stores/canvas-store";

interface BrandAsset {
  id: string;
  brandId: string;
  url: string;
  name: string;
  width: number | null;
  height: number | null;
  canvasX: number | null;
  canvasY: number | null;
  canvasScale: number | null;
}

/**
 * Canvas workspace page for a brand
 *
 * Loads brand assets from the API and displays them on the canvas.
 * Clears and reloads assets when brand changes.
 * Wrapped in ReactFlowProvider for access to ReactFlow hooks.
 */
export default function CanvasPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params.brandId;
  const addNode = useCanvasStore((s) => s.addNode);
  const clearNodes = useCanvasStore((s) => s.clearNodes);
  const prevBrandIdRef = useRef<string | null>(null);

  // Load assets on mount and brand change
  useEffect(() => {
    if (!brandId) return;

    // Clear existing nodes when brand changes
    if (prevBrandIdRef.current !== brandId) {
      clearNodes();
      prevBrandIdRef.current = brandId;
    }

    // Fetch brand assets
    fetch(`/api/brands/${brandId}/assets`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assets");
        return res.json();
      })
      .then((assets: BrandAsset[]) => {
        assets.forEach((asset, index) => {
          // Create ReactFlow node from asset
          const node: CanvasNode = {
            id: asset.id,
            type: "image",
            position: {
              // Use stored position or distribute in a grid
              x: asset.canvasX ?? 100 + (index % 3) * 250,
              y: asset.canvasY ?? 100 + Math.floor(index / 3) * 250,
            },
            data: {
              src: asset.url,
              width: asset.width ?? 200,
              height: asset.height ?? 200,
              opacity: 1,
              locked: false,
              label: asset.name,
            },
            // Set initial size via style
            style: {
              width: asset.width ?? 200,
              height: asset.height ?? 200,
            },
          };
          addNode(node);
        });
      })
      .catch(console.error);
  }, [brandId, addNode, clearNodes]);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      <ReactFlowProvider>
        <CanvasWorkspace />
      </ReactFlowProvider>
    </div>
  );
}
