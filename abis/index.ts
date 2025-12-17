// Helper to re-export ABIs with proper typing
import CountryRegistryJson from "./CountryRegistry.json";
import CountryTradingJson from "./CountryTrading.json";
import LiquidityPoolJson from "./LiquidityPool.json";
import ERC20 from "./ERC20.json";
import type { InterfaceAbi } from "ethers";

export const CountryRegistryABI = CountryRegistryJson.abi as InterfaceAbi;

export const CountryTradingABI = CountryTradingJson.abi as InterfaceAbi;

export const LiquidityPoolABI = LiquidityPoolJson.abi as InterfaceAbi;

export const ERC20ABI = ERC20.abi as InterfaceAbi;
