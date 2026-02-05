# Pitfalls Research

**Domain:** AI-powered brand style consistency platform (chat-to-canvas)
**Researched:** 2026-02-06
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: API Cost Blowup

**What goes wrong:**
AI generation costs spiral out of control. Free tier limits (2 IPM for Gemini) are quickly exhausted during development/testing. Per-generation charges accumulate without visibility until a surprising bill arrives. Users triggering unlimited regenerations without throttling.

**Why it happens:**
- No spending caps or usage monitoring implemented early
- Development testing burns through quotas
- UI allows rapid-fire generation without rate limiting
- No caching strategy for identical/similar requests

**How to avoid:**
- Set hard spending limits and alerts from day one (Google Cloud billing alerts)
- Implement client-side generation throttling (debounce, cooldown timers)
- Cache generated images by input hash to avoid regenerating identical requests
- Build usage dashboard showing API consumption before it becomes a surprise
- Use batch processing for non-time-sensitive operations (50% cost reduction)

**Warning signs:**
- No visibility into daily/weekly API costs
- Users can click "regenerate" unlimited times
- Testing generates real API calls without mock mode
- No rate limiting on generation endpoints

**Phase to address:**
Foundation phase - implement cost controls before any AI integration. Build mock mode for development.

---

### Pitfall 2: Style Extraction Unreliability

**What goes wrong:**
The core value proposition fails. Style extraction from source images produces inconsistent JSON outputs. The same image analyzed twice gives different results. Extracted styles don't translate to consistent generations.

**Why it happens:**
- AI models have inherent variability in image analysis
- No validation schema for extracted style data
- Temperature settings too high for style extraction prompts
- Over-reliance on single-pass extraction without verification
- Attempting to extract overly complex style properties

**How to avoid:**
- Define a strict JSON schema for style output and validate responses
- Use low temperature settings for extraction (maximize consistency)
- Implement extraction verification: run twice, compare outputs, flag discrepancies
- Start with limited style properties (colors, fonts, layout) before complex attributes
- Let users verify/adjust extracted styles before committing
- Cache verified styles rather than re-extracting

**Warning signs:**
- Style JSON structure varies between extractions
- Generated assets don't match source material
- Users report "the AI doesn't understand my brand"
- No human verification step in style extraction flow

**Phase to address:**
Core AI Integration phase - this IS the product. Validate extraction quality before building generation features.

---

### Pitfall 3: Canvas Performance Degradation

**What goes wrong:**
Canvas becomes sluggish as users add assets. Memory usage grows unbounded. Long sessions crash the browser. Interactions lag noticeably after 10-20 assets on canvas.

**Why it happens:**
- Canvas elements not properly disposed when removed
- Event listeners accumulating without cleanup
- High-resolution images loaded at full size regardless of zoom
- No virtualization for off-screen elements
- Animations running on every frame regardless of visibility

**How to avoid:**
- Implement proper cleanup on component unmount (remove event listeners, dispose textures)
- Use image thumbnails for canvas display, full resolution only on export
- Virtualize rendering: only render visible elements
- Profile memory usage early and set performance budgets
- Limit canvas asset count for v1 (e.g., max 50 elements)

**Warning signs:**
- Memory usage grows monotonically during session
- Performance degrades over time without adding content
- Browser DevTools shows detached DOM nodes or growing heap
- No performance budget defined for canvas operations

**Phase to address:**
Canvas MVP phase - establish performance baseline from first canvas implementation. Don't wait for "optimization later."

---

### Pitfall 4: Chat-to-Canvas UX Confusion

**What goes wrong:**
Users don't understand when they're in chat mode vs. canvas mode. They try to chat when they should be editing, or vice versa. The transition between modes feels jarring. Users lose context about what the AI "knows" from the chat.

**Why it happens:**
- Treating chat and canvas as completely separate experiences
- No visual continuity between modes
- Unclear mental model of what gets "transferred" to canvas
- Empty canvas state with no guidance
- Mode switching buried in navigation

**How to avoid:**
- Design explicit transition moment: "Your style is ready! View on canvas"
- Keep chat visible/accessible when on canvas (split view or sidebar)
- Show visual summary of chat-extracted information on canvas
- Never show empty canvas - always provide starting point or clear CTA
- Use progressive disclosure: don't expose canvas until chat produces actionable result

**Warning signs:**
- Users asking "where did my chat go?"
- High bounce rate after chat completion
- Users re-entering style information they already provided
- Confusion about whether changes in canvas affect chat context

**Phase to address:**
UX Design phase - prototype the transition flow before building either chat or canvas in isolation.

---

### Pitfall 5: Async Generation Without Proper Feedback

**What goes wrong:**
Users stare at spinners with no idea if generation is working, stuck, or failed. Long waits (10-30+ seconds for image generation) feel broken without progressive feedback. Users abandon or spam retry.

