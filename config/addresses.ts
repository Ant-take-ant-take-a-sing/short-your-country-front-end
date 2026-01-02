export const COLLATERAL_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_COLLATERAL_TOKEN_ADDRESS as `0x${string}`;
export const COUNTRY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_COUNTRY_REGISTRY_ADDRESS as `0x${string}`;
export const COUNTRY_TRADING_ADDRESS = process.env.NEXT_PUBLIC_COUNTRY_TRADING_ADDRESS as `0x${string}`;
export const COUNTRY_ADDRESSES: Record<string, `0x${string}`> = {
  ID: process.env.NEXT_PUBLIC_ID_PRICE_FEED as `0x${string}`,
  SG: process.env.NEXT_PUBLIC_SG_PRICE_FEED as `0x${string}`,
  US: process.env.NEXT_PUBLIC_US_PRICE_FEED as `0x${string}`,
  // JP: "0x...",
};

if (!COUNTRY_TRADING_ADDRESS) console.warn("⚠️ COUNTRY_TRADING_ADDRESS is missing!");