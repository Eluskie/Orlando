# Stack Research

**Domain:** AI-powered conversational design tool with canvas interface
**Researched:** 2026-02-06
**Confidence:** HIGH (core stack), MEDIUM (canvas library selection)

## Executive Summary

This stack powers a conversational AI design tool combining chat-first UX with spatial canvas workspace for brand style extraction and asset generation. The recommendations prioritize:
1. **Developer velocity** - Modern tooling with excellent TypeScript support
2. **Performance** - Canvas rendering and AI streaming without jank
3. **Future-proofing** - Real-time collaboration readiness

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5+ | Full-stack framework | App Router is stable with React 19, typed routes, Turbopack build times. Industry standard for AI products. Server Actions reduce boilerplate. |
| React | 19.x | UI library | Concurrent features, Server Components for initial load, stable with Next.js 15.1+. |
| TypeScript | 5.x | Type safety | Non-negotiable for complex canvas state and AI integration. Drizzle/Zustand/AI SDK all type-safe. |

**Confidence: HIGH** - Verified via [Next.js 15.5 blog](https://nextjs.org/blog/next-15-5), [Next.js releases](https://github.com/vercel/next.js/releases)

### Canvas Library

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Konva + react-konva | 19.2.x | Canvas rendering | Best balance of flexibility and performance for custom design tools. Scene graph architecture, layer-based rendering, dirty region detection. Lower-level than tldraw (more control), higher-level than raw canvas. |

**Why Konva over alternatives:**

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **Konva** | RECOMMENDED | Scene graph architecture suits asset placement/manipulation. React integration via react-konva. Memory management superior to Fabric.js. Free, MIT license. |
| tldraw | CONSIDERED | Higher-level, faster to prototype. BUT: "Made with tldraw" watermark without business license. Less control for custom brand asset workflows. |
| Fabric.js | REJECTED | Manual memory management, larger bundle, React integration requires more work. Better for pure image editors. |
| React Flow | REJECTED | Optimized for node-based diagrams/workflows, not spatial canvas design. Wrong tool for asset placement. |
| Excalidraw | REJECTED | Hand-drawn aesthetic is core to the library. Wrong visual language for brand design tool. |

**Confidence: MEDIUM** - Strong evidence for Konva's architecture advantages, but tldraw could accelerate MVP if licensing acceptable. Sources: [Konva vs Fabric comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan), [Konva architecture](https://medium.com/@www.blog4j.com/konva-js-vs-fabric-js-in-depth-technical-comparison-and-use-case-analysis-9c247968dd0f)

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.0.x | Global state | 14M+ weekly downloads. Simple API, TypeScript-first, minimal boilerplate. Perfect for canvas state, chat history, workspace management. |
| React useState/useReducer | Built-in | Local UI state | Use for component-local concerns (modals, forms). Don't over-engineer. |

**Why Zustand over alternatives:**

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **Zustand** | RECOMMENDED | Centralized store suits interconnected canvas + chat state. Devtools support. Easy to split stores later. |
| Jotai | CONSIDERED | Atomic model excellent for fine-grained canvas updates. BUT: More complexity for chat/workspace state that's naturally centralized. Could use both if needed. |
| Redux Toolkit | REJECTED | Overkill boilerplate for this scale. Zustand covers enterprise needs now. |
| Context API | REJECTED | Re-render issues with complex canvas state. Fine for themes/settings only. |

**Confidence: HIGH** - Clear consensus in 2025-2026 ecosystem. Sources: [State Management 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k), [Zustand npm](https://www.npmjs.com/package/zustand)

### AI Integration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel AI SDK | 6.x | Chat streaming, tool execution | SSE-based streaming, type-safe tools, UIMessage abstraction for persistence. Framework-agnostic. |
| Google Imagen API | Imagen 4 | Image generation | Per project requirements. Access via Vertex AI or Gemini API. |

**AI SDK Patterns:**
- Use `/api/chat` route with `streamText` for conversational interface
- `UIMessage` type is source of truth for persistence
- Tool approval system for human-in-the-loop generation workflows
- `onFinish` callback for saving generations to database

**Confidence: HIGH** - Verified via [AI SDK 6 announcement](https://vercel.com/blog/ai-sdk-6), [AI SDK docs](https://ai-sdk.dev/docs/introduction)

### Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon | - | Serverless PostgreSQL | Per project requirements. Serverless scaling, branching for dev/preview. |
| Drizzle ORM | 0.45.x | Type-safe queries | ~7.4kb, zero dependencies, excellent PostgreSQL support. JSONB for style metadata. |
| drizzle-kit | Latest | Migrations | SQL migration files, direct schema push. |

**Schema Patterns for This Domain:**
```typescript
// JSONB for flexible style metadata
styleMetadata: jsonb('style_metadata').$type<StyleMetadata>(),

// Identity columns (PostgreSQL best practice 2025)
id: serial('id').primaryKey(), // or identity()

// Indexed arrays for tags/categories
tags: text('tags').array(),
```

**Confidence: HIGH** - Per project requirements, verified via [Drizzle + Neon guide](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon)

### Image Handling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| UploadThing | Latest | File uploads | Type-safe, handles auth server-side, CDN delivery, resumable uploads. Best DX for Next.js. |
| Sharp | Latest | Server processing | Installed automatically by Next.js for optimization. Use for thumbnails, format conversion. |
| next/image | Built-in | Client display | Automatic optimization, WebP/AVIF, lazy loading. |

**Why UploadThing over alternatives:**

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **UploadThing** | RECOMMENDED | Simplest DX, type-safe, handles edge cases. Great for MVP velocity. |
| Vercel Blob | CONSIDERED | Tighter Vercel integration. BUT: 2x price of R2, less generous free tier. |
| Cloudflare R2 + presigned URLs | CONSIDERED | Cheapest at scale, unlimited bandwidth. BUT: More setup, manual image optimization. Consider for v2 cost optimization. |
| AWS S3 | REJECTED | Complexity overkill without existing AWS infrastructure. |

**Confidence: MEDIUM** - UploadThing optimizes for DX/velocity. May need R2 migration at scale. Sources: [UploadThing overview](https://best-of-web.builder.io/library/pingdotgg/uploadthing), [R2 vs Vercel Blob](https://www.wmtips.com/technologies/compare/cloudflare-r2-vs-vercel-blob/)

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | 4.x | Styling | 5x faster builds, zero-config with Vite/Next.js. OKLCH colors. Modern CSS features. |
| shadcn/ui | 0.9.x | Component library | Copy-paste components (not npm dependency). Full control, consistent with Linear/Anthropic aesthetic. |
| Radix UI | Latest | Primitives | Accessible primitives underneath shadcn. Headless, composable. |
| Lucide React | Latest | Icons | Tree-shakeable, consistent style. |

**Aesthetic Implementation:**
- shadcn/ui "default" or "new-york" theme as base
- Reduce border radius for sharper Linear-style look
- Muted color palette with high-contrast text
- Generous whitespace, subtle shadows

**Confidence: HIGH** - Industry standard stack. Sources: [Tailwind v4](https://tailwindcss.com/blog/tailwindcss-v4), [shadcn/ui](https://ui.shadcn.com/)

### Real-Time Collaboration (Future)

| Technology | Version | Purpose | When to Add |
|------------|---------|---------|-------------|
| Liveblocks | Latest | Real-time sync | V2+ when multi-user needed. Easier setup than Yjs. |
| Yjs | Latest | CRDT | Alternative if self-hosting required or complex conflict resolution needed. |

**Note:** Not needed for V1 (single user). Architecture should not preclude adding later. Zustand integrates well with both.

**Confidence: MEDIUM** - Clear options, decision deferred. Sources: [Liveblocks whiteboard guide](https://liveblocks.io/docs/guides/how-to-create-a-collaborative-online-whiteboard-with-react-zustand-and-liveblocks)

---

## Installation

```bash
# Core framework
npx create-next-app@latest dobra --typescript --tailwind --eslint --app --src-dir

# Canvas
npm install konva react-konva

# State management
npm install zustand

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# AI
npm install ai @ai-sdk/google

# File uploads
npm install uploadthing @uploadthing/react

# UI (shadcn is added via CLI)
npx shadcn@latest init
npx shadcn@latest add button input card dialog sheet tabs avatar badge skeleton

# Icons
npm install lucide-react

# Dev dependencies
npm install -D @types/node prettier eslint-config-prettier
```

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux/Redux Toolkit | Unnecessary complexity for this scale. Boilerplate overhead. | Zustand |
| Fabric.js | Manual memory management, React integration friction, larger bundle | Konva |
| styled-components/Emotion | Runtime CSS-in-JS has performance costs. Tailwind is faster. | Tailwind CSS |
| Prisma | Larger bundle, edge runtime issues, slower than Drizzle for PostgreSQL | Drizzle ORM |
| AWS Amplify | Vendor lock-in, complexity. We're not building on AWS. | Individual tools (Neon, UploadThing) |
| Firebase | NoSQL wrong fit for relational style/asset data | Neon PostgreSQL |
| Create React App | Deprecated. No SSR, no server components. | Next.js |
| Webpack (direct) | Turbopack is faster, Next.js handles it | Next.js built-in |

---

## Stack Patterns by Variant

**If canvas performance becomes critical:**
- Add Web Workers for heavy computations
- Consider OffscreenCanvas for rendering
- Profile with React DevTools, optimize Zustand selectors
- Jotai atoms for fine-grained canvas element state

**If real-time collaboration needed (V2+):**
- Add Liveblocks or Yjs
- Store operations as CRDTs, not final state
- Presence API for cursors/selections
- Zustand middleware for sync

**If image storage costs grow:**
- Migrate from UploadThing to Cloudflare R2
- Add custom image optimization pipeline
- Consider on-demand resizing with Cloudflare Images

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15.5+ | React 19 | Stable, typed routes require config |
| react-konva 19.x | React 19, Konva 9.x | Match major versions |
| Zustand 5.x | React 18/19 | Works with concurrent features |
| Drizzle 0.45+ | PostgreSQL 14+ | Use identity columns |
| Tailwind 4.x | Next.js 15, shadcn 0.9+ | Requires updated shadcn config |
| AI SDK 6.x | Next.js 14+, React 18+ | SSE streaming |

---

## Architecture Implications

This stack supports the following architecture:

```
[Client]                        [Server]                      [External]

Chat UI ─────────────────────▶ /api/chat ─────────────────▶ Google Imagen
    │                             │                         Vertex AI
    │   (AI SDK streaming)        │   (generation request)
    ▼                             ▼
Canvas (Konva) ◀───────────── Server Action ◀───────────── Neon DB
    │                             │                         (styles, assets)
    │   (state sync)              │   (Drizzle queries)
    ▼                             ▼
Zustand Store                  /api/upload ───────────────▶ UploadThing
                                                            (images, files)
```

**Key patterns:**
1. Chat triggers canvas updates via Zustand
2. Canvas state serializable for persistence
3. Server Actions for DB mutations (not REST)
4. AI SDK handles streaming complexity
5. UploadThing handles upload edge cases

---

## Sources

**HIGH confidence (official docs, Context7):**
- [Next.js 15.5 release](https://nextjs.org/blog/next-15-5)
- [Next.js App Router docs](https://nextjs.org/docs/app)
- [AI SDK documentation](https://ai-sdk.dev/docs/introduction)
- [AI SDK 6 announcement](https://vercel.com/blog/ai-sdk-6)
- [Drizzle + Neon tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [shadcn/ui installation](https://ui.shadcn.com/docs/installation/next)
- [Zustand npm](https://www.npmjs.com/package/zustand)
- [react-konva npm](https://www.npmjs.com/package/react-konva)

**MEDIUM confidence (community consensus, comparisons):**
- [Konva vs Fabric technical comparison](https://medium.com/@www.blog4j.com/konva-js-vs-fabric-js-in-depth-technical-comparison-and-use-case-analysis-9c247968dd0f)
- [State management in 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)
- [UploadThing overview](https://best-of-web.builder.io/library/pingdotgg/uploadthing)
- [R2 vs Vercel Blob pricing](https://www.wmtips.com/technologies/compare/cloudflare-r2-vs-vercel-blob/)
- [Liveblocks collaborative whiteboard](https://liveblocks.io/docs/guides/how-to-create-a-collaborative-online-whiteboard-with-react-zustand-and-liveblocks)
- [Google Imagen API docs](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api)

---

*Stack research for: AI-powered conversational design tool with canvas interface*
*Researched: 2026-02-06*
