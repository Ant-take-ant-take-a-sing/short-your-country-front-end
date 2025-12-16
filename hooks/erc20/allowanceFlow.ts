export type AllowanceFlowParams = {
  spender: `0x${string}`;
  amount: bigint;
  getAllowance: (spender: `0x${string}`) => Promise<bigint>;
  approve: (spender: `0x${string}`, amount: bigint) => Promise<any>;
};


// Ensure allowance is sufficient before protocol action
export const ensureAllowance = async ({
  spender,
  amount,
  getAllowance,
  approve,
}: AllowanceFlowParams) => {
  const currentAllowance = await getAllowance(spender);

  if (currentAllowance >= amount) {
    return;
  }

  await approve(spender, amount);
};
