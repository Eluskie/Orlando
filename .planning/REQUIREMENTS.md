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
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 3 | Pending |
| CHAT-04 | Phase 3 | Pending |
| CHAT-05 | Phase 3 | Pending |
| CHAT-06 | Phase 6 | Pending |
| CANV-01 | Phase 4 | Pending |
| CANV-02 | Phase 4 | Pending |
| CANV-03 | Phase 6 | Pending |
| CANV-04 | Phase 4 | Pending |
| CANV-05 | Phase 4 | Pending |
| CANV-06 | Phase 4 | Pending |
| CANV-07 | Phase 4 | Pending |
| GEN-01 | Phase 5 | Pending |
| GEN-02 | Phase 5 | Pending |
| GEN-03 | Phase 5 | Pending |
| GEN-04 | Phase 5 | Pending |
| GEN-05 | Phase 5 | Pending |
| GEN-06 | Phase 5 | Pending |
| GEN-07 | Phase 5 | Pending |
| BRAND-01 | Phase 2 | Pending |
| BRAND-02 | Phase 1, 3 | Pending |
| BRAND-03 | Phase 2 | Pending |
| BRAND-04 | Phase 3 | Pending |
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| EXPORT-01 | Phase 6 | Pending |
| EXPORT-02 | Phase 6 | Pending |
| UX-01 | Phase 1, 6 | Pending |
| UX-02 | Phase 4 | Pending |
| UX-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

**Coverage by Phase:**
| Phase | Requirements |
|-------|--------------|
| Phase 1 | BRAND-02 (partial), UX-01 (partial) |
| Phase 2 | CHAT-01, CHAT-02, BRAND-01, BRAND-03 |
| Phase 3 | CHAT-03, CHAT-04, CHAT-05, BRAND-02 (completion), BRAND-04 |
| Phase 4 | CANV-01, CANV-02, CANV-04, CANV-05, CANV-06, CANV-07, UX-02 |
| Phase 5 | GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07, HIST-01, HIST-02 |
| Phase 6 | CHAT-06, CANV-03, EXPORT-01, EXPORT-02, UX-01 (completion), UX-03 |

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after roadmap creation*
