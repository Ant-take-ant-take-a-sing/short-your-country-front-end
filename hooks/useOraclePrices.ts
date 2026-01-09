'use client';

import { useEffect, useState } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { COUNTRY_ADDRESSES } from '@/config/addresses';
import { PRICE_EVENT } from '@/config/abis';


export type PricePoint = {
  time: number;
  value: number;
};

export function useOraclePrices(countryCode:string) {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: 5003 });

  const [data, setData] = useState<PricePoint[]>([]);

  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!publicClient || !countryCode) return;

    const address = COUNTRY_ADDRESSES[countryCode as keyof typeof COUNTRY_ADDRESSES];

    if (!address) {
      console.warn(`No oracle address for ${countryCode}`);
      return;
    }

    const DAYS = 5n;
    const BLOCKS_PER_DAY = 43_200n;
    const BLOCKS_PER_MINUTE = 30n;
    const BLOCKS_PER_HOUR = 30n*60n;

    const BLOCKS_PER_CHUNK = 9_000n; // safe < 10,000
    const BLOCKS_24H = 43_200n;      // ~24h on Mantle

    async function fetchLast24HoursLogs(publicClient) {
        const latest = await publicClient.getBlockNumber();

        const fromTarget = latest - BLOCKS_24H;
        let from = fromTarget < 0n ? 0n : fromTarget;

        const allLogs = [];

        while (from < latest) {
            const to =
            from + BLOCKS_PER_CHUNK > latest
                ? latest
                : from + BLOCKS_PER_CHUNK;

            const logs = await publicClient.getLogs({
            address: address,
            event: PRICE_EVENT,
            fromBlock: from,
            toBlock: to,
            });

            allLogs.push(...logs);
            from = to + 1n; // IMPORTANT: avoid overlap
        }

        return allLogs;
    }

    async function fetch() {
        const logs = await fetchLast24HoursLogs(publicClient);

      setData(
        logs.map(log => ({
          time: Number(log.args.updatedAt),
          value: Number(log.args.price) / 1e8,
        }))
      );

      setLoading(false);
    }

    fetch();
    
  }, [publicClient, chainId]);

  return { data, loading };
}
