"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  base,
  sepolia,
  baseSepolia,
  mantleSepoliaTestnet,
} from "wagmi/chains";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

// sesuaikan chains sama kebutuhan kamu (misal cuma baseSepolia)
export const wagmiConfig = getDefaultConfig({
  appName: "Nation Index",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [baseSepolia, base, sepolia, mainnet, mantleSepoliaTestnet],
  ssr: true,
  // optiona  l: custom RPC
  // transports: {
  //   [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/XXX"),
  // },
});

type Web3ProviderProps = {
  children: ReactNode;
};

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Simple wallet coin config used by the Portfolio page to compute totals.
// Adjust symbols and amounts to reflect the user's holdings.
export type WalletCoin = {
  symbol: string; // e.g., "IDN"
  name: string;   // display name
  amount: number; // units held in wallet
};

// NOTE: This is a placeholder configuration. Replace with real balances or
// hydrate from your on-chain/account source as needed.
export const walletCoins: WalletCoin[] = [
  { symbol: "IDN", name: "Indonesian Shyntetic Nation Index", amount: 2.4 },
  { symbol: "USA", name: "US Shyntetic Nation Index", amount: 0.18 },
  { symbol: "JPN", name: "JPN Shyntetic Nation Index", amount: 35 },
];
