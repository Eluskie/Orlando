# Phase 5: AI Generation - Research

**Researched:** 2026-02-08
**Domain:** AI image generation, Google Imagen API, brand style application, optimistic UI
**Confidence:** HIGH

## Summary

This phase enables users to generate brand-consistent images via text prompts or sketch/image input, with AI automatically applying the extracted brand style. The research focused on: (1) Google Imagen API via Vertex AI and Gemini API for image generation, (2) Vercel AI SDK's generateImage function with @ai-sdk/google provider, (3) style reference and subject customization capabilities, (4) optimistic UI patterns for immediate canvas feedback, and (5) generation history management.

Google Imagen 4 is the current production model (imagen-4.0-generate-001), offering text-to-image generation with 1-4 variations per request. For brand style application, Imagen 3 Customization (imagen-3.0-capability-001) supports style and subject reference using reference images linked in prompts via `[referenceId]` markers. The AI SDK provides a unified `generateImage` function that works with Google/Imagen models, supporting aspect ratios, seed for reproducibility, and batch generation.

The project already has @ai-sdk/google installed and working with Gemini for chat/style extraction. Generation should use the same SDK for consistency. For optimistic UI, generation creates a placeholder node on canvas immediately, then updates with the real image upon completion.

**Primary recommendation:** Use Vercel AI SDK's `generateImage` with @ai-sdk/google for Imagen 4 text-to-image generation. Build a generate API route that accepts prompt + brandId, retrieves brand style, constructs style-enhanced prompt, generates 2-4 variations, stores to R2, creates asset/generation records, and returns URLs. For style application, prepend extracted brand style keywords to the user's prompt.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.73 | AI SDK core (installed) | Unified generateImage API across providers |
| `@ai-sdk/google` | ^3.0.21 | Google provider (installed) | Imagen model access, already configured |
| `zustand` | ^5.0.11 | Generation state (installed) | generation-store.ts already scaffolded |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | ^3.x | Input validation | Validate generation requests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @ai-sdk/google | @google/genai directly | AI SDK provides abstraction, consistent with chat; direct SDK needed for style reference |
| Imagen 4 | DALL-E 3 | Imagen is project requirement per GEN-06 |
| generateImage | Custom REST calls | AI SDK handles auth, retries, response parsing |

**Installation:**
```bash
# Already installed - no new packages needed for basic generation
# For advanced style reference, may need @google/genai for direct API access
npm install @google/genai
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       ├── generate/
│       │   └── route.ts              # NEW: Generation API endpoint
│       └── generations/
│           └── [brandId]/
│               └── route.ts          # NEW: History list endpoint
├── components/
│   └── canvas/
│       ├── generation-placeholder.tsx  # NEW: Loading placeholder node
│       └── generation-toolbar.tsx      # NEW: Generate button/controls
│   └── chat/
│       └── generation-trigger.tsx      # NEW: Detect generate intent in chat
├── lib/
│   ├── ai/
│   │   ├── imagen.ts                 # NEW: Imagen generation logic
│   │   ├── prompt-builder.ts         # NEW: Brand style prompt construction
│   │   └── style-extraction.ts       # Existing
│   └── db/
│       └── queries/
│           └── generations.ts        # NEW: Generation CRUD queries
└── stores/
    └── generation-store.ts           # Existing, extend for optimistic UI
```

### Pattern 1: Style-Enhanced Prompt Construction
**What:** Prepend extracted brand style to user prompt for consistent generation
**When to use:** Every generation request
**Example:**
```typescript
// lib/ai/prompt-builder.ts
import type { ExtractedStyleData } from '@/types/brand';

export function buildStyledPrompt(
  userPrompt: string,
  style: ExtractedStyleData | undefined
): string {
  if (!style) return userPrompt;

  // Extract key style descriptors
  const styleKeywords = style.mood.keywords.join(', ');
  const colorDescription = `using ${style.mood.tone} tones with colors like ${style.colors.primary}`;
  const visualStyle = `${style.visualStyle.complexity} design with ${style.visualStyle.contrast} contrast`;

  // Construct enhanced prompt
  return `${userPrompt}. Style: ${styleKeywords}. ${colorDescription}. ${visualStyle}. ${style.mood.primary} mood.`;
}

// Example output:
// "A mountain landscape. Style: modern, clean, minimal. using warm tones with colors like #2563EB. minimal design with high contrast. energetic mood."
```

