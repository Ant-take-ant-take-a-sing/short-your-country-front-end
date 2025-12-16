import { useERC20Token } from "./useERC20Token";
import { CONTRACTS } from "@/config/contracts";

export const useCollateralToken = () => {
  return useERC20Token(CONTRACTS.COLLATERAL_TOKEN.address);
};
