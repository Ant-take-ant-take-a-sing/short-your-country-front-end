// app/derivatives/page.tsx (contoh Next.js App Router)
"use client";

import React from "react";
import { SwipeCard } from "@/components/layout/SwipeCard";
import type { DerivativeNews } from "@/components/types/derivativenews";

const mockNews: DerivativeNews[] = [
    {
        id: "1",
        title: "FOMC Holds Rates, XAUUSD Volatility Spikes",
        summary:
            "The Fed decided to hold interest rates while signaling potential cuts next year. Gold reacted with a sharp move during the New York session...",
        symbol: "XAUUSD",
        source: "Internal NewsFeed",
        time: "2025-11-29 20:00 WIB",
    },
    {
        id: "2",
        title: "NFP Beats Expectations, USD Rallies Across the Board",
        summary:
            "The latest Non-Farm Payrolls report showed stronger-than-expected job growth, pushing the US dollar higher against major currencies...",
        symbol: "EURUSD",
        source: "MacroDesk",
        time: "2025-11-29 19:30 WIB",
    },
];

export default function DerivativesPage() {
    // callback ketika user swipe LONG
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

    return (
        <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <SwipeCard
                newsList={mockNews}
                onLong={handleLong}
                onShort={handleShort}
                onSkip={handleSkip}
            />
        </main>
    );
}
