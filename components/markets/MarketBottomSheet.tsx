"use client";

import { TrendingUp } from "lucide-react";
import { Market } from "@/hooks/useMarkets";
import PriceChart from "../charts/PriceChart";

interface Props {
  market: Market;
  price: number;
  onTrade: () => void;
}

export function MarketBottomSheet({ market, price, onTrade }: Props) {
  const isPositive = market.change24h >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{market.name}</h3>
          <p className="text-sm text-slate-400">{market.symbol}</p>
        </div>

        <TrendingUp
          className={`h-6 w-6 ${
            isPositive ? "text-emerald-500" : "text-rose-500"
          }`}
        />
      </div>

      {/* Price */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
        <p className="text-xs text-slate-400 mb-1">{market.basePrice}</p>
        <PriceChart/>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-slate-900/40 p-3">
          <p className="text-slate-400">24h Volume</p>
          <p className="font-semibold text-white">
            ${(market.volume24h || 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-slate-900/40 p-3">
          <p className="text-slate-400">Market ID</p>
          <p className="font-mono text-xs text-slate-300 truncate">
            {market.id}
          </p>
        </div>
      </div> */}

      {/* Actions */}
      <button
        onClick={onTrade}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        Trade {market.symbol}
      </button>
    </div>
  );
}