**Why it happens:**
- Treating AI generation like a fast API call
- Generic loading indicators without context
- No streaming or progress updates
- Timeout errors shown as generic failures
- No way to cancel in-flight generations

**How to avoid:**
- Use streaming text output where possible (show AI thinking/planning)
- For image generation: show placeholder with progress indicator, estimated time
- Implement timeout cascades: 10s warning, 30s timeout, graceful fallback
- Allow cancellation of in-flight requests
- Show what's happening: "Analyzing style...", "Generating image...", "Optimizing..."

**Warning signs:**
- Static spinner with no text during generation
- No difference between 2-second and 30-second waits
- Users clicking generate multiple times
- No cancel button during generation

**Phase to address:**
Core AI Integration phase - build feedback patterns alongside generation, not after.

---

### Pitfall 6: State Synchronization Breakdown

**What goes wrong:**
Chat state and canvas state become desynchronized. User changes style in chat but canvas shows old style. Canvas edits aren't reflected in chat context. Undo/redo breaks across mode boundaries.

**Why it happens:**
- Separate state stores for chat and canvas without proper coordination
- No single source of truth for style/asset data
- Optimistic updates without rollback on failure
- Missing state hydration on mode switch
- Event-based sync without conflict resolution

**How to avoid:**
- Single source of truth: style lives in one place, both UIs read from it
- Use atomic state patterns (Jotai/Zustand) where only affected components re-render
- Design state shape that supports both chat and canvas needs
- Implement explicit sync points rather than trying to keep everything live-synced
- Log state transitions for debugging sync issues

**Warning signs:**
- Different data shown in chat vs. canvas
- "It worked in chat but not on canvas" bug reports
- Refresh needed to see latest changes
- Duplicate state for same conceptual entity

**Phase to address:**
Foundation phase - define state architecture before building either UI. This is structural, not fixable later without rewrite.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip image optimization | Faster dev time | Storage costs balloon, slow load times | Never for user-uploaded images |
| No mock AI mode | Faster initial setup | Every test burns API quota, flaky tests | Never |
| Store full images in DB | Simple architecture | DB bloat, slow queries, backup issues | Never - use object storage |
| Inline styles for canvas | Quick prototyping | No theming, inconsistent look | Only in first week of prototyping |
| No error boundaries | Fewer components | One failure crashes entire UI | Never |
| Skip rate limiting | Simpler API | Cost blowup, abuse vulnerability | Only in private alpha |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Gemini API | No retry logic for 429 errors | Exponential backoff with jitter (1s, 2s, 4s, 8s delays) |
| Google Gemini API | Using high temperature for style extraction | Low temperature (0.1-0.3) for consistent structured output |
| Google Gemini API | Ignoring `finishReason` in responses | Check for safety blocks, truncation, handle each case |
| Cloud Storage | Storing full-res images only | Generate and store thumbnails for canvas, full-res for export |
| Cloud Storage | No lifecycle policies | Auto-delete temp files, archive old generations |
| Auth Provider | Blocking on auth checks | Optimistic UI with background validation |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all canvas assets at once | Slow initial load, memory spike | Lazy load, start with placeholders | >10 assets |
| Full image in canvas render | Sluggish pan/zoom | Use thumbnails, full-res only on export | >5 high-res images |
| Re-extracting styles on each request | Slow, inconsistent, costly | Cache extraction results, re-use | Every session |
| Synchronous AI calls in request path | Request timeouts, poor UX | Queue + webhook or polling | Any production load |
| No pagination for generations history | Memory bloat, slow list render | Virtual list, pagination | >50 items |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing AI API keys in client | Unlimited API abuse, cost attack | Server-side proxy for all AI calls |
| No per-user rate limits | Single user drains quota | Per-user/session rate limiting |
| Trusting AI output without sanitization | XSS if rendering AI text/HTML | Sanitize all AI responses before display |
| Storing uploaded images without scanning | Malware distribution | Scan uploads, validate image formats |
| No content moderation on generations | Brand safety issues, legal risk | Content filtering on AI outputs |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Empty canvas after chat completion | Confusion, lost context | Pre-populate canvas with extracted style preview |
| Generic "Error occurred" messages | Frustration, no actionable path | Specific errors: "Image generation failed. Try simpler design." |
| Hiding generation progress | Users think it's broken | Show stages: "Analyzing... Generating... Optimizing..." |
| Requiring style extraction before any action | Friction for exploration | Allow basic canvas use, prompt for style when needed |
| No way to compare generated vs. source | Can't validate style match | Side-by-side comparison view |
| Overwhelming canvas controls | Paralysis, learning curve | Progressive disclosure, simple mode by default |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Style extraction:** Often missing validation of JSON schema - verify output structure consistency
- [ ] **Image generation:** Often missing error state UI - verify all error paths have user-facing messages
- [ ] **Canvas:** Often missing cleanup on unmount - verify no memory leaks with extended use
- [ ] **Chat:** Often missing conversation persistence - verify chat survives refresh
- [ ] **Export:** Often missing format options - verify PNG/SVG needs are met
- [ ] **Loading states:** Often missing cancel functionality - verify long operations can be aborted
- [ ] **Cost tracking:** Often missing user-facing usage display - verify users know their consumption
- [ ] **Mobile:** Often missing responsive canvas - verify touch interactions work

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| API cost overrun | LOW | Add spending caps, implement caching, review and optimize prompts |
| Canvas performance issues | MEDIUM | Profile and fix leaks, add virtualization, reduce asset quality |
| State sync bugs | HIGH | Audit state architecture, may require partial rewrite of state layer |
| Style extraction unreliability | MEDIUM | Reduce extraction complexity, add verification step, lower temperature |
| UX confusion (chat/canvas) | MEDIUM | User research, redesign transition flow, may require UI restructure |
| Security vulnerability (API key exposure) | HIGH | Rotate keys immediately, audit access logs, add server proxy |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API cost blowup | Foundation | Spending alerts configured, mock mode works, rate limits in place |
| Style extraction unreliability | Core AI Integration | Same image produces identical JSON 10/10 times |
| Canvas performance | Canvas MVP | 50 assets with <100ms interaction latency |
| Chat-to-canvas confusion | UX Design | User testing shows >80% successful transition |
| Async feedback | Core AI Integration | All generation states have distinct UI feedback |
| State sync breakdown | Foundation | State audit shows single source of truth |
| Scope creep (over-built canvas) | All phases | MoSCoW prioritization enforced, feature freeze for v1 |
| PNG→SVG expectations mismatch | Planning | Clear documentation that v1 is PNG-only, SVG is v2 |

