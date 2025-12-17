"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CONTRACTS,
  COUNTRIES,
  getCountryCode,
  CHAIN_CONFIG,
} from "@/config/contracts";
import { CountryRegistryABI } from '@/abis';

export interface MarketData {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  change24h: number;
  volume24h: number;
  isActive: boolean;
  countryCode: string;
}

export const useCountryRegistry = () => {
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create provider (fallback to RPC if wallet not connected)
  const getProvider = () => {
    return new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
  };

  // Get contract instance
  const getContract = () => {
    const prov = getProvider();
    return new ethers.Contract(
      CONTRACTS.COUNTRY_REGISTRY.address,
      CountryRegistryABI,
      prov
    );
  };

  // Fetch all markets data
  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);

      const contract = getContract();
      const marketsData: MarketData[] = [];

      for (const country of COUNTRIES) {
        try {
          const countryCode = getCountryCode(country.id);

          // Get price from Chainlink via CountryRegistry
          const priceRaw = await contract.getCountryPrice(countryCode);
          const price = parseFloat(ethers.formatUnits(priceRaw, 8)); // Chainlink = 8 decimals

          // Check if country is active
          const isActive = await contract.isCountryActive(countryCode);

          // TODO: Get 24h change & volume from backend/indexer
          // For now, use mock data
          const change24h = (Math.random() - 0.5) * 5; // Random -2.5% to +2.5%
          const volume24h = Math.floor(Math.random() * 5000000);

          marketsData.push({
            id: country.id,
            name: country.name,
            symbol: country.symbol,
            basePrice: price,
            change24h,
            volume24h,
            isActive,
            countryCode,
          });
        } catch (err) {
          console.error(`Error fetching data for ${country.id}:`, err);
        }
      }

      setMarkets(marketsData);
    } catch (err) {
      console.error("Error fetching markets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch markets");
    } finally {
      setLoading(false);
    }
  };

  // Get single country price
  const getCountryPrice = async (countryId: string): Promise<number> => {
    try {
      const contract = getContract();
      const countryCode = getCountryCode(countryId);
      const priceRaw = await contract.getCountryPrice(countryCode);
      return parseFloat(ethers.formatUnits(priceRaw, 8));
    } catch (err) {
      console.error(`Error getting price for ${countryId}:`, err);
      throw err;
    }
  };

  // Auto-fetch on mount and every 30 seconds
  useEffect(() => {
    fetchMarkets();

    const interval = setInterval(() => {
      fetchMarkets();
    }, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [provider]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
    getCountryPrice,
  };
};
