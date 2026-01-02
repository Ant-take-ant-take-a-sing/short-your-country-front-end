"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mainNav } from "@/config/Navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useReadContract } from "wagmi";
import { Search, X, ChevronDown } from "lucide-react";
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
    return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (id: string) => {
    router.push(`/trade/${id}`);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-neutral-800">
      <nav className="flex w-full items-center justify-between px-4 py-3 lg:px-6">
        
        {/* Left: Brand & Nav */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold tracking-tight text-white">
              Geo<span className="text-emerald-500">Bit</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {mainNav.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    isActive ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-900",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Search, Network, Wallet */}
        <div className="flex items-center gap-2 lg:gap-3">
          
          {/* Search Bar (Responsive Width) */}
          <div className="hidden md:block relative" ref={searchContainerRef}>
            <div className={`relative flex items-center transition-all duration-300 ${isSearchFocused || searchQuery ? 'w-48 lg:w-64' : 'w-40 lg:w-48'}`}>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-full border border-neutral-800 bg-neutral-900 py-1.5 pl-9 pr-8 text-sm text-neutral-200 placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 text-neutral-500 hover:text-neutral-300">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && searchQuery && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {filteredCountries.length > 0 ? (
                  <div className="py-1">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleSelectCountry(country.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold text-neutral-400">
                          {country.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{country.name}</p>
                          <p className="text-xs text-neutral-500">{country.symbol}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-neutral-500">No country found.</div>
                )}
              </div>
            )}
          </div>

          {/* RainbowKit Buttons */}
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;

              return (
                <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none", userSelect: "none" } })}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                      Connect
                    </button>
                  ) : chain.unsupported ? (
                    <button onClick={openChainModal} className="rounded-full bg-rose-500/10 border border-rose-500/50 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20">
                      Wrong Network
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={openChainModal} className="group flex items-center justify-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 p-1.5 pr-2 hover:border-neutral-700 hover:bg-neutral-800 transition-all" title={chain.name}>
                        <div className="relative h-6 w-6 overflow-hidden rounded-full">
                          {chain.hasIcon && chain.iconUrl ? (
                            <img alt={chain.name} src={chain.iconUrl} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-neutral-700"></div>
                          )}
                        </div>
                        <ChevronDown className="h-3 w-3 text-neutral-500 group-hover:text-neutral-300" />
                      </button>

                      <button onClick={openAccountModal} className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 py-1 pl-1 pr-1 lg:pl-3 hover:border-neutral-700 hover:bg-neutral-800 transition-all">
                        {/* Hide balance on tablet to save space */}
                        <span className="hidden lg:block text-xs font-medium text-neutral-300">
                          {account.displayBalance ? ` ${account.displayBalance}` : ""}
                        </span>
                        <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs font-bold text-white border border-neutral-700">
                          {account.displayName}
                        </span>
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