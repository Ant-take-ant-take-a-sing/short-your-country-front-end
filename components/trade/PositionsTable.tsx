"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import {
  COUNTRY_TRADING_ADDRESS,
  COUNTRY_REGISTRY_ADDRESS,
} from "@/config/addresses";
import { CountryTradingAbi, CountryRegistryAbi } from "@/config/abis"; // Pastikan import CountryRegistryAbi
import { Loader2 } from "lucide-react";

export function PositionsTable() {
  const { address } = useAccount();

  interface QueryOptions {
    pollInterval: number;
    enabled: boolean;
  }

  // Polling position IDs
  const { data: positionIds, isLoading } = useReadContract({
    address: COUNTRY_TRADING_ADDRESS,
    abi: CountryTradingAbi,
    functionName: "getUserPositions",
    args: [address as `0x${string}`],
    query: { pollInterval: 3000, enabled: !!address } as QueryOptions,
  });

  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-[#0A0A0A] p-6">
      <h3 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
        Open Positions
        {positionIds && positionIds.length > 0 && (
          <span className="bg-neutral-800 text-xs px-2 py-0.5 rounded-full text-neutral-400">
            {positionIds.length}
          </span>
        )}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-xs tracking-wider">
              <th className="pb-3 pl-2">Market</th>
              <th className="pb-3">Side</th>
              <th className="pb-3">Size</th>
              <th className="pb-3">Collateral</th>
              <th className="pb-3">Entry Price</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500">
                  Loading positions...
                </td>
              </tr>
            ) : positionIds && positionIds.length > 0 ? (
              positionIds.map((id) => (
                <PositionRow key={id.toString()} positionId={id} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">📭</span>
                  <span>No active positions found.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT ROW ---
function PositionRow({ positionId }: { positionId: bigint }) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Detail Posisi dari Trading Contract
  const { data: pos } = useReadContract({
    address: COUNTRY_TRADING_ADDRESS,
    abi: CountryTradingAbi,
    functionName: "getPosition",
    args: [address as `0x${string}`, positionId],
  });

  // Nama Negara dari Registry Contract menggunakan Hash (countryCode)
  const { data: countryData } = useReadContract({
    address: COUNTRY_REGISTRY_ADDRESS,
    abi: CountryRegistryAbi,
    functionName: "getCountry",
    args: [pos?.countryCode || "0x0"],
    query: { enabled: !!pos },
  });
  console.log("Country Data:", countryData);

  const handleClose = async () => {
    try {
      await writeContractAsync({
        address: COUNTRY_TRADING_ADDRESS,
        abi: CountryTradingAbi,
        functionName: "closePosition",
        args: [positionId],
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!pos || pos.entryPrice === 0n) return null;


  const countryName = countryData ? countryData.name : "Loading...";

  return (
    <tr className="group hover:bg-neutral-900/50 transition-colors">
      <td className="py-4 pl-2 font-bold text-white">{countryName}</td>
      <td
        className={`py-4 font-bold ${
          pos.isLong ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {pos.isLong ? "LONG" : "SHORT"}
      </td>
      <td className="py-4 font-mono text-neutral-300">
        {formatUnits(pos.positionSize, 18)}
      </td>
      <td className="py-4 font-mono text-neutral-300">
        ${formatUnits(pos.collateralAmount, 18)}
      </td>
      <td className="py-4 font-mono text-neutral-300">
        ${formatUnits(pos.entryPrice, 8)}
      </td>
      <td className="py-4 text-right pr-2">
        <button
          onClick={handleClose}
          disabled={isPending}
          className="px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs font-bold text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
        >
          {isPending && <Loader2 className="w-3 h-3 animate-spin" />} Close
        </button>
      </td>
    </tr>
  );
}
