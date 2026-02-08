"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// PlaceholderNode - Loading state for generation
// ---------------------------------------------------------------------------

function PlaceholderNodeComponent({ data }: NodeProps) {
  // Type guard to ensure data has the required fields
  const typedData = data as {
    prompt?: string;
    status?: "pending" | "generating" | "complete" | "error";
    errorMessage?: string;
  };

  const prompt = typedData.prompt || "Generating...";
  const status = typedData.status || "pending";

  return (
    <div className="relative w-[200px] h-[200px] bg-white rounded-lg border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center p-4">
      {/* Loading spinner */}
      {(status === "pending" || status === "generating") && (
        <>
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
          <span className="text-sm text-gray-600 font-medium">
            {status === "pending" ? "Queued..." : "Generating..."}
          </span>
        </>
      )}

      {/* Error state */}
      {status === "error" && (
        <>
          <div className="w-8 h-8 text-red-400 mb-2 text-2xl">✕</div>
          <span className="text-sm text-red-600 font-medium">Failed</span>
          {typedData.errorMessage && (
            <span className="text-xs text-red-400 mt-1 text-center">
              {typedData.errorMessage}
            </span>
          )}
        </>
      )}

      {/* Prompt text */}
      <span className="text-xs text-gray-400 mt-2 text-center truncate max-w-full px-2">
        {prompt.length > 40 ? `${prompt.slice(0, 40)}...` : prompt}
      </span>
    </div>
  );
}

export const PlaceholderNode = memo(PlaceholderNodeComponent);
