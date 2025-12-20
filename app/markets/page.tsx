"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Search, TrendingUp, Lock } from "lucide-react";
import { useMarkets, Market } from "@/hooks/useMarkets";
import {
  CountryRegistryAbi,
  COUNTRY_REGISTRY_ADDRESS,
} from "@/config/contracts";

// --- MOCK DATA ---
const COMING_SOON_MARKETS: Partial<Market>[] = [
  { id: "jpn-mock", name: "Japan", symbol: "JPN", isActive: false },
  { id: "cn-mock", name: "China", symbol: "CN", isActive: false },
  { id: "uk-mock", name: "United Kingdom", symbol: "UK", isActive: false },
  { id: "in-mock", name: "India", symbol: "IND", isActive: false },
  { id: "br-mock", name: "Brazil", symbol: "BRA", isActive: false },
];

// --- BACKGROUND FETCHER ---
const MarketPriceFetcher = ({
  marketId,
  onPriceUpdate,
}: {
  marketId: string;
  onPriceUpdate: (price: number) => void;
}) => {
  const { data } = useReadContract({
    address: COUNTRY_REGISTRY_ADDRESS,
    abi: CountryRegistryAbi,
    functionName: "getCountryPrice",
    args: [marketId as `0x${string}`],
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    if (data) {
      const priceFloat = parseFloat(formatUnits(data[0], 18));
      onPriceUpdate(priceFloat);
    }
  }, [data, onPriceUpdate]);

  return null;
};

export default function MarketsPage() {
  const router = useRouter();
  const { markets: contractMarkets, isLoading } = useMarkets();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Update Harga Real-time (useCallback mencegah infinite loop di useEffect child)
  const handlePriceUpdate = useCallback((id: string, price: number) => {
    setPrices((prev) => {
      if (prev[id] === price) return prev;
      return { ...prev, [id]: price };
    });
  }, []);

  const handleNavigateToTrade = (marketId: string) => {
    router.push(`/trade/${marketId}`);
  };

  const filterMarkets = (markets: any[]) => {
    return markets.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeFiltered = filterMarkets(contractMarkets);
  const comingSoonFiltered = filterMarkets(COMING_SOON_MARKETS);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-400">
        <p className="animate-pulse text-xl font-semibold">
          Loading Markets...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-8 md:px-8">
      {/* Background Fetchers */}
      {contractMarkets.map((mkt) => (
        <MarketPriceFetcher
          key={mkt.id}
          marketId={mkt.id}
          onPriceUpdate={(p) => handlePriceUpdate(mkt.id, p)}
        />
      ))}

      <div className="mx-auto max-w-5xl space-y-8">
        {/* === HEADER & SEARCH === */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Markets</h1>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search a country (e.g. Indonesia, USA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-4 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* === TOP COUNTRY (ACTIVE) === */}
        {activeFiltered.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-300">
              Top Countries
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeFiltered.map((mkt) => {
                const currentPrice = prices[mkt.id] || 0;
                const isPositive = mkt.change24h >= 0;

                return (
                  <div
                    key={mkt.id}
                    onClick={() => handleNavigateToTrade(mkt.id)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-all hover:border-emerald-500/50 hover:bg-slate-900/80"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                          {mkt.symbol.substring(0, 2)}
                        </div>
                        <h3 className="font-bold text-white">{mkt.name}</h3>
                        <p className="text-xs text-slate-400">{mkt.symbol}</p>
                      </div>
                      <div className="text-right">
                        <TrendingUp
                          className={`h-6 w-6 ${
                            isPositive ? "text-emerald-500" : "text-rose-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Oracle Price</p>
                        <p className="text-xl font-bold text-slate-100">
                          $
                          {currentPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div
                        className={`rounded-lg px-2 py-1 text-xs font-medium ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {mkt.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === ALL COUNTRIES (LIST VIEW) === */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300">All Markets</h2>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">
            {/* Header */}
            <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              <div className="col-span-5 md:col-span-4">Country</div>
              <div className="col-span-4 md:col-span-3 text-right">Price</div>
              <div className="col-span-3 md:col-span-3 text-right hidden md:block">
                Volume (24h)
              </div>
              <div className="col-span-3 md:col-span-2 text-right">Action</div>
            </div>

            {/* Active List */}
            {activeFiltered.map((mkt) => (
              <div
                key={mkt.id}
                onClick={() => handleNavigateToTrade(mkt.id)}
                className="grid cursor-pointer grid-cols-12 items-center border-b border-slate-800/50 px-4 py-4 transition-colors hover:bg-slate-800/40"
              >
                <div className="col-span-5 flex items-center gap-3 md:col-span-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                    {mkt.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{mkt.name}</p>
                    <p className="text-xs text-slate-500 md:hidden">
                      {mkt.symbol}
                    </p>
                  </div>
                </div>
                <div className="col-span-4 text-right md:col-span-3">
                  <p className="font-medium text-slate-200">
                    $
                    {(prices[mkt.id] || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={`text-xs ${
                      mkt.change24h >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {mkt.change24h >= 0 ? "+" : ""}
                    {mkt.change24h.toFixed(2)}%
                  </p>
                </div>
                <div className="col-span-3 text-right hidden md:block text-slate-400 text-sm">
                  ${(mkt.volume24h || 0).toLocaleString()}
                </div>
                <div className="col-span-3 text-right md:col-span-2">
                  <button className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500">
                    Trade
                  </button>
                </div>
              </div>
            ))}

            {/* Coming Soon List */}
            {comingSoonFiltered.map((mkt) => (
              <div
                key={mkt.id}
                className="grid grid-cols-12 items-center border-b border-slate-800/50 px-4 py-4 opacity-60"
              >
                <div className="col-span-5 flex items-center gap-3 md:col-span-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-500">
                    {mkt.symbol?.substring(0, 2)}
                  </div>
                  <p className="font-medium text-slate-400">{mkt.name}</p>
                </div>
                <div className="col-span-4 text-right md:col-span-3">
                  <p className="text-sm text-slate-600">---</p>
                </div>
                <div className="col-span-3 text-right hidden md:block text-slate-600 text-sm">
                  ---
                </div>
                <div className="col-span-3 flex justify-end md:col-span-2">
                  <div className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400">
                    <Lock className="h-3 w-3" /> Coming Soon
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {activeFiltered.length === 0 && comingSoonFiltered.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No country found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
