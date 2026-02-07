"use client";

import { use, useState, useEffect, useCallback } from "react";
import type { UIMessage } from "ai";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";
import { Moodboard } from "@/components/brand/moodboard";
import type { BrandStyle } from "@/types/brand";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BrandData {
  brand: {
    id: string;
    name: string;
    description: string | null;
    style?: BrandStyle;
  };
  conversationId: string | null;
}

interface MessagePart {
  type: string;
  text?: string;
  url?: string;
  mediaType?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: MessagePart[];
}

/**
 * Brand-specific chat page
 *
 * Dynamic route for individual brand conversations.
 * Loads existing messages from database on mount.
 * Uses direct fetch for streaming messages with file upload support.
 * Shows moodboard section when brand has extracted style.
 */
export default function BrandChatPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMoodboard, setShowMoodboard] = useState(false);

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
            const { messages: dbMessages } = await messagesRes.json();
            // Convert DB messages to our Message format
            const formattedMessages: Message[] = (dbMessages || []).map(
              (m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                content: m.content,
                parts: [{ type: "text", text: m.content }],
              })
            );
            setMessages(formattedMessages);
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

  // Send message with optional file upload
  const sendMessage = useCallback(
    async (text: string, files?: File[]) => {
      // Upload files if provided
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        setIsUploading(true);
        try {
          const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("brandId", brandId);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            const { url } = await response.json();
            return url;
          });

          imageUrls = await Promise.all(uploadPromises);
        } finally {
          setIsUploading(false);
        }
      }

      // Build message parts: images first, then text
      const parts: MessagePart[] = [
        ...imageUrls.map((url) => ({
          type: "file" as const,
          mediaType: "image/jpeg",
          url,
        })),
        { type: "text", text },
      ];

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        parts,
      };

      // Add user message immediately
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              id: m.id,
              role: m.role,
              parts: m.parts || [{ type: "text", text: m.content }],
            })),
            brandId,
            conversationId: brandData?.conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        // Read streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantId = crypto.randomUUID();

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            parts: [{ type: "text", text: "" }],
          },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            // Parse AI SDK stream format: 0:"text"
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                assistantContent += text;
                // Update assistant message
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: assistantContent,
                          parts: [{ type: "text", text: assistantContent }],
                        }
                      : m
                  )
                );
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        // Refresh brand data to get updated style after extraction
        if (imageUrls.length > 0) {
          const brandRes = await fetch(`/api/brands/${brandId}`);
          if (brandRes.ok) {
            const updatedData: BrandData = await brandRes.json();
            setBrandData(updatedData);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            parts: [
              {
                type: "text",
                text: "Sorry, something went wrong. Please try again.",
              },
            ],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, brandId, brandData?.conversationId]
  );

  // Check if brand has style for moodboard
  const hasStyle = brandData?.brand?.style?.extractedStyle;

  // Show loading state while fetching brand data
  if (isLoadingData) {
    return (
      <ChatLayout hasContent={false}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ChatLayout>
    );
  }

  // Show error state if brand not found
  if (error) {
    return (
      <ChatLayout hasContent={false}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout hasContent={false}>
      {/* Moodboard Section (collapsible) */}
      {hasStyle && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => setShowMoodboard(!showMoodboard)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span>Brand Moodboard</span>
            {showMoodboard ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showMoodboard && brandData?.brand?.style && (
            <div className="border-t border-gray-100">
              <Moodboard
                brandName={brandData.brand.name}
                style={brandData.brand.style}
              />
            </div>
          )}
        </div>
      )}

      <ChatMessages
        messages={messages as UIMessage[]}
        isStreaming={isLoading}
      />
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || isUploading}
        onStop={() => {}}
      />
    </ChatLayout>
  );
}
