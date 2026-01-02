import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { COUNTRY_TRADING_ADDRESS } from "@/config/addresses";
import { CountryTradingAbi } from "@/config/abis";
import { parseUnits, stringToHex, keccak256 } from "viem";
import { useState } from "react";

export function useTrade() {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  // Transaction Status
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  // Helper: Buka Posisi (Long/Short)
  const openPosition = async (
    side: "LONG" | "SHORT",
    countryCodeStr: string,
    amountStr: string
  ) => {
    try {
      const hexString = stringToHex(countryCodeStr);
      
      const countryCode = keccak256(hexString);
      
      const collateralAmount = parseUnits(amountStr, 18);

      // Debugging Logs
      console.log(`--- TRADING DEBUG ---`);
      console.log(`Raw Input: ${countryCodeStr}`);
      console.log(`Hex String: ${hexString}`);
      console.log(`Generated Key (Keccak): ${countryCode}`);
      console.log(`Amount: ${amountStr} (${collateralAmount})`);

      const functionName = side === "LONG" ? "openLongPosition" : "openShortPosition";

      const hash = await writeContractAsync({
        address: COUNTRY_TRADING_ADDRESS,
        abi: CountryTradingAbi,
        functionName: functionName,
        args: [countryCode, collateralAmount],
      });

      setTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Trade Failed:", error);
      throw error;
    }
  };

  // Helper: Tutup Posisi
  const closePosition = async (positionId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: COUNTRY_TRADING_ADDRESS,
        abi: CountryTradingAbi,
        functionName: "closePosition",
        args: [positionId],
      });
      setTxHash(hash);
      return hash;
    } catch (error) {
      console.error("Close Failed:", error);
      throw error;
    }
  };

  return {
    openPosition,
    closePosition,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
    reset: () => setTxHash(null),
  };
}