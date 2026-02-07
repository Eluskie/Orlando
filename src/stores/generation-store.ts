import { create } from "zustand";
import type { GenerationStatus } from "@/types/generation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationItem {
  id: string;
  brandId: string;
  prompt: string;
  negativePrompt?: string;
  status: GenerationStatus;
  resultUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface GenerationState {
  pendingGenerations: GenerationItem[];
  completedGenerations: GenerationItem[];
  activeGenerationId: string | null;
  dailyCount: number;
  dailyLimit: number;
  dailyResetDate: string;

  // Computed
  canGenerate: () => boolean;
  remainingGenerations: () => number;

  // Actions
  addGeneration: (generation: GenerationItem) => void;
  updateGeneration: (
    id: string,
    updates: Partial<Omit<GenerationItem, "id">>,
  ) => void;
  moveToCompleted: (id: string) => void;
  setActiveGeneration: (id: string | null) => void;
  incrementDailyCount: () => void;
  resetDailyCountIfNeeded: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGenerationStore = create<GenerationState>()((set, get) => ({
  pendingGenerations: [],
  completedGenerations: [],
  activeGenerationId: null,
  dailyCount: 0,
  dailyLimit: 50,
  dailyResetDate: getTodayDateString(),

  canGenerate: () => {
    const state = get();
    state.resetDailyCountIfNeeded();
    return get().dailyCount < get().dailyLimit;
  },

  remainingGenerations: () => {
    const state = get();
    state.resetDailyCountIfNeeded();
    return Math.max(0, get().dailyLimit - get().dailyCount);
  },

  addGeneration: (generation) =>
    set((state) => ({
      pendingGenerations: [...state.pendingGenerations, generation],
    })),

  updateGeneration: (id, updates) =>
    set((state) => ({
      pendingGenerations: state.pendingGenerations.map((g) =>
        g.id === id ? { ...g, ...updates } : g,
      ),
      completedGenerations: state.completedGenerations.map((g) =>
        g.id === id ? { ...g, ...updates } : g,
      ),
    })),

  moveToCompleted: (id) =>
    set((state) => {
      const generation = state.pendingGenerations.find((g) => g.id === id);
      if (!generation) return state;
      return {
        pendingGenerations: state.pendingGenerations.filter(
          (g) => g.id !== id,
        ),
        completedGenerations: [
          { ...generation, status: "completed" as const, completedAt: new Date().toISOString() },
          ...state.completedGenerations,
        ],
        activeGenerationId:
          state.activeGenerationId === id ? null : state.activeGenerationId,
      };
    }),

  setActiveGeneration: (id) => set({ activeGenerationId: id }),

  incrementDailyCount: () =>
    set((state) => ({ dailyCount: state.dailyCount + 1 })),

  resetDailyCountIfNeeded: () => {
    const today = getTodayDateString();
    const { dailyResetDate } = get();
    if (dailyResetDate !== today) {
      set({ dailyCount: 0, dailyResetDate: today });
    }
  },
}));
