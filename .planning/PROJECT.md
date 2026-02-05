# Dobra - Brand Style Consistency Platform

## What This Is

A conversational AI platform that helps agencies maintain brand consistency by extracting style from reference images and generating new branded assets on demand. Users start in a chat interface that guides brand creation, then transition to a spatial canvas workspace where they can generate illustrations, manage assets, and maintain visual consistency across all brand materials.

## Core Value

Agencies can generate brand-consistent illustrations months after the original branding work, without needing to contact the original designer - maintaining perfect style consistency through AI-powered generation.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Chat Interface & Brand Creation
- [ ] Conversational chat interface as entry point (Claude/ChatGPT style)
- [ ] Guided brand creation flow through chat
- [ ] Upload 1-2 reference images per brand via chat
- [ ] AI-powered style analysis and extraction
- [ ] Extract style to JSON format (descriptive keywords + technical parameters)
- [ ] Smooth transition from chat to canvas workspace

#### Canvas Workspace
- [ ] Canvas-based workspace interface (one canvas per brand)
- [ ] Visual moodboard displaying brand definition (references + characteristics)
- [ ] Toolbar with actions for asset management
- [ ] Floating chat container (sidebar) that persists in canvas view
- [ ] Display generated assets spatially on canvas
- [ ] Switch between multiple brand workspaces/canvases

#### Asset Generation (Two Modes)
- [ ] Text-to-image generation: Text prompt → styled illustration (via chat or toolbar)
- [ ] Image-to-image generation: Sketch/scribble → styled illustration (via chat or toolbar)
- [ ] Integration with Google Imagen API (Nano Banana) for generation
- [ ] Generated assets appear on canvas immediately
- [ ] Visual similarity to source style maintained
- [ ] Consistency across multiple generations from same style

#### Asset Management
- [ ] Basic generation history list per brand
- [ ] Export generated assets as PNG
- [ ] Export generated assets as SVG
- [ ] View past generations for each brand

#### Design & UX
- [ ] Modern, clean UI aesthetic (inspired by Linear, Granola, Anthropic)
- [ ] Intuitive chat-to-canvas flow
- [ ] Responsive interactions for asset generation

### Out of Scope

- **Template application (business cards, social media)** — Defer to v2, focus on core generation first
- **Full AI agent for brand creation from scratch** — v1 requires reference images, v2 can guide full creation
- **User authentication** — Single user for v1, add auth when opening to multiple users
- **Multi-user collaboration** — Future consideration when expanding beyond personal use
- **Real-time collaboration** — Not needed for single-user v1
- **Fine-tuning models per brand** — Start with prompt-based style extraction (JSON), consider fine-tuning if needed in v2
- **Advanced canvas features** (zoom, pan, layers) — Keep canvas simple for v1, enhance in v2
- **Asset editing/manipulation on canvas** — Canvas is for viewing/organizing, not editing

## Context

**Problem:** Companies get branding work done (including illustration styles) but struggle to create new assets months later without going back to the original designer. This breaks brand consistency and creates bottlenecks.

**Solution approach:** Use AI to extract the "essence" of a brand's visual style from 1-2 example images, store it as structured data (JSON), and use it to generate new assets on demand that match the original style.

**User profile:** Building for personal agency use initially, may expand to 2 people, potentially open to clients in future.

**Technical environment:** Modern web stack (Next.js ecosystem), leveraging Google's Imagen API for actual image generation.

**Style extraction strategy:** Analyze reference images to extract descriptive keywords (minimalist, playful, corporate, etc.) and technical parameters that can be fed to Google's generation API. This structured approach allows flexibility and explainability vs. black-box fine-tuning.

**Interface philosophy:** Chat-first (familiar, guides user through creation) → evolves to canvas (spatial, visual, powerful for managing multiple assets and seeing the brand holistically).

## Constraints

- **Tech stack**: Next.js or React, Neon (PostgreSQL), Drizzle ORM — Modern, popular stack preferred
- **Single user**: No authentication for v1 (can use BetterAuth or Clerk in future)
- **Google Imagen API**: Dependent on Google's API capabilities, pricing, and availability
- **Budget**: API costs scale with usage (generation requests)
- **SVG output**: May require PNG→SVG conversion depending on API output format

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Style extraction via JSON (not fine-tuning) | More flexible, faster to implement, explainable, no model training costs | — Pending |
| Chat-to-canvas interface (not traditional CRUD) | More intuitive, guides users, matches modern AI UX patterns | — Pending |
| One canvas per brand (workspace switching) | Cleaner mental model, focused work context, easier to implement | — Pending |
| Defer templates to v2 | Focus on core generation capabilities first, validate before expanding | — Pending |
| Next.js + Neon + Drizzle | Modern stack with good DX, scales well, strong ecosystem | — Pending |

---
*Last updated: 2026-02-06 after initialization*
