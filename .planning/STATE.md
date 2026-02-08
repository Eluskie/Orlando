# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** Agencies can generate brand-consistent illustrations without contacting the original designer - maintaining perfect style consistency through AI-powered extraction and generation.
**Current focus:** Phase 5 - AI Generation planning

## Current Position

Phase: 5 of 6 (AI Generation)
Plan: 0 of 3 in current phase (planning)
Status: Planning
Last activity: 2026-02-08 - Completed Phase 4 (Canvas Workspace with ReactFlow)

Progress: [████████░░] 75% (12/16 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 5 min
- Total execution time: 55 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 12 min | 6 min |
| 2. Chat Interface | 3/3 | 12 min | 4 min |
| 3. Style Extraction | 3/3 | 8 min | 3 min |
| 4. Canvas Workspace | 4/4 | 23 min | 6 min |

**Recent Trend:**
- Phase 4 included ReactFlow migration (user request)
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
- [01-02]: Canvas undo tracks nodes only (not viewport/selection)
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
- [04]: Migrated from Konva to ReactFlow (user request)
- [04]: ReactFlow node-based model with ImageNode custom component
- [04]: Built-in zoom/pan, MiniMap, Controls, and Background from ReactFlow
- [04]: Upload route now creates asset records in database for canvas display
- [04]: NodeResizer for resize handles on selected images

### Pending Todos

- User must provide Neon DATABASE_URL in .env.local before database operations
- User must provide R2 credentials in .env.local for image uploads

### Blockers/Concerns

- [Research]: Imagen API integration patterns need research during Phase 5 planning
- [Research]: SVG export may not be feasible (AI outputs PNG) - may need high-res PNG alternative

## Session Continuity

Last session: 2026-02-08
Stopped at: Completed Phase 4 (Canvas Workspace)
Resume file: None
