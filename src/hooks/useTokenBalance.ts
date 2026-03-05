"use client";

import { erc20Abi } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";

import { getContracts } from "@/lib/contracts/addresses";

/**
 * Reads USDC, USDT, and native ETH balances for the connected wallet on the
 * active chain.  Defaults to Base mainnet addresses when no chain is detected.
 */
export function useTokenBalance() {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId ?? 8453);

  // ── Native ETH balance ─────────────────────────────────────────
  const {
    data: ethData,
    isLoading: ethLoading,
    refetch: refetchEth,
  } = useBalance({
    address,
  });

  // ── USDC balance (6 decimals) ──────────────────────────────────
  const {
    data: usdcRaw,
    isLoading: usdcLoading,
    refetch: refetchUsdc,
  } = useReadContract({
    address: contracts.usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // ── USDT balance (6 decimals) ──────────────────────────────────
  const {
    data: usdtRaw,
    isLoading: usdtLoading,
    refetch: refetchUsdt,
  } = useReadContract({
    address: contracts.usdt,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && contracts.usdt !== "0x" },
  });

  const refetchAll = () => {
    refetchEth();
    refetchUsdc();
    refetchUsdt();
  };

  return {
    /** Native ETH balance in wei (bigint | undefined) */
    ethBalance: ethData?.value,
    /** ETH balance formatted with symbol */
    ethFormatted: ethData?.formatted,
    /** USDC raw balance in 6-decimal units (bigint | undefined) */
    usdcBalance: usdcRaw as bigint | undefined,
    /** USDT raw balance in 6-decimal units (bigint | undefined) */
    usdtBalance: usdtRaw as bigint | undefined,
    /** True while any balance query is loading */
    isLoading: ethLoading || usdcLoading || usdtLoading,
    /** Refetch all balances */
    refetch: refetchAll,
  };
}
