"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { CanvasWorkspace } from "@/components/canvas";
import { useCanvasStore, type CanvasObject } from "@/stores/canvas-store";

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
 */
export default function CanvasPage() {
  const params = useParams<{ brandId: string }>();
  const brandId = params.brandId;
  const addObject = useCanvasStore((s) => s.addObject);
  const prevBrandIdRef = useRef<string | null>(null);

  // Load assets on mount and brand change
  useEffect(() => {
    if (!brandId) return;

    // Clear existing objects when brand changes
    const store = useCanvasStore.getState();
    if (prevBrandIdRef.current !== brandId) {
      // Remove all existing objects
      store.objects.forEach((obj) => {
        store.removeObject(obj.id);
      });
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
          const canvasObj: CanvasObject = {
            id: asset.id,
            type: "image",
            // Use stored position or distribute randomly
            x: asset.canvasX ?? 100 + (index % 3) * 250,
            y: asset.canvasY ?? 100 + Math.floor(index / 3) * 250,
            width: asset.width ?? 200,
            height: asset.height ?? 200,
            rotation: 0,
            scaleX: asset.canvasScale ?? 1,
            scaleY: asset.canvasScale ?? 1,
            opacity: 1,
            visible: true,
            locked: false,
            src: asset.url,
          };
          addObject(canvasObj);
        });
      })
      .catch(console.error);
  }, [brandId, addObject]);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      <CanvasWorkspace />
    </div>
  );
}
