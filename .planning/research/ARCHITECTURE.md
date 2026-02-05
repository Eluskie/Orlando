# Architecture Research

**Domain:** Conversational AI Design Tool with Canvas Interface
**Researched:** 2026-02-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js App Router)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Chat View  │  │ Canvas View │  │  Sidebar    │  │ Brand Mgmt  │        │
│  │  (Initial)  │→→│  (Primary)  │  │  (Float)    │  │  (Settings) │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                   │                                         │
│  ┌───────────────────────────────┴───────────────────────────────────┐     │
│  │                    STATE LAYER (Zustand Stores)                    │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │     │
│  │  │ Canvas   │  │  Chat    │  │  Brand   │  │ Generation│           │     │
│  │  │  Store   │  │  Store   │  │  Store   │  │   Store   │           │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │     │
│  └───────────────────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────────────────┤
│                          API LAYER (Route Handlers)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ /api/chat   │  │/api/generate│  │ /api/brands │  │ /api/assets │        │
│  │ (streaming) │  │ (async job) │  │   (CRUD)    │  │   (CRUD)    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┘
          │                │                │                │
┌─────────┴────────────────┴────────────────┴────────────────┴────────────────┐
│                              BACKEND SERVICES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐   │
│  │    LLM Service      │  │  Image Gen Service  │  │   Style Analysis  │   │
│  │  (Vercel AI SDK)    │  │  (Google Imagen)    │  │   (Vision API)    │   │
│  └─────────┬───────────┘  └─────────┬───────────┘  └─────────┬─────────┘   │
│            │                        │                        │              │
│  ┌─────────┴───────────┐  ┌─────────┴───────────┐           │              │
│  │  Streaming Response │  │   Job Queue (opt)   │           │              │
│  │       (SSE)         │  │   BullMQ + Redis    │           │              │
│  └─────────────────────┘  └─────────────────────┘           │              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              DATA LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   PostgreSQL     │  │   Cloudinary     │  │      Redis       │          │
│  │     (Neon)       │  │  (Asset Storage) │  │  (Queue/Cache)   │          │
│  │                  │  │                  │  │    (Optional)    │          │
│  │  - brands        │  │  - generated     │  │  - job queue     │          │
│  │  - styles        │  │    images        │  │  - session cache │          │
│  │  - generations   │  │  - uploads       │  │                  │          │
│  │  - conversations │  │  - exports       │  │                  │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Chat View | Brand creation flow, initial conversation | React components with Vercel AI SDK `useChat` |
| Canvas View | Asset display, manipulation, export | Konva.js via react-konva (or tldraw for simpler needs) |
| Floating Sidebar | Persistent chat during canvas mode | Fixed-position React component sharing chat state |
| Brand Management | Brand switching, style editing | Modal/drawer with form components |
| Canvas Store | Canvas state (objects, selection, history) | Zustand store with undo/redo middleware |
| Chat Store | Conversation history, streaming state | Zustand + React Query for server sync |
| Brand Store | Active brand, brand list, style settings | Zustand with persistence |
| Generation Store | Pending generations, completed assets | Zustand + polling/subscription |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth-related routes (future)
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts        # Streaming chat endpoint
│   │   ├── generate/
│   │   │   └── route.ts        # Image generation trigger
│   │   ├── brands/
│   │   │   └── route.ts        # Brand CRUD
│   │   ├── assets/
│   │   │   └── route.ts        # Asset management
│   │   └── styles/
│   │       └── route.ts        # Style extraction/analysis
│   ├── brand/
│   │   └── [brandId]/
│   │       └── page.tsx        # Canvas workspace per brand
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing/chat view
│
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx   # Main chat wrapper
│   │   ├── ChatMessage.tsx     # Individual message
│   │   ├── ChatInput.tsx       # Message input with actions
│   │   └── ChatSidebar.tsx     # Floating sidebar version
│   ├── canvas/
│   │   ├── Canvas.tsx          # Main canvas component
│   │   ├── CanvasToolbar.tsx   # Tools (select, pan, zoom)
│   │   ├── AssetNode.tsx       # Individual asset on canvas
│   │   └── CanvasControls.tsx  # Zoom, export, etc.
│   ├── brand/
│   │   ├── BrandSelector.tsx   # Switch between brands
│   │   ├── StyleEditor.tsx     # Edit brand style JSON
│   │   └── BrandCard.tsx       # Brand preview card
│   ├── generation/
│   │   ├── GenerationCard.tsx  # Generation preview/status
│   │   ├── GenerationQueue.tsx # Pending generations list
│   │   └── AssetPreview.tsx    # Generated asset preview
│   └── ui/                     # Shared UI components
│
├── lib/
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── index.ts            # Database client
│   │   └── migrations/         # Drizzle migrations
│   ├── ai/
│   │   ├── chat.ts             # Chat/LLM utilities
│   │   ├── imagen.ts           # Google Imagen integration
│   │   └── vision.ts           # Style extraction logic
│   ├── storage/
│   │   └── cloudinary.ts       # Asset upload/retrieval
│   └── utils/
│       └── canvas.ts           # Canvas-related utilities
│
├── stores/
│   ├── canvas-store.ts         # Canvas state (Zustand)
│   ├── chat-store.ts           # Chat state
│   ├── brand-store.ts          # Brand/style state
│   └── generation-store.ts     # Generation queue state
│
├── types/
│   ├── brand.ts                # Brand/style types
│   ├── canvas.ts               # Canvas object types
│   ├── generation.ts           # Generation types
│   └── chat.ts                 # Chat/message types
│
└── hooks/
    ├── use-canvas.ts           # Canvas operations hook
    ├── use-brand.ts            # Brand operations hook
    └── use-generation.ts       # Generation polling/status hook