### Pattern 2: Generation API Route
**What:** Server route that handles generation requests with brand context
**When to use:** All generation requests (chat or toolbar)
**Example:**
```typescript
// app/api/generate/route.ts
import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brands, generations, assets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { buildStyledPrompt } from '@/lib/ai/prompt-builder';
import { uploadGeneratedImage } from '@/lib/storage/r2';

export async function POST(req: Request) {
  try {
    const { prompt, brandId, count = 4, aspectRatio = '1:1' } = await req.json();

    // Validate daily limit (server-side enforcement)
    // TODO: Implement per-user rate limiting

    // Fetch brand style
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId));

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Build styled prompt
    const styledPrompt = buildStyledPrompt(prompt, brand.style?.extractedStyle);

    // Create generation record (pending)
    const [generation] = await db
      .insert(generations)
      .values({
        brandId,
        prompt,
        status: 'processing',
        metadata: {
          model: 'imagen-4.0-generate-001',
          aspectRatio,
          styledPrompt,
        },
      })
      .returning();

    // Generate images
    const result = await generateImage({
      model: google.image('imagen-4.0-generate-001'),
      prompt: styledPrompt,
      n: Math.min(count, 4), // Imagen max is 4
      aspectRatio,
      providerOptions: {
        google: {
          personGeneration: 'allow_adult',
        },
      },
    });

    // Upload each image to R2 and create asset records
    const createdAssets = await Promise.all(
      result.images.map(async (image, index) => {
        const buffer = Buffer.from(image.base64, 'base64');
        const fileName = `gen-${generation.id}-${index}.png`;

        const { url } = await uploadGeneratedImage(buffer, brandId, fileName);

        const [asset] = await db
          .insert(assets)
          .values({
            brandId,
            generationId: generation.id,
            url,
            name: `${prompt.slice(0, 50)} - Variation ${index + 1}`,
            type: 'illustration',
          })
          .returning();

        return asset;
      })
    );

    // Update generation status
    await db
      .update(generations)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(generations.id, generation.id));

    return NextResponse.json({
      generationId: generation.id,
      assets: createdAssets,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
```

### Pattern 3: Optimistic UI with Placeholder
**What:** Add placeholder nodes to canvas immediately, replace with real images
**When to use:** When user triggers generation
**Example:**
```typescript
// components/canvas/generation-placeholder.tsx
'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Loader2 } from 'lucide-react';

interface PlaceholderData {
  prompt: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  targetUrl?: string;
}

export const PlaceholderNode = memo(function PlaceholderNode({
  data,
}: NodeProps<PlaceholderData>) {
  if (data.status === 'complete' && data.targetUrl) {
    // This will be replaced by ImageNode
    return null;
  }

  return (
    <div className="relative w-64 h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
      <span className="text-sm text-gray-500 text-center">
        {data.status === 'pending' && 'Queued...'}
        {data.status === 'generating' && 'Generating...'}
        {data.status === 'error' && 'Failed'}
      </span>
      <span className="text-xs text-gray-400 mt-1 truncate max-w-full">
        {data.prompt.slice(0, 40)}...
      </span>
      <Handle type="source" position={Position.Right} className="invisible" />
    </div>
  );
});
```

