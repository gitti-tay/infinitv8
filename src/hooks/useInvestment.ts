"use client";

import { useCallback, useState } from "react";

import { erc20Abi, type Address, maxUint256 } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { INFINITV8InvestmentABI } from "@/lib/contracts/abi";
import { getContracts } from "@/lib/contracts/addresses";
import { wagmiConfig } from "@/lib/wagmi";

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

  // ── Allowance check for current token (lazy, not auto-fetched) ─
  const [allowanceToken, setAllowanceToken] = useState<Address | undefined>();
  const { refetch: refetchAllowance } =
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

  /**
   * Wait for transaction receipt and verify it actually executed on a contract.
   * An EOA call succeeds with status "success" but produces no logs — we detect that.
   */
  async function waitAndVerifyTx(
    hash: `0x${string}`,
    expectLogs: boolean = false,
  ): Promise<void> {
    setActiveTxHash(hash);

    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      hash,
      confirmations: 1,
      timeout: 120_000,
    });

    if (receipt.status !== "success") {
      throw new Error("Transaction failed on-chain");
    }

    // For invest/investETH calls, the contract must emit events.
    // If there are no logs, the tx likely went to an EOA (no contract).
    if (expectLogs && receipt.logs.length === 0) {
      throw new Error(
        "Transaction produced no events. The investment contract may not be deployed on this network. Please switch to Base mainnet.",
      );
    }
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

          // Wait for confirmation and verify contract execution
          await waitAndVerifyTx(hash, true);
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

            // Approval emits an Approval event
            await waitAndVerifyTx(approveHash, true);
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

          // Invest must emit InvestmentMade + TransferSingle events
          await waitAndVerifyTx(investHash, true);
          setState("success");
        }
      } catch (err: unknown) {
        let message = "Transaction failed";
        if (err instanceof Error) {
          // Surface contract revert reasons for common cases
          const msg = err.message;
          if (msg.includes("Project not active")) {
            message = "This project is not yet active on-chain. Please contact support.";
          } else if (msg.includes("Below minimum")) {
            message = "Investment amount is below the project minimum.";
          } else if (msg.includes("Exceeds target")) {
            message = "This investment would exceed the project's fundraising target.";
          } else if (msg.includes("Token not accepted")) {
            message = "This payment token is not accepted. Try USDC or USDT.";
          } else if (msg.includes("ETH not accepted")) {
            message = "ETH payments are not currently accepted.";
          } else if (msg.includes("User rejected") || msg.includes("user rejected")) {
            message = "Transaction was rejected in your wallet.";
          } else {
            message = msg;
          }
        }
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
