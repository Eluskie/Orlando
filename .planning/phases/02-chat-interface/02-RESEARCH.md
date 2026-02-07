# Phase 2: Chat Interface - Research

**Researched:** 2026-02-07
**Domain:** Streaming chat UI with Vercel AI SDK, message persistence, brand creation flow
**Confidence:** HIGH

## Summary

This phase implements a conversational chat interface as the app's entry point using the Vercel AI SDK (`ai` package v6.0.73 already installed). The research focused on: (1) streaming chat implementation with `useChat` hook and `streamText` on the backend, (2) message persistence patterns with Neon/Drizzle, (3) OpenCode-inspired sidebar layout, and (4) Claude-like minimal message styling.

The AI SDK v6 provides a mature, well-documented streaming architecture. The `useChat` hook handles message state, streaming, and status management. Messages are persisted via the `onFinish` callback in `toUIMessageStreamResponse()`. The existing project infrastructure (stores, schema, design system) aligns well with these patterns.

**Primary recommendation:** Use the AI SDK's `useChat` hook with `DefaultChatTransport`, `streamText` on the API route with `toUIMessageStreamResponse()`, and persist messages in the `onFinish` callback using the existing Drizzle schema.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | ^6.0.73 | AI SDK core (already installed) | Official Vercel streaming SDK |
| `@ai-sdk/react` | ^6.x | React hooks (`useChat`) | Official React integration |
| `@ai-sdk/google` | ^3.0.21 | Google/Gemini provider (already installed) | Multi-modal support, streaming |
| `react-markdown` | ^9.x | Markdown rendering for messages | Lightweight, secure, React-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `remark-gfm` | ^4.x | GitHub-flavored markdown | Lists, bold, basic formatting |
| `lucide-react` | ^0.563.0 | Icons (already installed) | Send button, attachment icon, sidebar icons |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-markdown` | `marked` + `DOMPurify` | More control but more setup; react-markdown is simpler |
| CSS animations | `framer-motion` | Overkill for typing indicator; CSS is sufficient |
| Custom streaming | WebSocket | Unnecessary complexity; SSE via AI SDK handles all cases |

**Installation:**
```bash
npm install @ai-sdk/react react-markdown remark-gfm
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts         # streamText endpoint
│   └── (chat)/                  # Route group for chat layout
│       ├── layout.tsx           # Sidebar + main area layout
│       ├── page.tsx             # Default redirect or empty state
│       └── [brandId]/
│           └── page.tsx         # Brand-specific chat
├── components/
│   └── chat/
│       ├── chat-sidebar.tsx     # Brand list + navigation
│       ├── chat-messages.tsx    # Message list with scroll
│       ├── chat-input.tsx       # Input + send + attachment placeholder
│       ├── message-item.tsx     # Single message rendering
│       ├── typing-indicator.tsx # Pulsing dots
│       └── brand-card.tsx       # Inline brand creation card
├── lib/
│   └── ai/
│       ├── config.ts            # (exists) AI configuration
│       ├── mock.ts              # (exists) Mock responses
│       └── chat.ts              # Chat-specific utilities
└── stores/
    ├── chat-store.ts            # (exists) Chat state
    └── brand-store.ts           # (exists) Brand state
```

### Pattern 1: Streaming Chat with useChat
**What:** Use AI SDK's `useChat` hook for all chat state management
**When to use:** All chat interactions
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export function ChatInterface({ brandId }: { brandId: string }) {
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: brandId, // Unique per brand
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { brandId }, // Pass brandId to backend
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isStreaming={status === 'streaming'} />
      {isLoading && <TypingIndicator />}
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isLoading}
        onStop={stop}
      />
    </div>
  );
}
```

### Pattern 2: API Route with Persistence
**What:** Stream responses and persist messages in onFinish
**When to use:** /api/chat route handler
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { db } from '@/lib/db';
import { messages as messagesTable, conversations } from '@/lib/db/schema';

export async function POST(req: Request) {
  const { messages, brandId, conversationId } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-pro'),
    system: `You are a helpful brand creation assistant...`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: finalMessages }) => {
      // Save new messages to database
      const newMessages = finalMessages.slice(-2); // User + assistant
      await db.insert(messagesTable).values(
        newMessages.map(m => ({
          conversationId,
          role: m.role,
          content: m.parts.map(p => p.type === 'text' ? p.text : '').join(''),
          createdAt: new Date(),
        }))
      );
    },
  });
}
```

### Pattern 3: Message Parts Rendering
**What:** Render messages using the `parts` array (AI SDK v5+ pattern)
**When to use:** All message display
**Example:**
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
function MessageContent({ message }: { message: UIMessage }) {
  return (
    <div>
      {message.parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
              {part.text}
            </ReactMarkdown>
          );
        }
        // Future: handle tool results, etc.
        return null;
      })}
    </div>
  );
}
```

