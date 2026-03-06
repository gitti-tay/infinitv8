"use client";

const STEP_LABELS: Record<string, { label: string; icon: string }> = {
  overview: { label: "Overview", icon: "info" },
  terms: { label: "Terms", icon: "description" },
  kyc: { label: "KYC", icon: "verified_user" },
  wallet: { label: "Wallet", icon: "account_balance_wallet" },
  amount: { label: "Amount", icon: "payments" },
};

const STEPS = ["overview", "terms", "kyc", "wallet", "amount"] as const;

interface StepIndicatorProps {
  currentStep: string;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.indexOf(currentStep as (typeof STEPS)[number]);

  return (
    <div className="flex items-center justify-center gap-0 mt-4 mb-6 px-2">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const info = STEP_LABELS[step];

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-accent border-2 border-accent text-white"
                    : isActive
                      ? "bg-primary border-2 border-primary text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
                      : "bg-background-tertiary border-2 border-border text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-base">check</span>
                ) : (
                  <span className="material-symbols-outlined text-base">{info.icon}</span>
                )}
              </div>
              <p
                className={`text-[10px] font-semibold text-center ${
                  isActive ? "text-primary" : isCompleted ? "text-accent" : "text-text-muted"
                }`}
              >
                {info.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 min-w-[16px] -mt-4 ${
                  i < currentIndex ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
