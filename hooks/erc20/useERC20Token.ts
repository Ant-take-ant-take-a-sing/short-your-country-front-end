"use client";

import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { ERC20ABI } from "@/abis";
import { CHAIN_CONFIG } from "@/config/contracts";

export const useERC20Token = (tokenAddress: string) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const readProvider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);

  const getReadContract = () =>
    new ethers.Contract(tokenAddress, ERC20ABI, readProvider);

  const getWriteContract = async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    return new ethers.Contract(tokenAddress, ERC20ABI, signer);
  };

  // Read
  const getBalance = async (): Promise<bigint> => {
    if (!address) return 0n;
    const contract = getReadContract();
    return contract.balanceOf(address);
  };

  const getAllowance = async (spender: string): Promise<bigint> => {
    if (!address) return 0n;
    const contract = getReadContract();
    return contract.allowance(address, spender);
  };

  const getMetadata = async () => {
    const contract = getReadContract();
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: Number(decimals),
    };
  };

  // Write
  const approve = async (spender: string, amount: bigint) => {
    const contract = await getWriteContract();
    const tx = await contract.approve(spender, amount);
    await tx.wait();
    return tx.hash;
  };

  return {
    isConnected,
    address,

    getBalance,
    getAllowance,
    approve,
    getMetadata,
  };
};
