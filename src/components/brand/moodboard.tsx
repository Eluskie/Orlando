'use client';

import Image from 'next/image';
import type { BrandStyle } from '@/types/brand';
import { StyleExtractionCard } from '@/components/chat/style-extraction-card';

interface MoodboardProps {
  brandName: string;
  style: BrandStyle;
}

/**
 * Moodboard - Brand style definition view
 *
 * Displays reference images grid and extracted style characteristics.
 * Shows empty state when no style has been defined yet.
 */
export function Moodboard({ brandName, style }: MoodboardProps) {
  const { referenceImages, extractedStyle } = style;
  const hasReferences = referenceImages && referenceImages.length > 0;
  const hasStyle = !!extractedStyle;

  if (!hasReferences && !hasStyle) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-lg mb-2">No style defined yet</div>
        <p className="text-sm">Upload reference images in the chat to extract your brand style.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{brandName}</h2>
        <p className="text-sm text-gray-500">Brand Style Definition</p>
      </div>

      {/* Reference Images Grid */}
      {hasReferences && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            Reference Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {referenceImages.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={url}
                  alt={`Reference ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Style Card */}
      {hasStyle && extractedStyle && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            Extracted Style
          </h3>
          <StyleExtractionCard style={extractedStyle} />
        </div>
      )}

      {/* Quick Reference Section */}
      {hasStyle && extractedStyle && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
            Quick Reference
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Primary Color:</span>{' '}
              <span className="font-mono">{extractedStyle.colors.primary}</span>
            </div>
            <div>
              <span className="text-gray-500">Secondary Color:</span>{' '}
              <span className="font-mono">{extractedStyle.colors.secondary}</span>
            </div>
            <div>
              <span className="text-gray-500">Mood:</span>{' '}
              <span>{extractedStyle.mood.primary}</span>
            </div>
            <div>
              <span className="text-gray-500">Typography:</span>{' '}
              <span>{extractedStyle.typography.style}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
