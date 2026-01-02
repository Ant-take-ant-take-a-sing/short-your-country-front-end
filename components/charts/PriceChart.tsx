'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickData,
  CandlestickSeries,
  LineSeries,
  LineData,
} from 'lightweight-charts';

import { mockLogs } from '@/mocks/priceLogs';
import { toSeries } from '@/lib/priceSeries';
import { toCandles } from '@/lib/toCandle';

export default function PriceChart() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#020617' },
        textColor: '#e5e7eb',
      },
      grid: {
        vertLines: { color: '#0f172a' },
        horzLines: { color: '#0f172a' },
      },
      width: ref.current.clientWidth,
      height: 320,
    });

    const mockSeries = [
    { time: '2019-04-11', value: 80.01 },
    { time: '2019-04-12', value: 96.63 },
    { time: '2019-04-13', value: 76.64 },
    { time: '2019-04-14', value: 81.89 },
    { time: '2019-04-15', value: 74.43 },
    { time: '2019-04-16', value: 80.01 },
    { time: '2019-04-17', value: 96.63 },
    { time: '2019-04-18', value: 76.64 },
    { time: '2019-04-19', value: 81.89 },
    { time: '2019-04-20', value: 74.43 },
]

    const lineSeries = chart.addSeries(LineSeries,{
      color: '#22c55e',
      lineWidth: 2,  
    })
    

    // const candleSeries = chart.addSeries(CandlestickSeries,{
    //     upColor: '#22c55e',
    //   downColor: '#ef4444',
    //   borderVisible: false,
    //   wickUpColor: '#22c55e',
    //   wickDownColor: '#ef4444',
    // })

    // MOCK FLOW
    const series = toSeries(mockLogs);
    const candles = toCandles(series, 60);

    lineSeries.setData(series as LineData[])

    // candleSeries.setData(
    //   candles as CandlestickData[]
    // );

    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full rounded-xl border border-slate-800"
    />
  );
}
