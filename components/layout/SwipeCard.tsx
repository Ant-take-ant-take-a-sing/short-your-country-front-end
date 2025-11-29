// components/SwipeCard.tsx
"use client";

import React, {useCallback, useLayoutEffect, useRef, useState,} from "react";
import {gsap} from "gsap";
import {Draggable} from "gsap/Draggable";
import type {DerivativeNews} from "../types/derivativenews";

gsap.registerPlugin(Draggable);

type SwipeAction = "long" | "short" | "skip";

interface SwipeCardProps {
    newsList: DerivativeNews[];
    onLong?: (news: DerivativeNews) => void;
    onShort?: (news: DerivativeNews) => void;
    onSkip?: (news: DerivativeNews) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
                                                                        newsList,
                                                                        onLong,
                                                                        onShort,
                                                                        onSkip,
                                                                    }) => {
    // state untuk menyimpan index kartu yang sedang aktif
    const [activeIndex, setActiveIndex] = useState(0);

    // referensi ke elemen DOM kartu
    const cardRef = useRef<HTMLDivElement | null>(null);
    const longBadgeRef = useRef<HTMLDivElement | null>(null);
    const shortBadgeRef = useRef<HTMLDivElement | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);

    // referensi ke instance draggable GSAP
    type DraggableInstance = ReturnType<typeof Draggable.create>[0];
    const draggableRef = useRef<DraggableInstance | null>(null);

    const activeNews = newsList[activeIndex];

    // fungsi untuk mengembalikan kartu ke posisi tengah
    const resetCardPosition = useCallback(() => {
        if (!cardRef.current) return;
        gsap.set(cardRef.current, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
            boxShadow:
                "0 10px 30px rgba(0,0,0,0.45)",
        });
        if (longBadgeRef.current) {
            gsap.set(longBadgeRef.current, { opacity: 0, scale: 0.85, filter: "blur(2px)" });
        }
        if (shortBadgeRef.current) {
            gsap.set(shortBadgeRef.current, { opacity: 0, scale: 0.85, filter: "blur(2px)" });
        }
        if (titleRef.current) {
            gsap.set(titleRef.current, {
                letterSpacing: "0px",
                scale: 1,
                skewX: 0,
                color: "#ffffff",
                textShadow: "none",
                filter: "none",
            });
        }
    }, []);

    // fungsi untuk pindah ke kartu berita berikutnya
    const goToNextNews = useCallback(() => {
        setActiveIndex((prev) => prev + 1);
    }, []);

    // util: suara aksi long/short
    const playActionSound = useCallback((action: SwipeAction) => {
        if (typeof window === "undefined") return;
        try {
            const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            const isLong = action === "long";
            const baseFreq = isLong ? 560 : 260;
            osc.type = isLong ? "sawtooth" : "square";
            osc.frequency.setValueAtTime(baseFreq, now);
            // quick pitch sweep for strong feedback
            osc.frequency.exponentialRampToValueAtTime(isLong ? 920 : 180, now + 0.12);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (_) {
            // ignore audio errors
        }
    }, []);

    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof window !== "undefined" && navigator?.vibrate) {
            try { navigator.vibrate(pattern); } catch (_) {}
        }
    }, []);

    // fungsi untuk eksekusi aksi (long / short / skip) dengan animasi
    const executeAction = useCallback(
        (action: SwipeAction) => {
            if (!activeNews || !cardRef.current) return;

            const element = cardRef.current;
            const screenWidth =
                typeof window !== "undefined" ? window.innerWidth : 600;

            if (action === "long") {
                playActionSound("long");
                vibrate([10, 30, 10]);
                // animasi geser ke kanan untuk LONG
                gsap.to(element, {
                    x: screenWidth,
                    rotation: 15,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power3.in",
                    onComplete: () => {
                        onLong?.(activeNews);
                        goToNextNews();
                        resetCardPosition();
                    },
                });
            } else if (action === "short") {
                playActionSound("short");
                vibrate([10, 40]);
                // animasi geser ke kiri untuk SHORT
                gsap.to(element, {
                    x: -screenWidth,
                    rotation: -15,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power3.in",
                    onComplete: () => {
                        onShort?.(activeNews);
                        goToNextNews();
                        resetCardPosition();
                    },
                });
            } else {
                // animasi geser ke atas untuk SKIP
                gsap.to(element, {
                    y: -400,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power3.in",
                    onComplete: () => {
                        onSkip?.(activeNews);
                        goToNextNews();
                        resetCardPosition();
                    },
                });
            }
        },
        [activeNews, onLong, onShort, onSkip, goToNextNews, resetCardPosition, playActionSound, vibrate]
    );

    // inisialisasi Draggable setiap kali kartu aktif berubah
    useLayoutEffect(() => {
        const element = cardRef.current;
        if (!element || !activeNews) return;

        // pastikan posisi kartu di-reset dulu
        resetCardPosition();

        // animasi fade-in saat kartu baru muncul
        gsap.fromTo(
            element,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
        );

        // threshold jarak drag untuk dianggap swipe
        const thresholdX = 120;
        const thresholdY = 120;

        // membuat kartu dapat di-drag menggunakan Draggable
        const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        draggableRef.current = Draggable.create(element, {
            type: "x,y",
            edgeResistance: 0.8,
            // Use BoundsMinMax shape to satisfy GSAP typings
            bounds: {minX: -300, maxX: 300, minY: -300, maxY: 300},
            onDrag() {
                // saat di-drag, kartu sedikit berotasi berdasarkan posisi x
                const rotation = this.x / 15;
                gsap.to(this.target, {rotation, duration: 0});
                // visual feedback kuat sesuai arah
                const x = this.x as number;
                const intensity = Math.min(1, Math.max(0, Math.abs(x) / 140));
                if (x > 0) {
                    // LONG: emerald glow
                    gsap.to(this.target, {
                        boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 ${12 + intensity * 26}px ${intensity * 10}px rgba(16,185,129,${0.35 + intensity * 0.4})`,
                        duration: 0,
                    });
                    if (longBadgeRef.current) {
                        gsap.to(longBadgeRef.current, {
                            opacity: 0.15 + intensity * 0.85,
                            scale: 0.9 + intensity * 0.25,
                            filter: "blur(0px)",
                            duration: 0
                        });
                    }
                    if (shortBadgeRef.current) {
                        gsap.to(shortBadgeRef.current, {opacity: 0.05, scale: 0.85, filter: "blur(2px)", duration: 0});
                    }
                    if (!reduceMotion && titleRef.current) {
                        gsap.to(titleRef.current, {
                            letterSpacing: `${Math.round(0.5 + intensity * 1.5)}px`,
                            scale: 1 + intensity * 0.06,
                            skewX: intensity * 4,
                            color: "#6ee7b7", // emerald-300
                            textShadow: `0 0 ${2 + intensity * 10}px rgba(16,185,129,${0.55 + intensity * 0.35})`,
                            duration: 0,
                        });
                    }
                } else if (x < 0) {
                    // SHORT: rose glow
                    gsap.to(this.target, {
                        boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 ${12 + intensity * 26}px ${intensity * 10}px rgba(244,63,94,${0.35 + intensity * 0.4})`,
                        duration: 0,
                    });
                    if (shortBadgeRef.current) {
                        gsap.to(shortBadgeRef.current, {
                            opacity: 0.15 + intensity * 0.85,
                            scale: 0.9 + intensity * 0.25,
                            filter: "blur(0px)",
                            duration: 0
                        });
                    }
                    if (longBadgeRef.current) {
                        gsap.to(longBadgeRef.current, {opacity: 0.05, scale: 0.85, filter: "blur(2px)", duration: 0});
                    }
                    if (!reduceMotion && titleRef.current) {
                        gsap.to(titleRef.current, {
                            letterSpacing: `${Math.round(0.5 + intensity * 1.5)}px`,
                            scale: 1 + intensity * 0.06,
                            skewX: -intensity * 4,
                            color: "#fda4af", // rose-300
                            textShadow: `0 0 ${2 + intensity * 10}px rgba(244,63,94,${0.55 + intensity * 0.35})`,
                            duration: 0,
                        });
                    }
                }
            },
            onDragEnd() {
                const {x, y} = this;

                // jika pergerakan kurang jauh, kartu kembali ke tengah
                if (Math.abs(x) < thresholdX && Math.abs(y) < thresholdY) {
                    gsap.to(this.target, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        duration: 0.3,
                        ease: "power3.out",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
                        onComplete: () => {
                            if (longBadgeRef.current) gsap.to(longBadgeRef.current, {
                                opacity: 0,
                                scale: 0.85,
                                filter: "blur(2px)",
                                duration: 0.12
                            });
                            if (shortBadgeRef.current) gsap.to(shortBadgeRef.current, {
                                opacity: 0,
                                scale: 0.85,
                                filter: "blur(2px)",
                                duration: 0.12
                            });
                        }
                    });
                    if (!reduceMotion && titleRef.current) {
                        gsap.to(titleRef.current, {
                            letterSpacing: "0px",
                            scale: 1,
                            skewX: 0,
                            color: "#ffffff",
                            textShadow: "none",
                            duration: 0.22,
                            ease: "power2.out",
                        });
                    }
                    return;
                }

                let action: SwipeAction | null = null;

                // cek apakah drag lebih dominan horizontal atau vertical
                if (Math.abs(x) > Math.abs(y)) {
                    // horizontal → tentukan long / short
                    action = x > 0 ? "long" : "short";
                } else if (y < 0) {
                    // vertical ke atas → skip
                    action = "skip";
                } else {
                    // drag ke bawah → anggap batal dan kembali ke tengah
                    gsap.to(this.target, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        duration: 0.3,
                        ease: "power3.out",
                    });
                    return;
                }

                if (action) {
                    // small kinetic pop on title before action exit
                    if (!reduceMotion && titleRef.current && (action === "long" || action === "short")) {
                        gsap.to(titleRef.current, {
                            scale:
                                action === "long" || action === "short" ? 1.12 : 1,
                            duration: 0.12,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.out",
                        });
                    }
                    executeAction(action);
                }
            },
        })[0];

        // cleanup saat kartu diganti atau komponen unmount
        return () => {
            draggableRef.current?.kill();
            draggableRef.current = null;
        };
    }, [activeNews, executeAction, resetCardPosition]);

    // jika data berita sudah habis
    if (!activeNews) {
        return (
            <div className="w-full max-w-md mx-auto text-center py-12 text-slate-400">
                No more news ✨
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full max-w-md h-[420px] flex items-center justify-center">
                <div
                    ref={cardRef}
                    className="absolute w-full h-[380px] bg-slate-900 text-white rounded-2xl shadow-2xl p-5 flex flex-col gap-3 select-none touch-pan-y overflow-hidden"
                >
                    {/* overlay badges for strong direction feedback */}
                    <div
                        ref={longBadgeRef}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 origin-center rounded-full px-4 py-2 text-emerald-200 bg-emerald-500/15 ring-2 ring-emerald-400/40 font-extrabold tracking-widest text-sm uppercase"
                        style={{ opacity: 0, transform: "translateY(-50%) scale(0.85)" }}
                    >
                        LONG ➜
                    </div>
                    <div
                        ref={shortBadgeRef}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 origin-center rounded-full px-4 py-2 text-rose-200 bg-rose-500/15 ring-2 ring-rose-400/40 font-extrabold tracking-widest text-sm uppercase"
                        style={{ opacity: 0, transform: "translateY(-50%) scale(0.85)" }}
                    >
                        ⬅ SHORT
                    </div>
                    {/* baris kecil sebagai hint arah swipe */}
                    <div className="flex justify-between text-xl font-bold uppercase tracking-wide rounded-full">
                        <span className="px-2 py-1 rounded-full bg-rose-500/15 text-rose-300">
                         SHORT
                        </span>
                        <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
                          LONG
                        </span>
                    </div>

                    {/* header informasi simbol dan sumber */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="text-xs text-slate-400">
                            <div className="font-medium text-emerald-300">
                                {activeNews.symbol}
                            </div>
                            {activeNews.source && <div>{activeNews.source}</div>}
                            {activeNews.time && <div>{activeNews.time}</div>}
                        </div>

                        <div className="flex flex-col gap-1 text-[10px] text-right text-slate-400">
                            <span>👆 up = SKIP</span>
                            <span>Drag gently to read</span>
                        </div>
                    </div>

                    {/* gambar thumbnail jika tersedia */}
                    {activeNews.imageUrl && (
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-800 mt-1">
                            <img
                                src={activeNews.imageUrl}
                                alt={activeNews.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* konten utama kartu: judul + ringkasan */}
                    <div className="mt-1 flex-1 overflow-hidden">
                        <h2 ref={titleRef} className="font-semibold text-lg mb-1 line-clamp-2">
                            {activeNews.title}
                        </h2>
                        <p className="text-sm text-slate-300 line-clamp-6">
                            {activeNews.summary}
                        </p>
                    </div>

                    {/* tombol manual jika user tidak ingin swipe */}
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <button
                            onClick={() => executeAction("short")}
                            className="py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 transition font-semibold"
                        >
                            SHORT
                        </button>
                        <button
                            onClick={() => executeAction("skip")}
                            className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition font-semibold"
                        >
                            SKIP
                        </button>
                        <button
                            onClick={() => executeAction("long")}
                            className="py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 transition font-semibold"
                        >
                            LONG
                        </button>
                    </div>
                </div>
            </div>

            {/* indikator progress kartu */}
            <div className="text-xs text-slate-400">
                Card {activeIndex + 1} of {newsList.length}
            </div>
        </div>
    );
};
