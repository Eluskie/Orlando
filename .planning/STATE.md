# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** Agencies can generate brand-consistent illustrations without contacting the original designer - maintaining perfect style consistency through AI-powered extraction and generation.
**Current focus:** Phase 4 - Canvas Workspace in progress

## Current Position

Phase: 4 of 6 (Canvas Workspace)
Plan: 3 of 4 in current phase (04-01, 04-02, 04-03 complete)
Status: In progress
Last activity: 2026-02-08 - Completed 04-02-PLAN.md (Canvas Interactions)

Progress: [████████░░] 56% (9/16 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 5 min
- Total execution time: 43 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 12 min | 6 min |
| 2. Chat Interface | 3/3 | 12 min | 4 min |
| 3. Style Extraction | 1/3 | 5 min | 5 min |
| 4. Canvas Workspace | 3/4 | 18 min | 6 min |

**Recent Trend:**
- Last 5 plans: 03-01 (5 min), 04-01 (4 min), 04-03 (4 min), 04-02 (6 min)
- Trend: Consistent efficiency

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 6 phases derived from requirements following Foundation -> Chat -> Extraction -> Canvas -> Generation -> Integration order
- [Roadmap]: Style extraction before canvas (can't display what doesn't exist)
- [Roadmap]: Cost controls in Phase 1 (prevent expensive mistakes during development)
- [01-01]: Inter font for Linear/Anthropic aesthetic
- [01-01]: Separate messages table (not JSONB array) for chat history scalability
- [01-01]: Canvas positioning fields on assets table for Phase 4 spatial workspace
- [01-01]: neon-http driver for serverless-first architecture
- [01-01]: UUID primary keys on all tables
- [01-02]: Tailwind v4 CSS-first config via @theme inline (no tailwind.config.ts)
- [01-02]: Partial persistence (only activeBrandId, conversationId) to avoid stale state
- [01-02]: Canvas undo tracks objects only (not viewport/selection)
- [01-02]: Mock AI uses SVG data URL placeholders (zero external dependencies)
- [01-02]: Daily generation limit (50) tracked client-side, server enforcement in Phase 5
- [02-01]: Route group (chat) handles root path; demo page removed
- [02-01]: Mock streaming uses 50ms word-by-word delays for natural feel
- [02-01]: System prompt guides brand creation conversationally (no wizard)
- [02-02]: DefaultChatTransport with body param for brandId in useChat
- [02-02]: Use message.parts array for AI SDK v6 (not deprecated content)
- [02-02]: ChatLayout adaptive: hasContent=false->max-w-3xl, true->w-[350px] left panel
- [03-01]: Use temp/ path for uploads without brandId (new brand flow)
- [03-01]: Max 3 images per message (UI enforced)
- [03-01]: Image parts use type: file with mediaType for AI SDK compatibility
- [04-01]: Stage is draggable for panning - setPan called on Stage dragEnd
- [04-01]: Images use CORS anonymous mode for cross-origin compatibility
- [04-01]: ResizeObserver pattern for responsive Stage dimensions
- [04-02]: Wheel zoom updates both Konva Stage (imperative) and Zustand store (persistence)
- [04-02]: Trackpad pinch zoom supported via ctrlKey detection
- [04-02]: Transformer scale reset pattern - store actual dimensions, not scale values
- [04-03]: Temporal state requires useEffect subscription for zundo reactivity
- [04-03]: Toolbar uses native buttons with Tailwind (no Button component dependency)
- [04-03]: Zoom step factor of 1.2x per click for smooth increments

### Pending Todos

- User must provide Neon DATABASE_URL in .env.local before database operations
- User must provide BLOB_READ_WRITE_TOKEN in .env.local for image uploads (see 03-USER-SETUP.md)

### Blockers/Concerns

- [Research]: Style extraction JSON schema needs design during Phase 3 planning
- [Research]: Imagen API integration patterns need research during Phase 5 planning
- [Research]: SVG export may not be feasible (AI outputs PNG) - may need high-res PNG alternative

## Session Continuity

Last session: 2026-02-08
Stopped at: Completed 04-02-PLAN.md (Canvas Interactions)
Resume file: None