## Scope Creep Warning Signs

Specific to this project - features that commonly creep into v1 but should be deferred.

| Feature | Why It Creeps In | Why Defer | Phase for Consideration |
|---------|------------------|-----------|------------------------|
| Real-time collaboration | "Figma has it" | Massive complexity, requires CRDT, not core value | v3+ |
| Advanced canvas tools (pen, shapes) | "Users might want to edit" | Core value is AI generation, not manual editing | v2 |
| Template library | "Common request" | Need to validate style extraction first | v2 |
| Vector/SVG export | "PNG isn't professional" | AI APIs output PNG, conversion is lossy | v2 |
| Brand guidelines PDF export | "Users need to share" | Nice-to-have, not MVP | v2 |
| Multi-brand management | "Agencies need this" | Validate single-brand first | v2 |
| Version history | "What if they want to go back?" | Local storage or simple saves first | v2 |

## PNG vs SVG Reality Check

A specific pitfall worth highlighting.

**The expectation:** Users want vector graphics for professional use (scalable, editable).
**The reality:** AI image generation APIs (Gemini, DALL-E, Midjourney) output rasterized PNG images.

**Why this matters:**
- PNG→SVG conversion is lossy and often looks worse than original
- True vector generation requires different AI models (limited availability)
- Users may be disappointed if they expect SVG

**Prevention:**
- Set expectations clearly: "AI-generated assets are high-resolution PNG"
- Position as "ready for digital use" not "print-ready vector"
- Defer SVG to v2 with explicit vector generation research
- Offer high-res PNG (2x, 4x) for quality needs

## Sources

- [Designing for AI Mistakes](https://medium.com/design-bootcamp/designing-for-ai-mistakes-because-they-will-happen-b8857d953bcc) - AI UX patterns
- [Konva Memory Leak Prevention](https://konvajs.org/docs/performance/Avoid_Memory_Leaks.html) - Canvas memory management
- [AI Loading States Pattern](https://uxpatterns.dev/patterns/ai-intelligence/ai-loading-states) - Async feedback patterns
- [State Synchronization Trap](https://ondrejvelisek.github.io/avoid-state-synchronization-trap/) - State management pitfalls
- [Gemini API Rate Limits Guide](https://www.aifreeapi.com/en/posts/gemini-api-rate-limits-per-tier) - API cost control
- [Gemini API Troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting) - Error handling best practices
- [MVP Scope and Over-engineering](https://fastercapital.com/content/Define-MVP-scope--How-to-Define-Your-MVP-Scope-and-Avoid-Overengineering.html) - Scope management
- [Conversational UI Best Practices](https://research.aimultiple.com/conversational-ui/) - Chat UX patterns
- [Cloud Cost Optimization Strategies](https://northflank.com/blog/cloud-cost-optimization) - Storage cost management
- [AI Brand Consistency Tools](https://logodiffusion.com/blog/how-ai-ensures-brand-consistency) - Style extraction context

---
*Pitfalls research for: AI-powered brand style consistency platform (chat-to-canvas)*
*Researched: 2026-02-06*
