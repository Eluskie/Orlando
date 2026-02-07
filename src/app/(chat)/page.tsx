"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";

/**
 * Default chat page - shown when no brand is selected
 *
 * This is the entry point for new conversations.
 * Uses ChatLayout with hasContent=false (centered chat).
 * Plan 03 will handle brand creation flow and navigation.
 */
export default function ChatHomePage() {
  // Create transport for new conversations
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    []
  );

  // Initialize useChat for new conversations
  const { messages, sendMessage, status, stop } = useChat({
    id: "new",
    transport,
  });

  // Compute loading state from status
  const isLoading = status === "submitted" || status === "streaming";

  // New conversations always start centered (no content yet)
  const hasContent = false;

  return (
    <ChatLayout hasContent={hasContent}>
      {/* Welcome message shown when no messages */}
      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md px-4 text-center">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Welcome to Dobra
            </h2>
            <p className="text-gray-500">
              Send a message to start creating your first brand
            </p>
          </div>
        </div>
      )}

      {/* Messages list (hidden when empty, ChatMessages shows its own empty state otherwise) */}
      {messages.length > 0 && (
        <ChatMessages
          messages={messages}
          isStreaming={status === "streaming"}
        />
      )}

      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isLoading}
        onStop={stop}
      />
    </ChatLayout>
  );
}
