# Phase 3: Style Extraction - Research

**Researched:** 2026-02-07
**Domain:** Image upload, Vision AI analysis, structured style extraction, reference storage
**Confidence:** HIGH

## Summary

This phase enables users to upload reference images via chat and have AI extract structured style data (colors, typography hints, mood, keywords) into a JSON format that can be stored with the brand and used for consistent generation. The research focused on: (1) image upload patterns with AI SDK v6 useChat attachments, (2) Gemini 2.5 Flash multimodal vision for style analysis, (3) Vercel Blob for persistent image storage, (4) structured output with Zod schemas, and (5) displaying extracted style as visual feedback.

The AI SDK v6 provides native multi-modal message support through the `parts` array, automatically converting images to data URLs via `sendMessage({ files })`. Gemini 2.5 Flash excels at image understanding and can extract colors, mood, and visual characteristics through targeted prompts. For structured output, the AI SDK's `Output.object({ schema })` with Zod ensures type-safe JSON extraction. Vercel Blob provides simple, cost-effective persistent storage for reference images.

**Primary recommendation:** Use AI SDK's native file attachment support with `sendMessage({ files })`, Gemini 2.5 Flash for vision analysis with structured output via `Output.object()`, and Vercel Blob for persistent reference image storage. Extract style as a well-defined JSON schema that extends the existing `BrandStyle` type.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.73 | AI SDK core (installed) | Native multi-modal support, structured output |
| `@ai-sdk/google` | ^3.0.21 | Gemini provider (installed) | Vision API, structured JSON output |
| `@vercel/blob` | ^1.x | Blob storage | Official Vercel storage, simple API |
| `zod` | ^3.x | Schema validation | AI SDK integration, type inference |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `color-thief` | ^2.x | Client-side color extraction | Fallback/preview before AI analysis |
| `extract-colors` | ^4.x | Lightweight color extraction | Alternative to color-thief, smaller |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel Blob | Cloudinary | More features but added complexity; Blob is simpler |
| Vercel Blob | AWS S3 | More control but requires more setup; Blob integrates natively |
| Gemini structured output | Manual JSON parsing | Unreliable; structured output guarantees valid schema |
| color-thief | Pure AI extraction | AI handles it; client-side extraction only for instant preview |

**Installation:**
```bash
npm install @vercel/blob zod
```

Note: `ai` and `@ai-sdk/google` already installed. Color extraction libraries optional for client-side preview.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts          # Updated: handle image parts
│       └── upload/
│           └── route.ts          # NEW: Vercel Blob upload handler
├── components/
│   └── chat/
│       ├── chat-input.tsx        # Updated: file attachment UI
│       ├── message-item.tsx      # Updated: render image parts
│       └── style-extraction-card.tsx  # NEW: extraction feedback UI
├── lib/
│   ├── ai/
│   │   ├── style-extraction.ts   # NEW: extraction prompts/schemas
│   │   └── chat.ts               # Updated: system prompt for extraction
│   └── storage/
│       └── blob.ts               # NEW: Vercel Blob utilities
└── types/
    └── brand.ts                  # Updated: expanded BrandStyle type
```

### Pattern 1: Multi-Modal Chat with Attachments
**What:** Use AI SDK's native file attachment support in useChat
**When to use:** All image upload interactions
**Example:**
```typescript
// Source: https://ai-sdk.dev/cookbook/guides/multi-modal-chatbot
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';

