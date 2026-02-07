"use client";

import { type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StyleExtractionCard } from "./style-extraction-card";
import type { ExtractedStyleData } from "@/types/brand";

interface MessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}

/**
 * Try to extract style data from message content.
 * Looks for JSON block markers or structured style data.
 */
function extractStyleFromMessage(content: string): ExtractedStyleData | null {
  // Look for JSON block with style data
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      // Validate it has the expected shape
      if (parsed.colors && parsed.mood && parsed.typography && parsed.visualStyle) {
        return parsed as ExtractedStyleData;
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Look for inline style extraction markers (alternative format)
  const markerMatch = content.match(/\[EXTRACTED_STYLE\]([\s\S]*?)\[\/EXTRACTED_STYLE\]/);
  if (markerMatch) {
    try {
      const parsed = JSON.parse(markerMatch[1].trim());
      if (parsed.colors && parsed.mood && parsed.typography && parsed.visualStyle) {
        return parsed as ExtractedStyleData;
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  return null;
}

/**
 * MessageItem - Single message rendering with markdown
 *
 * Claude-like minimal styling: no bubbles, left-aligned.
 * User messages have subtle gray background.
 * Renders text parts with ReactMarkdown for formatting.
 * Detects and renders StyleExtractionCard for extraction results.
 */
export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const isUser = message.role === "user";

  // Extract text content from message parts or content field
  let textContent = "";
  if (message.parts && Array.isArray(message.parts)) {
    textContent = message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("");
  } else if ("content" in message && typeof message.content === "string") {
    textContent = message.content;
  }

  // Check for image parts in user message
  const imageParts =
    isUser && message.parts
      ? message.parts.filter(
          (part): part is { type: "file"; url: string; mediaType: string } =>
            part.type === "file" &&
            "mediaType" in part &&
            typeof part.mediaType === "string" &&
            part.mediaType.startsWith("image/")
        )
      : [];

  // Check for extracted style in assistant messages
  const extractedStyle = !isUser ? extractStyleFromMessage(textContent) : null;

  // Remove JSON block from display text if we found style data
  const displayText = extractedStyle
    ? textContent.replace(/```json\n[\s\S]*?\n```/g, "").trim()
    : textContent;

  return (
    <div className={`px-4 py-4 ${isUser ? "bg-gray-50" : "bg-white"}`}>
      <div className="mx-auto max-w-3xl">
        <span className="mb-1 block text-xs font-medium text-gray-500">
          {isUser ? "You" : "Dobra"}
        </span>

        {/* Show image thumbnails for user messages with images */}
        {imageParts.length > 0 && (
          <div className="flex gap-2 mb-3">
            {imageParts.map((part, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={part.url}
                  alt={`Reference ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-ul:my-2 prose-li:my-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
          {isStreaming && !isUser && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
          )}
        </div>

        {/* Show style extraction card if we found style data */}
        {extractedStyle && <StyleExtractionCard style={extractedStyle} />}
      </div>
    </div>
  );
}
