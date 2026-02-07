"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { type UIMessage } from "ai";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { BrandCard } from "./brand-card";
import {
  extractBrandNameFromMessage,
  extractTextFromParts,
} from "@/lib/ai/chat";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
  onCreateBrand?: (name: string) => void;
  isCreatingBrand?: boolean;
}

/**
 * ChatMessages - Scrollable message list with auto-scroll
 *
 * Features:
 * - Auto-scrolls to bottom on new messages (if user is near bottom)
 * - Shows typing indicator when streaming and last message is from user
 * - Detects brand creation marker and shows BrandCard
 * - Edge case: Card hidden if user sends another message before confirming
 */
export function ChatMessages({
  messages,
  isStreaming,
  onCreateBrand,
  isCreatingBrand = false,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  // Check if user is near the bottom of the scroll container
  const isNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    const threshold = 100;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold
    );
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only auto-scroll if user hasn't scrolled away
    if (!userScrolledRef.current || isNearBottom()) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isStreaming, isNearBottom]);

  // Track user scroll
  const handleScroll = useCallback(() => {
    userScrolledRef.current = !isNearBottom();
  }, [isNearBottom]);

  // Reset scroll tracking when messages change significantly
  useEffect(() => {
    if (messages.length <= 1) {
      userScrolledRef.current = false;
    }
  }, [messages.length]);

  // Show typing indicator when waiting for response
  const showTypingIndicator =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user";

  // Check for brand creation marker in the LAST assistant message
  // Only show card if the last message is from assistant (not user)
  // This handles the edge case where user sends another message before confirming
  const pendingBrandName = useMemo(() => {
    if (messages.length === 0) return null;

    const lastMessage = messages[messages.length - 1];

    // Only check assistant messages - if user sent another message, hide the card
    if (lastMessage.role !== "assistant") return null;

    // Don't show while streaming - wait for completion
    if (isStreaming) return null;

    // Extract text from parts
    const text = extractTextFromParts(
      lastMessage.parts as Array<{ type: string; text?: string }>
    );

    return extractBrandNameFromMessage(text);
  }, [messages, isStreaming]);

  const handleConfirm = () => {
    if (pendingBrandName && onCreateBrand) {
      onCreateBrand(pendingBrandName);
    }
  };

  const handleCancel = () => {
    // User can continue chatting - the card will disappear on next message
    // No explicit action needed - the AI will respond to their next message
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">
            Send a message to start the conversation
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id || index}
              message={message}
              isStreaming={
                isStreaming &&
                index === messages.length - 1 &&
                message.role === "assistant"
              }
            />
          ))}
          {showTypingIndicator && <TypingIndicator />}

          {/* Show brand creation card when marker detected */}
          {pendingBrandName && onCreateBrand && (
            <BrandCard
              brandName={pendingBrandName}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isLoading={isCreatingBrand}
            />
          )}
        </>
      )}
    </div>
  );
}
