"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mainNav } from "@/config/Navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useReadContract } from "wagmi";
import { Search, X, ChevronDown, Command } from "lucide-react";
import { hexToString, trim } from "viem";
import { COUNTRY_REGISTRY_ADDRESS } from "@/config/addresses";
import { CountryRegistryAbi } from "@/config/abis";

const cleanSymbol = (hexStr: string): string => {
  try {
    const rawStr = hexToString(trim(hexStr as `0x${string}`));
    return rawStr.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  } catch {
    return "UNKNOWN";
  }
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Countries
  const { data: rawCountries } = useReadContract({
    address: COUNTRY_REGISTRY_ADDRESS,
    abi: CountryRegistryAbi,
    functionName: "getAllCountries",
  });

  // Filter Logic
  const searchableCountries = (rawCountries || []).map((c) => ({
    id: c.countryCode,
    name: c.name,
    symbol: cleanSymbol(c.countryCode),
  }));

  const filteredCountries = searchableCountries.filter((c) => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  });

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (id: string) => {
    router.push(`/trade`);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    // Update: Background lebih gelap (#020202) dengan border white/5
    <header className="sticky top-0 z-50 w-full bg-[#020202]/80 backdrop-blur-md border-b border-white/5 supports-[backdrop-filter]:bg-[#020202]/60">
      <nav className="flex w-full items-center justify-between px-6 py-2">
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo Text */}
            <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity">
              Geo<span className="text-emerald-500">Bit</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-emerald-400"
                      : "text-neutral-400 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Network, Wallet */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden md:block relative" ref={searchContainerRef}>
            <div
              className={`relative flex items-center transition-all duration-300 ${
                isSearchFocused || searchQuery ? "w-64" : "w-48"
              }`}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-3.5 w-3.5 text-neutral-500" />
              </div>
              <input
                type="text"
                placeholder="Search asset..."
                className="block w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-xs font-mono text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <div className="absolute right-2 pointer-events-none"></div>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && searchQuery && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                    Markets
                  </p>
                </div>
                {filteredCountries.length > 0 ? (
                  <div className="py-1">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleSelectCountry(country.id)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                          {country.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-200 group-hover:text-white">
                            {country.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            {country.symbol}-PERP
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-neutral-500">
                    No country found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RainbowKit Buttons - Styled to match */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const connected = mounted && account && chain;

              return (
                <div
                  {...(!mounted && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    >
                      Connect Wallet
                    </button>
                  ) : chain.unsupported ? (
                    <button
                      onClick={openChainModal}
                      className="rounded-lg bg-rose-500/10 border border-rose-500/50 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                    >
                      Wrong Network
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="group flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5 pr-3 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
                        title={chain.name}
                      >
                        <div className="relative h-5 w-5 overflow-hidden rounded-full">
                          {chain.hasIcon && chain.iconUrl ? (
                            <img
                              alt={chain.name}
                              src={chain.iconUrl}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-neutral-700"></div>
                          )}
                        </div>
                        <ChevronDown className="h-3 w-3 text-neutral-500 group-hover:text-neutral-300" />
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 py-1.5 px-1.5 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
                      >
                        {/* Address Badge */}
                        <span className="rounded-md px-2 py-1 text-xs font-mono font-bold text-white">
                          {account.displayName}
                        </span>
                        <ChevronDown className="h-3 w-3 text-neutral-500 group-hover:text-neutral-300" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </nav>
    </header>
  );
}