### Pattern 4: Generation Trigger from Chat
**What:** Detect generation intent in chat messages and trigger generation
**When to use:** When implementing GEN-07 (generate via chat)
**Example:**
```typescript
// lib/ai/generation-detector.ts
const GENERATION_PATTERNS = [
  /generate\s+(?:an?\s+)?(?:image|illustration|graphic)/i,
  /create\s+(?:an?\s+)?(?:image|illustration|graphic)/i,
  /make\s+(?:an?\s+)?(?:image|illustration|graphic)/i,
  /draw\s+(?:an?\s+)?(?:image|illustration|graphic)/i,
];

export function detectGenerationIntent(message: string): {
  isGeneration: boolean;
  prompt: string | null;
} {
  for (const pattern of GENERATION_PATTERNS) {
    if (pattern.test(message)) {
      // Extract the rest as the prompt
      const prompt = message
        .replace(/^(generate|create|make|draw)\s+(?:an?\s+)?(?:image|illustration|graphic)\s+(?:of\s+)?/i, '')
        .trim();

      return { isGeneration: true, prompt: prompt || null };
    }
  }

  return { isGeneration: false, prompt: null };
}
```

### Pattern 5: Generation History Query
**What:** Fetch and display generation history per brand
**When to use:** HIST-01 and HIST-02 requirements
**Example:**
```typescript
// lib/db/queries/generations.ts
import { db } from '@/lib/db';
import { generations, assets } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getGenerationHistory(brandId: string, limit = 50) {
  return db.query.generations.findMany({
    where: eq(generations.brandId, brandId),
    orderBy: [desc(generations.createdAt)],
    limit,
    with: {
      assets: true,
    },
  });
}

export async function getGeneration(id: string) {
  return db.query.generations.findFirst({
    where: eq(generations.id, id),
    with: {
      assets: true,
    },
  });
}
```

### Anti-Patterns to Avoid
- **Generating without brand context:** Always fetch and apply brand style - that's the core value proposition
- **Blocking UI during generation:** Use optimistic placeholders; generation takes 5-30 seconds
- **Storing generated images as base64:** Upload to R2 immediately, store URLs only
- **Client-side API calls to Imagen:** Always proxy through server route for security and rate limiting
- **Hardcoding prompt structure:** Make prompt builder configurable for different brand types

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image generation API | Custom fetch to Imagen | `generateImage` from AI SDK | Handles auth, retries, response parsing |
| Multiple variations | Loop with individual calls | `n` parameter in generateImage | Single API call for 1-4 images |
| Aspect ratio handling | Custom dimensions | `aspectRatio` parameter | API handles size calculations |
| Rate limiting | Manual counter | Server-side with database | Client-side is bypassable |
| Image upload after generation | Custom S3 code | Existing R2 upload helpers | Already built in Phase 3 |
| Placeholder components | Custom loading div | ReactFlow custom node | Integrates with canvas system |

**Key insight:** The AI SDK's generateImage function handles most complexity. Focus on brand style integration and UI/UX, not API mechanics.

## Common Pitfalls

### Pitfall 1: Imagen Model Version Confusion
**What goes wrong:** Using deprecated preview models that will stop working
**Why it happens:** Preview models (imagen-4.0-generate-preview-*) deprecated November 2025
**How to avoid:** Use GA models only: `imagen-4.0-generate-001`, `imagen-4.0-fast-generate-001`, or `imagen-4.0-ultra-generate-001`
**Warning signs:** Deprecation warnings, unexpected API errors

### Pitfall 2: Style Reference Not Available in @ai-sdk/google
**What goes wrong:** Trying to use referenceImages with AI SDK generateImage
**Why it happens:** AI SDK's generateImage doesn't expose Imagen's style/subject reference API
**How to avoid:** For advanced style transfer, use @google/genai directly with Imagen 3 Customization (imagen-3.0-capability-001)
**Warning signs:** Missing parameters, "unsupported feature" errors
**Recommendation:** Start with prompt-based style (Phase 5), add reference-based style in Phase 6 if needed

