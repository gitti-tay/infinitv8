"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/ui/header";

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
}

export default function InvestReviewPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [error, setError] = useState("");

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

  if (!amount || amount <= 0) {
    router.push(`/investments/${params.id}/invest`);
    return null;
  }

  const annualReturn = project ? amount * (project.apy / 100) : 0;
  const platformFee = amount * 0.005;
  const netReturn = annualReturn - platformFee;
  const totalAtMaturity = project
    ? amount + annualReturn * (project.term / 12)
    : 0;
  const monthlyIncome = annualReturn / 12;

  async function handleConfirmInvestment() {
    if (!project) return;
    setIsProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, amount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Investment failed");
      }

      const investment = await res.json();
      router.push(
        `/investments/${project.id}/invest/success?amount=${amount}&investmentId=${investment.id}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
      setIsProcessing(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Review Investment" />
        <div className="pt-16 pb-24 px-5 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Loading...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Review Investment" />
        <div className="pt-16 pb-24 px-5 flex items-center justify-center min-h-screen">
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
              Secure Investment
            </p>
            <p className="text-xs text-green-700 dark:text-green-400">
              Your transaction is protected by bank-level encryption
            </p>
          </div>
        </div>

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
            {/* Project Details */}
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
              <span className="text-sm text-text-muted">
                Est. Annual Return
              </span>
              <span className="text-sm font-bold text-accent">
                +$
                {annualReturn.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Monthly Income</span>
              <span className="text-sm font-bold">
                $
                {monthlyIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">
                Platform Fee (0.5%)
              </span>
              <span className="text-sm font-medium text-text-muted">
                -$
                {platformFee.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold">Total at Maturity</span>
              <span className="text-lg font-bold text-primary">
                $
                {totalAtMaturity.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg mb-4">Payment Method</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "wallet"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === "wallet"
                    ? "bg-primary"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    paymentMethod === "wallet"
                      ? "text-white"
                      : "text-text-muted"
                  }`}
                >
                  account_balance_wallet
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold">Wallet Balance</p>
                <p className="text-sm text-text-muted">
                  Pay from connected wallet
                </p>
              </div>
              {paymentMethod === "wallet" && (
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("bank")}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "bank"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === "bank"
                    ? "bg-primary"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    paymentMethod === "bank"
                      ? "text-white"
                      : "text-text-muted"
                  }`}
                >
                  account_balance
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold">Bank Transfer</p>
                <p className="text-sm text-text-muted">1-2 business days</p>
              </div>
              {paymentMethod === "bank" && (
                <span className="material-symbols-outlined text-primary">
                  check_circle
                </span>
              )}
            </button>
          </div>
        </div>

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
                Your investment will be locked for {project.term} months. Early
                withdrawal may incur fees. Past performance does not guarantee
                future results.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={handleConfirmInvestment}
            disabled={isProcessing}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin material-symbols-outlined">
                  progress_activity
                </span>
                Processing...
              </>
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
