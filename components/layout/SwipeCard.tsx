"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import ReactCountryFlag from "react-country-flag";
import {
  ArrowLeft,
  ArrowRight,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { DerivativeNews } from "@/components/types/derivativenews";
import confetti from "canvas-confetti";
import { usePublicClient, useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

type SwipeAction = "long" | "short" | "skip";

interface SwipeCardProps {
  newsList: DerivativeNews[];
  onLong?: (news: DerivativeNews, tradeAmount: number) => Promise<any>;
  onShort?: (news: DerivativeNews, tradeAmount: number) => Promise<any>;
  onSkip?: (news: DerivativeNews) => void;
}

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCountryCode(country: string | undefined | null): string | null {
  if (!country) return null;
  const c = country.toLowerCase().trim();
  if (/\b(us|usa|united states|america)\b/.test(c)) return "US";
  if (/\b(uk|gb|britain|united kingdom|england)\b/.test(c)) return "GB";
  if (/\b(eu|euro|europe)\b/.test(c)) return "EU";
  if (/\b(japan|jp)\b/.test(c)) return "JP";
  if (/\b(china|cn)\b/.test(c)) return "CN";
  if (/\b(indonesia|id)\b/.test(c)) return "ID";
  if (/\b(india|in)\b/.test(c)) return "IN";
  if (/\b(singapore|sg)\b/.test(c)) return "SG";
  if (/\b(russia|ru)\b/.test(c)) return "RU";
  if (/\b(germany|de)\b/.test(c)) return "DE";
  return null;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  newsList,
  onLong,
  onShort,
  onSkip,
}) => {
  const publicClient = usePublicClient();

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [shuffledNews, setShuffledNews] = useState<DerivativeNews[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterCode, setFilterCode] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"SIGN" | "CONFIRM">("SIGN");

  const tradeAmounts = [1, 5, 10] as const;
  const [tradeIndex, setTradeIndex] = useState(1);
  const tradeAmount = tradeAmounts[tradeIndex];

  const successRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const draggableInstance = useRef<globalThis.Draggable[] | null>(null);

  const showSuccess = (action: "long" | "short") => {
    const el = successRef.current;
    if (!el) return;

    const scalar = 2;
    const shape = confetti.shapeFromText({
      text: action === "long" ? "📈" : "📉",
      scalar,
    });

    confetti({
      particleCount: 50,
      spread: 120,
      origin: { y: 0.5 },
      shapes: [shape],
      scalar: scalar,
      zIndex: 10001,
    });

    gsap.set(el, { display: "flex" });
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
        onStart: () => {
          const label = el.querySelector(".success-label") as HTMLElement;
          const bg = el.querySelector(".success-bg") as HTMLElement;
          if (action === "long") {
            label.innerText = "LONG OPENED";
            label.className =
              "success-label text-emerald-400 font-bold tracking-widest text-lg";
            bg.style.borderColor = "rgba(16, 185, 129, 0.3)";
          } else {
            label.innerText = "SHORT OPENED";
            label.className =
              "success-label text-rose-400 font-bold tracking-widest text-lg";
            bg.style.borderColor = "rgba(244, 63, 94, 0.3)";
          }
        },
      }
    );

    gsap.to(el, {
      opacity: 0,
      scale: 0.9,
      delay: 2,
      duration: 0.3,
      onComplete: () => {
        gsap.set(el, { display: "none" });
      },
    });
  };

  const showError = (message: string) => {
    const el = errorRef.current;
    if (!el) return;

    const label = el.querySelector(".error-message") as HTMLElement;
    if (label) label.innerText = message;

    gsap.set(el, { display: "flex" });
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
    );

    gsap.to(el, {
      opacity: 0,
      scale: 0.9,
      delay: 3,
      duration: 0.3,
      onComplete: () => {
        gsap.set(el, { display: "none" });
      },
    });
  };

  useEffect(() => {
    setShuffledNews(shuffleArray(newsList));
    setActiveIndex(0);
  }, [newsList]);

  const availableCountryCodes = useMemo(() => {
    const codes = new Set<string>();
    newsList.forEach((n) => {
      const code = getCountryCode(n.country);
      if (code) codes.add(code);
    });
    return Array.from(codes).sort();
  }, [newsList]);

  const displayedNews = useMemo(() => {
    if (!filterCode) return shuffledNews;
    return shuffledNews.filter((n) => getCountryCode(n.country) === filterCode);
  }, [shuffledNews, filterCode]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filterCode, shuffledNews]);

  const currentNews = displayedNews[activeIndex] ?? null;
  const hasCard = !!currentNews;

  const handleSwipeComplete = useCallback(
    async (action: SwipeAction) => {
      const current = displayedNews[activeIndex];
      const cardElement = cardRef.current;
      if (!current || !cardElement) return;

      if (action === "skip") {
        const screenHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;
        gsap.to(cardElement, {
          y: -screenHeight * 1.5,
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            onSkip?.(current);
            setActiveIndex((prev) => prev + 1);
            gsap.set(cardElement, {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              clearProps: "all",
            });
          },
        });
        return;
      }

      if (!isConnected) {
        gsap.to(cardElement, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.6)",
          clearProps: "all",
        });
        if (openConnectModal) {
          openConnectModal();
        } else {
          showError("Please Connect Wallet");
        }
        return;
      }

      setLoadingStep("SIGN");
      setIsProcessing(true);

      try {
        let txHash: any;

        if (action === "long") {
          txHash = await onLong?.(current, tradeAmount);
        } else if (action === "short") {
          txHash = await onShort?.(current, tradeAmount);
        }

        if (
          txHash &&
          typeof txHash === "string" &&
          txHash.startsWith("0x") &&
          publicClient
        ) {
          setLoadingStep("CONFIRM");
          await publicClient.waitForTransactionReceipt({
            hash: txHash as `0x${string}`,
          });
        }

        setIsProcessing(false);

        const screenWidth =
          typeof window !== "undefined" ? window.innerWidth : 400;
        const xDest =
          action === "long" ? screenWidth * 1.5 : -screenWidth * 1.5;
        const rotDest = action === "long" ? 30 : -30;

        gsap.to(cardElement, {
          x: xDest,
          rotation: rotDest,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            setActiveIndex((prev) => prev + 1);
            gsap.set(cardElement, {
              x: 0,
              y: 0,
              rotation: 0,
              opacity: 1,
              clearProps: "all",
            });
            showSuccess(action);
          },
        });
      } catch (error: any) {
        setIsProcessing(false);

        const errMsg = (error?.message || "").toLowerCase();
        const isReject =
          errMsg.includes("rejected") ||
          errMsg.includes("denied") ||
          errMsg.includes("user rejected");

        if (isReject) {
        } else {
          console.error("Trade Error:", error);
          showError("Transaction Failed");
        }

        gsap.to(cardElement, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.6)",
          clearProps: "all",
        });
      }
    },
    [
      activeIndex,
      displayedNews,
      onLong,
      onShort,
      onSkip,
      tradeAmount,
      publicClient,
      isConnected,
      openConnectModal,
    ]
  );

  useLayoutEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement || !currentNews) return;

    if (draggableInstance.current && draggableInstance.current[0])
      draggableInstance.current[0].kill();

    const longBadge = cardElement.querySelector("[data-swipe-long]");
    const shortBadge = cardElement.querySelector("[data-swipe-short]");
    const overlay = cardElement.querySelector("[data-overlay]");

    gsap.set(cardElement, { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set([longBadge, shortBadge, overlay], { opacity: 0 });

    draggableInstance.current = Draggable.create(cardElement, {
      type: "x,y",
      edgeResistance: 0.65,
      bounds: { minX: -500, maxX: 500, minY: -500, maxY: 500 },
      onDrag: function () {
        const x = this.x;
        const intensity = Math.min(Math.abs(x) / 100, 1);
        gsap.set(cardElement, { rotation: x / 15 });

        if (x > 0) {
          gsap.to(longBadge, {
            opacity: intensity,
            scale: 1 + intensity * 0.2,
            duration: 0.1,
          });
          gsap.to(shortBadge, { opacity: 0, duration: 0.1 });
          gsap.to(overlay, {
            backgroundColor: `rgba(16, 185, 129, ${intensity * 0.3})`,
            opacity: 1,
            duration: 0.1,
          });
        } else {
          gsap.to(shortBadge, {
            opacity: intensity,
            scale: 1 + intensity * 0.2,
            duration: 0.1,
          });
          gsap.to(longBadge, { opacity: 0, duration: 0.1 });
          gsap.to(overlay, {
            backgroundColor: `rgba(244, 63, 94, ${intensity * 0.3})`,
            opacity: 1,
            duration: 0.1,
          });
        }
      },
      onRelease: function () {
        const x = this.x;
        const y = this.y;
        if (x > 100) handleSwipeComplete("long");
        else if (x < -100) handleSwipeComplete("short");
        else if (y < -100) handleSwipeComplete("skip");
        else {
          gsap.to(cardElement, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.6)",
          });
          gsap.to([longBadge, shortBadge, overlay], {
            opacity: 0,
            duration: 0.3,
          });
        }
      },
    });

    return () => {
      if (draggableInstance.current && draggableInstance.current[0])
        draggableInstance.current[0].kill();
    };
  }, [activeIndex, currentNews, handleSwipeComplete]);

  const handleCountryFilter = (code: string | null) => {
    setFilterCode((curr) => (curr === code ? null : code));
  };

  if (!hasCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-neutral-500 animate-in fade-in zoom-in">
        <div className="w-20 h-20 mb-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-base font-medium text-white">All caught up!</p>
        <button
          onClick={() => {
            setFilterCode(null);
            setShuffledNews(shuffleArray(newsList));
            setActiveIndex(0);
          }}
          className="mt-8 px-6 py-2.5 text-xs font-bold text-black bg-white rounded-full hover:bg-neutral-200 transition shadow-lg"
        >
          Reset Feed
        </button>
      </div>
    );
  }

  const currentCode = getCountryCode(currentNews.country);

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto h-[calc(100vh-90px)] md:h-auto md:min-h-[600px] mt-2 relative">
      <div className="w-full overflow-x-auto no-scrollbar py-2 px-4 shrink-0 z-20 mask-gradient-right">
        <div className="flex gap-2 justify-center min-w-max">
          <button
            onClick={() => handleCountryFilter(null)}
            className={classNames(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border backdrop-blur-sm",
              !filterCode
                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : "bg-black/40 text-neutral-400 border-white/10 hover:border-white/30"
            )}
          >
            All
          </button>
          {availableCountryCodes.map((code) => {
            const isActive = filterCode === code;
            return (
              <button
                key={code}
                onClick={() => handleCountryFilter(code)}
                className={classNames(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border backdrop-blur-sm",
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-black/40 text-neutral-400 border-white/10 hover:border-white/30"
                )}
              >
                <ReactCountryFlag
                  countryCode={code}
                  svg
                  className="rounded-full w-3 h-3"
                />
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex-1 w-full flex justify-center items-center perspective-1000 my-4 min-h-0">
        {displayedNews[activeIndex + 1] && (
          <div className="absolute w-[85%] h-[95%] bg-neutral-900/50 border border-white/5 rounded-[2rem] -z-10 translate-y-4 scale-95 opacity-50" />
        )}

        <div
          ref={cardRef}
          className="relative w-[90%] md:w-[320px] aspect-[3/4.5] md:aspect-[3/4.2] md:max-h-[500px] bg-[#050505] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing will-change-transform group"
        >
          <div
            data-overlay
            className="absolute inset-0 pointer-events-none z-20 transition-opacity"
          />

          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-center items-center gap-10">
            <div
              data-swipe-long
              className="flex flex-col items-center gap-2 opacity-0 transform -rotate-12"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.6)]">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                LONG
              </span>
            </div>
            <div
              data-swipe-short
              className="flex flex-col items-center gap-2 opacity-0 transform rotate-12"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.6)]">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
                SHORT
              </span>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-full p-4 z-40 flex justify-between items-start">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
              {currentCode && (
                <ReactCountryFlag
                  countryCode={currentCode}
                  svg
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {currentNews.country}
              </span>
            </div>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                setTradeIndex((i) => (i + 1) % tradeAmounts.length)
              }
              className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-full font-bold text-xs shadow-lg active:scale-95 transition-transform"
            >
              <DollarSign className="w-3 h-3" />
              <span>{tradeAmount}</span>
            </button>
          </div>

          <div className="relative h-[55%] w-full overflow-hidden">
            <img
              src={currentNews.imageUrl}
              alt="News"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 w-full h-[50%] bg-gradient-to-t from-[#050505] via-[#050505] to-transparent px-5 pb-6 flex flex-col justify-end">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white leading-tight line-clamp-3 text-pretty">
                {currentNews.title}
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-4">
                {currentNews.description}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[9px] text-neutral-600 font-mono uppercase">
              <span>AI Analysis</span> • <span>Impact: High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pb-2 shrink-0 z-20">
        <button
          disabled={isProcessing}
          onClick={() => handleSwipeComplete("short")}
          className={classNames(
            "w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:border-rose-500/50 hover:bg-rose-500/10 group",
            isProcessing && "opacity-50"
          )}
        >
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => handleSwipeComplete("skip")}
          className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-xl active:scale-90 hover:bg-white/10"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
        <button
          disabled={isProcessing}
          onClick={() => handleSwipeComplete("long")}
          className={classNames(
            "w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center shadow-2xl transition-all active:scale-90 hover:border-emerald-500/50 hover:bg-emerald-500/10 group",
            isProcessing && "opacity-50"
          )}
        >
          <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div
        ref={successRef}
        className="pointer-events-none fixed inset-0 z-[10000] hidden items-center justify-center"
      >
        <div className="success-bg bg-black/90 backdrop-blur-xl border border-emerald-500/20 px-10 py-8 rounded-[2rem] text-center shadow-2xl transform scale-50">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <div className="success-label mb-2"></div>
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            Transaction Successful
          </div>
        </div>
      </div>

      <div
        ref={errorRef}
        className="pointer-events-none fixed inset-0 z-[10000] hidden items-center justify-center"
      >
        <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-rose-500/30 px-8 py-6 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-3 min-w-[280px]">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="error-message text-rose-400 font-bold tracking-wide text-lg mb-1"></div>
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Please try again
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/10 px-8 py-6 rounded-2xl flex items-center gap-4 shadow-2xl scale-110">
            <div className="relative">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">
                {loadingStep === "SIGN" ? "Check Wallet..." : "Confirming..."}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 mt-0.5">
                {loadingStep === "SIGN"
                  ? "Sign the transaction"
                  : "Waiting for receipt"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
