"use client";

import { useState } from "react";

export interface PlanData {
  name: string;
  apy: number;
  min: number;
  term: number;
  lockup: string;
  payout: string;
  badge: string | null;
  description: string;
}

interface PlanStepProps {
  plans: PlanData[];
  onSelect: (plan: PlanData) => void;
  onBack: () => void;
}

export function PlanStep({ plans, onSelect, onBack }: PlanStepProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
          Choose Your Plan
        </h2>
        <p className="text-sm text-text-muted">
          Select an investment tier that fits your goals
        </p>
      </div>

      <div className="space-y-3">
        {plans.map((plan, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`w-full text-left rounded-xl p-5 border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              } relative`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    plan.badge === "Popular"
                      ? "bg-primary text-white"
                      : plan.badge === "Top Yield"
                        ? "bg-accent text-white"
                        : plan.badge === "Best Value"
                          ? "bg-purple text-white"
                          : plan.badge === "Founders"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-500 text-white"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{plan.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{plan.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 mt-0.5 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-white text-xs">check</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-extrabold text-primary">{plan.apy}%</span>
                <span className="text-xs text-text-muted">APY</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-text-muted">Minimum</p>
                  <p className="font-semibold">${plan.min.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-text-muted">Lockup</p>
                  <p className="font-semibold">{plan.lockup}</p>
                </div>
                <div>
                  <p className="text-text-muted">Payout</p>
                  <p className="font-semibold">{plan.payout}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => {
              if (selectedIndex !== null) onSelect(plans[selectedIndex]);
            }}
            disabled={selectedIndex === null}
            className="flex-1 py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
