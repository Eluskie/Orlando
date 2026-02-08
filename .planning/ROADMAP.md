# Roadmap: Dobra

## Overview

Dobra delivers brand style consistency through a chat-first AI workflow that extracts style from reference images and generates matching assets on a spatial canvas. The roadmap progresses from foundation infrastructure through chat interface, style extraction, canvas workspace, AI generation, and finally integration with export capabilities. Each phase delivers verifiable capability that unlocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Database schema, project structure, state architecture, cost controls
- [x] **Phase 2: Chat Interface** - Conversational UI, streaming responses, brand creation flow
- [x] **Phase 3: Style Extraction** - Reference upload, AI analysis, JSON style output
- [x] **Phase 4: Canvas Workspace** - Spatial canvas, asset display, manipulation controls
- [ ] **Phase 5: AI Generation** - Imagen integration, text-to-image, image-to-image generation
- [ ] **Phase 6: Integration & Export** - Chat-canvas connection, export functionality, UX polish

## Phase Details

### Phase 1: Foundation
**Goal**: Infrastructure and architecture that prevents expensive mistakes later
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-02, UX-01 (partial - design system setup)
**Success Criteria** (what must be TRUE):
  1. Database schema exists with tables for brands, conversations, generations, and assets
  2. Zustand stores are scaffolded for canvas, chat, brand, and generation state
  3. Cost monitoring and rate limiting are active on generation endpoints
  4. Mock AI mode allows development without burning API quota
  5. Design system components (colors, typography, spacing) follow Linear/Anthropic aesthetic
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md - Initialize Next.js 15.5 project with Drizzle schema for brands, conversations, generations, assets
- [x] 01-02-PLAN.md - Scaffold Zustand stores, mock AI mode, rate limiting, Linear/Anthropic design system

### Phase 2: Chat Interface
**Goal**: Users can have a conversation that initiates brand creation
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, BRAND-01, BRAND-03
**Success Criteria** (what must be TRUE):
  1. User sees a conversational chat interface as the entry point (Claude/ChatGPT style)
  2. Chat guides user through brand creation steps (name, purpose, reference prompts)
  3. User can name and identify brands within the chat flow
  4. Chat messages stream in real-time (not appear all at once)
  5. Conversation history persists across browser sessions
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md - App shell layout with OpenCode-inspired sidebar and streaming chat API
- [x] 02-02-PLAN.md - Chat UI components with streaming messages and Claude-like styling
- [x] 02-03-PLAN.md - Brand creation flow, message persistence, and conversation history

### Phase 3: Style Extraction
**Goal**: AI extracts structured style data from reference images users upload
**Depends on**: Phase 2
**Requirements**: CHAT-03, CHAT-04, CHAT-05, BRAND-02, BRAND-04
**Success Criteria** (what must be TRUE):
  1. User can upload 1-3 reference images via chat
  2. AI analyzes references and extracts style to JSON (keywords + technical parameters)
  3. User sees feedback on what style elements were extracted
  4. Style JSON is stored with the brand and accessible for generation
  5. User can view brand definition as visual moodboard (references + characteristics)
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md - Image upload UI and Vercel Blob storage infrastructure
- [x] 03-02-PLAN.md - Style extraction AI with Gemini Vision and Zod schema
- [x] 03-03-PLAN.md - Extraction feedback card and brand moodboard display

### Phase 4: Canvas Workspace
**Goal**: Users have a spatial workspace to view and organize brand assets
**Depends on**: Phase 3
**Requirements**: CANV-01, CANV-02, CANV-03, CANV-04, CANV-05, CANV-06, CANV-07, UX-02
**Success Criteria** (what must be TRUE):
  1. User has a dedicated canvas workspace per brand
  2. Canvas displays visual moodboard (references + generated assets together)
  3. User can zoom and pan the canvas
  4. User can undo/redo actions on canvas
  5. User can drag and arrange assets on canvas
  6. User can switch between different brand workspaces
  7. Toolbar with common actions is visible
**Plans**: 4 plans

Plans:
- [x] 04-01-PLAN.md - ReactFlow canvas setup and image node rendering with drag support
- [x] 04-02-PLAN.md - Canvas interactions: wheel zoom, pan, selection, and resize
- [x] 04-03-PLAN.md - Toolbar with undo/redo and zoom controls
- [x] 04-04-PLAN.md - Canvas route, asset loading per brand, and navigation

### Phase 5: AI Generation
**Goal**: Users can generate brand-consistent images via text or sketch input
**Depends on**: Phase 4
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07, HIST-01, HIST-02
**Success Criteria** (what must be TRUE):
  1. User can generate images from text prompts with brand style applied
  2. User can generate images from sketches/images with brand style applied
  3. Each generation produces 2-4 variations to choose from
  4. Brand style is automatically applied without re-prompting
  5. Generated assets appear on canvas immediately (optimistic UI with placeholder)
  6. User can view generation history per brand
  7. User can revisit and reuse previous generations
**Plans**: TBD

Plans:
- [ ] 05-01: Imagen API integration and job queue
- [ ] 05-02: Text-to-image generation flow
- [ ] 05-03: Image-to-image generation and history

### Phase 6: Integration & Export
**Goal**: Seamless chat-canvas workflow with export capabilities
**Depends on**: Phase 5
**Requirements**: CHAT-06, EXPORT-01, EXPORT-02, UX-01 (completion), UX-03
**Success Criteria** (what must be TRUE):
  1. User experiences smooth transition from chat view to canvas workspace
  2. Floating chat sidebar persists in canvas view for continued conversation
  3. User can export generated assets as PNG with transparency
  4. User can export generated assets as SVG (if feasible, otherwise high-res PNG)
  5. Generation shows responsive loading states and progress feedback
  6. UI follows modern, clean aesthetic throughout (Linear/Granola/Anthropic style)
**Plans**: TBD

Plans:
- [ ] 06-01: Chat-canvas integration and sidebar
- [ ] 06-02: Export functionality
- [ ] 06-03: Loading states and UX polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-02-07 |
| 2. Chat Interface | 3/3 | Complete | 2026-02-07 |
| 3. Style Extraction | 3/3 | Complete | 2026-02-07 |
| 4. Canvas Workspace | 4/4 | Complete | 2026-02-08 |
| 5. AI Generation | 0/3 | Not started | - |
| 6. Integration & Export | 0/3 | Not started | - |

---
*Roadmap created: 2026-02-06*
*Total phases: 6 | Total plans: 18 (estimated)*
