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

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getRiskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "Low Risk";
    case "MEDIUM":
      return "Medium Risk";
    case "HIGH":
      return "High Risk";
    default:
      return riskLevel;
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "local_hospital";
    case "AGRICULTURE":
      return "eco";
    case "REAL_ESTATE":
      return "apartment";
    case "COMMODITIES":
      return "inventory_2";
    default:
      return "category";
  }
}

export default function InvestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const projectedPayout = numericAmount + annualReturn - platformFee;

  async function handleInvest() {
    if (!project) return;
    if (numericAmount < project.minInvestment) {
      setError(`Minimum investment is $${project.minInvestment.toLocaleString("en-US")}`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          amount: numericAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Investment failed");
        setSubmitting(false);
        return;
      }

      router.push(
        `/investments/${project.id}/invest/success?amount=${numericAmount}&investmentId=${data.id}`
      );
    } catch {
      setError("Investment failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Invest" />
        <div className="pt-16 pb-24 px-5 flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-text-muted">Loading...</div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Invest" />
        <div className="pt-16 pb-24 px-5 flex items-center justify-center min-h-screen">
          <p className="text-red-500">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Invest" />
      <div className="pt-16 pb-28 px-5">
        {/* Project Info Card */}
        <div className="mt-4 bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="material-icons text-primary text-xl">
                {getCategoryIcon(project.category)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-sm">
                {project.ticker} — {project.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-accent text-xs font-semibold">
                  {project.apy}% APY
                </span>
                <span className="text-text-muted text-xs">
                  {project.term} Mo
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRiskColor(project.riskLevel)}`}
                >
                  {getRiskLabel(project.riskLevel)}
                </span>
              </div>
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
            Min. investment: $
            {project.minInvestment.toLocaleString("en-US")}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          </div>
        )}

        {/* Investment Summary */}
        {numericAmount > 0 && (
          <div className="mt-6 bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm mb-3">Investment Summary</h3>
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
                <span className="text-sm font-bold">Projected Payout</span>
                <span className="text-sm font-bold text-primary">
                  $
                  {projectedPayout.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="flex gap-3">
            <span className="material-icons text-primary text-lg mt-0.5">
              info
            </span>
            <div>
              <p className="text-xs text-text-muted leading-relaxed">
                Payouts are distributed {project.payout.toLowerCase()} to your
                wallet. Your investment is locked for the full {project.term}
                -month term. Early withdrawal may incur penalties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40">
        <div className="max-w-md mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={handleInvest}
            disabled={submitting || numericAmount <= 0}
            className="block w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-center font-bold rounded-xl shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin material-icons text-lg">
                  progress_activity
                </span>
                Processing...
              </span>
            ) : (
              "Confirm Investment"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
