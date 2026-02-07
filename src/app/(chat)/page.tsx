"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { mutate } from "swr";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";
import { useBrandStore } from "@/stores/brand-store";

/**
 * Default chat page - shown when no brand is selected
 *
 * This is the entry point for new conversations.
 * Handles brand creation flow:
 * 1. User chats with AI about what brand to create
 * 2. AI responds with [CREATE_BRAND:name] marker
 * 3. BrandCard appears for confirmation
 * 4. On confirm: create brand via API, refresh sidebar, navigate to brand page
 */
export default function ChatHomePage() {
  const router = useRouter();
  const { addBrand } = useBrandStore();
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

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

  // Handle brand creation when user confirms
  const handleCreateBrand = useCallback(
    async (name: string) => {
      setIsCreatingBrand(true);

      try {
        const response = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          throw new Error("Failed to create brand");
        }

        const { brand, conversationId } = await response.json();

        // Add brand to local store (with conversationId)
        addBrand({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          style: brand.style || {},
          createdAt: brand.createdAt,
          updatedAt: brand.updatedAt,
          conversationId,
        });

        // Trigger SWR revalidation to refresh sidebar immediately
        mutate("/api/brands");

        // Navigate to the new brand's chat page
        router.push(`/${brand.id}`);
      } catch (error) {
        console.error("Failed to create brand:", error);
        setIsCreatingBrand(false);
      }
    },
    [addBrand, router]
  );

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

      {/* Messages list with brand creation support */}
      {messages.length > 0 && (
        <ChatMessages
          messages={messages}
          isStreaming={status === "streaming"}
          onCreateBrand={handleCreateBrand}
          isCreatingBrand={isCreatingBrand}
        />
      )}

      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isLoading || isCreatingBrand}
        onStop={stop}
      />
    </ChatLayout>
  );
}
