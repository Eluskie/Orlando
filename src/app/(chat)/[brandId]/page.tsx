"use client";

import { use, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";

/**
 * Brand-specific chat page
 *
 * Dynamic route for individual brand conversations.
 * Uses useChat hook for streaming messages with the API.
 * ChatLayout adapts based on whether brand has content (canvas assets).
 */
export default function BrandChatPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);

  // Create transport with brand-specific body
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { brandId },
      }),
    [brandId]
  );

  // Initialize useChat with brand-specific ID and transport
  const { messages, sendMessage, status, stop } = useChat({
    id: brandId,
    transport,
  });

  // Compute loading state from status
  const isLoading = status === "submitted" || status === "streaming";

  // For Phase 2, brands have no canvas content yet
  // This will check actual canvas asset existence in Phase 4
  const hasContent = false;

  return (
    <ChatLayout hasContent={hasContent}>
      <ChatMessages
        messages={messages}
        isStreaming={status === "streaming"}
      />
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isLoading}
        onStop={stop}
      />
    </ChatLayout>
  );
}
