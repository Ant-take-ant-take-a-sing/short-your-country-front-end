"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { CONTRACTS, CHAIN_CONFIG } from "@/config/contracts";
import { LiquidityPoolABI } from "@/abis";
import { ensureAllowance } from "@/hooks/erc20/allowanceFlow";
import { useCollateralToken } from "@/hooks/erc20/useCollateralToken";

export const useLiquidityPool = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { approve, getAllowance } = useCollateralToken();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readProvider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);

  const getSigner = async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    const provider = new ethers.BrowserProvider(walletClient);
    return provider.getSigner();
  };

  const getReadContract = () =>
    new ethers.Contract(
      CONTRACTS.LIQUIDITY_POOL.address,
      LiquidityPoolABI,
      readProvider
    );

  const getWriteContract = async () =>
    new ethers.Contract(
      CONTRACTS.LIQUIDITY_POOL.address,
      LiquidityPoolABI,
      await getSigner()
    );

  // Read
  const getPoolMetrics = async () => {
    const contract = getReadContract();
    const [poolBalance, longOI, shortOI] = await contract.getPoolMetrics();

    return {
      poolBalance: Number(ethers.formatEther(poolBalance)),
      totalLongOpenInterest: Number(ethers.formatEther(longOI)),
      totalShortOpenInterest: Number(ethers.formatEther(shortOI)),
    };
  };

  const isPaused = async (): Promise<boolean> => {
    const contract = getReadContract();
    return contract.paused();
  };

  // Write
  const deposit = async (amount: bigint) => {
    if (!address) throw new Error("Wallet not connected");

    await ensureAllowance({
      spender: CONTRACTS.LIQUIDITY_POOL.address,
      amount,
      getAllowance,
      approve,
    });

    const contract = await getWriteContract();
    const tx = await contract.deposit(amount);
    await tx.wait();

    return tx.hash;
  };

  const withdraw = async (amount: bigint) => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getWriteContract();
      const tx = await contract.withdraw(amount);
      await tx.wait();

      return tx.hash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdraw failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    loading,
    error,

    // read
    getPoolMetrics,
    isPaused,

    // write
    deposit,
    withdraw, // owner only
  };
};
