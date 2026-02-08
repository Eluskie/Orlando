"use client";

import { useState, useRef } from "react";
import { Sparkles, X, ImagePlus, Trash2 } from "lucide-react";
import { useCanvasStore, type CanvasNode, type ImageNodeData } from "@/stores/canvas-store";
import { useGenerationStore } from "@/stores/generation-store";
import { useBrandStore } from "@/stores/brand-store";

// ---------------------------------------------------------------------------
// GenerationToolbar - Generate images with prompt and optional image upload
// ---------------------------------------------------------------------------

export function GenerationToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store hooks
  const activeBrandId = useBrandStore((s) => s.activeBrandId);
  const activeBrand = useBrandStore((s) => s.activeBrand());
  const addNode = useCanvasStore((s) => s.addNode);
  const removeNode = useCanvasStore((s) => s.removeNode);
  const addPlaceholder = useGenerationStore((s) => s.addPlaceholder);
  const updatePlaceholderStatus = useGenerationStore((s) => s.updatePlaceholderStatus);
  const removePlaceholder = useGenerationStore((s) => s.removePlaceholder);
  const incrementDailyCount = useGenerationStore((s) => s.incrementDailyCount);
  const canGenerate = useGenerationStore((s) => s.canGenerate);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Convert image file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix to get raw base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim() || !activeBrandId || !canGenerate() || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      // Convert image to base64 if present
      let imageBase64: string | undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      // Create placeholder IDs
      const placeholderIds = Array.from(
        { length: count },
        (_, i) => `placeholder-${Date.now()}-${i}`
      );

      // Add placeholders to store
      placeholderIds.forEach((id) => {
        addPlaceholder(id, { prompt: prompt.trim(), brandId: activeBrandId });
      });

      // Add placeholder nodes to canvas
      placeholderIds.forEach((id, i) => {
        const node = {
          id,
          type: "placeholder",
          position: { x: 100 + i * 220, y: 100 },
          data: {
            prompt: prompt.trim(),
            status: "generating",
          },
        } as CanvasNode;
        addNode(node);
      });

      // Update placeholder status to generating
      placeholderIds.forEach((id) => {
        updatePlaceholderStatus(id, "generating");
      });

      // Call generate API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          brandId: activeBrandId,
          count,
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Replace placeholders with real image nodes
      if (result.assets && Array.isArray(result.assets)) {
        result.assets.forEach((asset: { url: string; name: string; width?: number; height?: number }, index: number) => {
          const placeholderId = placeholderIds[index];

          // Remove placeholder
          removeNode(placeholderId);
          removePlaceholder(placeholderId);

          // Add real image node
          const imageNode: CanvasNode = {
            id: `image-${Date.now()}-${index}`,
            type: "image",
            position: { x: 100 + index * 220, y: 100 },
            data: {
              src: asset.url,
              width: asset.width || 200,
              height: asset.height || 200,
              opacity: 1,
              locked: false,
              label: asset.name,
            },
          };
          addNode(imageNode);
        });
      }

      // Increment daily count
      incrementDailyCount();

      // Reset form
      setPrompt("");
      handleClearImage();
      setIsOpen(false);
    } catch (error) {
      console.error("Generation error:", error);

      // Update placeholders to error state
      const placeholderIds = Array.from(
        { length: count },
        (_, i) => `placeholder-${Date.now()}-${i}`
      );
      placeholderIds.forEach((id) => {
        updatePlaceholderStatus(id, "error");
      });

      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* Floating panel */}
      <div className="absolute top-4 right-4 z-10">
        {!isOpen ? (
          /* Collapsed: Generate button */
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Generate</span>
          </button>
        ) : (
          /* Expanded: Generation panel */
          <div className="w-80 bg-white rounded-lg shadow-lg border p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Generate Images</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>

            {/* Image upload section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Image (optional)
              </label>
              {!imageFile ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>Attach image/sketch</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-md">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {imageFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(imageFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={handleClearImage}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Count selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variations
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      count === n
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                        : "bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !canGenerate() || !activeBrandId}
              className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>

            {/* Daily limit warning */}
            {!canGenerate() && (
              <p className="text-xs text-red-600 text-center">
                Daily limit reached (50 generations)
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
