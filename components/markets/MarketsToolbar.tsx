"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface MarketsToolbarProps {
  activeTab: string;
  setActiveTab: (tab: "ALL" | "FAVORITES" | "GAINERS" | "LOSERS") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export const MarketsToolbar = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
}: MarketsToolbarProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen, setIsSearchOpen]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4 min-h-[50px]">
      <div
        className={`flex items-center gap-1 transition-opacity duration-300 overflow-x-auto no-scrollbar ${
          isSearchOpen
            ? "opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
            : "opacity-100"
        }`}
      >
        {(["ALL", "FAVORITES", "GAINERS", "LOSERS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? "text-white font-bold bg-white/5"
                : "text-neutral-500 hover:text-white"
            }`}
          >
            {tab === "ALL"
              ? "All Markets"
              : tab === "FAVORITES"
              ? "Favorites"
              : tab === "GAINERS"
              ? "Gainers"
              : "Losers"}
          </button>
        ))}
      </div>

      <div
        ref={searchContainerRef}
        className="flex items-center justify-end relative"
      >
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 text-neutral-400 hover:text-white transition-all duration-300 ${
            isSearchOpen
              ? "opacity-0 scale-75 pointer-events-none absolute"
              : "opacity-100 scale-100 relative"
          }`}
        >
          <Search className="w-4 h-4" />
        </button>

        <div
          className={`flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isSearchOpen
              ? "w-full md:w-64 opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-4 overflow-hidden"
          }`}
        >
          <Search className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-transparent focus:border-white/20 py-1 text-sm text-white placeholder-neutral-600 focus:outline-none transition-all"
          />
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
