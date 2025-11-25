"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  CandlestickSeries,
  type Time,
  type AreaData,
  type CandlestickData,
} from "lightweight-charts";

export type Timeframe = "1m" | "5m" | "1h" | "1d";
export type ChartType = "area" | "candlestick";

type NationMarketChartProps = {
  symbol: string;       // "IDN", "USA", dll
  basePrice: number;    // harga dasar per market
  timeframe: Timeframe; // 1m / 5m / 1h / 1d
  chartType: ChartType; // area / candlestick
};

// 1 menit sebagai base interval mock
const BASE_INTERVAL_SEC = 60;

type BasePoint = { time: Time; value: number };
type AreaPoint = AreaData<Time>;
type CandlePoint = CandlestickData<Time>;

function getIntervalSeconds(timeframe: Timeframe): number {
  switch (timeframe) {
    case "1m":
      return 60;
    case "5m":
      return 60 * 5;
    case "1h":
      return 60 * 60;
    case "1d":
      return 60 * 60 * 24;
    default:
      return 60;
  }
}

// 🔹 Generate base series (1m interval) – INI YANG DIPAKAI SEMUA TIMEFRAME
function generateBaseSeries(basePrice: number, points = 200): BasePoint[] {
  const now = Math.floor(Date.now() / 1000);
  const firstTime = now - points * BASE_INTERVAL_SEC;

  const data: BasePoint[] = [];
  let lastValue = basePrice;

  for (let i = 0; i < points; i++) {
    const tNum = firstTime + i * BASE_INTERVAL_SEC;

    const drift = (Math.random() - 0.5) * 2; // -1 s/d +1
    const noise = Math.sin(i / 5) * 2;

    lastValue = lastValue + drift + noise * 0.1;

    data.push({
      time: tNum as Time,
      value: lastValue,
    });
  }

  return data;
}

// 🔹 Tambahkan 1 titik baru ke base series (biar chart “bergerak”)
function extendBaseSeries(base: BasePoint[], maxPoints = 200): BasePoint[] {
  if (base.length === 0) return base;

  const last = base[base.length - 1];
  const lastTimeNum = last.time as number;
  const nextTime = (lastTimeNum + BASE_INTERVAL_SEC) as Time;
  const drift = (Math.random() - 0.5) * 2;
  const nextValue = last.value + drift;

  const next: BasePoint = { time: nextTime, value: nextValue };
  const updated = [...base, next];

  if (updated.length > maxPoints) {
    updated.shift();
  }

  return updated;
}

// 🔹 Dari base series → Area data sesuai timeframe
function buildAreaFromBase(
  base: BasePoint[],
  timeframe: Timeframe
): AreaPoint[] {
  const intervalSec = getIntervalSeconds(timeframe);
  const groupSize = Math.max(1, Math.round(intervalSec / BASE_INTERVAL_SEC));

  const slice = base.slice(-200); // batasi biar nggak terlalu banyak titik
  const result: AreaPoint[] = [];

  for (let i = 0; i < slice.length; i += groupSize) {
    const chunk = slice.slice(i, i + groupSize);
    if (chunk.length === 0) continue;

    const last = chunk[chunk.length - 1];
    result.push({
      time: last.time,
      value: last.value,
    });
  }

  return result;
}

// 🔹 Dari base series → Candle data sesuai timeframe
function buildCandleFromBase(
  base: BasePoint[],
  timeframe: Timeframe
): CandlePoint[] {
  const intervalSec = getIntervalSeconds(timeframe);
  const groupSize = Math.max(1, Math.round(intervalSec / BASE_INTERVAL_SEC));

  const slice = base.slice(-200);
  const result: CandlePoint[] = [];

  for (let i = 0; i < slice.length; i += groupSize) {
    const chunk = slice.slice(i, i + groupSize);
    if (chunk.length === 0) continue;

    const open = chunk[0].value;
    const close = chunk[chunk.length - 1].value;
    const values = chunk.map((p) => p.value);

    const high = Math.max(...values);
    const low = Math.min(...values);

    result.push({
      time: chunk[chunk.length - 1].time,
      open,
      high,
      low,
      close,
    });
  }

  return result;
}

export function NationMarketChart({
  symbol,
  basePrice,
  timeframe,
  chartType,
}: NationMarketChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Base series disimpan di ref supaya TETAP sama untuk semua timeframe
  const baseSeriesRef = useRef<BasePoint[] | null>(null);
  const baseSymbolRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // kalau symbol berubah → regenerate base series
    if (!baseSeriesRef.current || baseSymbolRef.current !== symbol) {
      baseSeriesRef.current = generateBaseSeries(basePrice);
      baseSymbolRef.current = symbol;
    }

    let baseSeries = baseSeriesRef.current!;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#020617" }, // slate-950
        textColor: "#e2e8f0", // slate-200
      },
      grid: {
        vertLines: { color: "#020617" },
        horzLines: { color: "#020617" },
      },
      width: containerRef.current.clientWidth,
      height: 360,
      timeScale: {
        borderColor: "#1e293b",
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
      crosshair: {
        mode: 0,
      },
    });

    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (chartType === "area") {
      const areaData = buildAreaFromBase(baseSeries, timeframe);
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#22c55e",
        topColor: "rgba(34, 197, 94, 0.35)",
        bottomColor: "rgba(15, 23, 42, 0.9)",
      });

      series.setData(areaData);
      chart.timeScale().fitContent();

      // update streaming: update base → rebuild area dari base yang sama
      intervalId = setInterval(() => {
        baseSeries = extendBaseSeries(baseSeries);
        baseSeriesRef.current = baseSeries;

        const updated = buildAreaFromBase(baseSeries, timeframe);
        series.setData(updated);
      }, 1000);
    } else {
      const candleData = buildCandleFromBase(baseSeries, timeframe);
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });

      series.setData(candleData);
      chart.timeScale().fitContent();

      intervalId = setInterval(() => {
        baseSeries = extendBaseSeries(baseSeries);
        baseSeriesRef.current = baseSeries;

        const updated = buildCandleFromBase(baseSeries, timeframe);
        series.setData(updated);
      }, 1000);
    }

    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (intervalId) clearInterval(intervalId);
      chart.remove();
    };
  }, [symbol, basePrice, timeframe, chartType]);

  return (
    <div className="h-[360px] w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
