# Project Research Summary

**Project:** Dobra - AI-powered brand style consistency platform
**Domain:** Conversational AI design tool with spatial canvas workspace
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

Dobra is an AI-powered design tool that extracts brand style from reference images through conversational interaction, then generates consistent brand assets on a spatial canvas workspace. The research reveals this is a hybrid product combining three established patterns: (1) AI image generation with persistent style memory (Midjourney + brand kits), (2) chat-to-visual-workspace transition (emerging in AI tools), and (3) moodboard-style asset management (Milanote/Miro patterns).

The recommended approach prioritizes developer velocity with Next.js 15.5 + React 19, Zustand for interconnected chat/canvas state, and Konva for flexible canvas rendering. Google Imagen handles generation, Neon PostgreSQL stores brand/style data, and UploadThing manages uploads. This stack balances rapid MVP delivery with enterprise-grade scalability. The architecture centers on dual-view shared state: chat and canvas modes share Zustand stores, enabling seamless transitions without context loss.

Key risks include API cost blowup (image generation is expensive), style extraction unreliability (AI variability in image analysis), and chat-to-canvas UX confusion (users losing context across modes). Mitigation strategies include upfront cost controls with spending alerts and rate limiting, strict JSON validation for style extraction with human verification, and explicit transition design with persistent chat sidebar in canvas mode. The research shows high confidence in stack choices and architecture patterns, medium-high confidence in feature prioritization, with identified gaps around SVG export expectations (AI models output PNG) and real-time collaboration complexity.

## Key Findings

### Recommended Stack

The stack optimizes for speed-to-market with modern, well-supported technologies. Next.js 15.5 with App Router provides stable React 19 support, typed routes, and Server Actions that reduce boilerplate. Konva via react-konva offers the sweet spot for canvas rendering: more flexible than tldraw, better memory management than Fabric.js, with scene graph architecture ideal for asset placement/manipulation. Zustand centralizes interconnected canvas + chat state with minimal complexity.

**Core technologies:**
- **Next.js 15.5 + React 19**: Full-stack framework with Server Components, App Router stability, Turbopack build performance. Industry standard for AI products.
- **Konva + react-konva**: Scene graph canvas rendering with dirty region detection, first-class React integration, suitable complexity for asset manipulation.
- **Zustand 5.x**: Centralized state for canvas/chat/brand with devtools support, TypeScript-first, 14M+ weekly downloads. Integrates cleanly with future real-time collaboration.
- **Vercel AI SDK 6.x**: SSE streaming, type-safe tool execution, UIMessage abstraction. Framework-agnostic with excellent Next.js integration.
- **Neon + Drizzle ORM**: Serverless PostgreSQL with branching, type-safe queries at 7.4kb. JSONB for flexible style metadata.
- **Google Imagen 4**: Per project requirements, accessed via Vertex AI. Handles text-to-image and image-to-image generation.
- **UploadThing**: Type-safe file uploads with auth, CDN delivery, resumable uploads. Optimizes DX for Next.js, may migrate to R2 at scale.
- **Tailwind 4.x + shadcn/ui**: 5x faster builds, copy-paste components for full control, consistent with Linear/Anthropic aesthetic.

**Critical version notes:**
- Next.js 15.5+ required for stable React 19 support
- react-konva 19.x must match React major version
- Drizzle 0.45+ for PostgreSQL identity columns

**What to avoid:**
- Redux (Zustand covers needs without boilerplate)
- Fabric.js (memory management issues, weaker React integration)
- Prisma (edge runtime issues, slower than Drizzle for PostgreSQL)
- styled-components (runtime CSS-in-JS performance cost)

### Expected Features

Research identified clear feature tiers through competitor analysis (Midjourney, Canva AI, Leonardo AI, Figma AI) and brand management platforms (Frontify, Brandkit, Brandy).

**Must have (table stakes):**
- Text-to-image and image-to-image generation — every AI design tool has this
- Generation variations (multiple options per prompt) — Midjourney pattern users expect
- PNG export with transparency — universal raster format
- SVG/vector export — designers need scalable formats (note: research flags this as challenging since AI outputs PNG)
- Generation history per brand — users need to revisit and iterate
- Brand kit storage — colors, fonts, style references extracted from uploads
- Style reference application — apply saved style to new generations (Midjourney --sref equivalent)
- Basic canvas operations — zoom, pan, undo/redo, asset organization

