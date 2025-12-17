"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/portofolio/StatCard";
import { walletCoins } from "@/lib/WalletConfig";
import { MantleSepoliaBalance } from "@/components/portofolio/MantleSepoliaBalance";

type Holding = {
  symbol: string;
  name: string;
  amount: number; // units held
  price: number; // current price per unit (USD)
  change24hPct: number; // percent change last 24h (e.g., 0.035 = +3.5%)
};

// Simple price source for symbols. Replace with live prices when available.
const priceBook: Record<
  string,
  { price: number; change24hPct: number; name?: string }
> = {
  IDN: {
    price: 3550,
    change24hPct: 0.018,
    name: "Indonesian Shyntetic Nation Index",
  },
  USA: {
    price: 68000,
    change24hPct: -0.006,
    name: "US Shyntetic Nation Index",
  },
  JPN: { price: 185, change24hPct: 0.042, name: "JPN Shyntetic Nation Index" },
};

function usd(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export default function Portofolio() {
  const [closedPositions, setClosedPositions] = useState<string[]>([]);
  const [closeModal, setCloseModal] = useState<Holding | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Load closed positions dari localStorage
  useEffect(() => {
    const stored = localStorage.getItem("closedPositions");
    if (stored) {
      setClosedPositions(JSON.parse(stored));
    }
  }, []);

  const allHoldings: Holding[] = walletCoins.map((c) => {
    const p = priceBook[c.symbol];
    return {
      symbol: c.symbol,
      name: c.name ?? p?.name ?? c.symbol,
      amount: c.amount,
      price: p?.price ?? 0,
      change24hPct: p?.change24hPct ?? 0,
    } as Holding;
  });

  // Filter closed positions
  const holdings = allHoldings.filter(
    (h) => !closedPositions.includes(h.symbol)
  );

  const totalValue = holdings.reduce((sum, h) => sum + h.amount * h.price, 0);

  // Yesterday value approximated by reversing 24h change
  const yesterdayValue = holdings.reduce(
    (sum, h) => sum + (h.amount * h.price) / (1 + (h.change24hPct || 0)),
    0
  );
  const pnl24h = totalValue - yesterdayValue;
  const pnl24hPct = yesterdayValue === 0 ? 0 : pnl24h / yesterdayValue;

  const best = [...holdings].sort((a, b) => b.change24hPct - a.change24hPct)[0];

  const handleClosePosition = async () => {
    if (!closeModal) return;

    setIsClosing(true);

    // Simulasi API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Ubah ke closed positions
    const updated = [...closedPositions, closeModal.symbol];
    setClosedPositions(updated);
    localStorage.setItem("closedPositions", JSON.stringify(updated));

    setIsClosing(false);
    setCloseModal(null);
  };

  const handleReopenAll = () => {
    setClosedPositions([]);
    localStorage.removeItem("closedPositions");
  };

  return (
    <div className="space-y-6">
      {/* Mantle Sepolia native MNT balance widget */}
      <MantleSepoliaBalance />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Value"
          value={usd(totalValue)}
          subtitle="Current portfolio value"
        />
        <StatCard
          label="24h PnL"
          value={`${pnl24h >= 0 ? "+" : ""}${usd(pnl24h)} (${(
            pnl24hPct * 100
          ).toFixed(2)}%)`}
          subtitle="Since 24h"
          tone={pnl24h >= 0 ? "positive" : "negative"}
        />
        {best && (
          <StatCard
            label="Best Performer (24h)"
            value={`${best.symbol} ${(best.change24hPct * 100).toFixed(2)}%`}
            subtitle={best.name}
            tone={best.change24hPct >= 0 ? "positive" : "negative"}
          />
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex justify-between items-center border-b border-slate-800 px-4 py-3">
          <p className="text-sm font-semibold text-slate-100">Holdings</p>
          {closedPositions.length > 0 && (
            <button
              onClick={handleReopenAll}
              className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              Reopen All ({closedPositions.length})
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-800">
          <div className="grid grid-cols-14 gap-2 px-4 py-2 text-[11px] uppercase tracking-wide text-slate-400">
            <div className="col-span-4">Asset</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-2 text-right">24h</div>
            <div className="col-span-2 text-right">Modify</div>
          </div>
          {holdings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400">No active holdings</p>
              <p className="mt-1 text-sm text-slate-500">
                All positions have been closed
              </p>
              {closedPositions.length > 0 && (
                <button
                  onClick={handleReopenAll}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Reopen All Positions
                </button>
              )}
            </div>
          ) : (
            holdings.map((h) => {
              const value = h.amount * h.price;
              const tone =
                h.change24hPct >= 0 ? "text-emerald-400" : "text-rose-400";
              const sign = h.change24hPct >= 0 ? "+" : "";
              return (
                <div
                  key={h.symbol}
                  className="grid grid-cols-14 items-center gap-2 px-4 py-3 text-sm"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-200">
                      {h.symbol}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{h.name}</p>
                      <p className="text-xs text-slate-500">{h.symbol}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-slate-100">
                    {h.amount.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-slate-100">
                    {h.price ? usd(h.price) : "—"}
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-slate-100">
                    {h.price ? usd(value) : "—"}
                  </div>
                  <div className={`col-span-2 text-right tabular-nums ${tone}`}>
                    {sign}
                    {(h.change24hPct * 100).toFixed(2)}%
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => setCloseModal(h)}
                      className="rounded-md bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  Close Position
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Confirm closing this position
                </p>
              </div>
              <button
                onClick={() => setCloseModal(null)}
                disabled={isClosing}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                <p className="text-lg cursor-pointer">X</p>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Asset Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                    {closeModal.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">
                      {closeModal.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {closeModal.symbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Amount</span>
                  <span className="font-medium text-slate-100">
                    {closeModal.amount.toLocaleString()} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Current Price</span>
                  <span className="font-medium text-slate-100">
                    {usd(closeModal.price)}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-slate-100">
                      Estimated Proceeds
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {usd(closeModal.amount * closeModal.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCloseModal(null)}
                disabled={isClosing}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium text-slate-100 transition-colors hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClosePosition}
                disabled={isClosing}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {isClosing ? "Closing..." : "Confirm Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
