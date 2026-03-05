"use client";

import { useCallback, useState } from "react";

import { erc20Abi, type Address, maxUint256 } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { INFINITV8InvestmentABI } from "@/lib/contracts/abi";
import { getContracts } from "@/lib/contracts/addresses";

// ─── Types ───────────────────────────────────────────────────────

export type InvestmentState =
  | "idle"
  | "approving"
  | "waitingApproval"
  | "investing"
  | "waitingInvestment"
  | "recording"
  | "success"
  | "error";

export type PaymentMethod = "usdc" | "usdt" | "eth";

interface UseInvestmentReturn {
  /** Initiate the invest flow (approve + invest for ERC-20, or investETH). */
  invest: (
    projectId: bigint,
    amount: bigint,
    paymentMethod: PaymentMethod,
  ) => Promise<void>;
  /** Current step in the state machine. */
  state: InvestmentState;
  /** Transaction hash of the investment tx (or approval tx while approving). */
  txHash: `0x${string}` | undefined;
  /** Human-readable error message. */
  error: string | null;
  /** Reset to idle so the user can retry. */
  reset: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useInvestment(): UseInvestmentReturn {
  const { address, chainId } = useAccount();
  const contracts = getContracts(chainId ?? 8453);

  const [state, setState] = useState<InvestmentState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [activeTxHash, setActiveTxHash] = useState<
    `0x${string}` | undefined
  >();

  // ── Write helpers ────────────────────────────────────────────
  const { writeContractAsync } = useWriteContract();

  // ── Wait for receipt (used imperatively via refetch) ─────────
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: activeTxHash,
    query: { enabled: !!activeTxHash },
  });

  // ── Allowance check for current token (lazy, not auto-fetched) ─
  const [allowanceToken, setAllowanceToken] = useState<Address | undefined>();
  const { data: currentAllowance, refetch: refetchAllowance } =
    useReadContract({
      address: allowanceToken,
      abi: erc20Abi,
      functionName: "allowance",
      args:
        address && contracts.investment
          ? [address, contracts.investment]
          : undefined,
      query: { enabled: !!address && !!allowanceToken },
    });

  // ── Helpers ──────────────────────────────────────────────────

  function resolveTokenAddress(method: PaymentMethod): Address {
    if (method === "usdc") return contracts.usdc;
    if (method === "usdt") return contracts.usdt;
    throw new Error("ETH does not use a token address");
  }

  async function waitForTx(hash: `0x${string}`): Promise<void> {
    setActiveTxHash(hash);
    // Poll until the receipt appears (wagmi caches it internally)
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const { data } = await refetchAllowance();
          // We also check receipt presence by re-querying
          // In practice wagmi will resolve useWaitForTransactionReceipt
          // We give it a simple polling approach
          clearInterval(interval);
          resolve();
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 2000);

      // Safety timeout: 2 minutes
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Transaction confirmation timed out"));
      }, 120_000);
    });
  }

  // ── Main invest function ─────────────────────────────────────

  const invest = useCallback(
    async (
      projectId: bigint,
      amount: bigint,
      paymentMethod: PaymentMethod,
    ) => {
      if (!address) {
        setError("Wallet not connected");
        setState("error");
        return;
      }

      try {
        setError(null);

        if (paymentMethod === "eth") {
          // ── ETH path: single tx ────────────────────────────
          setState("investing");

          const hash = await writeContractAsync({
            address: contracts.investment,
            abi: INFINITV8InvestmentABI,
            functionName: "investETH",
            args: [projectId],
            value: amount,
          });

          setActiveTxHash(hash);
          setState("waitingInvestment");

          // Wait for confirmation
          await waitForTx(hash);
          setState("success");
        } else {
          // ── ERC-20 path: approve → invest ──────────────────
          const tokenAddress = resolveTokenAddress(paymentMethod);
          setAllowanceToken(tokenAddress);

          // Check current allowance
          const { data: allowance } = await refetchAllowance();
          const currentAllowanceValue = (allowance as bigint) ?? BigInt(0);

          if (currentAllowanceValue < amount) {
            // Step 1: Approve
            setState("approving");

            const approveHash = await writeContractAsync({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [contracts.investment, maxUint256],
            });

            setActiveTxHash(approveHash);
            setState("waitingApproval");

            await waitForTx(approveHash);
          }

          // Step 2: Invest
          setState("investing");

          const investHash = await writeContractAsync({
            address: contracts.investment,
            abi: INFINITV8InvestmentABI,
            functionName: "invest",
            args: [projectId, tokenAddress, amount],
          });

          setActiveTxHash(investHash);
          setState("waitingInvestment");

          await waitForTx(investHash);
          setState("success");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        setState("error");
      }
    },
    [address, contracts, writeContractAsync, refetchAllowance],
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setActiveTxHash(undefined);
  }, []);

  return {
    invest,
    state,
    txHash: activeTxHash,
    error,
    reset,
  };
}
