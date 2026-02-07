# Phase 2: Chat Interface - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a conversational chat interface as the app's entry point. Users can send messages, receive streaming AI responses, create brands through the chat, and see conversation history persisted to the database. The chat guides brand creation with a lightweight flow (name + optional context), then transitions the user toward the canvas workspace.

Image upload, style extraction, and canvas rendering are NOT in this phase (Phases 3-4).

</domain>

<decisions>
## Implementation Decisions

### Chat layout & feel
- **OpenCode-inspired layout**: Left sidebar always visible showing brand projects (like OpenCode's project list). Plus button to create new brand.
- **Chat starts full-width centered** when no content exists for a brand — like Claude.ai's centered column.
- **Chat shrinks to left panel** once brand has content, making room for canvas in center and optional right panel later.
- **Per-brand sub-navigation**: Clicking a brand in sidebar opens navigation specific to that brand (chat, canvas, settings).
- **Minimal message style (Claude-like)**: Clean text messages, no bubbles. Left-aligned with subtle separation. User messages differentiated by styling, not position.
- **Input area**: Text input + send button + disabled attachment icon (placeholder for Phase 3 upload). Attachment button is visible but inactive until Phase 3.
- **Empty state**: When no brands exist, sidebar is empty. First chat helps create a brand. No onboarding wizard — just start chatting.

### Streaming & messages
- **Streaming approach**: Claude's Discretion — pick best streaming method for Vercel AI SDK integration (word-by-word or chunk).
- **Typing indicator**: Animated pulsing dots (like iMessage) while waiting for first response token.
- **Message formatting**: Basic formatting only for v1 (bold, lists). Architecture it so full markdown can be enabled later. No code blocks needed — this is a brand tool.
- **Inline brand card**: When AI creates a brand, show a styled card inline in chat with brand name, color, and a "View Canvas" action.

### Conversation persistence
- **One conversation per brand for v1**: Simplest model. Schema already supports multiple conversations — easy to extend later.
- **Database persistence (Neon)**: Messages saved to the messages table immediately on send/receive. Not localStorage.
- **Chat history loading**: Claude's Discretion — pick best approach for performance (full load vs paginated).
- **Clear conversation**: Users can clear/delete a conversation via brand menu. Deletes messages, keeps the brand.

### Brand creation flow
- **Lightweight creation**: Brand creation is NOT a deep wizard. Core value is style replication from references, not building brand identity from scratch.
- **Minimal info collected**: Brand name is the primary requirement. Optional one-liner description. That's it.
- **AI initiates on first message**: When user sends first message in a new chat (no brand context), AI recognizes this and guides toward creating a brand.
- **User confirms via button**: AI collects the name, then shows a confirmation card/button in chat. User clicks to confirm brand creation.
- **After creation → transition to canvas**: Brand creation leads to canvas view where the first action is uploading references. For Phase 2, we handle everything up to the transition point.

### Claude's Discretion
- Exact streaming implementation (word-by-word vs chunk)
- Chat history loading strategy (full load vs paginated)
- Exact message spacing and typography
- Error state handling for failed messages
- Scroll behavior on new messages

</decisions>

<specifics>
## Specific Ideas

- "Take a look at how OpenCode does it — the UI structure is very nice." OpenCode's left sidebar for project switching, with per-project navigation that expands.
- Messages should feel like Claude.ai — clean, minimal, no bubble clutter.
- The real value is replicating style from references, not creating brand identity from scratch. Keep brand creation fast and simple.
- "People don't want to do that; they just want to be able to replicate." — Don't over-engineer the brand creation wizard.
- After brand creation, the experience should transition into the canvas where the first action is uploading reference images.

</specifics>

<deferred>
## Deferred Ideas

- Multiple conversations per brand — v2 (schema supports it, just needs UI for conversation list)
- Image upload in chat — Phase 3 (Style Extraction)
- Canvas workspace rendering — Phase 4 (Canvas Workspace)
- Reference-based style extraction — Phase 3

</deferred>

---

*Phase: 02-chat-interface*
*Context gathered: 2026-02-07*
