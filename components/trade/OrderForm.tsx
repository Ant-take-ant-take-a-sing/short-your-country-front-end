"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Loader2 } from "lucide-react";
import { COUNTRY_TRADING_ADDRESS } from "@/config/addresses";
import { CountryTradingAbi } from "@/config/abis";
import { useTrade } from "@/hooks/useTrade";

export function OrderForm({ selectedCountry }: { selectedCountry: string }) {
  const { address } = useAccount();
  const { openPosition, isPending, isConfirming, isSuccess, reset } = useTrade();
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [amount, setAmount] = useState("");

  // Baca Saldo Collateral Internal (di dalam Smart Contract)
  const { data: collateralBalance, refetch } = useReadContract({
    address: COUNTRY_TRADING_ADDRESS,
    abi: CountryTradingAbi,
    functionName: "getCollateralBalance",
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // Jika sukses, reset form & refresh saldo
  useEffect(() => {
    if (isSuccess) {
      setAmount("");
      refetch();
      // Bisa tambah toast notification disini
      setTimeout(reset, 3000); 
    }
  }, [isSuccess, refetch, reset]);

  const handleTrade = () => {
    if (!amount) return;
    openPosition(side, selectedCountry, amount);
  };

  const formattedBalance = collateralBalance
    ? parseFloat(formatUnits(collateralBalance, 18)).toFixed(2)
    : "0.00";

  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-800 bg-[#0A0A0A] p-6">
      <h2 className="text-xl font-bold mb-4 text-white">Place Order</h2>

      {/* Selector Long/Short */}
      <div className="mb-6 flex rounded-lg bg-neutral-900 p-1 border border-neutral-800">
        <button
          onClick={() => setSide("LONG")}
          className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
            side === "LONG"
              ? "bg-emerald-600 text-white shadow-lg"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("SHORT")}
          className={`flex-1 rounded-md py-2 text-sm font-bold transition-all ${
            side === "SHORT"
              ? "bg-rose-600 text-white shadow-lg"
              : "text-neutral-400 hover:text-white"
          }`}
        >
          Short
        </button>
      </div>

      {/* Input Amount */}
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-xs text-neutral-400">
            <span>Amount</span>
            <span className="text-emerald-400">Available: ${formattedBalance}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-right text-lg font-mono text-white focus:border-neutral-600 focus:outline-none placeholder:text-neutral-600"
            />
            <span className="absolute left-4 top-3.5 text-sm font-bold text-neutral-500">
              USDT
            </span>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Leverage</span>
            <span className="font-mono text-white">1.0x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Entry Price</span>
            <span className="font-mono text-white">Oracle Live</span>
          </div>
          <div className="flex justify-between text-sm border-t border-neutral-800 pt-2 mt-2">
            <span className="text-neutral-400">Est. Fee (0.1%)</span>
            <span className="font-mono text-neutral-300">
              {amount ? (parseFloat(amount) * 0.001).toFixed(4) : "0.00"} USDT
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0}
          onClick={handleTrade}
          className={`mt-4 w-full rounded-lg py-4 text-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            side === "LONG"
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              : "bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
          }`}
        >
          {isPending || isConfirming ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" /> Processing...
            </div>
          ) : (
            `${side} ${selectedCountry}`
          )}
        </button>
        
        {isSuccess && (
            <p className="text-center text-xs text-emerald-500 animate-pulse">Order placed successfully!</p>
        )}
      </div>
    </div>
  );
}