### Pitfall 3: Slow Generation Blocking UI
**What goes wrong:** User waits 10-30 seconds staring at spinner
**Why it happens:** Imagen generation takes 5-30 seconds per request
**How to avoid:** Optimistic UI - add placeholder immediately, update on completion
**Warning signs:** Low engagement, users leaving mid-generation

### Pitfall 4: Rate Limit Exceeded
**What goes wrong:** 429 errors, failed generations
**Why it happens:** Imagen has per-minute and daily limits by tier
**How to avoid:**
- Client-side: dailyCount in generation-store.ts (already exists)
- Server-side: Track per-brand or per-user limits in database
- Queue generations if limit approaching
**Warning signs:** Burst of failures, 429 responses

### Pitfall 5: Lost Generation Results
**What goes wrong:** Generated images not persisting
**Why it happens:** Only stored in memory, not uploaded to R2 or DB
**How to avoid:** Upload to R2 and create asset record in same transaction
**Warning signs:** Images disappear on refresh

### Pitfall 6: Prompt Injection
**What goes wrong:** User prompt overrides brand style
**Why it happens:** User includes "ignore previous instructions" or style overrides
**How to avoid:**
- Prepend style at end of prompt (harder to override)
- Consider prompt sanitization
- Use negative prompts for anti-patterns
**Warning signs:** Off-brand generations despite style being set

## Code Examples

Verified patterns from official sources:

### AI SDK generateImage Usage
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/image-generation
import { generateImage } from 'ai';
import { google } from '@ai-sdk/google';

const result = await generateImage({
  model: google.image('imagen-4.0-generate-001'),
  prompt: 'A futuristic city at sunset',
  n: 4,
  aspectRatio: '16:9',
  providerOptions: {
    google: {
      personGeneration: 'allow_adult',
    },
  },
});

// Access generated images
for (const image of result.images) {
  // image.base64 - base64 encoded image data
  // image.uint8Array - binary data
}
```

### Imagen Provider Options
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/image-generation
// Available aspectRatio values for Imagen:
// '1:1', '3:4', '4:3', '9:16', '16:9'

// Provider-specific options:
providerOptions: {
  google: {
    personGeneration: 'allow_adult', // 'dont_allow' | 'allow_adult' | 'allow_all'
    // Note: seed is not supported with watermarking enabled (default)
  },
}
```

### Mock Generation for Development
```typescript
// lib/ai/mock-generation.ts
import { AI_CONFIG } from './config';

const MOCK_IMAGES = [
  'data:image/svg+xml;base64,...', // Placeholder SVGs
];

export async function mockGenerateImages(
  prompt: string,
  count: number
): Promise<{ images: { base64: string }[] }> {
  // Simulate generation delay
  await new Promise(resolve =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  return {
    images: Array.from({ length: count }, (_, i) => ({
      base64: generateMockSvg(prompt, i),
    })),
  };
}

function generateMockSvg(prompt: string, index: number): string {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316'];
  const color = colors[index % colors.length];
  const label = prompt.slice(0, 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="100%" height="100%" fill="${color}"/>
    <text x="50%" y="45%" font-family="sans-serif" font-size="24" fill="white"
      text-anchor="middle">Generated #${index + 1}</text>
    <text x="50%" y="55%" font-family="sans-serif" font-size="14" fill="white"
      text-anchor="middle">${label}...</text>
  </svg>`;

  return Buffer.from(svg).toString('base64');
}
```

### Generation Store Extension
```typescript
// Extend existing generation-store.ts for optimistic UI
interface GenerationState {
  // ... existing fields ...

  // NEW: Placeholder tracking for optimistic UI
  placeholders: Map<string, {
    prompt: string;
    brandId: string;
    position: { x: number; y: number };
    status: 'pending' | 'generating' | 'complete' | 'error';
  }>;

