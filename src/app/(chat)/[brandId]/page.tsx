"use client";

import { use, useMemo, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";

interface BrandData {
  brand: {
    id: string;
    name: string;
    description: string | null;
  };
  conversationId: string | null;
}

/**
 * Brand-specific chat page
 *
 * Dynamic route for individual brand conversations.
 * Loads existing messages from database on mount.
 * Uses useChat hook for streaming messages with the API.
 * ChatLayout adapts based on whether brand has content (canvas assets).
 */
export default function BrandChatPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brand data and messages on mount
  useEffect(() => {
    async function loadBrandData() {
      setIsLoadingData(true);
      setError(null);

      try {
        // Fetch brand data with conversationId
        const brandRes = await fetch(`/api/brands/${brandId}`);
        if (!brandRes.ok) {
          throw new Error("Brand not found");
        }
        const data: BrandData = await brandRes.json();
        setBrandData(data);

        // Fetch messages if conversation exists
        if (data.conversationId) {
          const messagesRes = await fetch(
            `/api/conversations/${data.conversationId}/messages`
          );
          if (messagesRes.ok) {
            const { messages } = await messagesRes.json();
            setInitialMessages(messages || []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brand");
      } finally {
        setIsLoadingData(false);
      }
    }

    loadBrandData();
  }, [brandId]);

  // Create transport with brand-specific body including conversationId
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          brandId,
          conversationId: brandData?.conversationId,
        },
      }),
    [brandId, brandData?.conversationId]
  );

  // Initialize useChat with brand-specific ID, transport, and initial messages
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: brandId,
    transport,
  });

  // Set messages when initial data loads or conversationId changes
  // Per RESEARCH.md pitfall #5 - sync messages with conversationId changes
  useEffect(() => {
    if (!isLoadingData && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [isLoadingData, initialMessages, setMessages]);

  // Compute loading state from status
  const isLoading = status === "submitted" || status === "streaming";

  // For Phase 2, brands have no canvas content yet
  // This will check actual canvas asset existence in Phase 4
  const hasContent = false;

  // Show loading state while fetching brand data
  if (isLoadingData) {
    return (
      <ChatLayout hasContent={hasContent}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ChatLayout>
    );
  }

  // Show error state if brand not found
  if (error) {
    return (
      <ChatLayout hasContent={hasContent}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </ChatLayout>
    );
  }

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
