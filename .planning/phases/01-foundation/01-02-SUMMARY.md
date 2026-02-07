---
phase: 01-foundation
plan: 02
subsystem: state, ai, design
tags: [zustand, zundo, rate-limiting, mock-ai, tailwind-v4, design-system]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js project, DB schema, TypeScript types, all dependencies installed
provides:
  - Four Zustand stores (brand, chat, canvas, generation) with persistence and undo/redo
  - Mock AI mode for development without API costs
  - In-memory rate limiter with 429 response support
  - Generation API endpoint (POST + GET)
  - Linear/Anthropic-inspired design system via Tailwind v4 @theme tokens
  - Component classes (btn, input, card, spinner) and utility classes
affects: [02-chat-interface, 03-style-extraction, 04-canvas-workspace, 05-ai-generation, 06-integration]

# Tech tracking
tech-stack:
  added: [zundo]
  patterns: [zustand-persist, zustand-temporal, in-memory-rate-limit, mock-mode-env-switch, css-first-tailwind-v4, design-tokens-via-theme]

key-files:
  created:
    - src/stores/brand-store.ts
    - src/stores/chat-store.ts
    - src/stores/canvas-store.ts
    - src/stores/generation-store.ts
    - src/lib/ai/config.ts
    - src/lib/ai/mock.ts
    - src/lib/rate-limit.ts
    - src/app/api/generate/route.ts
  modified:
    - src/app/globals.css
    - src/app/page.tsx
    - .env.example
    - package.json

key-decisions:
  - "Tailwind v4 CSS-first config (no tailwind.config.ts) using @theme inline directive"
  - "Persist only essential IDs (activeBrandId, conversationId) not full state"
  - "Canvas undo/redo tracks only objects, not viewport or selection state"
  - "50-state limit on canvas undo history to prevent memory growth"
  - "Daily generation limit (50) tracked client-side in generation store"
  - "Rate limiter uses in-memory Map (resets on restart, fine for dev)"
  - "Mock AI returns SVG data URLs as placeholders (no external dependencies)"

patterns-established:
  - "Store-per-domain: separate stores for brand, chat, canvas, generation"
  - "Partialize persistence: only persist what must survive page reload"
  - "Environment-driven modes: MOCK_AI_MODE switches between real and mock AI"
  - "Rate limit before process: check rate limit before any expensive operation"
  - "CSS component classes: .btn, .input, .card for consistent styling"

# Metrics
duration: 7min
completed: 2026-02-07
---

# Phase 1 Plan 2: Stores and Design System Summary

**Zustand stores with persistence/undo, mock AI mode with rate-limited generation endpoint, Linear/Anthropic design system via Tailwind v4 @theme tokens**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-07T13:55:12Z
- **Completed:** 2026-02-07T14:02:03Z
- **Tasks:** 3
- **Files created:** 8
- **Files modified:** 4

## Accomplishments

- Four Zustand stores scaffolded: brand (with persistence), chat (with persistence), canvas (with zundo undo/redo, 50-state limit), generation (with daily limit tracking)
- Mock AI mode returns placeholder images, chat responses, and style extraction data without API calls
- In-memory rate limiter with configurable window (10 req/min default), RateLimitError class
- POST /api/generate endpoint with rate limiting, validation, and mock mode support
- GET /api/generate endpoint for rate limit status checking
- Linear/Anthropic-inspired design system: gray scale, indigo primary, success/warning/error accents
- Component classes: btn (primary/secondary/ghost), input, card, spinner
- Utility classes: scrollbar-hide, text-gradient
- Keyframe animations: fade-in, slide-up, pulse-subtle

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand stores for all domains** - `a1f963e` (feat)
2. **Task 2: Implement mock AI mode and rate limiting** - `b77c6f7` (feat)
3. **Task 3: Configure design system** - `5354f77` (style)

## Files Created/Modified

- `src/stores/brand-store.ts` - Brand state with persistence, CRUD actions, style updates
- `src/stores/chat-store.ts` - Chat state with persistence, message management, streaming flag
- `src/stores/canvas-store.ts` - Canvas state with zundo temporal undo/redo (50 states), object CRUD
- `src/stores/generation-store.ts` - Generation queue with daily limit tracking (50/day)
- `src/lib/ai/config.ts` - AI_CONFIG object, isMockMode() function
- `src/lib/ai/mock.ts` - mockGenerate(), mockChat(), getMockStyleExtraction()
- `src/lib/rate-limit.ts` - rateLimit(), checkRateLimit(), RateLimitError class
- `src/app/api/generate/route.ts` - POST (generate with rate limit) + GET (status check)
- `src/app/globals.css` - Full design system via Tailwind v4 @theme tokens
- `src/app/page.tsx` - Design system demo page (buttons, card, colors, input)
- `.env.example` - Added MOCK_AI_MODE=true
- `package.json` - Added zundo dependency

## Decisions Made

- **Tailwind v4 CSS-first config**: Project uses Tailwind v4 which eliminates tailwind.config.ts. All design tokens defined via `@theme inline` directive in globals.css. This is a deviation from the plan which specified tailwind.config.ts (adapted for correct Tailwind version).
- **Partial persistence strategy**: Brand store persists only activeBrandId, chat store persists only conversationId. Full data comes from server on load. This prevents stale local state diverging from database.
- **Canvas undo tracks objects only**: Viewport (zoom/pan) and selection are not tracked in undo history. Users don't expect "undo" to change their view position.
- **SVG data URL placeholders**: Mock AI generates SVG data URLs inline instead of requiring external placeholder services. Works offline with zero dependencies.
- **Daily limit client-side**: Generation store tracks daily count locally with date-based reset. Server-side enforcement will come in Phase 5.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tailwind v4 uses CSS-first config, not JS config**
- **Found during:** Task 3 (design system configuration)
- **Issue:** Plan specified creating `tailwind.config.ts` but project uses Tailwind v4 which configures via CSS `@theme` directives, not JS config files
- **Fix:** Used `@theme inline` in globals.css for all design tokens instead of creating tailwind.config.ts
- **Files modified:** src/app/globals.css
- **Committed in:** `5354f77` (Task 3)

---

**Total deviations:** 1 auto-fixed (blocking issue)
**Impact on plan:** Adapted to correct Tailwind v4 patterns. All design system tokens are equivalent, just defined via CSS instead of JS.

## Issues Encountered

None - all tasks executed smoothly. Build compiles with zero errors.

## Verification Results

- `npx tsc --noEmit` passes with no errors
- `npx next build` compiles successfully
- All routes render (static: /, dynamic: /api/generate)
- MOCK_AI_MODE=true set in .env.local

## Next Phase Readiness

Phase 1 is now complete. All foundation infrastructure is in place:
- Database schema (01-01) + state stores (01-02) ready for Phase 2 chat interface
- Mock AI mode enables rapid development without API costs
- Rate limiting protects against accidental expense during development
- Design system provides consistent visual language for all future UI work
- Canvas store with undo/redo ready for Phase 4

**Phase 2 can begin**: Chat UI components, streaming, brand creation flow.

---
*Phase: 01-foundation*
*Completed: 2026-02-07*