```

### Structure Rationale

- **app/**: Next.js App Router for file-based routing with React Server Components
- **components/**: Feature-grouped components (chat, canvas, brand, generation) for clear ownership
- **lib/**: Non-React code - database, AI integrations, utilities
- **stores/**: Zustand stores separated by domain for maintainability
- **types/**: Shared TypeScript types across the application
- **hooks/**: Custom hooks that compose store logic with side effects

## Architectural Patterns

### Pattern 1: Dual View with Shared State

**What:** Chat view and Canvas view share underlying state through Zustand stores, allowing seamless transition between modes while preserving context.

**When to use:** When users need to switch between conversational and visual interfaces while maintaining continuity.

**Trade-offs:**
- PRO: Seamless UX, no data loss on view switch
- PRO: Chat sidebar in canvas mode uses same state
- CON: More complex state design upfront

**Example:**
```typescript
// stores/chat-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  activeBrandId: string | null;
  addMessage: (message: Message) => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,
      activeBrandId: null,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setStreaming: (isStreaming) => set({ isStreaming }),
    }),
    { name: 'chat-storage' }
  )
);

// Both ChatView and ChatSidebar use the same store
```

### Pattern 2: Optimistic UI with Background Jobs

**What:** For AI image generation, immediately show a "generating" placeholder on canvas while the actual generation happens asynchronously. Poll for completion or use webhooks.

**When to use:** When AI operations take 5-30+ seconds (image generation with Imagen).

**Trade-offs:**
- PRO: UI feels responsive despite slow AI operations
- PRO: Users can continue working while generation happens
- CON: Need to handle failure states gracefully
- CON: Polling adds complexity (webhooks better at scale)

**Example:**
```typescript
// Trigger generation - returns immediately with job ID
const triggerGeneration = async (prompt: string, brandId: string) => {
  const { jobId } = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, brandId }),
  }).then(r => r.json());

  // Add optimistic placeholder to canvas
  addToCanvas({
    id: jobId,
    type: 'generation',
    status: 'pending',
    prompt,
  });

  return jobId;
};