**Should have (competitive advantage):**
- **Chat-guided brand extraction** — CORE DIFFERENTIATOR. Competitors require manual brand kit setup; Dobra extracts style through conversation.
- **Chat-to-canvas transition** — Seamless shift from conversational setup to visual workspace; emerging pattern in AI tools.
- **Moodboard-as-workspace** — References + generations displayed together; more visual than chat-only interfaces.
- **One workspace per brand** — Clean mental model vs. cluttered project views (Brandy pattern).
- **Style consistency across generations** — AI remembers and applies brand context automatically without re-prompting.
- **Conversational asset iteration** — "Make this more vibrant" through natural language within canvas.
- **Reference image analysis feedback** — Show users what style elements were extracted; transparency builds trust.

**Defer (v2+):**
- Real-time collaboration — Out of v1 scope per project context; adds CRDT complexity premature for validation
- Template application — Different product category (Canva/Marq territory)
- Full brand creation from scratch — v1 requires 1-3 reference images
- Inpainting/outpainting — Feature bloat; focus on core generation modes first
- Multi-format export (PSD, AI files) — Maintain focus on universal formats
- Brand guideline document generation — Nice-to-have after core validation

### Architecture Approach

The architecture implements dual-view shared state: chat and canvas are separate UI modes that read/write to common Zustand stores, enabling seamless transitions while preserving context. The data flow follows: user message → streaming AI response with tool calls → tool execution (brand creation, image generation) → optimistic UI updates → async job processing → polling for completion → final state sync.

**Major components:**
1. **Chat View + Floating Sidebar** — Vercel AI SDK useChat hook for streaming responses, tool calls trigger structured actions (create brand, generate asset). Persistent sidebar keeps chat accessible in canvas mode.
2. **Canvas View** — Konva-based infinite canvas with moodboard layout. Displays references + generated assets with manipulation (drag, resize, select). Virtualized rendering for performance.
3. **State Layer (Zustand)** — Four stores: Canvas (objects, selection, history with undo/redo), Chat (messages, streaming state), Brand (active brand, style JSON, workspace list), Generation (pending jobs, completed assets, polling state).
4. **API Layer** — `/api/chat` for streaming with tool execution, `/api/generate` for async image generation (returns job ID immediately), `/api/brands` for CRUD, `/api/assets` for management.
5. **AI Services** — Google Imagen for generation (30+ second async operations), Vision API for style extraction from references, LLM for chat/tool orchestration.
6. **Database (Neon PostgreSQL)** — Brands table with JSONB style metadata, generations table with status tracking, assets table with canvas positions, conversations table for chat persistence.

**Key patterns:**
- **Streaming chat with tool calls** — LLM streams responses and invokes structured tools (createBrand, generateAsset) during conversation
- **Optimistic UI with background jobs** — Immediately show "generating" placeholder on canvas while actual generation happens async; poll for completion
- **Temporal store for undo/redo** — Zustand temporal middleware tracks canvas history, caps at 50 states to prevent memory bloat
- **Single source of truth for style** — Style lives in brand store, both chat and canvas read from it; no duplicate state

**Build order from architecture:**
Foundation (DB schema, Next.js structure, brand CRUD) → Chat Core (UI, streaming API, state) → Canvas Core (Konva setup, state, asset display) → AI Generation (Imagen integration, job queue, optimistic updates) → Integration (tool calls in chat, chat sidebar in canvas, style extraction) → Polish (export, error handling, loading states).

### Critical Pitfalls

Research identified six critical pitfalls specific to this domain, with clear prevention strategies.

1. **API Cost Blowup** — AI generation costs spiral without visibility. Free tiers (2 IPM for Gemini) exhausted quickly. Users trigger unlimited regenerations. PREVENTION: Set hard spending limits and alerts from day one, implement client-side throttling (debounce, cooldown), cache generations by input hash, build usage dashboard, use batch processing for 50% cost reduction.

2. **Style Extraction Unreliability** — Core value prop fails when extraction produces inconsistent results. Same image analyzed twice gives different outputs. PREVENTION: Define strict JSON schema and validate responses, use low temperature (0.1-0.3) for consistency, implement verification (run twice, compare outputs), start with limited properties (colors, fonts, layout only), let users verify/adjust before committing.

