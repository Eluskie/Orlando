'use client';

import type { ExtractedStyleData } from '@/types/brand';

interface StyleExtractionCardProps {
  style: ExtractedStyleData;
  isExtracting?: boolean;
}

/**
 * StyleExtractionCard - Visual display of extracted brand style
 *
 * Shows color swatches, mood keywords, typography hints, and confidence score.
 * Designed to be embedded in chat messages after style extraction.
 */
export function StyleExtractionCard({ style, isExtracting }: StyleExtractionCardProps) {
  if (isExtracting) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <span className="text-sm text-gray-500">Extracting style from your references...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4 max-w-md mt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Extracted Style</h3>
        <span className="text-xs text-gray-500">
          {Math.round(style.confidence * 100)}% confidence
        </span>
      </div>

      {/* Color Palette */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Colors</p>
        <div className="flex gap-3">
          {Object.entries(style.colors).map(([name, hex]) => (
            <div key={name} className="text-center">
              <div
                className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
              <span className="text-xs text-gray-500 mt-1 block capitalize">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood & Keywords */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Mood</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full">
            {style.mood.primary}
          </span>
          {style.mood.keywords.map((kw) => (
            <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Typography</p>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-500">Style:</span>{' '}
            <span className="text-gray-900">{style.typography.style}</span>
          </div>
          <div>
            <span className="text-gray-500">Weight:</span>{' '}
            <span className="text-gray-900">{style.typography.weight}</span>
          </div>
          <div>
            <span className="text-gray-500">Feel:</span>{' '}
            <span className="text-gray-900">{style.typography.mood}</span>
          </div>
        </div>
      </div>

      {/* Visual Style */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Visual Characteristics</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-gray-900 font-medium capitalize">{style.visualStyle.complexity}</div>
            <div className="text-xs text-gray-500">Complexity</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-gray-900 font-medium capitalize">{style.visualStyle.contrast}</div>
            <div className="text-xs text-gray-500">Contrast</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-gray-900 font-medium capitalize">{style.visualStyle.texture}</div>
            <div className="text-xs text-gray-500">Texture</div>
          </div>
        </div>
      </div>

      {/* Tone indicator */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <div className={`w-3 h-3 rounded-full ${
          style.mood.tone === 'warm' ? 'bg-orange-400' :
          style.mood.tone === 'cool' ? 'bg-blue-400' : 'bg-gray-400'
        }`} />
        <span className="text-sm text-gray-600 capitalize">{style.mood.tone} tone</span>
      </div>
    </div>
  );
}
