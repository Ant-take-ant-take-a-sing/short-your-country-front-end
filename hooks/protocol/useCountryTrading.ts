// src/hooks/useCountryTrading.ts
"use client";

import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { CountryTradingABI } from "@/abis";

export const useCountryTrading = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const getSignerContract = async () => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }

    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();

    return new ethers.Contract(
      CONTRACTS.COUNTRY_TRADING.address,
      CountryTradingABI,
      signer
    );
  };

  const deposit = async (amount: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.deposit(amount);
    return await tx.wait();
  };

  const withdraw = async (amount: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.withdraw(amount);
    return await tx.wait();
  };

  const openLong = async (countryCode: string, collateral: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.openLongPosition(countryCode, collateral);
    return await tx.wait();
  };

  const openShort = async (countryCode: string, collateral: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.openShortPosition(countryCode, collateral);
    return await tx.wait();
  };

  const closePosition = async (positionId: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.closePosition(positionId);
    return await tx.wait();
  };

  const closePartial = async (positionId: bigint, ratioBps: number) => {
    const contract = await getSignerContract();
    const tx = await contract.closePositionPartial(positionId, ratioBps);
    return await tx.wait();
  };

  const increaseCollateral = async (positionId: bigint, amount: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.increaseCollateral(positionId, amount);
    return await tx.wait();
  };

  const liquidate = async (user: string, positionId: bigint) => {
    const contract = await getSignerContract();
    const tx = await contract.liquidatePosition(user, positionId);
    return await tx.wait();
  };

  return {
    isConnected,
    address,
    deposit,
    withdraw,
    openLong,
    openShort,
    closePosition,
    closePartial,
    increaseCollateral,
    liquidate,
  };
};
