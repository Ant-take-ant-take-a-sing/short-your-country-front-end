import { ethers } from 'ethers';

export const CONTRACTS = {
  COUNTRY_REGISTRY: {
    address: process.env.COUNTRY_REGISTRY_ADDRESS as `0x{string}`,
  },
  COUNTRY_TRADING: {
    address: process.env.COUNTRY_TRADING_ADDRESS as `0x{string}`,
  },
  COLLATERAL_TOKEN: {
    address: process.env.COLLATERAL_TOKEN_ADDRESS as `0x{string}`,
  },
  LIQUIDITY_POOL: {
    address: process.env.LIQUIDITY_POOL_ADDRESS as `0x{string}`,
  },
} as const;

export const CHAIN_CONFIG = {
  chainId: parseInt(process.env.CHAIN_ID!),
  rpcUrl: process.env.RPC_URL as string,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    name: 'MNT',
    symbol: 'MNT',
    decimals: 18,
  },
  blockExplorer: 'https://sepolia.mantlescan.xyz',
};

// Country mapping
export const COUNTRIES = [
  { 
    id: 'US', 
    name: 'United States Index', 
    symbol: 'USA',
    priceFeed: process.env.US_PRICE_FEED 
  },
  { 
    id: 'ID', 
    name: 'Indonesia Index', 
    symbol: 'IDN',
    priceFeed: process.env.ID_PRICE_FEED 
  },
  { 
    id: 'SG', 
    name: 'Singapore Index', 
    symbol: 'SGP',
    priceFeed: process.env.SG_PRICE_FEED 
  },
] as const;

// Helper: convert country ID to bytes32
export const getCountryCode = (countryId: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(countryId));
};