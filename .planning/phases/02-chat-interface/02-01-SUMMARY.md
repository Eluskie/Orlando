---
phase: 02-chat-interface
plan: 01
subsystem: ui
tags: [next.js, react, streaming, vercel-ai-sdk, gemini, sidebar, routing]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Design system, stores, AI config, mock mode
provides:
  - App shell with persistent sidebar layout
  - ChatSidebar component with brand navigation
  - POST /api/chat streaming endpoint
  - System prompt for brand creation assistant
affects: [02-02, 02-03, 03-style-extraction, 04-canvas-workspace]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Route group (chat) for layout isolation
    - Streaming response with word-by-word mock delays
    - Three-panel flexbox layout (sidebar + main)

key-files:
  created:
    - src/app/(chat)/layout.tsx
    - src/app/(chat)/page.tsx
    - src/app/(chat)/[brandId]/page.tsx
    - src/components/chat/chat-sidebar.tsx
    - src/app/api/chat/route.ts
    - src/lib/ai/chat.ts
  modified: []

key-decisions:
  - "Removed demo page.tsx to let (chat) route group handle root path"
  - "Mock streaming uses 50ms word-by-word delays for natural feel"
  - "System prompt guides brand creation without complex wizards"

patterns-established:
  - "Route groups with layout.tsx for persistent UI elements"
  - "ChatSidebar pattern: header + scrollable list + bottom action"
  - "API route pattern: mock mode check early, then branch to mock/real implementation"

# Metrics
duration: 4min
completed: 2026-02-07
---

# Phase 2 Plan 01: App Shell and Streaming Chat Summary

**OpenCode-inspired sidebar layout with persistent brand navigation and streaming chat API using Vercel AI SDK with mock mode support**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-07T14:55:17Z
- **Completed:** 2026-02-07T14:59:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- App shell with persistent sidebar showing brand list and "New Brand" button
- Dynamic routing for brand-specific chat pages (/[brandId])
- Streaming chat API endpoint with mock mode (word-by-word delays) and real Gemini support
- System prompt guiding users through brand creation conversations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat route group layout with sidebar** - `c997a9f` (feat)
2. **Task 2: Create streaming chat API endpoint** - `0599969` (feat)

## Files Created/Modified
- `src/app/(chat)/layout.tsx` - App shell with sidebar + main area
- `src/app/(chat)/page.tsx` - Welcome page when no brand selected
- `src/app/(chat)/[brandId]/page.tsx` - Dynamic brand chat placeholder
- `src/components/chat/chat-sidebar.tsx` - Brand navigation sidebar
- `src/app/api/chat/route.ts` - Streaming chat endpoint with mock/real modes
- `src/lib/ai/chat.ts` - System prompt and message utilities
- `src/app/page.tsx` - Removed (replaced by route group)

## Decisions Made
- **Removed demo page.tsx:** Route group (chat) handles root `/`, so the Phase 1 demo page was removed to avoid conflict
- **50ms streaming delays:** Mock mode streams word-by-word with 50ms delays for natural typing feel
- **Lightweight system prompt:** Guides brand creation without complex flow - keeps it conversational

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- **convertToModelMessages is async:** Required `await` in API route - quick fix based on TypeScript error

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- App shell ready for useChat integration (Plan 02)
- API endpoint ready to receive messages
- Brand navigation prepared for persistence (Plan 03)

---
*Phase: 02-chat-interface*
*Completed: 2026-02-07*
