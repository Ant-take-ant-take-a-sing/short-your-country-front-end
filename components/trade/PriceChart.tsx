"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
} from "lightweight-charts";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { OracleAbi } from "@/config/abis";
import { COUNTRY_ADDRESSES } from "@/config/addresses";

// --- HELPER: GENERATE FAKE HISTORY ---
const generateFakeHistory = (
  currentPrice: number,
  count: number = 100
): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let time = Math.floor(Date.now() / 1000) - count * 60;

  let price = currentPrice;

  const tempArray = [];

  for (let i = 0; i < count; i++) {
    const move = (Math.random() - 0.5) * (currentPrice * 0.002);
    const close = price;
    const open = price - move;
    const high = Math.max(open, close) + Math.random() * currentPrice * 0.001;
    const low = Math.min(open, close) - Math.random() * currentPrice * 0.001;

    tempArray.push({
      time: time as any,
      open,
      high,
      low,
      close,
    });

    price = open;
    time += 60;
  }

  const candles: CandlestickData[] = [];
  let basePrice = currentPrice;
  let baseTime = Math.floor(Date.now() / 1000) - count * 60;

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.0005;
    const change = (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      time: baseTime as any,
      open,
      high,
      low,
      close,
    });

    basePrice = close;
    baseTime += 60;
  }

  const lastFakeClose = candles[candles.length - 1].close;
  const diff = currentPrice - lastFakeClose;

  return candles.map((c) => ({
    ...c,
    open: c.open + diff,
    high: c.high + diff,
    low: c.low + diff,
    close: c.close + diff,
  }));
};

export function PriceChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const lastCandleRef = useRef<CandlestickData | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const oracleAddress = COUNTRY_ADDRESSES[symbol];

  interface QueryOptions {
    pollInterval: number;
    enabled: boolean;
  }

  const { data: oracleData } = useReadContract({
    address: oracleAddress,
    abi: OracleAbi,
    functionName: "latestRoundData",
    query: { pollInterval: 2000, enabled: !!oracleAddress } as QueryOptions,
  });

  // --- SETUP CHART ---
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Inisialisasi Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#525252",
      },
      grid: {
        vertLines: { color: "#171717" },
        horzLines: { color: "#171717" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#262626",
        rightOffset: 2,
      },
      rightPriceScale: {
        borderColor: "#262626",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderUpColor: "#10b981",
      borderDownColor: "#f43f5e",
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].target) return;

      const newRect = entries[0].contentRect;
      chart.applyOptions({
        width: newRect.width,
        height: newRect.height,
      });
      chart.timeScale().fitContent();
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // --- RESET STATE SAAT GANTI NEGARA ---
  useEffect(() => {
    setIsInitialized(false);
    lastCandleRef.current = null;
    if (seriesRef.current) seriesRef.current.setData([]);
  }, [symbol]);

  // --- MAIN LOGIC ---
  useEffect(() => {
    if (!oracleData || !seriesRef.current) return;

    // Parsing Data
    const priceRaw = (oracleData as any)[1];
    const rawPrice = parseFloat(formatUnits(priceRaw, 8));

    setCurrentPrice(rawPrice);

    // INIT: Generate Fake History Sekali
    if (!isInitialized) {
      // Buat 60 candle palsu ke belakang yang berujung di rawPrice
      const fakeHistory = generateFakeHistory(rawPrice, 60);
      seriesRef.current.setData(fakeHistory);

      // Set last candle dari fake history agar nyambung ke live
      lastCandleRef.current = fakeHistory[fakeHistory.length - 1];

      chartRef.current?.timeScale().fitContent();
      setIsInitialized(true);
      return;
    }

    // LIVE UPDATE LOGIC
    const now = Math.floor(Date.now() / 1000);
    const timeBucket = (Math.floor(now / 60) * 60) as any;
    const prevCandle = lastCandleRef.current;

    if (!prevCandle) return;

    if (Number(prevCandle.time) === timeBucket) {
      // Update candle berjalan
      const updated = {
        ...prevCandle,
        high: Math.max(prevCandle.high, rawPrice),
        low: Math.min(prevCandle.low, rawPrice),
        close: rawPrice,
      };
      seriesRef.current.update(updated);
      lastCandleRef.current = updated;
    } else {
      // Buat candle baru
      const next = {
        time: timeBucket,
        open: prevCandle.close,
        high: Math.max(prevCandle.close, rawPrice),
        low: Math.min(prevCandle.close, rawPrice),
        close: rawPrice,
      };
      seriesRef.current.update(next);
      lastCandleRef.current = next;
    }
  }, [oracleData, isInitialized]);

  const isUp = lastCandleRef.current
    ? lastCandleRef.current.close >= lastCandleRef.current.open
    : true;

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-neutral-800 bg-[#0A0A0A] p-5 shadow-2xl overflow-hidden">
      <div className="mb-4 flex items-end justify-between px-2 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`text-4xl font-bold font-mono tracking-tight ${
                isUp ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : "Loading..."}
            </span>
            <span className="text-sm font-bold text-white bg-neutral-800 px-2 py-1 rounded-md">
              {symbol}-USDT
            </span>
          </div>
        </div>
      </div>
      <div className="relative w-full flex-1 min-h-0" ref={chartContainerRef} />
    </div>
  );
}
