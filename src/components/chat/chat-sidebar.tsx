"use client";

import { useRouter, usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useBrandStore } from "@/stores/brand-store";

/**
 * ChatSidebar - Brand navigation sidebar (OpenCode-inspired)
 *
 * Displays list of brands with active state highlighting.
 * "New Brand" button navigates to root to start brand creation flow.
 */
export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { brands } = useBrandStore();

  // Extract active brand ID from pathname
  const activeBrandId = pathname.startsWith("/")
    ? pathname.split("/")[1] || null
    : null;

  const handleBrandClick = (brandId: string) => {
    router.push(`/${brandId}`);
  };

  const handleNewBrand = () => {
    router.push("/");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <h1 className="text-lg font-semibold text-gray-900">Dobra</h1>
      </div>

      {/* Brand list */}
      <nav className="flex-1 overflow-y-auto p-2">
        {brands.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-gray-500">
            No brands yet
          </p>
        ) : (
          <ul className="space-y-1">
            {brands.map((brand) => {
              const isActive = brand.id === activeBrandId;
              return (
                <li key={brand.id}>
                  <button
                    onClick={() => handleBrandClick(brand.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="block truncate">{brand.name}</span>
                  </button>
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
