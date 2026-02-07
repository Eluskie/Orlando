"use client";

import { useState, useCallback, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Paperclip, Square, X } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string, files?: File[]) => void;
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
 * - File attachment (Paperclip button) for up to 3 images
 * - Preview thumbnails with clear functionality
 */
export function ChatInput({ onSend, disabled, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Handle file selection (max 3 images)
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 3);

    setSelectedFiles(validFiles);
    setPreviews([]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Clear selected files
  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if ((!trimmed && selectedFiles.length === 0) || disabled) return;
    onSend(
      trimmed || 'Please analyze these reference images.',
      selectedFiles.length > 0 ? selectedFiles : undefined
    );
    setInput("");
    clearFiles();
  }, [input, disabled, onSend, selectedFiles, clearFiles]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // Trigger file input click
  const handlePaperclipClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">
        {/* Image previews */}
        {previews.length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={clearFiles}
              className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Clear images"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={handlePaperclipClick}
            disabled={disabled}
            className="btn btn-ghost p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Attach images (max 3)"
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
              disabled={!input.trim() && selectedFiles.length === 0}
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
