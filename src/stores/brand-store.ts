import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandStyle } from "@/types/brand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  style: BrandStyle;
  createdAt: string;
  updatedAt: string;
  conversationId?: string | null;
}

interface BrandState {
  brands: Brand[];
  activeBrandId: string | null;

  // Computed
  activeBrand: () => Brand | undefined;

  // Actions
  setBrands: (brands: Brand[]) => void;
  setActiveBrand: (id: string | null) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updates: Partial<Omit<Brand, "id">>) => void;
  updateBrandStyle: (id: string, style: Partial<BrandStyle>) => void;
  removeBrand: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      brands: [],
      activeBrandId: null,

      activeBrand: () => {
        const { brands, activeBrandId } = get();
        return brands.find((b) => b.id === activeBrandId);
      },

      setBrands: (brands) => set({ brands }),

      setActiveBrand: (id) => set({ activeBrandId: id }),

      addBrand: (brand) =>
        set((state) => ({ brands: [...state.brands, brand] })),

      updateBrand: (id, updates) =>
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b,
          ),
        })),

      updateBrandStyle: (id, style) =>
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id
              ? {
                  ...b,
                  style: { ...b.style, ...style },
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        })),

      removeBrand: (id) =>
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
          activeBrandId: state.activeBrandId === id ? null : state.activeBrandId,
        })),
    }),
    {
      name: "dobra-brand-store",
      partialize: (state) => ({
        activeBrandId: state.activeBrandId,
      }),
    },
  ),
);
