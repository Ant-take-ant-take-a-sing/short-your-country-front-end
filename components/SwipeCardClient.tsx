"use client";

import { SwipeCard } from "@/components/layout/SwipeCard";
import type { DerivativeNews } from "@/components/types/derivativenews";
import { useTrade } from "@/hooks/useTrade";
import { useState } from "react";

function getCountryCode(country: string | undefined | null): string | null {
  if (!country) return null;
  const c = country.toLowerCase().trim();

  if (["us", "usa", "united states"].some((k) => c.includes(k))) return "US";
  if (["uk", "gb", "britain", "united kingdom"].some((k) => c.includes(k)))
    return "GB";
  if (["eu", "euro"].some((k) => c.includes(k))) return "EU";
  if (["japan", "jp"].some((k) => c.includes(k))) return "JP";
  if (["china", "cn"].some((k) => c.includes(k))) return "CN";
  if (["indonesia", "id"].some((k) => c.includes(k))) return "ID";
  if (["india", "in"].some((k) => c.includes(k))) return "IN";
  // Tambahan Singapore yang sebelumnya hilang
  if (["singapore", "sg"].some((k) => c.includes(k))) return "SG";

  return null;
}

export default function SwipeCardClient({
  newsList,
}: {
  newsList: DerivativeNews[];
}) {
  const { openPosition } = useTrade();
  const [isLoading, setIsLoading] = useState(false);

  const handleLong = async (news: DerivativeNews, amount: number) => {
    const countryCode = getCountryCode(news.country);

    console.log(`[LONG] Country: ${news.country} -> Code: ${countryCode}`);

    if (!countryCode) {
      console.error(`Invalid country code for: ${news.country}`);
      return;
    }

    try {
      setIsLoading(true); // ⬅️ sebelum wallet muncul
      await openPosition("LONG", countryCode, amount.toString());
    } catch (err) {
      console.error("LONG failed:", err);
    } finally {
      setIsLoading(false); // ⬅️ wallet reject / tx done
    }
  };

  const handleShort = async (news: DerivativeNews, amount: number) => {
    const countryCode = getCountryCode(news.country);

    console.log(`[SHORT] Country: ${news.country} -> Code: ${countryCode}`);

    if (!countryCode) {
      console.error(`Invalid country code for: ${news.country}`);
      return;
    }

    try {
      setIsLoading(true);
      await openPosition("SHORT", countryCode, amount.toString());
    } catch (err) {
      console.error("SHORT failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SwipeCard newsList={newsList} onLong={handleLong} onShort={handleShort} />
  );
}