export function ChatInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, status } = useChat();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="text"]') as HTMLInputElement;
    const files = fileInputRef.current?.files;

    await sendMessage({
      text: input.value,
      files: files || undefined, // FileList automatically converted to data URLs
    });

    input.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" ref={fileInputRef} accept="image/*" multiple />
      <input type="text" placeholder="Describe your brand..." />
      <button type="submit" disabled={status !== 'ready'}>Send</button>
    </form>
  );
}
```

### Pattern 2: Server-Side Image Handling with Vision
**What:** Process image parts on server, analyze with Gemini Vision
**When to use:** /api/chat route when images are present
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
import { streamText, convertToModelMessages, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Gemini 2.5 Flash recommended (2.0 deprecated March 2026)
const model = google('gemini-2.5-flash');

export async function POST(req: Request) {
  const { messages } = await req.json();

  // convertToModelMessages handles image parts automatically
  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
    system: STYLE_EXTRACTION_PROMPT,
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 3: Structured Style Extraction
**What:** Use AI SDK Output.object() with Zod schema for type-safe extraction
**When to use:** When extracting style from reference images
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Style extraction schema
const StyleExtractionSchema = z.object({
  colors: z.object({
    primary: z.string().describe('Main dominant color as hex code'),
    secondary: z.string().describe('Secondary color as hex code'),
    accent: z.string().describe('Accent/highlight color as hex code'),
    neutral: z.string().describe('Background/neutral color as hex code'),
  }),
  typography: z.object({
    style: z.enum(['serif', 'sans-serif', 'display', 'handwritten', 'monospace'])
      .describe('Overall typography style detected'),
    weight: z.enum(['light', 'regular', 'medium', 'bold', 'heavy'])
      .describe('Dominant font weight'),
    mood: z.string().describe('Typography mood: modern, classic, playful, etc.'),
  }),
  mood: z.object({
    primary: z.string().describe('Primary mood/feeling: energetic, calm, luxurious, etc.'),
    keywords: z.array(z.string()).describe('3-5 descriptive keywords'),
    tone: z.enum(['warm', 'cool', 'neutral']).describe('Overall color temperature'),
  }),
  visualStyle: z.object({
    complexity: z.enum(['minimal', 'moderate', 'detailed', 'ornate']),
    contrast: z.enum(['low', 'medium', 'high']),
    texture: z.string().describe('Texture quality: smooth, grainy, organic, etc.'),
  }),
  confidence: z.number().min(0).max(1).describe('Extraction confidence 0-1'),
});

export type ExtractedStyle = z.infer<typeof StyleExtractionSchema>;

async function extractStyleFromImage(imageDataUrl: string): Promise<ExtractedStyle> {
  const { output } = await generateText({
    model: google('gemini-2.5-flash'),
    output: Output.object({ schema: StyleExtractionSchema }),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            image: imageDataUrl,
          },
          {
            type: 'text',
            text: `Analyze this reference image and extract the visual style characteristics.
                   Focus on: dominant colors (as hex codes), typography style if visible,
                   overall mood and feeling, and visual complexity.
                   Be specific and precise with color values.`,
          },
        ],
      },
    ],
  });

  return output;
}
```

### Pattern 4: Vercel Blob Upload Handler
**What:** Server-side upload handler for persistent image storage
**When to use:** After style extraction, store references permanently
**Example:**
```typescript
// Source: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const brandId = formData.get('brandId') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Vercel Blob with brand-specific path
  const blob = await put(`brands/${brandId}/references/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true, // Prevent conflicts
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
  });
}
```

### Pattern 5: Rendering Image Parts in Messages
**What:** Display uploaded images in chat messages
**When to use:** MessageItem component for image parts
**Example:**
```typescript
// Source: https://ai-sdk.dev/cookbook/guides/multi-modal-chatbot
import Image from 'next/image';
import type { UIMessage } from 'ai';

function MessageContent({ message }: { message: UIMessage }) {
  return (
    <div className="space-y-2">
      {message.parts.map((part, index) => {
        if (part.type === 'text') {
          return <ReactMarkdown key={index}>{part.text}</ReactMarkdown>;
        }
        if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
          return (
            <div key={index} className="rounded-lg overflow-hidden max-w-xs">
              <Image
                src={part.url}
                width={300}
                height={300}
                alt={`Reference ${index + 1}`}
                className="object-cover"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Storing images as base64 in database:** Use Blob storage URLs instead; base64 bloats the DB
- **Processing images client-side for style extraction:** AI does better; client extraction only for preview
- **Ignoring Gemini 2.0 deprecation:** Use Gemini 2.5 Flash; 2.0 is deprecated March 2026
- **Manual JSON parsing from AI:** Use Output.object() with Zod for guaranteed schema compliance
- **Large file uploads without multipart:** Use multipart: true for files > 5MB

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color extraction | Custom canvas pixel analysis | Gemini Vision + structured output | AI understands context, not just pixels |
| File to data URL conversion | FileReader boilerplate | AI SDK sendMessage({ files }) | Automatic conversion handled |
| Image storage | Local filesystem or base64 DB | Vercel Blob | Global CDN, automatic cleanup, managed |
| JSON validation | try/catch JSON.parse | Zod + Output.object() | Type-safe, validated at generation time |
| Multiple image handling | Custom file management | AI SDK parts array | Native multi-file support |
| Upload progress | Custom XHR | Blob onUploadProgress callback | Built-in progress tracking |

**Key insight:** The AI SDK v6 treats multi-modal content as first-class. Images flow through the same message pipeline as text. Don't build parallel upload systems.

## Common Pitfalls

### Pitfall 1: Gemini 2.0 Flash Deprecation
**What goes wrong:** Using gemini-2.0-flash which is deprecated March 31, 2026
**Why it happens:** Project currently uses gemini-2.0-flash
**How to avoid:** Update to gemini-2.5-flash which has better vision capabilities
**Warning signs:** Deprecation warnings in console

### Pitfall 2: Data URL Size Limits
**What goes wrong:** Large images fail to send as data URLs
**Why it happens:** Base64 encoding increases size ~33%, browser limits vary
**How to avoid:** Compress images client-side before upload; limit to 5MB; use Blob for storage
**Warning signs:** Failed message sends, timeouts

### Pitfall 3: Inconsistent Style Extraction
**What goes wrong:** Different images produce wildly different style values
**Why it happens:** AI interprets each image independently
**How to avoid:** Process multiple images together, aggregate results, use confidence scores
**Warning signs:** Brand style that doesn't feel cohesive

### Pitfall 4: Missing Image Persistence
**What goes wrong:** Reference images lost after session
**Why it happens:** Only stored as data URLs in messages, not persisted
**How to avoid:** Upload to Vercel Blob after extraction, store URLs in brand record
**Warning signs:** Empty moodboard after refresh

### Pitfall 5: Blocking UI During Extraction
**What goes wrong:** UI freezes while processing images
**Why it happens:** Synchronous extraction without loading states
**How to avoid:** Use streaming for feedback, show extraction progress card
**Warning signs:** Unresponsive UI, users abandoning

## Code Examples

Verified patterns from official sources:

### Extended BrandStyle Type
```typescript
// types/brand.ts
export interface BrandStyle {
  // Existing (from Phase 2)
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headingFont?: string;
  tone?: string;
  keywords?: string[];
  referenceImages?: string[];  // Blob URLs

  // NEW: Extracted style data
  extractedStyle?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      neutral: string;
    };
    typography: {
      style: 'serif' | 'sans-serif' | 'display' | 'handwritten' | 'monospace';
      weight: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
      mood: string;
    };
    mood: {
      primary: string;
      keywords: string[];
      tone: 'warm' | 'cool' | 'neutral';
    };
    visualStyle: {
      complexity: 'minimal' | 'moderate' | 'detailed' | 'ornate';
      contrast: 'low' | 'medium' | 'high';
      texture: string;
    };
    confidence: number;
    extractedAt: string;  // ISO timestamp
    sourceImages: string[];  // URLs of images used
  };
}
```

### Style Extraction System Prompt
```typescript
// lib/ai/style-extraction.ts
export const STYLE_EXTRACTION_PROMPT = `You are Dobra's style extraction system.
When users upload reference images, analyze them to extract visual style characteristics.

For each image or set of images, identify:
1. COLOR PALETTE: Extract dominant colors as precise hex codes (#RRGGBB)
   - Primary: The main brand color
   - Secondary: Supporting color
   - Accent: Highlight/call-to-action color
   - Neutral: Background/text color

2. TYPOGRAPHY STYLE: Even without visible text, infer the typography that would match
   - Serif, sans-serif, display, handwritten, or monospace
   - Weight tendency (light to heavy)
   - Mood (modern, classic, playful, serious, etc.)

3. MOOD & FEELING:
   - Primary mood descriptor
   - 3-5 keywords that capture the brand essence
   - Color temperature (warm, cool, neutral)

4. VISUAL STYLE:
   - Complexity level
   - Contrast level
   - Texture quality

When analyzing multiple images, find common threads and prioritize consistency.
Express confidence (0-1) based on image clarity and style coherence.`;
```

### Style Extraction Card Component
```typescript
// components/chat/style-extraction-card.tsx
'use client';

import type { ExtractedStyle } from '@/lib/ai/style-extraction';

interface StyleExtractionCardProps {
  style: ExtractedStyle;
  isExtracting?: boolean;
}

export function StyleExtractionCard({ style, isExtracting }: StyleExtractionCardProps) {
  if (isExtracting) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-500">Extracting style...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <h3 className="font-medium">Extracted Style</h3>

      {/* Color Palette */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Color Palette</p>
        <div className="flex gap-2">
          {Object.entries(style.colors).map(([name, hex]) => (
            <div key={name} className="text-center">
              <div
                className="w-10 h-10 rounded-lg border"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs text-gray-500">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Keywords */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Mood</p>
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
            {style.mood.primary}
          </span>
          {style.mood.keywords.map((kw) => (
            <span key={kw} className="px-2 py-1 bg-gray-50 rounded text-xs">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-100 rounded">
          <div
            className="h-1 bg-green-500 rounded"
            style={{ width: `${style.confidence * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {Math.round(style.confidence * 100)}% confidence
        </span>
      </div>
    </div>
  );
}
```

### Chat Flow with Image Upload
```typescript
// Integrated chat input with file attachment
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import { ImagePlus, Send, X } from 'lucide-react';

export function ChatInputWithUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const { sendMessage, status } = useChat();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Generate previews
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const clearFiles = () => {
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('textarea') as HTMLTextAreaElement;
    const files = fileInputRef.current?.files;

    await sendMessage({
      text: input.value || 'Please analyze these reference images for my brand style.',
      files: files || undefined,
    });

    input.value = '';
    clearFiles();
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Preview ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg"
              />
            </div>
          ))}
          <button type="button" onClick={clearFiles} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
          <ImagePlus className="w-5 h-5 text-gray-500" />
        </label>

        <textarea
          placeholder="Describe your brand or upload references..."
          className="flex-1 resize-none border rounded-lg px-3 py-2"
          rows={1}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="p-2 bg-black text-white rounded-lg disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate upload endpoints | sendMessage({ files }) | AI SDK v5 | Unified message flow |
| generateObject() | Output.object() in generateText | AI SDK v6 | Unified API, better streaming |
| gemini-2.0-flash | gemini-2.5-flash | Early 2026 | Better vision, longer support |
| Manual base64 encoding | Automatic FileList handling | AI SDK v5 | Less boilerplate |
| localStorage for images | Vercel Blob | GA 2024 | Persistent, global CDN |

**Deprecated/outdated:**
- `generateObject()`: Use `generateText()` with `output` property
- `gemini-2.0-flash`: Deprecated March 31, 2026; use `gemini-2.5-flash`
- Inline base64 storage: Use Blob URLs for persistence
- Custom file upload handling: AI SDK handles file conversion

## Open Questions

Things that couldn't be fully resolved:

1. **Multiple Image Aggregation Strategy**
   - What we know: Gemini can process multiple images in one request
   - What's unclear: Best prompt strategy for aggregating styles from 2-3 different references
   - Recommendation: Send all images in one message, prompt for "common threads" and "weighted average"

2. **Optimal Image Compression**
   - What we know: Gemini accepts up to 20MB per request, 3600 images max
   - What's unclear: Best resolution/quality balance for style extraction
   - Recommendation: Compress to ~1MB, 1024px max dimension, JPEG at 80% quality

3. **Mock Mode for Vision**
   - What we know: Project has mock mode for text chat
   - What's unclear: How to mock vision/style extraction convincingly
   - Recommendation: Return static mock extraction data with random variations

4. **Client-Side Preview vs AI Extraction**
   - What we know: Libraries like color-thief can extract colors instantly
   - What's unclear: Whether to show instant preview then refine with AI
   - Recommendation: Optional enhancement; focus on AI extraction first

## Sources

### Primary (HIGH confidence)
- [AI SDK UI: Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) - File attachment support, parts array
- [AI SDK: Multi-Modal Chatbot Guide](https://ai-sdk.dev/cookbook/guides/multi-modal-chatbot) - Image handling patterns
- [AI SDK: Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) - Output.object() with Zod
- [Vercel Blob SDK](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk) - Upload, storage patterns
- [Gemini API: Image Understanding](https://ai.google.dev/gemini-api/docs/vision) - Vision capabilities

### Secondary (MEDIUM confidence)
- [Gemini Models](https://ai.google.dev/gemini-api/docs/models) - 2.0 deprecation, 2.5 features
- [Firebase AI Logic: Structured Output](https://firebase.google.com/docs/ai-logic/generate-structured-output) - Schema patterns
- [Design Tokens Specification](https://www.designtokens.org/tr/drafts/format/) - Style schema patterns

### Tertiary (LOW confidence)
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/) - Client-side color extraction (optional)
- WebSearch results for style JSON patterns - Community patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official AI SDK docs, Vercel Blob docs, installed packages
- Architecture: HIGH - Verified patterns from official documentation
- Style schema: MEDIUM - Based on design token standards + AI extraction capabilities
- Pitfalls: HIGH - Documented deprecation, verified size limits

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - AI SDK stable, Gemini 2.0 deprecation noted)
