"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAccount, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits, parseEther } from "viem";

import { Header } from "@/components/ui/header";
import { useInvestment, type PaymentMethod } from "@/hooks/useInvestment";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { BASE_CHAIN_ID, getBasescanUrl } from "@/lib/contracts/addresses";

interface Project {
  id: string;
  name: string;
  ticker: string;
  apy: number;
  term: number;
  riskLevel: string;
  minInvestment: number;
  payout: string;
  category: string;
  location: string;
  status: string;
  chainProjectId?: number;
}

const PAYMENT_OPTIONS: { method: PaymentMethod; label: string; symbol: string; decimals: number; color: string }[] = [
  { method: "usdc", label: "USDC", symbol: "U", decimals: 6, color: "from-[#2775ca] to-[#1a5fb4]" },
  { method: "usdt", label: "USDT", symbol: "T", decimals: 6, color: "from-[#26a17b] to-[#1a9b72]" },
  { method: "eth",  label: "ETH",  symbol: "E", decimals: 18, color: "from-[#627eea] to-[#4a6cf7]" },
];

const STATE_LABELS: Record<string, { label: string; icon: string }> = {
  approving:          { label: "Approve token spending...",  icon: "key" },
  waitingApproval:    { label: "Confirming approval...",     icon: "hourglass_top" },
  investing:          { label: "Confirm investment in wallet...", icon: "account_balance_wallet" },
  waitingInvestment:  { label: "Confirming on-chain...",     icon: "hourglass_top" },
  recording:          { label: "Recording investment...",    icon: "cloud_upload" },
  success:            { label: "Investment successful!",     icon: "check_circle" },
};