  addPlaceholder: (id: string, data: PlaceholderData) => void;
  updatePlaceholder: (id: string, status: PlaceholderStatus) => void;
  removePlaceholder: (id: string) => void;
}
```

### R2 Upload for Generated Images
```typescript
// lib/storage/r2.ts - extend with generation uploads
export async function uploadGeneratedImage(
  buffer: Buffer,
  brandId: string,
  fileName: string
): Promise<{ url: string; key: string }> {
  const key = `brands/${brandId}/generated/${Date.now()}-${fileName}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  }));

  return {
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
    key,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| REST API to Imagen | AI SDK generateImage | AI SDK 6 (2025) | Unified API, provider abstraction |
| Imagen 3 | Imagen 4 GA | November 2025 | Better quality, faster generation |
| Client-side generation | Server-side with API route | Security best practice | Protects API keys, enables rate limiting |
| Manual prompt engineering | Structured style prepending | Evolving | More consistent brand application |
| Polling for completion | Streaming/webhook patterns | Evolving | Better UX for long operations |

**Deprecated/outdated:**
- `imagen-4.0-generate-preview-*`: Deprecated November 2025, use GA models
- `imagen-3.0-generate-*`: Still works but Imagen 4 is recommended for new projects
- Direct REST API calls: Use AI SDK for abstraction unless advanced features needed

## Open Questions

Things that couldn't be fully resolved:

1. **Style Reference API Access**
   - What we know: Imagen 3 Customization supports style reference via referenceImages array
   - What's unclear: AI SDK doesn't expose this; requires @google/genai direct usage
   - Recommendation: Phase 5 uses prompt-based style injection. If results insufficient, Phase 6 can add direct API integration for style reference

2. **Sketch-to-Image Capability**
   - What we know: GEN-02 requires sketch/image input for generation
   - What's unclear: Best API for this - Imagen edit API vs. image-to-image
   - Recommendation: Research Imagen edit endpoint for Phase 5 implementation

3. **Optimal Variation Count**
   - What we know: Requirement is 2-4 variations (GEN-03)
   - What's unclear: Performance/cost tradeoff at scale
   - Recommendation: Default to 4, make configurable

4. **Server-Side Rate Limiting Implementation**
   - What we know: Daily limit of 50 is client-tracked, server enforcement needed
   - What's unclear: Per-user vs per-brand vs global limiting strategy
   - Recommendation: Start with per-brand daily limit stored in generations table count

5. **Generation Queue for High Load**
   - What we know: Imagen rate limits exist per tier
   - What's unclear: Whether to implement queue for burst traffic
   - Recommendation: Start simple (fail fast), add queue if rate limits hit frequently

## Sources

### Primary (HIGH confidence)
- [AI SDK Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation) - generateImage API, provider options
- [Gemini API Imagen Docs](https://ai.google.dev/gemini-api/docs/imagen) - Model parameters, code examples
- [Vertex AI Imagen API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api) - Complete API reference
- [AI SDK Human-in-the-Loop](https://ai-sdk.dev/cookbook/next/human-in-the-loop) - Tool approval patterns
- Existing codebase - generation-store.ts, mock.ts, R2 upload patterns

### Secondary (MEDIUM confidence)
- [Imagen Subject Customization](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/subject-customization) - Reference image API
- [Firebase AI Logic Style Customization](https://firebase.google.com/docs/ai-logic/edit-images-imagen-style-customization) - Style reference (limited platform support)
- [Google Gen AI SDK npm](https://www.npmjs.com/package/@google/genai) - Direct SDK for advanced features

### Tertiary (LOW confidence)
- WebSearch results for rate limits and quotas - varies by tier, may change

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using installed packages, verified API patterns
- Architecture: HIGH - Extends existing patterns (stores, R2 upload, API routes)
- Generation API: HIGH - Official AI SDK documentation verified
- Style application: MEDIUM - Prompt injection works but reference API would be better
- Rate limiting: LOW - Specific limits not documented, needs testing

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - Imagen API stable, watch for new models)