3. **Canvas Performance Degradation** — Canvas becomes sluggish after 10-20 assets. Memory usage grows unbounded. Browser crashes in long sessions. PREVENTION: Implement proper cleanup (remove event listeners, dispose textures), use image thumbnails for canvas display (full resolution only on export), virtualize rendering (only render visible elements), set performance budgets early, limit canvas asset count for v1.

4. **Chat-to-Canvas UX Confusion** — Users don't understand mode transitions. They lose context about what the AI "knows." Empty canvas state provides no guidance. PREVENTION: Design explicit transition moment ("Your style is ready! View on canvas"), keep chat visible in canvas mode (split view or sidebar), show visual summary of extracted information, never show empty canvas (provide starting point), use progressive disclosure (don't expose canvas until chat produces result).

5. **Async Generation Without Proper Feedback** — Users stare at spinners with no idea if generation is working or stuck. 30+ second waits feel broken. PREVENTION: Use streaming text output where possible, show placeholder with progress indicator and estimated time, implement timeout cascades (10s warning, 30s timeout, graceful fallback), allow cancellation, show stages ("Analyzing style...", "Generating image...", "Optimizing...").

6. **State Synchronization Breakdown** — Chat and canvas become desynchronized. User changes style in chat but canvas shows old style. Undo/redo breaks across modes. PREVENTION: Single source of truth (style lives in one place, both UIs read from it), use atomic state patterns, design state shape supporting both needs, implement explicit sync points rather than continuous live-sync.

**Additional gotchas:**
- **PNG vs SVG expectation mismatch** — AI generation APIs output PNG, not vector. Users may expect SVG. Set expectations clearly: "high-resolution PNG" not "print-ready vector." Defer true vector to v2.
- **Integration mistakes** — No retry logic for 429 errors (needs exponential backoff), using high temperature for style extraction (needs 0.1-0.3 for consistency), storing full images in DB (use object storage), no per-user rate limits (enables cost attack).
- **Scope creep** — Real-time collaboration, advanced canvas tools, template library, multi-brand management all commonly creep into v1 but should be deferred.

## Implications for Roadmap

Based on research findings, the roadmap should follow dependency-driven phasing that addresses critical pitfalls early while delivering incremental value. The architecture research clearly shows foundation work (state, cost controls) must precede feature work to avoid technical debt that's expensive to fix later.

### Phase 1: Foundation & Cost Controls
**Rationale:** Address API cost blowup pitfall BEFORE any AI integration. Set up state architecture to prevent sync breakdown. Establish data models that everything depends on.

**Delivers:**
- Database schema (brands, conversations, generations, assets)
- Next.js 15.5 project structure with App Router
- Zustand stores scaffolded (canvas, chat, brand, generation)
- Cost monitoring dashboard and spending alerts configured
- Mock AI mode for development (prevents burning quota in testing)
- Rate limiting on generation endpoints

**Addresses features:**
- Brand kit storage (database foundation)
- Multiple brand workspaces (data model)

**Avoids pitfalls:**
- API cost blowup (controls in place from day one)
- State synchronization breakdown (architecture decided upfront)

**Research flags:** Standard Next.js + database setup, no additional research needed.

---

### Phase 2: Chat Interface & Brand Extraction
**Rationale:** Chat is the entry point; must work before canvas is useful. Style extraction is the core differentiator; validate it early. Address style extraction reliability pitfall immediately.

**Delivers:**
- Chat UI components (ChatContainer, ChatMessage, ChatInput)
- Streaming chat API with Vercel AI SDK
- Chat state management and persistence
- Reference image upload mechanism
- Style extraction with Vision API (strict JSON validation, low temperature, human verification)
- Tool call: createBrand (extracts style, stores in DB, creates workspace)

**Addresses features:**
- Chat-guided brand extraction (CORE DIFFERENTIATOR)
- Reference image analysis feedback (transparency builds trust)
- Brand kit storage (style JSON populated)

**Avoids pitfalls:**
- Style extraction unreliability (validation, verification, limited properties)
- Async generation without feedback (streaming text shows AI thinking)

**Research flags:** Needs phase-specific research for Vision API style extraction patterns and JSON schema design.