export default function InvestReviewPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { usdcBalance, usdtBalance, ethBalance, isLoading: balancesLoading } = useTokenBalance();
  const { invest, state: txState, txHash, error: txError, reset: resetTx } = useInvestment();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("usdc");
  const [error, setError] = useState("");
  const [kycStatus, setKycStatus] = useState<string>("NONE");
  const [cumulativeInvested, setCumulativeInvested] = useState(0);

  const amount = parseFloat(searchParams.get("amount") || "0");

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setProject(data);
      } catch {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [params.id]);

  // Fetch KYC status and cumulative investment for threshold check
  useEffect(() => {
    async function fetchKycAndInvestments() {
      try {
        const [profileRes, investmentsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/investments"),
        ]);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setKycStatus(profile.kycStatus ?? "NONE");
        }
        if (investmentsRes.ok) {
          const investments = await investmentsRes.json();
          const confirmed = investments.filter(
            (inv: { status: string }) => inv.status === "CONFIRMED"
          );
          const total = confirmed.reduce(
            (sum: number, inv: { amount: number }) => sum + Number(inv.amount),
            0
          );
          setCumulativeInvested(total);
        }
      } catch {
        // Non-blocking: KYC nudge is informational
      }
    }
    fetchKycAndInvestments();
  }, []);

  // Redirect if no amount
  if (!amount || amount <= 0) {
    router.push(`/investments/${params.id}/invest`);
    return null;
  }

  // Get balance for selected payment method
  function getBalance(method: PaymentMethod): string {
    if (method === "usdc" && usdcBalance !== undefined) {
      return formatUnits(usdcBalance, 6);
    }
    if (method === "usdt" && usdtBalance !== undefined) {
      return formatUnits(usdtBalance, 6);
    }
    if (method === "eth" && ethBalance !== undefined) {
      return formatUnits(ethBalance, 18);
    }
    return "0";
  }

  function hasInsufficientBalance(): boolean {
    const bal = parseFloat(getBalance(paymentMethod));
    return bal < amount;
  }

  const isOnBase = chainId === BASE_CHAIN_ID || chainId === 84532;
  const isProcessing = txState !== "idle" && txState !== "error" && txState !== "success";

  const KYC_THRESHOLD = 5000;
  const isKycApproved = kycStatus === "APPROVED";
  const wouldExceedThreshold = cumulativeInvested + amount > KYC_THRESHOLD;
  const kycBlocked = !isKycApproved && wouldExceedThreshold;
  const remainingBeforeKyc = Math.max(0, KYC_THRESHOLD - cumulativeInvested);

  const annualReturn = project ? amount * (project.apy / 100) : 0;
  const platformFee = amount * 0.005;
  const totalAtMaturity = project ? amount + annualReturn * (project.term / 12) : 0;
  const monthlyIncome = annualReturn / 12;

  async function handleSwitchNetwork() {
    try {
      await switchChainAsync({ chainId: BASE_CHAIN_ID });
    } catch {
      setError("Failed to switch network. Please switch to Base manually.");
    }
  }

  async function handleConfirmInvestment() {
    if (!project || !address) return;
    setError("");
    resetTx();

    try {
      // Convert amount to on-chain units
      const decimals = paymentMethod === "eth" ? 18 : 6;
      const onChainAmount = paymentMethod === "eth"
        ? parseEther(amount.toString())
        : parseUnits(amount.toString(), decimals);

      const chainProjectId = BigInt(project.chainProjectId ?? 0);

      // Execute on-chain transaction (approve + invest)
      await invest(chainProjectId, onChainAmount, paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  // After on-chain success, record in backend and redirect
  useEffect(() => {
    if (txState !== "success" || !project || !txHash) return;

    async function recordInvestment() {
      try {
        const res = await fetch("/api/investments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project!.id,
            amount,
            txHash,
            asset: paymentMethod.toUpperCase(),
            network: "base",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to record investment");
        }

        const investment = await res.json();
        router.push(
          `/investments/${project!.id}/invest/success?amount=${amount}&investmentId=${investment.id}&txHash=${txHash}`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to record investment");
      }
    }

    recordInvestment();
  }, [txState, project, txHash, amount, paymentMethod, router]);

  if (loading) {
    return (
      <>
        <Header title="Review Investment" />
        <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Loading...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Review Investment" />
        <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error || "Project not found"}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Review Investment" />
      <div className="pt-16 pb-28 px-5 animate-fadeIn space-y-5">
        {/* Security Badge */}
        <div className="mt-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
            verified_user
          </span>
          <div className="flex-1">
            <p className="font-bold text-sm text-green-900 dark:text-green-100">
              On-Chain Investment
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Your investment is secured by smart contracts on Base and verifiable on Basescan
            </p>
          </div>
        </div>

        {/* KYC Nudge Banner */}
        {!isKycApproved && !kycBlocked && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">
              info
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm text-blue-900 dark:text-blue-100">
                You can invest up to ${remainingBeforeKyc.toLocaleString("en-US")} more without identity verification.
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <Link href="/kyc" className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-200">
                  Complete KYC
                </Link>{" "}
                to unlock unlimited investing.
              </p>
            </div>
          </div>
        )}

        {kycBlocked && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
              gpp_maybe
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm text-red-900 dark:text-red-100">
                Identity verification required
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                Your cumulative investment would exceed $5,000.{" "}
                <Link href="/kyc" className="underline font-semibold hover:text-red-900 dark:hover:text-red-200">
                  Complete KYC
                </Link>{" "}
                to continue.
              </p>
            </div>
          </div>
        )}

        {/* Network Guard */}
        {isConnected && !isOnBase && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl">
                warning
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-100">
                  Wrong Network
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Please switch to Base network to invest
                </p>
              </div>
              <button
                onClick={handleSwitchNetwork}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
              >
                Switch to Base
              </button>
            </div>
          </div>
        )}

        {/* Not connected */}
        {!isConnected && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl">
                account_balance_wallet
              </span>
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-100">
                  Wallet Required
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Connect your wallet to invest on-chain
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Investment Summary Card */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-800">
          <div className="bg-gradient-to-r from-primary to-primary-dark p-5 text-white">
            <h3 className="font-bold text-lg mb-4">Investment Summary</h3>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm mb-1">Total Investment</p>
              <p className="text-4xl font-bold">
                ${amount.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
                Project
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">
                    apartment
                  </span>
                </div>
                <div>
                  <p className="font-bold">{project.name}</p>
                  <p className="text-sm text-text-muted">
                    {project.ticker} &middot; {project.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">
                Investment Plan
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted mb-1">APY</p>
                  <p className="font-bold text-primary">{project.apy}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Term</p>
                  <p className="font-bold">{project.term} Months</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Payouts</p>
                  <p className="font-bold">{project.payout}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Risk</p>
                  <p className="font-bold">
                    {project.riskLevel === "LOW"
                      ? "Low"
                      : project.riskLevel === "MEDIUM"
                        ? "Medium"
                        : "High"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4">Payment Method</h3>
          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const bal = getBalance(opt.method);
              const balNum = parseFloat(bal);
              const insufficient = opt.method === paymentMethod && balNum < amount;

              return (
                <button
                  key={opt.method}
                  onClick={() => { setPaymentMethod(opt.method); setError(""); }}
                  disabled={isProcessing}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === opt.method
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${opt.color} flex items-center justify-center text-white font-extrabold text-base shrink-0`}>
                    {opt.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold">{opt.label}</p>
                    <p className={`text-sm ${insufficient ? "text-red-500 font-semibold" : "text-text-muted"}`}>
                      {balancesLoading
                        ? "Loading..."
                        : isConnected
                          ? `Balance: ${parseFloat(bal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: opt.method === "eth" ? 6 : 2 })} ${opt.label}`
                          : "Connect wallet"
                      }
                      {insufficient && " (Insufficient)"}
                    </p>
                  </div>
                  {paymentMethod === opt.method && (
                    <span className="material-symbols-outlined text-primary">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projected Returns */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4">Projected Returns</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Principal Amount</span>
              <span className="text-sm font-bold">
                ${amount.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Est. Annual Return</span>
              <span className="text-sm font-bold text-accent">
                +${annualReturn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Monthly Income</span>
              <span className="text-sm font-bold">
                ${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Platform Fee (0.5%)</span>
              <span className="text-sm font-medium text-text-muted">
                -${platformFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold">Total at Maturity</span>
              <span className="text-lg font-bold text-primary">
                ${totalAtMaturity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Progress */}
        {txState !== "idle" && txState !== "error" && (
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                txState === "success" ? "bg-green-500" : "bg-primary"
              }`}>
                <span className={`material-symbols-outlined text-white ${
                  txState !== "success" ? "animate-spin" : ""
                }`}>
                  {STATE_LABELS[txState]?.icon || "hourglass_top"}
                </span>
              </div>
              <div>
                <p className="font-bold">{STATE_LABELS[txState]?.label || "Processing..."}</p>
                {txHash && (
                  <a
                    href={`${getBasescanUrl(chainId ?? BASE_CHAIN_ID)}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {txHash.slice(0, 10)}...{txHash.slice(-6)}
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {(paymentMethod !== "eth" ? ["Approve", "Invest", "Record"] : ["Invest", "Record"]).map((step, i) => {
                const steps = paymentMethod !== "eth"
                  ? [["approving", "waitingApproval"], ["investing", "waitingInvestment"], ["recording", "success"]]
                  : [["investing", "waitingInvestment"], ["recording", "success"]];
                const isActive = steps[i]?.includes(txState);
                const isDone = i < steps.findIndex(s => s.includes(txState));
                return (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone ? "bg-green-500 text-white"
                      : isActive ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-text-muted"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs ${isActive ? "font-bold" : "text-text-muted"}`}>{step}</span>
                    {i < (paymentMethod !== "eth" ? 2 : 1) && (
                      <div className={`flex-1 h-0.5 ${isDone ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-amber-600 text-xl">
              info
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm text-amber-900 dark:text-amber-100 mb-1">
                Important Notice
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Your investment will be locked for {project.term} months. An ERC-1155 token
                will be minted to your wallet representing your investment. All transactions
                are verifiable on Basescan.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {(error || txError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error || txError}
            </p>
            {txState === "error" && (
              <button
                onClick={() => { resetTx(); setError(""); }}
                className="block mx-auto mt-2 text-xs text-primary font-bold hover:underline"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={handleConfirmInvestment}
            disabled={!isConnected || !isOnBase || isProcessing || hasInsufficientBalance() || kycBlocked}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin material-symbols-outlined">
                  progress_activity
                </span>
                {STATE_LABELS[txState]?.label || "Processing..."}
              </>
            ) : !isConnected ? (
              "Connect Wallet to Invest"
            ) : !isOnBase ? (
              "Switch to Base Network"
            ) : hasInsufficientBalance() ? (
              `Insufficient ${paymentMethod.toUpperCase()} Balance`
            ) : (
              <>
                Confirm Investment
                <span className="material-symbols-outlined">check_circle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
