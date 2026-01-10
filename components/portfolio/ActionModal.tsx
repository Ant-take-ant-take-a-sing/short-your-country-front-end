"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface ActionModalProps {
  isOpen: boolean;
  type: "deposit" | "withdraw";
  onClose: () => void;
  balance: string;
  onConfirm: (amount: string) => void;
  isPending: boolean;
  feedback: { type: string; message: string; hash?: string } | null;
}

export function ActionModal({
  isOpen,
  type,
  onClose,
  balance,
  onConfirm,
  isPending,
  feedback,
}: ActionModalProps) {
  const [amount, setAmount] = useState("");

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (isOpen) setAmount("");
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handlePercentage = (percent: number) => {
    const val = parseFloat(balance || "0");
    const formatted = (val * percent).toFixed(6).replace(/\.?0+$/, "");
    setAmount(formatted);
  };

  const handleSubmit = () => {
    if (!isConnected) {
      openConnectModal?.();
    } else {
      onConfirm(amount);
    }
  };

  const isDeposit = type === "deposit";
  const buttonBg = isDeposit
    ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
    : "bg-white text-black hover:bg-neutral-200";

  const getFontSize = (length: number) => {
    if (length > 20) return { int: "text-xl", dec: "text-base" };
    if (length > 14) return { int: "text-2xl", dec: "text-lg" };
    if (length > 10) return { int: "text-3xl", dec: "text-xl" };
    if (length > 7) return { int: "text-4xl", dec: "text-2xl" };
    return { int: "text-5xl", dec: "text-3xl" };
  };

  const formatDisplay = (val: string) => {
    if (!val)
      return <span className="text-neutral-600 text-5xl font-bold">0</span>;

    const [int, dec] = val.split(".");
    const { int: intSize, dec: decSize } = getFontSize(val.length);

    return (
      <div className="flex items-baseline justify-center tracking-tight w-full px-4 transition-all duration-200">
        <span className={`${intSize} font-bold text-white`}>{int}</span>
        {dec !== undefined && (
          <span className={`${decSize} font-bold text-neutral-500`}>
            .{dec}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold capitalize text-white tracking-wide">
            {type}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback ? (
          <div
            className={`p-6 rounded-3xl border text-center animate-in fade-in zoom-in duration-300 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20"
                : feedback.type === "error"
                ? "bg-rose-500/10 border-rose-500/20"
                : "bg-neutral-900 border-white/5"
            }`}
          >
            {feedback.type === "loading" && (
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
            )}
            <p
              className={`font-medium ${
                feedback.type === "success"
                  ? "text-emerald-400"
                  : feedback.type === "error"
                  ? "text-rose-400"
                  : "text-white"
              }`}
            >
              {feedback.message}
            </p>
            {feedback.hash && (
              <a
                href={`https://explorer.sepolia.mantle.xyz/tx/${feedback.hash}`}
                target="_blank"
                className="text-xs text-neutral-500 underline mt-2 block hover:text-white"
              >
                View Transaction
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative py-6 text-center">
              <p className="text-[10px] text-neutral-500 font-mono mb-1 uppercase tracking-wider">
                Enter Amount (USDT)
              </p>

              <div className="relative z-0 min-h-[60px] flex items-center justify-center pointer-events-none overflow-hidden">
                {formatDisplay(amount)}
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-text text-center caret-white"
                autoFocus
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-neutral-500">
                  Balance Available
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {parseFloat(balance).toLocaleString()} USDT
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentage(pct / 100)}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => setAmount(balance)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isDeposit
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  MAX
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={
                isPending ||
                (!isConnected ? false : !amount || parseFloat(amount) <= 0)
              }
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                !isConnected
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : buttonBg
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : !isConnected ? (
                <>
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </>
              ) : (
                `Confirm ${type}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}
