"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Send, Paperclip, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  onStop: () => void;
}

/**
 * ChatInput - Text input with send and attachment buttons
 *
 * Features:
 * - Controlled input with local state
 * - Submit on Enter (Shift+Enter for newline)
 * - Send button (disabled when empty or loading)
 * - Stop button shown when disabled (streaming in progress)
 * - Attachment button (disabled placeholder for Phase 3)
 */
export function ChatInput({ onSend, disabled, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          {/* Attachment button - disabled placeholder */}
          <button
            type="button"
            disabled
            className="btn btn-ghost p-2 text-gray-400 opacity-50"
            title="Coming in Phase 3"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              disabled={disabled}
              rows={1}
              className="input max-h-32 min-h-[2.5rem] w-full resize-none py-2.5 pr-12"
              style={{
                height: "auto",
                minHeight: "2.5rem",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>

          {/* Send or Stop button */}
          {disabled ? (
            <button
              type="button"
              onClick={onStop}
              className="btn btn-secondary p-2"
              title="Stop generating"
            >
              <Square className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="btn btn-primary p-2"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