### Pattern 4: OpenCode-Inspired Layout
**What:** Three-panel layout with persistent sidebar
**When to use:** Main app shell
**Example:**
```typescript
// Layout structure (not exact code)
<div className="flex h-screen">
  {/* Left sidebar - always visible */}
  <aside className="w-64 border-r flex flex-col">
    <SidebarHeader />
    <BrandList brands={brands} activeBrandId={activeBrandId} />
    <NewBrandButton />
  </aside>

  {/* Main content - chat or chat+canvas */}
  <main className="flex-1 flex">
    {/* Chat panel - full width or left side */}
    <div className={cn(
      "flex flex-col",
      hasContent ? "w-1/3 border-r" : "w-full max-w-2xl mx-auto"
    )}>
      {children}
    </div>

    {/* Canvas panel - appears when brand has content */}
    {hasContent && <CanvasArea />}
  </main>
</div>
```

### Anti-Patterns to Avoid
- **Managing message state manually:** Don't use useState for messages; useChat handles this
- **Polling for responses:** useChat uses SSE streaming; don't implement polling
- **Storing messages in localStorage:** Use database persistence with onFinish callback
- **Replacing Chat instance dynamically:** This breaks streaming; use different chat IDs instead
- **Using deprecated `content` property:** Use `message.parts` array for v5+ compatibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Streaming state management | Custom WebSocket/SSE handlers | `useChat` hook | Handles reconnection, status, abort, etc. |
| Message format conversion | Manual message array transforms | `convertToModelMessages()` | UIMessage to ModelMessage properly |
| Stream response formatting | Custom SSE formatting | `toUIMessageStreamResponse()` | Proper protocol, error handling |
| Typing indicator timing | Complex timeout logic | `status === 'streaming'` | Built into useChat |
| Markdown rendering | Custom parser | `react-markdown` | Security, edge cases, performance |
| ID generation | `Math.random()` or `uuid()` | AI SDK's `createIdGenerator()` | Consistent across client/server |

**Key insight:** The AI SDK v6 has solved most streaming chat complexity. Custom solutions introduce bugs around reconnection, partial messages, and race conditions.

## Common Pitfalls

### Pitfall 1: Message Shape Mismatch
**What goes wrong:** UIMessage (frontend) vs ModelMessage (backend) vs DB schema have different shapes
**Why it happens:** AI SDK uses `parts` array; older code uses `content` string
**How to avoid:** Always use `convertToModelMessages()` for backend; store in UIMessage format
**Warning signs:** Messages not appearing, tool calls missing

### Pitfall 2: Streaming Breaks on Chat Switch
**What goes wrong:** Switching between brands causes streaming to stop working
**Why it happens:** Dynamically replacing Chat instance breaks SSE connection
**How to avoid:** Use unique `id` prop per brand; don't reuse same useChat instance
**Warning signs:** Messages appear all at once instead of streaming

### Pitfall 3: Lost Messages on Disconnect
**What goes wrong:** If user disconnects during streaming, messages aren't saved
**Why it happens:** onFinish callback never fires
**How to avoid:** Call `result.consumeStream()` (without await) to ensure persistence
**Warning signs:** Partial conversations, missing assistant responses

### Pitfall 4: Scroll Position Jumps
**What goes wrong:** Chat scrolls erratically during streaming
**Why it happens:** Each token triggers re-render and scroll
**How to avoid:** Use `experimental_throttle` option; scroll only if user is near bottom
**Warning signs:** Jerky scroll behavior, user losing their place

### Pitfall 5: Stale Conversation State
**What goes wrong:** Chat shows wrong messages after brand switch
**Why it happens:** useChat state not synced with conversationId change
**How to avoid:** Use `setMessages([])` when conversationId changes; load from DB
**Warning signs:** Messages from wrong brand appearing

## Code Examples

Verified patterns from official sources:

### Typing Indicator (CSS Animation)
```css
/* Source: Common pattern */
@keyframes typing-dot {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-4px); }
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-gray-400);
  border-radius: 50%;
  animation: typing-dot 1.2s ease-in-out infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
```

### Typing Indicator Component
```typescript
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
```

