"use client";

import { type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

/**
 * MessageItem - Single message rendering with markdown
 *
 * Claude-like minimal styling: no bubbles, left-aligned.
 * User messages have subtle gray background.
 * Renders text parts with ReactMarkdown for formatting.
 */
export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === "user";

  // Extract text content from message parts
  const textContent = message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div
      className={`px-4 py-4 ${isUser ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-3xl">
        <span className="mb-1 block text-xs font-medium text-gray-500">
          {isUser ? "You" : "Dobra"}
        </span>
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {textContent}
          </ReactMarkdown>
          {isStreaming && !isUser && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
