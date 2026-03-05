"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const QUICK_AMOUNTS = [5, 10, 50, 100];

export default function InvestAmountPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const numericAmount = parseFloat(amount) || 0;
  const annualReturn = project ? numericAmount * (project.apy / 100) : 0;
  const platformFee = numericAmount * 0.005;

  function handleContinue() {
    if (!project) return;
    if (numericAmount < project.minInvestment) {
      setError(
        `Minimum investment is $${project.minInvestment.toLocaleString("en-US")}`
      );
      return;
    }
    if (!agreedToTerms) {
      setError("Please accept the terms to continue");
      return;
    }
    router.push(
      `/investments/${project.id}/invest/review?amount=${numericAmount}`
    );
  }

  if (loading) {
    return (
      <>
        <Header title="Invest" />
        <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Loading...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Invest" />
        <div className="pt-16 pb-24 md:pb-8 px-5 flex items-center justify-center min-h-screen">
          <p className="text-red-500">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Investment Amount" />
      <div className="pt-16 pb-28 px-5 animate-fadeIn">
        {/* Plan Card */}
        <div className="mt-4 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">{project.ticker}</h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/20 rounded-full">
              {project.term} Mo Term
            </span>
          </div>
          <p className="text-white/70 text-xs mb-3">{project.name}</p>
          <div className="flex gap-4">
            <div>
              <p className="text-white/60 text-[10px]">Target APY</p>
              <p className="text-lg font-bold">{project.apy}%</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Payout</p>
              <p className="text-lg font-bold">{project.payout}</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px]">Risk</p>
              <p className="text-lg font-bold">
                {project.riskLevel === "LOW"
                  ? "Low"
                  : project.riskLevel === "MEDIUM"
                    ? "Med"
                    : "High"}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mt-6 text-center">
          <p className="text-text-muted text-xs mb-3">Enter Investment Amount</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-5xl font-bold text-text-muted">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0"
              className="text-5xl font-bold bg-transparent outline-none text-center w-48 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <p className="text-text-muted text-xs mt-2">
            Min: ${project.minInvestment.toLocaleString("en-US")}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-4 justify-center">
          {QUICK_AMOUNTS.map((qa) => (
            <button
              key={qa}
              onClick={() => {
                setAmount(qa.toString());
                setError("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                numericAmount === qa
                  ? "bg-primary text-white"
                  : "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:border-primary"
              }`}
            >
              ${qa.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          </div>
        )}

        {/* Projected Returns */}
        {numericAmount > 0 && (
          <div className="mt-6 bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm mb-3">Projected Returns</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
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
              <div className="flex justify-between items-center">
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
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold">Net Annual Return</span>
                <span className="text-sm font-bold text-primary">
                  $
                  {(annualReturn - platformFee).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Liquidity Notice */}
        <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5">
              info
            </span>
            <p className="text-xs text-text-muted leading-relaxed">
              Your investment is locked for the full {project.term}-month term.
              Payouts distributed {project.payout.toLowerCase()} to your wallet.
              Early withdrawal may incur penalties.
            </p>
          </div>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-xs text-text-muted">
            I have read and agree to the investment terms, risk disclosure, and
            understand that returns are not guaranteed.
          </span>
        </label>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={handleContinue}
            disabled={numericAmount <= 0}
            className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </>
  );
}