### Auto-Scroll with User Awareness
```typescript
// Source: Common pattern
import { useRef, useEffect } from 'react';

function useAutoScroll(messages: UIMessage[], isStreaming: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || userScrolledRef.current) return;

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }, [messages, isStreaming]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    // Check if user scrolled away from bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    userScrolledRef.current = !isNearBottom;
  };

  return { containerRef, handleScroll };
}
```

### Message List with Minimal Styling
```typescript
// Claude-like minimal message styling
function MessageItem({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "py-4 px-4",
      isUser ? "bg-gray-50" : "bg-white"
    )}>
      <div className="max-w-2xl mx-auto">
        <span className="text-xs font-medium text-gray-500 mb-1 block">
          {isUser ? 'You' : 'Dobra'}
        </span>
        <div className="prose prose-sm max-w-none">
          <MessageContent message={message} />
        </div>
      </div>
    </div>
  );
}
```

### Brand Creation Inline Card
```typescript
// Inline card shown when brand is created
function BrandCard({ brand, onViewCanvas }: { brand: Brand; onViewCanvas: () => void }) {
  return (
    <div className="card p-4 my-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: brand.style.primaryColor || '#6366f1' }}
        />
        <div>
          <p className="font-medium">{brand.name}</p>
          {brand.description && (
            <p className="text-sm text-gray-500">{brand.description}</p>
          )}
        </div>
      </div>
      <button onClick={onViewCanvas} className="btn btn-primary">
        View Canvas
      </button>
    </div>
  );
}
```

### Loading Initial Messages
```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect } from 'react';

export function ChatWithHistory({
  conversationId,
  initialMessages
}: {
  conversationId: string;
  initialMessages: UIMessage[];
}) {
  const { messages, setMessages, ...chat } = useChat({
    id: conversationId,
    messages: initialMessages, // Load from server
  });

  // Reset messages when conversation changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages, setMessages]);

  return <ChatUI messages={messages} {...chat} />;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `message.content` string | `message.parts` array | AI SDK v5 | Supports tool calls, files, etc. |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` | AI SDK v5 | Better persistence support |
| `handleSubmit` + input state | `sendMessage({ text })` | AI SDK v5 | Cleaner API, no input management |
| Custom streaming handlers | `DefaultChatTransport` | AI SDK v5 | Configurable, type-safe |
| `isLoading` boolean | `status` enum | AI SDK v5 | More granular states |

**Deprecated/outdated:**
- `useChat` managing input state internally: Now external
- `content` property on messages: Use `parts` array
- `toDataStreamResponse()`: Use `toUIMessageStreamResponse()` for chat persistence
- `StreamingTextResponse`: Replaced by transport-based architecture

## Open Questions

Things that couldn't be fully resolved:

1. **Mock Streaming Implementation**
   - What we know: Project has mock mode with `mockChat()` function
   - What's unclear: How to integrate mock streaming with `useChat` transport
   - Recommendation: Create `MockChatTransport` that simulates streaming delays, or use mock mode only at API route level

2. **Exact Throttle Value**
   - What we know: `experimental_throttle` can batch UI updates
   - What's unclear: Optimal ms value for smooth UX
   - Recommendation: Start with 50ms, adjust based on feel

3. **Brand Creation Tool vs Inline Flow**
   - What we know: AI SDK supports tool calling with approval
   - What's unclear: Whether to use tool calling or simple prompt-based detection
   - Recommendation: Start with prompt-based ("I'll create a brand called X") for Phase 2 simplicity

## Sources

### Primary (HIGH confidence)
- [AI SDK UI: Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) - useChat hook API, patterns
- [AI SDK UI: Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence) - onFinish, storage patterns
- [AI SDK: streamText](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) - Backend streaming API
- [AI SDK: useChat Reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat) - Complete hook reference
- [AI SDK: Getting Started Next.js](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - Integration patterns

### Secondary (MEDIUM confidence)
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6) - New features, breaking changes
- [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon) - Database patterns
- [OpenCode DeepWiki](https://deepwiki.com/anomalyco/opencode/5.1-application-shell-and-layout) - Layout inspiration

### Tertiary (LOW confidence)
- WebSearch results for typing indicator CSS patterns - Community patterns
- WebSearch results for Claude UI patterns - Design inspiration

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official AI SDK docs, already installed
- Architecture: HIGH - Verified patterns from official documentation
- Pitfalls: HIGH - Documented issues from GitHub and official troubleshooting
- UI patterns: MEDIUM - Community patterns verified with multiple sources

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - AI SDK is stable, patterns well-established)