---

### Phase 3: Canvas Workspace
**Rationale:** Canvas depends on having brands/styles from Phase 2. Address canvas performance pitfall early by building with proper cleanup/optimization from start.

**Delivers:**
- Konva canvas component with react-konva
- Canvas state management (Zustand with temporal middleware for undo/redo)
- Asset display (images loaded from URLs)
- Basic canvas operations (zoom, pan, select, drag, resize)
- Moodboard layout (references + assets arranged visually)
- Canvas performance budgets and monitoring

**Addresses features:**
- Moodboard-as-workspace (DIFFERENTIATOR)
- Zoom/pan canvas (table stakes)
- Undo/redo (table stakes)
- Asset organization (table stakes)

**Avoids pitfalls:**
- Canvas performance degradation (cleanup, thumbnails, virtualization from start)
- Chat-to-canvas confusion (explicit transition, starting content)

**Research flags:** Standard canvas patterns, no additional research needed.

---

### Phase 4: AI Image Generation
**Rationale:** Core value delivery. Depends on Phases 1-3 (cost controls, style extraction, canvas to display on). Address async feedback pitfall with proper UI patterns.

**Delivers:**
- Google Imagen integration via Vertex AI
- Generation API endpoint (async job pattern, returns job ID immediately)
- Generation queue and status tracking
- Optimistic canvas updates (placeholder with progress indicator)
- Polling mechanism with exponential backoff and timeout
- Tool call: generateAsset (queues job, updates canvas optimistically)
- Generation history per brand

**Addresses features:**
- Text-to-image generation (table stakes)
- Image-to-image generation (table stakes)
- Generation variations (table stakes)
- Generation history (table stakes)
- Style reference application (DIFFERENTIATOR)
- Style consistency across generations (DIFFERENTIATOR)

**Avoids pitfalls:**
- Async generation without feedback (progress indicators, stages, estimated time)
- API cost blowup (already mitigated in Phase 1)

**Research flags:** Needs phase-specific research for Imagen API integration, job queue patterns, and polling strategies.

---

### Phase 5: Canvas-Chat Integration
**Rationale:** Connect the two modes. Depends on both working independently. Address chat-to-canvas UX confusion with thoughtful integration.

**Delivers:**
- Floating chat sidebar in canvas view
- Conversational asset iteration (chat commands within canvas)
- Transition flow from chat completion to canvas (explicit, guided)
- Visual summary of extracted style on canvas
- Tool calls working from both chat views

**Addresses features:**
- Chat-to-canvas transition (DIFFERENTIATOR)
- Conversational asset iteration (DIFFERENTIATOR)
- One workspace per brand (mental model clarity)

**Avoids pitfalls:**
- Chat-to-canvas UX confusion (persistent sidebar, explicit transition, context preservation)
- State synchronization breakdown (single source of truth validated)

**Research flags:** Standard integration patterns, no additional research needed.

---

### Phase 6: Export & Polish
**Rationale:** Final value delivery. Users need to extract assets. Address PNG vs SVG expectations explicitly.

**Delivers:**
- PNG export with transparency
- High-resolution options (2x, 4x for quality needs)
- Download functionality
- Error handling across all generation states (failed, timeout, safety blocks)
- Loading states and skeletons throughout
- Clear messaging: "AI-generated high-resolution PNG assets"

**Addresses features:**
- PNG export (table stakes)
- SVG export (deferred — research shows AI outputs PNG, conversion is lossy)

**Avoids pitfalls:**
- PNG vs SVG expectation mismatch (explicit messaging)

**Research flags:** Standard file handling, no additional research needed.

---

### Phase Ordering Rationale

**Dependency-driven:**
- Foundation → Chat (chat needs state architecture, cost controls prevent expensive mistakes)
- Chat → Canvas (canvas needs brands/styles from chat; empty canvas is confusing)
- Canvas → Generation (nowhere to display generated assets without canvas)
- Generation → Integration (need independent systems before connecting)
- Integration → Export (need working system before extracting value)

