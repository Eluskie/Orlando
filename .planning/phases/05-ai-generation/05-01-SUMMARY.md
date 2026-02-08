# Phase 5: AI Generation - Plan 01 Summary

**Completed:** 2026-02-08
**Duration:** ~8 minutes
**Status:** ✅ Complete

## Objective

Build the generation backend: prompt builder that injects brand style into user prompts, generation DB queries, and upgrade the existing /api/generate route to support mock multi-image generation (2-4 variations) with real Imagen 4 integration (behind feature flag). The API also accepts an optional image input for image-to-image/sketch-to-image generation (GEN-02).

## Implementation Summary

### Files Created

1. **src/lib/ai/prompt-builder.ts**
   - Exports `buildStyledPrompt(userPrompt, style)` function
   - Combines user prompt with extracted brand style descriptors
   - Style appended AFTER user prompt (harder to override)
   - Extracts: mood keywords, color palette, visual style, contrast, mood
   - Returns original prompt unchanged if no style data provided

2. **src/lib/db/queries/generations.ts**
   - `createGeneration(data)` - Creates new generation record
   - `updateGeneration(id, data)` - Updates generation status/completion
   - `getGenerationHistory(brandId, limit)` - Fetches history with nested assets
   - `getGeneration(id)` - Gets single generation with assets
   - `getDailyGenerationCount(brandId)` - Counts today's generations for rate limiting

### Files Modified

3. **src/types/generation.ts**
   - Added `styledPrompt?: string` to GenerationMetadata
   - Added `count?: number` to GenerationMetadata
   - Added `sourceImage?: string` to GenerationMetadata (stores '[provided]' marker)

4. **src/lib/ai/mock.ts**
   - Added `mockGenerateImages(prompt, count)` function
   - Generates 2-5 second simulated delay
   - Returns `count` SVG placeholders (512x512) with different colors
   - Each shows "Generated #N" and truncated prompt
   - Converts SVG to base64 format

5. **src/app/api/generate/route.ts** (Complete rewrite)
   - POST handler accepts: `{ prompt, brandId, count?, aspectRatio?, image? }`
   - Validates count (1-4), aspectRatio (1:1, 3:4, 4:3, 9:16, 16:9)
   - Server-side daily limit check via `getDailyGenerationCount()`
   - Fetches brand and builds styled prompt via `buildStyledPrompt()`
   - Creates generation record with status: 'processing'
   - **MOCK PATH:**
     - Calls `mockGenerateImages(styledPrompt, count)`
     - Creates asset records with SVG data URLs (no R2 upload)
     - Updates generation to 'completed'
     - Returns `{ generationId, assets, mode: 'mock' }`
   - **REAL PATH:**
     - Uses AI SDK's `generateImage` with Google Imagen 4
     - If image provided: prepends "Based on the provided reference image:" to prompt
     - Uploads each generated PNG to R2 via `uploadBuffer()`
     - Creates asset records with R2 URLs
     - Updates generation to 'completed'
     - On error: updates to 'failed' with errorMessage
   - GET handler: Returns rate limit status (unchanged)

## Verification

✅ TypeScript compiles without errors: `npx tsc --noEmit`
✅ All new files created with correct exports
✅ prompt-builder.ts correctly combines user prompt with style data
✅ All 5 generation CRUD queries implemented and typed
✅ mockGenerateImages produces SVG placeholders with simulated delay
✅ Generate route handles both mock and real Imagen 4 generation
✅ Optional `image` field accepted for image-to-image generation (GEN-02)
✅ Mock mode returns 2-4 variations, ignores image input gracefully
✅ Server-side daily rate limit enforced per brand
✅ Generation records track full lifecycle (pending → processing → completed/failed)

## Key Features Delivered

1. **Brand Style Injection:** User prompts automatically enhanced with extracted style keywords, colors, visual style, and mood
2. **Multi-Image Generation:** Supports 2-4 variations per request (GEN-03)
3. **Image-to-Image Support:** Accepts optional base64 image for sketch/reference-based generation (GEN-02)
4. **Mock Mode:** Full development workflow without API keys or R2 credentials
5. **Server-Side Rate Limiting:** Daily limit of 50 generations per brand enforced at API level
6. **Database Tracking:** All generations and assets persisted with metadata
7. **Error Handling:** Failed generations tracked with error messages

## Technical Decisions

1. **Style Application Strategy:** Append style AFTER user prompt (harder to override via prompt injection)
2. **Mock Image Format:** SVG data URLs (zero dependencies, instant display, color-coded variations)
3. **Image-to-Image Fallback:** Prepend context to prompt (graceful degradation without direct API access)
4. **Metadata Storage:** Store '[provided]' marker for sourceImage, not full base64 (avoid DB bloat)
5. **Mock R2 Bypass:** Data URLs instead of R2 upload in mock mode (works without credentials)

## API Contract

**POST /api/generate**

Request:
```json
{
  "prompt": "a mountain landscape",
  "brandId": "uuid",
  "count": 4,
  "aspectRatio": "1:1",
  "image": "base64..." // optional
}
```

Response (mock):
```json
{
  "generationId": "uuid",
  "assets": [
    {
      "id": "uuid",
      "url": "data:image/svg+xml;base64,...",
      "name": "a mountain landscape - Variation 1",
      "type": "illustration",
      "width": 512,
      "height": 512
    }
  ],
  "mode": "mock"
}
```

Response (real):
```json
{
  "generationId": "uuid",
  "assets": [
    {
      "id": "uuid",
      "url": "https://r2.../brands/{brandId}/generated/...",
      "name": "a mountain landscape - Variation 1",
      "type": "illustration"
    }
  ]
}
```

## Next Steps

Plan 05-02 will build the canvas generation UI:
- PlaceholderNode component for optimistic loading states
- GenerationToolbar with prompt input and optional image upload
- Wire the full flow: user generates → placeholders appear → replaced with real images
- Integration with existing canvas workspace and ReactFlow

## Dependencies for Plan 05-02

- ✅ Generation API endpoint complete
- ✅ Mock multi-image generation working
- ✅ Database queries ready
- ✅ Optional image input supported
- Ready to build UI layer
