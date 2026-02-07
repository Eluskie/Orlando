"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { useBrandStore, type Brand } from "@/stores/brand-store";

// SWR fetcher for brands API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * ChatSidebar - Brand navigation sidebar (OpenCode-inspired)
 *
 * Uses SWR to fetch brands from API and sync with local store.
 * Displays list of brands with active state highlighting.
 * Supports clear chat action via context menu.
 */
export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setBrands } = useBrandStore();
  const [contextMenuBrandId, setContextMenuBrandId] = useState<string | null>(
    null
  );

  // Fetch brands from API using SWR
  const { data, isLoading, mutate } = useSWR<{ brands: Brand[] }>(
    "/api/brands",
    fetcher
  );

  const brands = data?.brands ?? [];

  // Sync SWR data with Zustand store
  useEffect(() => {
    if (data?.brands) {
      setBrands(data.brands);
    }
  }, [data, setBrands]);

  // Extract active brand ID from pathname
  const activeBrandId = pathname.startsWith("/")
    ? pathname.split("/")[1] || null
    : null;

  const handleBrandClick = (brandId: string) => {
    router.push(`/${brandId}`);
    setContextMenuBrandId(null);
  };

  const handleNewBrand = () => {
    router.push("/");
    setContextMenuBrandId(null);
  };

  const handleContextMenu = (e: React.MouseEvent, brandId: string) => {
    e.preventDefault();
    setContextMenuBrandId(contextMenuBrandId === brandId ? null : brandId);
  };

  const handleClearChat = useCallback(
    async (brandId: string, conversationId?: string) => {
      if (!conversationId) {
        // Need to get conversationId - for now just close menu
        setContextMenuBrandId(null);
        return;
      }

      try {
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "DELETE",
        });

        // If viewing this brand, refresh the page
        if (activeBrandId === brandId) {
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to clear chat:", error);
      }

      setContextMenuBrandId(null);
    },
    [activeBrandId, router]
  );

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenuBrandId(null);
    if (contextMenuBrandId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenuBrandId]);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <h1 className="text-lg font-semibold text-gray-900">Dobra</h1>
      </div>

      {/* Brand list */}
      <nav className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-2 py-4 text-center text-sm text-gray-500">
            Loading...
          </p>
        ) : brands.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-gray-500">
            No brands yet
          </p>
        ) : (
          <ul className="space-y-1">
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId;
              const showMenu = contextMenuBrandId === brand.id;

              return (
                <li key={brand.id} className="relative">
                  <button
                    onClick={() => handleBrandClick(brand.id)}
                    onContextMenu={(e) => handleContextMenu(e, brand.id)}
                    className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="block truncate">{brand.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, brand.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </button>

                  {/* Context menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Get actual conversationId - for now show message
                          handleClearChat(brand.id);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear Chat
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* New Brand button */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={handleNewBrand}
          className="btn btn-secondary w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          New Brand
        </button>
      </div>
    </aside>
  );
}

/**
 * Trigger SWR revalidation for brands list
 * Can be called from other components after brand creation
 */
export { useSWR as useBrandsSWR };
