"use client";

import { useState } from "react";
import { NationMarketChart } from "@/components/charts/NationMarketChart";
import type { DerivativeNews } from "@/components/types/derivativenews";

type Market = {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  change24h: number;
  volume24h: number;
};

type Timeframe = "1m" | "5m" | "1h" | "1d";
type ChartType = "area" | "candlestick";



const mockMarkets: Market[] = [
  {
    id: "IDN",
    name: "Indonesia Index",
    symbol: "IDN",
    basePrice: 100,
    change24h: 1.23,
    volume24h: 1_200_000,
  },
  {
    id: "USA",
    name: "United States Index",
    symbol: "USA",
    basePrice: 250,
    change24h: -0.85,
    volume24h: 3_450_000,
  },
  {
    id: "JPN",
    name: "Japan Index",
    symbol: "JPN",
    basePrice: 180,
    change24h: 0.42,
    volume24h: 890_000,
  },
];

export default function MarketsPage() {
  const [selected, setSelected] = useState<Market>(mockMarkets[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [chartType, setChartType] = useState<ChartType>("area");
    const handleLong = (news: DerivativeNews) => {
        console.log("LONG from news:", news);
        // TODO:
        // - panggil viem / wagmi untuk open long di smart contract
        // - atau kirim request ke backend (REST / GraphQL)
    };

    // callback ketika user swipe SHORT
    const handleShort = (news: DerivativeNews) => {
        console.log("SHORT from news:", news);
    };

    // callback ketika user swipe SKIP
    const handleSkip = (news: DerivativeNews) => {
        console.log("SKIP news:", news.id);
    };
  const timeframes: Timeframe[] = ["1m", "5m", "1h", "1d"];

  return (
    <div className="min-h-[70vh] px-4 py-6 md:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        {/* LIST MARKET (KIRI) */}
        <div className="w-full lg:w-1/3">
          <h1 className="text-lg font-semibold text-slate-50">
            Markets
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Pilih negara untuk melihat index dan mulai long / short.
          </p>

          <div className="mt-4 space-y-2">
            {mockMarkets.map((mkt) => {
              const isActive = mkt.id === selected.id;
              const changeClass =
                mkt.change24h > 0
                  ? "text-emerald-400"
                  : mkt.change24h < 0
                  ? "text-rose-400"
                  : "text-slate-300";

              return (
                <button
                  key={mkt.id}
                  onClick={() => setSelected(mkt)}
                  className={[
                    "w-full rounded-2xl border px-3 py-3 text-left text-xs transition-colors",
                    isActive
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">
                        {mkt.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {mkt.symbol} • Synthetic Nation Index
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-100">
                        {mkt.basePrice.toFixed(2)}
                      </p>
                      <p className={`text-[11px] ${changeClass}`}>
                        {mkt.change24h > 0 ? "+" : ""}
                        {mkt.change24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Vol 24h: ${mkt.volume24h.toLocaleString("en-US")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHART + DETAIL (KANAN) */}
        <div className="w-full space-y-4 lg:w-2/3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {selected.name}
              </p>
              <p className="text-[11px] text-slate-400">
                {selected.symbol} • On-chain synthetic index
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-50">
                {selected.basePrice.toFixed(2)}
              </p>
              <p
                className={`text-[11px] ${
                  selected.change24h > 0
                    ? "text-emerald-400"
                    : selected.change24h < 0
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {selected.change24h > 0 ? "+" : ""}
                {selected.change24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>

          {/* CONTROL BAR: timeframe & chart type */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-2 py-1">
              <span className="text-slate-400">Timeframe</span>
              <div className="flex gap-1">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={[
                      "rounded-full px-2 py-1",
                      timeframe === tf
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-300 hover:bg-slate-800",
                    ].join(" ")}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-2 py-1">
              <span className="text-slate-400">Chart</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType("area")}
                  className={[
                    "rounded-full px-2 py-1",
                    chartType === "area"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800",
                  ].join(" ")}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType("candlestick")}
                  className={[
                    "rounded-full px-2 py-1",
                    chartType === "candlestick"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800",
                  ].join(" ")}
                >
                  Candle
                </button>
              </div>
            </div>
          </div>

          <NationMarketChart
            symbol={selected.symbol}
            basePrice={selected.basePrice}
            timeframe={timeframe}
            chartType={chartType}
          />

          {/* Info bawah chart (dummy dulu) */}
          <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Estimated Funding
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-400">
                0.015% / 8h
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Berlaku untuk posisi long & short.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Open Interest
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-50">
                $1.24M
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Total posisi aktif di index ini.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Max Leverage
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-50">
                10x
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Disesuaikan dengan volatilitas negara.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
