"use client";

interface BrandCardProps {
  brandName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * BrandCard - Inline brand creation confirmation card
 *
 * Displayed in chat when AI confirms brand creation.
 * User clicks "Create Brand" to confirm or "Cancel" to continue chatting.
 */
export function BrandCard({
  brandName,
  onConfirm,
  onCancel,
  isLoading = false,
}: BrandCardProps) {
  return (
    <div className="mx-4 my-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Placeholder color swatch */}
        <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {brandName}
          </p>
          <p className="text-xs text-gray-500">Ready to create this brand</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="btn btn-primary flex-1 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : "Create Brand"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="btn btn-secondary flex-1 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
