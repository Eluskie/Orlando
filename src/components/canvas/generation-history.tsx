"use client";

import { useState, useEffect } from "react";
import { History, X, Plus, Clock } from "lucide-react";
import { useCanvasStore, type CanvasNode } from "@/stores/canvas-store";
import { useBrandStore } from "@/stores/brand-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Generation {
  id: string;
  prompt: string;
  status: string;
  createdAt: string;
  assets: Array<{
    id: string;
    url: string;
    name: string;
    width?: number;
    height?: number;
  }>;
}

// ---------------------------------------------------------------------------
// GenerationHistory - View and reuse past generations
// ---------------------------------------------------------------------------

export function GenerationHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);

  const activeBrandId = useBrandStore((s) => s.activeBrandId);
  const addNode = useCanvasStore((s) => s.addNode);

  // Fetch generations when panel opens
  useEffect(() => {
    if (isOpen && activeBrandId) {
      fetchGenerations();
    }
  }, [isOpen, activeBrandId]);

  const fetchGenerations = async () => {
    if (!activeBrandId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/generations/${activeBrandId}`);
      if (response.ok) {
        const data = await response.json();
        setGenerations(data);
      }
    } catch (error) {
      console.error("Failed to fetch generations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate relative time
  const getRelativeTime = (dateString: string): string => {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Add generation assets to canvas
  const handleAddToCanvas = (generation: Generation) => {
    generation.assets.forEach((asset, i) => {
      const node: CanvasNode = {
        id: `history-${Date.now()}-${i}`,
        type: "image",
        position: { x: 100 + i * 220, y: 300 },
        data: {
          src: asset.url,
          width: asset.width || 200,
          height: asset.height || 200,
          opacity: 1,
          locked: false,
          label: asset.name,
        },
      };
      addNode(node);
    });

    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-52 z-10 p-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 transition-colors"
        title="Generation History"
      >
        <History className="w-5 h-5 text-gray-600" />
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l z-20 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">Generation History</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}

            {!loading && generations.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p>No generations yet</p>
                <p className="text-xs mt-1">
                  Use the Generate button to create images
                </p>
              </div>
            )}

            {!loading &&
              generations.map((gen) => (
                <div
                  key={gen.id}
                  className="border rounded-lg p-3 space-y-2 hover:border-indigo-300 transition-colors"
                >
                  {/* Prompt */}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {gen.prompt.length > 60
                      ? `${gen.prompt.slice(0, 60)}...`
                      : gen.prompt}
                  </p>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{getRelativeTime(gen.createdAt)}</span>
                  </div>

                  {/* Asset thumbnails */}
                  {gen.assets.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {gen.assets.map((asset) => (
                        <img
                          key={asset.id}
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Add to canvas button */}
                  <button
                    onClick={() => handleAddToCanvas(gen)}
                    className="w-full py-2 px-3 bg-indigo-50 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Canvas</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