// Poll for completion
const useGenerationStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['generation', jobId],
    queryFn: () => fetch(`/api/generate/${jobId}`).then(r => r.json()),
    refetchInterval: (data) => data?.status === 'completed' ? false : 2000,
  });
};
```

### Pattern 3: Streaming Chat with Tool Calls

**What:** Use Vercel AI SDK's `useChat` hook for streaming responses, with tool calls for structured actions (e.g., "create brand", "generate image").

**When to use:** Conversational AI interface where responses should stream and may trigger actions.

**Trade-offs:**
- PRO: Great UX with streaming text
- PRO: Tool calls enable structured AI-to-action flow
- PRO: Vercel AI SDK handles complexity
- CON: Requires understanding of tool call patterns

**Example:**
```typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      createBrand: tool({
        description: 'Create a new brand with the given name and style',
        parameters: z.object({
          name: z.string(),
          style: z.object({
            primaryColor: z.string(),
            fontFamily: z.string(),
            tone: z.string(),
          }),
        }),
        execute: async ({ name, style }) => {
          // Insert brand into database
          const brand = await db.insert(brands).values({ name, style }).returning();
          return { brandId: brand[0].id };
        },
      }),
      generateAsset: tool({
        description: 'Generate an image asset for the brand',
        parameters: z.object({
          prompt: z.string(),
          brandId: z.string(),
          assetType: z.enum(['logo', 'banner', 'social']),
        }),
        execute: async ({ prompt, brandId, assetType }) => {
          // Queue generation job
          const job = await queueGeneration({ prompt, brandId, assetType });
          return { jobId: job.id, status: 'queued' };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

### Pattern 4: Canvas State with History (Undo/Redo)

**What:** Canvas state managed in Zustand with temporal middleware for undo/redo support.

**When to use:** Any canvas application where users manipulate objects.

**Trade-offs:**
- PRO: Full undo/redo with minimal code
- PRO: Integrates well with React
- CON: Memory grows with history length (cap it)

**Example:**
```typescript
// stores/canvas-store.ts
import { create } from 'zustand';
import { temporal } from 'zundo';

interface CanvasObject {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  data: Record<string, unknown>;
}

interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  setSelection: (ids: string[]) => void;
}

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set) => ({
      objects: [],
      selectedIds: [],
      addObject: (obj) =>
        set((state) => ({ objects: [...state.objects, obj] })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...updates } : obj
          ),
        })),
      removeObject: (id) =>
        set((state) => ({
          objects: state.objects.filter((obj) => obj.id !== id),
        })),
      setSelection: (ids) => set({ selectedIds: ids }),
    }),
    { limit: 50 } // Keep last 50 states for undo
  )
);

// Usage: useCanvasStore.temporal.getState().undo()
```

## Data Flow

### Request Flow (Chat to Generation)

```
User types message
    ↓
ChatInput component → onSubmit
    ↓
useChat hook → POST /api/chat (streaming)
    ↓
LLM processes → streams response tokens → ChatMessage renders progressively
    ↓
LLM invokes tool (e.g., generateAsset)
    ↓
Tool execution:
    - Insert generation record (status: pending)
    - Call Google Imagen API (async)
    - Return jobId to stream
    ↓
Frontend receives tool result → adds placeholder to canvas
    ↓
Polling: GET /api/generate/[jobId] every 2-3s
    ↓
Imagen completes → webhook or poll detects completion
    ↓
Upload result to Cloudinary → update generation record
    ↓
Poll returns completed status with asset URL
    ↓
Canvas updates placeholder → real image
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                              │
└─────────────────────────────────────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ↓                   ↓                   ↓
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Chat Action │    │Canvas Action│    │Brand Action │
    │ (send msg)  │    │ (move obj)  │    │(switch brand)│
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                   │
           ↓                  ↓                   ↓
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Chat Store  │    │Canvas Store │    │ Brand Store │
    │ (Zustand)   │    │ (Zustand +  │    │ (Zustand +  │
    │             │    │  temporal)  │    │  persist)   │
    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
           │                  │                   │
           │    ┌─────────────┴───────────────────┤
           │    ↓                                 │
           │  Local state update (immediate)      │
           │    ↓                                 │
           │  React components re-render          │
           ↓                                      ↓
    ┌─────────────────────────────────────────────────┐
    │             SERVER SYNC (async)                  │
    │  - POST /api/chat (streaming)                   │
    │  - PUT /api/canvas/[brandId] (debounced save)   │
    │  - Database persistence                         │
    └─────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Chat → Brand Creation:** User describes brand → LLM extracts style → tool creates brand → navigate to canvas
2. **Chat → Generation:** User requests asset → LLM generates prompt → tool queues generation → optimistic canvas update → poll → final update
3. **Upload → Style Extraction:** User uploads reference image → Vision API analyzes → extract colors/fonts/tone → store as brand style JSON
4. **Canvas → Export:** User selects assets → triggers export → Cloudinary/local processing → download

## Database Schema (Drizzle ORM)

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, jsonb, uuid, integer } from 'drizzle-orm/pg-core';

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  style: jsonb('style').$type<BrandStyle>().notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }),
  messages: jsonb('messages').$type<Message[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const generations = pgTable('generations', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  prompt: text('prompt').notNull(),
  enhancedPrompt: text('enhanced_prompt'), // AI-enhanced version
  status: text('status').$type<'pending' | 'processing' | 'completed' | 'failed'>().notNull().default('pending'),
  assetType: text('asset_type').$type<'logo' | 'banner' | 'social' | 'custom'>().notNull(),
  assetUrl: text('asset_url'), // Cloudinary URL when completed
  metadata: jsonb('metadata').$type<GenerationMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  generationId: uuid('generation_id').references(() => generations.id),
  name: text('name').notNull(),
  type: text('type').$type<'generated' | 'uploaded'>().notNull(),
  url: text('url').notNull(), // Cloudinary URL
  thumbnailUrl: text('thumbnail_url'),
  canvasPosition: jsonb('canvas_position').$type<{ x: number; y: number; width: number; height: number }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types
interface BrandStyle {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headingFont?: string;
  tone?: string;
  keywords?: string[];
  referenceImages?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

interface GenerationMetadata {
  model?: string;
  seed?: number;
  negativePrompt?: string;
  aspectRatio?: string;
}
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 users | Monolith is fine. Polling for generations. No Redis needed. |
| 100-1k users | Add Redis for job queue (BullMQ). Consider Cloudinary for CDN. |
| 1k-10k users | Move generation workers to separate service. Add caching layer. |
| 10k+ users | Webhooks instead of polling. Consider edge deployment. Rate limiting. |

### Scaling Priorities

1. **First bottleneck:** Image generation API rate limits and latency. Mitigation: Queue with concurrency control, user-facing generation limits.
2. **Second bottleneck:** Database connections on serverless. Mitigation: Connection pooling (Neon handles this), or Prisma Accelerate.
3. **Third bottleneck:** Asset storage/delivery. Mitigation: Cloudinary CDN handles this well.

## Anti-Patterns

### Anti-Pattern 1: Polling Without Limits

**What people do:** Poll for generation status indefinitely at high frequency.
**Why it's wrong:** Wastes resources, can DDoS your own API, poor UX if generation fails silently.
**Do this instead:** Exponential backoff, maximum attempts, clear timeout with user notification.

### Anti-Pattern 2: Storing Images in Database

**What people do:** Store base64 image data directly in PostgreSQL.
**Why it's wrong:** Bloats database, slow queries, expensive storage.
**Do this instead:** Store in Cloudinary/S3, keep only URLs in database.

### Anti-Pattern 3: Blocking on AI Generation

**What people do:** Make the API route wait for Imagen to complete before responding.
**Why it's wrong:** Serverless timeout (typically 10-60s), terrible UX, wasted compute.
**Do this instead:** Return immediately with job ID, use async job processing.

### Anti-Pattern 4: Single Global Canvas State

**What people do:** One canvas store shared across all brands.
**Why it's wrong:** State bleeds between brands, complex cleanup logic, bugs.
**Do this instead:** Canvas state keyed by brandId, or separate store instances.

### Anti-Pattern 5: Chat History in Local Storage Only

**What people do:** Rely solely on localStorage for conversation persistence.
**Why it's wrong:** Lost on clear, not synced across devices, limited size.
**Do this instead:** Persist to database, use localStorage as cache only.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Imagen API | REST API via Vertex AI SDK | Async generation, returns base64. Upload result to Cloudinary. |
| OpenAI/Anthropic | Vercel AI SDK streaming | Chat completions with tool calls. |
| Cloudinary | REST API + Node SDK | Asset upload, transformation, CDN delivery. |
| Neon PostgreSQL | Drizzle ORM over HTTP | Serverless-friendly, connection pooling built-in. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Chat ↔ Canvas | Zustand stores | Shared state, no API calls between views |
| Frontend ↔ Backend | Next.js API routes | Server Actions for mutations, API routes for streaming/polling |
| Backend ↔ AI Services | REST/SDK | Abstract behind service layer in `lib/ai/` |
| Backend ↔ Storage | SDK | Abstract behind service layer in `lib/storage/` |

## Build Order Recommendations

Based on dependencies and incremental value delivery:

### Phase 1: Foundation (Build First)
1. **Database schema** - Everything depends on data models
2. **Basic Next.js structure** - App Router, layouts, routing
3. **Brand CRUD** - Simple starting point, needed for everything else

### Phase 2: Chat Core
4. **Chat UI components** - ChatInput, ChatMessage, ChatContainer
5. **Chat API with streaming** - `/api/chat` with Vercel AI SDK
6. **Chat state management** - Zustand store, persistence

### Phase 3: Canvas Core
7. **Canvas component** - react-konva setup, basic rendering
8. **Canvas state management** - Zustand with undo/redo
9. **Asset display on canvas** - Render images from URLs

### Phase 4: AI Generation
10. **Imagen integration** - API wrapper, prompt enhancement
11. **Generation queue** - Job status tracking, polling
12. **Optimistic canvas updates** - Placeholders, status indicators

### Phase 5: Integration
13. **Tool calls in chat** - Connect chat to brand creation, generation
14. **Chat sidebar in canvas** - Floating persistent chat
15. **Style extraction** - Upload analysis (can be deferred)

### Phase 6: Polish
16. **Export functionality** - Download assets
17. **Error handling** - Failed generations, retries
18. **Loading states** - Skeletons, progress indicators

## Canvas Library Recommendation

**Recommendation: Konva.js via react-konva**

**Why:**
- First-class React support with declarative API
- Excellent performance with dirty region detection
- Good documentation and active maintenance
- Suitable complexity level for asset manipulation (not overkill like tldraw for this use case)
- Easy object manipulation (drag, resize, rotate)

**Alternative considered:**
- **tldraw** - More powerful for whiteboard-style apps, but heavier and more complex than needed for asset gallery/canvas
- **Fabric.js** - Strong feature set but weaker React integration
- **Raw Canvas API** - Too low-level, reinventing the wheel

**Example setup:**
```typescript
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';

function AssetNode({ asset, isSelected, onSelect, onChange }) {
  const [image] = useImage(asset.url);

  return (
    <Image
      image={image}
      x={asset.x}
      y={asset.y}
      width={asset.width}
      height={asset.height}
      draggable
      onClick={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
```

## Async AI Operations Strategy

**Recommended approach: Polling with timeout (MVP) → Webhooks (scale)**

### MVP: Polling

```typescript
// Simple polling pattern for single user
const useGenerationPolling = (jobId: string) => {
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 60; // 2 minutes at 2s intervals

  useEffect(() => {
    if (!jobId || status !== 'pending') return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/generate/${jobId}`);
      const data = await res.json();

      if (data.status === 'completed' || data.status === 'failed') {
        setStatus(data.status);
        clearInterval(interval);
      } else if (attempts >= MAX_ATTEMPTS) {
        setStatus('failed');
        clearInterval(interval);
      }
      setAttempts(a => a + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status, attempts]);

  return status;
};
```

### Scale: Job Queue + Webhooks

```typescript
// BullMQ worker (separate process or serverless function)
import { Worker } from 'bullmq';

const worker = new Worker('image-generation', async (job) => {
  const { prompt, brandId, generationId } = job.data;

  // Call Imagen API
  const result = await generateImage(prompt);

  // Upload to Cloudinary
  const assetUrl = await uploadToCloudinary(result.imageData);

  // Update database
  await db.update(generations)
    .set({ status: 'completed', assetUrl })
    .where(eq(generations.id, generationId));

  // Trigger webhook/SSE notification
  await notifyClient(generationId, 'completed', assetUrl);
}, { connection: redis });
```

## Sources

### Canvas Libraries
- [tldraw SDK](https://tldraw.dev/) - Infinite canvas architecture patterns
- [react-konva](https://konvajs.org/docs/react/index.html) - React canvas library
- [Konva.js vs Fabric.js comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan)

### AI Integration
- [Vercel AI SDK Guide](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Streaming chat patterns
- [Google Imagen API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api) - Image generation
- [Next.js Backend for Conversational AI 2026](https://www.sashido.io/en/blog/nextjs-backend-conversational-ai-2026)

### State Management
- [React State Management 2025](https://dev.to/rayan2228/state-management-in-react-2025-exploring-modern-solutions-5f9c)
- [Zustand with React](https://github.com/pmndrs/zustand)

### Job Queues
- [BullMQ Architecture](https://docs.bullmq.io/guide/architecture)
- [BullMQ Image Processing Example](https://medium.com/@sanipatel0401/building-scalable-job-queues-with-bullmq-a-complete-guide-with-image-processing-example-88c58b550cb8)

### Database
- [Drizzle ORM PostgreSQL Best Practices 2025](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717)
- [Drizzle Relations](https://orm.drizzle.team/docs/relations-v2)

### UI Patterns
- [Design Patterns for AI Interfaces](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/)
- [AI UI Placement Patterns](https://uxdesign.cc/where-should-ai-sit-in-your-ui-1710a258390e)
- [Next.js App Router vs Pages Router 2025](https://kitemetric.com/blogs/next-js-routing-in-2025-app-router-vs-pages-router)

### Asset Storage
- [Cloudinary vs S3](https://cloudinary.com/guides/ecosystems/cloudinary-vs-s3)

---
*Architecture research for: Conversational AI Design Tool with Canvas Interface*
*Researched: 2026-02-06*
