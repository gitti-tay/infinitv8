"use client";

import { useAccount, useReadContracts } from "wagmi";

import { INFINITV8InvestmentABI } from "@/lib/contracts/abi";
import { getContracts } from "@/lib/contracts/addresses";

interface TokenBalance {
  projectId: bigint;
  balance: bigint;
}

interface UseInvestmentTokensReturn {
  /** Array of { projectId, balance } for each queried project. */
  balances: TokenBalance[];
  /** True while the batch read is in flight. */
  isLoading: boolean;
  /** Error from the multicall, if any. */
  error: Error | null;
  /** Refetch all balances. */
  refetch: () => void;
}

/**
 * Reads ERC-1155 `balanceOf` for a connected wallet across multiple project IDs
 * in a single multicall via wagmi's `useReadContracts`.
 *
 * @param projectIds - Array of on-chain project IDs to query.
 */
export function useInvestmentTokens(
  projectIds: bigint[],
): UseInvestmentTokensReturn {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId ?? 8453);

  const contractCalls = projectIds.map((projectId) => ({
    address: contracts.investment,
    abi: INFINITV8InvestmentABI,
    functionName: "balanceOf" as const,
    args: [address!, projectId] as const,
  }));

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: contractCalls,
    query: {
      enabled: !!address && projectIds.length > 0,
    },
  });

  const balances: TokenBalance[] = projectIds.map((projectId, index) => {
    const result = data?.[index];
    return {
      projectId,
      balance:
        result?.status === "success" ? (result.result as bigint) : BigInt(0),
    };
  });

  return {
    balances,
    isLoading,
    error: error ?? null,
    refetch,
  };
}
