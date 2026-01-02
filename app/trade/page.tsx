"use client";

import { useState } from "react";
import { PriceChart } from "@/components/trade/PriceChart";
import { OrderForm } from "@/components/trade/OrderForm";
import { PositionsTable } from "@/components/trade/PositionsTable";

// Mock Market Data (Bisa diganti fetch dari Registry nanti)
const MARKETS = [
  { id: "ID", name: "Indonesia", icon: "🇮🇩" },
  { id: "SG", name: "Singapore", icon: "🇸🇬" },
  { id: "US", name: "United States", icon: "🇺🇸" },
];

export default function TradePage() {
  const [selectedCountry, setSelectedCountry] = useState(MARKETS[0]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Sub-Header: Market Selector */}
      <div className="sticky top-0 z-40 border-b border-neutral-800 bg-black/80 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-7xl flex gap-3 overflow-x-auto no-scrollbar">
          {MARKETS.map((market) => (
            <button
              key={market.id}
              onClick={() => setSelectedCountry(market)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                selectedCountry.id === market.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white"
              }`}
            >
              <span className="text-lg">{market.icon}</span>
              {market.name}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* KOLOM KIRI: Chart & Positions (Lebar) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Section */}
            <div className="h-[450px] w-full">
               <PriceChart symbol={selectedCountry.id} />
            </div>
            
            {/* Positions Table */}
            <PositionsTable />
          </div>

          {/* KOLOM KANAN: Order Form (Sempit) */}
          <div className="lg:col-span-1">
             <div className="sticky top-20">
                <OrderForm selectedCountry={selectedCountry.id} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}