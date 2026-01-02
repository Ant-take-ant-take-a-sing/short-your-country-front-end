import { parseAbi } from "viem";

export const CountryRegistryAbi = parseAbi([
  "function getAllCountries() external view returns ((bytes32 countryCode, string name, address priceFeed, bool isActive)[])",
  "function getCountryPrice(bytes32 countryCode) external view returns (uint256 price, uint256 timestamp)",
  "function getCountry(bytes32 countryCode) external view returns ((bytes32 countryCode, string name, address priceFeed, bool isActive))",
]);

export const CountryTradingAbi = parseAbi([
  // Write
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function openLongPosition(bytes32 countryCode, uint256 collateralAmount) external returns (uint256)",
  "function openShortPosition(bytes32 countryCode, uint256 collateralAmount) external returns (uint256)",
  "function closePositionPartial(uint256 positionId, uint256 closeRatioBps) external",
  "function closePosition(uint256 positionId) external",
  
  // Read
  "function getCollateralBalance(address user) external view returns (uint256)",
  "function getUserPositions(address user) external view returns (uint256[])",
  "function getPosition(address user, uint256 positionId) external view returns ((bytes32 countryCode, bool isLong, uint256 collateralAmount, uint256 positionSize, uint256 entryPrice, uint256 entryTimestamp, uint256 lastFundingTimestamp))",
  "function getPositionPnL(address user, uint256 positionId) external view returns (int256 pnl, uint256 currentPrice)",
]);

export const Erc20Abi = parseAbi([
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

export const OracleAbi = parseAbi([
  "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
  "function decimals() external view returns (uint8)"
]);