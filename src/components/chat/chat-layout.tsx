"use client";

import { type ReactNode } from "react";

interface ChatLayoutProps {
  hasContent: boolean;
  children: ReactNode;
}

/**
 * ChatLayout - Adaptive layout wrapper for chat/canvas split
 *
 * Implements the CONTEXT.md layout shift decision:
 * - When hasContent=false: Chat is full-width centered (max-w-3xl mx-auto) like Claude.ai
 * - When hasContent=true: Chat shrinks to left panel (w-[350px]) with canvas placeholder
 *
 * This prepares for Phase 4 canvas integration.
 */
export function ChatLayout({ hasContent, children }: ChatLayoutProps) {
  // Full-width centered layout for brands without content
  if (!hasContent) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col px-4">
        {children}
      </div>
    );
  }

  // Split layout: chat panel + canvas placeholder
  return (
    <div className="flex h-full">
      {/* Chat panel - fixed width left side */}
      <div className="flex w-[350px] flex-shrink-0 flex-col border-r border-gray-200">
        {children}
      </div>

      {/* Canvas placeholder - will be replaced in Phase 4 */}
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <p className="text-gray-400">Canvas will appear here</p>
      </div>
    </div>
  );
}
