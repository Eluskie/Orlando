import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage } from "@/types/chat";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;

  // Actions
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setConversationId: (id: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  clearChat: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      conversationId: null,
      isStreaming: false,

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m,
          ),
        })),

      setConversationId: (id) => set({ conversationId: id }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      clearChat: () =>
        set({ messages: [], conversationId: null, isStreaming: false }),
    }),
    {
      name: "dobra-chat-store",
      partialize: (state) => ({
        conversationId: state.conversationId,
      }),
    },
  ),
);
