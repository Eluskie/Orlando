"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";
import { useBrandStore } from "@/stores/brand-store";

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
 * Default chat page - simplified version without AI SDK useChat
 * Uses direct fetch to /api/chat for reliability
 */
export default function ChatHomePage() {
  const router = useRouter();
  const { addBrand } = useBrandStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Send message and stream response
  const sendMessage = useCallback(async (text: string, files?: File[]) => {
    // Upload files if provided
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          // No brandId yet in home page flow

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
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
      // Add image parts first
      ...imageUrls.map(url => ({
        type: "file" as const,
        mediaType: "image/jpeg",
        url,
      })),
      // Then text part
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
        { id: assistantId, role: "assistant", content: "", parts: [{ type: "text", text: "" }] },
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
                    ? { ...m, content: assistantContent, parts: [{ type: "text", text: assistantContent }] }
                    : m
                )
              );
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          parts: [{ type: "text", text: "Sorry, something went wrong. Please try again." }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

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

        // Add brand to local store
        addBrand({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          style: brand.style || {},
          createdAt: brand.createdAt,
          updatedAt: brand.updatedAt,
          conversationId,
        });

        // Trigger SWR revalidation
        mutate("/api/brands");

        // Navigate to the new brand's page
        router.push(`/${brand.id}`);
      } catch (error) {
        console.error("Failed to create brand:", error);
        setIsCreatingBrand(false);
      }
    },
    [addBrand, router]
  );

  return (
    <ChatLayout hasContent={false}>
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

      {messages.length > 0 && (
        <ChatMessages
          messages={messages as any}
          isStreaming={isLoading}
          onCreateBrand={handleCreateBrand}
          isCreatingBrand={isCreatingBrand}
        />
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || isCreatingBrand || isUploading}
        onStop={() => {}}
      />
    </ChatLayout>
  );
}
