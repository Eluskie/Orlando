"use client";

import { useRef, useEffect, useCallback } from "react";
import { type UIMessage } from "ai";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";

interface ChatMessagesProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

/**
 * ChatMessages - Scrollable message list with auto-scroll
 *
 * Features:
 * - Auto-scrolls to bottom on new messages (if user is near bottom)
 * - Shows typing indicator when streaming and last message is from user
 * - Maps messages to MessageItem components
 */
export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
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
    isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === "user";

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">Send a message to start the conversation</p>
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
        </>
      )}
    </div>
  );
}
