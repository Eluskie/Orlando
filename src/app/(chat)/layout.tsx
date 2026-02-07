import { ChatSidebar } from "@/components/chat/chat-sidebar";

/**
 * ChatLayout - App shell with persistent sidebar
 *
 * Three-panel flexbox layout:
 * - Left sidebar (256px): Brand navigation
 * - Main area (flex-1): Chat or canvas content
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Persistent sidebar */}
      <ChatSidebar />

      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