**Pitfall-prevention:**
- Phase 1 addresses systemic risks (cost, state architecture) that are expensive to fix retroactively
- Phase 2 validates core differentiator (style extraction) early before building dependent features
- Phase 3 builds performance-conscious canvas from start (optimization later doesn't work)
- Phase 4 delivers generation with proper async patterns (blocking on AI is architectural mistake)
- Phase 5 connects modes thoughtfully (mode confusion is UX debt hard to fix)
- Phase 6 manages expectations explicitly (PNG/SVG reality check)

**Value delivery:**
- Phase 1-2: Chat creates brands (limited value alone)
- Phase 1-3: Can view brand workspaces (still no generation)
- Phase 1-4: Can generate assets (CORE VALUE DELIVERED)
- Phase 1-5: Seamless workflow (DIFFERENTIATORS SHINE)
- Phase 1-6: Production-ready (export, polish, error handling)

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 2 (Chat & Brand Extraction):** Style extraction is the core differentiator but has no standard pattern. Needs research into:
  - Vision API prompting strategies for consistent JSON output
  - Optimal JSON schema for brand style (balance between detail and reliability)
  - Verification strategies (dual extraction comparison, human-in-loop patterns)
  - Temperature and parameter tuning for consistency

- **Phase 4 (AI Image Generation):** Async generation patterns at 30+ seconds with cost implications. Needs research into:
  - Imagen API best practices (prompt enhancement, parameter selection)
  - Job queue architecture (polling vs webhooks, scaling considerations)
  - Cost optimization strategies (caching, batch processing)
  - Error handling patterns (safety blocks, timeouts, retries)

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Next.js + Zustand + Drizzle is well-documented standard stack
- **Phase 3 (Canvas):** Konva patterns for asset manipulation are established
- **Phase 5 (Integration):** State sharing patterns between views are standard
- **Phase 6 (Export):** File download and export are commodity features

### Deferred Questions

**SVG export complexity:**
Research shows AI APIs output PNG. True vector generation requires different models or lossy conversion. Defer to v2 with explicit research into:
- Native SVG generation models (limited availability in 2026)
- PNG-to-SVG conversion quality benchmarks
- User acceptance of high-resolution PNG vs. vector expectations

**Real-time collaboration:**
Explicitly out of v1 scope per project context. Architecture doesn't preclude adding later (Zustand integrates with Liveblocks/Yjs), but CRDT complexity is premature for validation. Defer to v3+ after product-market fit.

**Template system:**
Different product category (Canva/Marq territory). Defer to v2 after validating core generation workflow. Would require research into template architecture and social media sizing standards.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All core technologies verified via official docs (Next.js 15.5 blog, AI SDK docs, Drizzle + Neon tutorial). Version compatibility confirmed. Community consensus strong (Zustand 14M+ weekly downloads, Konva active maintenance). |
| Features | **MEDIUM-HIGH** | Table stakes features verified across 5+ competitors (Midjourney, Canva AI, Leonardo AI, Figma AI, Frontify). Differentiators validated against competitor gaps. Anti-features identified through common pitfalls analysis. Medium confidence on SVG export (AI reality vs. user expectations). |
| Architecture | **HIGH** | Patterns sourced from official Vercel AI SDK guides, tldraw architecture, Konva docs, BullMQ examples. Dual-view shared state is proven pattern (Cursor IDE, Linear). Job queue + polling well-established for async AI. State management patterns standard. |
| Pitfalls | **MEDIUM-HIGH** | Critical pitfalls sourced from domain-specific articles (Konva memory leaks, Gemini API troubleshooting, state synchronization traps). Cost blowup verified via Gemini rate limits guide. UX pitfalls from conversational UI research. Some pitfalls inferred from general patterns. |

**Overall confidence:** **HIGH**

The research provides strong foundation for roadmap creation. Stack choices are verified and version-compatible. Architecture patterns are proven in production systems. Critical pitfalls have documented prevention strategies. Main uncertainty is around style extraction reliability (AI variability) and PNG vs SVG expectations, both flagged for validation during implementation.

### Gaps to Address

**During Phase 2 planning:**
- **Style extraction JSON schema:** Research didn't find established schema for "brand style" AI extraction. Needs design during phase planning to balance detail (more brand attributes) vs. reliability (consistent AI output).
- **Verification threshold:** How to determine if dual extraction results "match"? Needs quantitative metric (e.g., color values within 5%, font family exact match, tone keywords 70% overlap).

**During Phase 4 planning:**
- **Imagen prompt enhancement:** How to translate user natural language + brand style JSON into optimal Imagen prompts? May need LLM-based prompt enhancement step.
- **Cache key strategy:** What constitutes "same generation request" for caching? Hash of (prompt + style JSON + parameters)? Needs design to balance cache hits vs. variety.

**During implementation:**
- **PNG-to-SVG quality:** If users demand vector export, needs A/B testing of conversion tools (Vectorizer.AI, Adobe Illustrator API) against user satisfaction. May need to decline feature if quality is unacceptable.
- **Canvas asset limit:** Research suggests setting v1 limit (50 assets recommended), but needs validation through user testing. May need pagination or "archive old assets" pattern.

**Post-MVP validation:**
- **Real-time collaboration demand:** Out of v1 scope, but needs user research post-launch to prioritize for v2. Architecture accommodates adding later.
- **Template system value:** Deferred to v2, but needs validation that users want templates vs. just raw asset generation.

## Sources

### Primary (HIGH confidence)

**Stack & Architecture:**
- [Next.js 15.5 release blog](https://nextjs.org/blog/next-15-5) — React 19 stability, Turbopack performance
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs/introduction) — Streaming patterns, tool calls
- [Vercel AI SDK 6 announcement](https://vercel.com/blog/ai-sdk-6) — SSE streaming, UIMessage abstraction
- [Drizzle + Neon tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon) — Serverless PostgreSQL patterns
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — Build performance improvements
- [react-konva documentation](https://konvajs.org/docs/react/index.html) — Canvas patterns
- [Zustand GitHub](https://github.com/pmndrs/zustand) — State management patterns

**AI Integration:**
- [Google Imagen API reference](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api) — Generation capabilities
- [Gemini API troubleshooting guide](https://ai.google.dev/gemini-api/docs/troubleshooting) — Error handling best practices

### Secondary (MEDIUM confidence)

**Feature Research:**
- [Figma AI Design Tools 2026](https://www.figma.com/resource-library/ai-design-tools/) — Competitive landscape
- [Zapier Best AI Image Generators 2026](https://zapier.com/blog/best-ai-image-generator/) — Feature comparison
- [Midjourney Style Reference docs](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference) — Style consistency patterns
- [Frontify Brand Management](https://www.frontify.com/en) — Brand kit patterns
- [Brandkit Platform](https://brandkit.com/brand-management-software) — Asset management UX

**Architecture Patterns:**
- [Konva vs Fabric comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan) — Canvas library selection
- [State Management 2025 guide](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) — Zustand vs alternatives
- [BullMQ architecture guide](https://docs.bullmq.io/guide/architecture) — Job queue patterns
- [Next.js Backend for Conversational AI 2026](https://www.sashido.io/en/blog/nextjs-backend-conversational-ai-2026) — Chat integration patterns

**Pitfalls & UX:**
- [Konva Memory Leak Prevention](https://konvajs.org/docs/performance/Avoid_Memory_Leaks.html) — Canvas cleanup patterns
- [State Synchronization Trap](https://ondrejvelisek.github.io/avoid-state-synchronization-trap/) — State management anti-patterns
- [Gemini API Rate Limits Guide](https://www.aifreeapi.com/en/posts/gemini-api-rate-limits-per-tier) — Cost control strategies
- [AI Loading States Pattern](https://uxpatterns.dev/patterns/ai-intelligence/ai-loading-states) — Async feedback UX
- [Designing for AI Mistakes](https://medium.com/design-bootcamp/designing-for-ai-mistakes-because-they-will-happen-b8857d953bcc) — Error handling UX
- [Conversational UI Best Practices](https://research.aimultiple.com/conversational-ui/) — Chat UX patterns

### Tertiary (LOW confidence, needs validation)

- [UploadThing overview](https://best-of-web.builder.io/library/pingdotgg/uploadthing) — File upload DX comparison
- [R2 vs Vercel Blob pricing](https://www.wmtips.com/technologies/compare/cloudflare-r2-vs-vercel-blob/) — Storage cost analysis
- [MVP Scope and Over-engineering](https://fastercapital.com/content/Define-MVP-scope--How-to-Define-Your-MVP-Scope-and-Avoid-Overengineering.html) — Scope management principles

---

*Research completed: 2026-02-06*
*Ready for roadmap: YES*
