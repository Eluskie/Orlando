# Requirements: Dobra

**Defined:** 2026-02-06
**Core Value:** Agencies can generate brand-consistent illustrations without contacting the original designer — maintaining perfect style consistency through AI-powered extraction and generation.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Chat Interface & Brand Creation

- [ ] **CHAT-01**: User sees conversational chat interface as entry point (Claude/ChatGPT style)
- [ ] **CHAT-02**: Chat guides user through brand creation (upload references, extraction feedback)
- [ ] **CHAT-03**: User can upload 1-3 reference images per brand via chat
- [ ] **CHAT-04**: AI extracts style from references to JSON (descriptive keywords + technical parameters)
- [ ] **CHAT-05**: User sees feedback on what style elements were extracted
- [ ] **CHAT-06**: User experiences smooth transition from chat view to canvas workspace

### Canvas Workspace

- [ ] **CANV-01**: User has dedicated canvas workspace per brand
- [ ] **CANV-02**: Canvas displays visual moodboard (references + generated assets together)
- [ ] **CANV-03**: Floating chat sidebar persists in canvas view for continued conversation
- [ ] **CANV-04**: User can zoom and pan the canvas
- [ ] **CANV-05**: User can undo/redo actions on canvas
- [ ] **CANV-06**: User can drag and arrange assets on canvas
- [ ] **CANV-07**: User can switch between different brand workspaces

### AI Generation

- [ ] **GEN-01**: User can generate images from text prompts with brand style applied
- [ ] **GEN-02**: User can generate images from sketches/images with brand style applied
- [ ] **GEN-03**: Each generation produces 2-4 variations to choose from
- [ ] **GEN-04**: Brand style is automatically applied without re-prompting
- [ ] **GEN-05**: Generated assets appear on canvas immediately (optimistic UI)
- [ ] **GEN-06**: System integrates with Google Imagen API for generation
- [ ] **GEN-07**: User can generate via chat OR toolbar/UI controls

### Brand Management

- [ ] **BRAND-01**: User can create a new brand by providing reference images
- [ ] **BRAND-02**: System stores brand style as structured JSON (keywords + parameters)
- [ ] **BRAND-03**: User can name and identify brands for easy switching
- [ ] **BRAND-04**: User can view brand definition as visual moodboard

### Export & History

- [ ] **HIST-01**: User can view generation history per brand (basic list)
- [ ] **HIST-02**: User can revisit and reuse previous generations
- [ ] **EXPORT-01**: User can export generated assets as PNG with transparency
- [ ] **EXPORT-02**: User can export generated assets as SVG (nice to have)

### Design & UX

- [ ] **UX-01**: UI follows modern, clean aesthetic (Linear/Granola/Anthropic style)
- [ ] **UX-02**: Canvas has toolbar with common actions
- [ ] **UX-03**: Generation shows responsive loading states and progress feedback

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Templates

- **TMPL-01**: User can apply brand to pre-built templates (business cards, social posts)
- **TMPL-02**: User can see brand applied to mockups before export

### Brand Creation

- **CREATE-01**: User can create brand from scratch without reference images (AI-guided)
- **CREATE-02**: Chat suggests style directions based on user description

### Advanced Features

- **ADV-01**: User can upscale generations for print-ready resolution
- **ADV-02**: User can adjust style weight/influence on generations
- **ADV-03**: User can organize workspace with folders/tags
- **ADV-04**: User can compare generations side-by-side

### Collaboration

- **COLLAB-01**: Multiple users can access the platform (authentication)
- **COLLAB-02**: Users can share brand workspaces
- **COLLAB-03**: Real-time collaboration on canvas

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real-time collaboration | High complexity (CRDT, presence, conflict resolution); premature for v1 validation |
| Full brand creation from scratch | Massively increases scope; v1 requires at least 1-3 reference images |
| Template application | Complex template system; different product category (Canva territory) |
| Plugin/extension system | Premature optimization; adds API maintenance burden |
| Automatic social media sizing | Scope creep into marketing automation; users resize externally |
| Version branching | Complex version control UX; confuses brand consistency message |
| AI-generated brand guidelines | Outside core competency; low quality without human input |
| Multiple export formats (PSD, AI) | Maintain focus on universal formats (PNG + SVG) |
| Inpainting/outpainting | Feature bloat; add based on usage data |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHAT-01 | TBD | Pending |
| CHAT-02 | TBD | Pending |
| CHAT-03 | TBD | Pending |
| CHAT-04 | TBD | Pending |
| CHAT-05 | TBD | Pending |
| CHAT-06 | TBD | Pending |
| CANV-01 | TBD | Pending |
| CANV-02 | TBD | Pending |
| CANV-03 | TBD | Pending |
| CANV-04 | TBD | Pending |
| CANV-05 | TBD | Pending |
| CANV-06 | TBD | Pending |
| CANV-07 | TBD | Pending |
| GEN-01 | TBD | Pending |
| GEN-02 | TBD | Pending |
| GEN-03 | TBD | Pending |
| GEN-04 | TBD | Pending |
| GEN-05 | TBD | Pending |
| GEN-06 | TBD | Pending |
| GEN-07 | TBD | Pending |
| BRAND-01 | TBD | Pending |
| BRAND-02 | TBD | Pending |
| BRAND-03 | TBD | Pending |
| BRAND-04 | TBD | Pending |
| HIST-01 | TBD | Pending |
| HIST-02 | TBD | Pending |
| EXPORT-01 | TBD | Pending |
| EXPORT-02 | TBD | Pending |
| UX-01 | TBD | Pending |
| UX-02 | TBD | Pending |
| UX-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 30

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after initial definition*
