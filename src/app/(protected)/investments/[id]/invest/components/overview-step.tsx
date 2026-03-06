"use client";

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
}

interface OverviewStepProps {
  project: Project;
  onContinue: () => void;
}

export function OverviewStep({ project, onContinue }: OverviewStepProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-purple/12 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            apartment
          </span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight mb-1 text-text-primary">
          You are about to invest in
        </h2>
        <p className="text-lg font-bold text-primary">{project.name}</p>
      </div>

      {/* Project Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">{project.ticker}</h3>
          <span className="px-2.5 py-1 text-[10px] font-semibold bg-white/20 rounded-full">
            {project.category}
          </span>
        </div>
        <p className="text-white/70 text-sm mb-4">{project.location}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Target APY</p>
            <p className="text-2xl font-bold">{project.apy}%</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Term</p>
            <p className="text-2xl font-bold">{project.term} Mo</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Payout</p>
            <p className="text-lg font-bold">{project.payout}</p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">Min. Investment</p>
            <p className="text-lg font-bold">${project.minInvestment.toLocaleString("en-US")}</p>
          </div>
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            project.riskLevel === "LOW" ? "bg-accent/10" : project.riskLevel === "MEDIUM" ? "bg-amber-500/10" : "bg-red-500/10"
          }`}>
            <span className={`material-symbols-outlined text-xl ${
              project.riskLevel === "LOW" ? "text-accent" : project.riskLevel === "MEDIUM" ? "text-amber-500" : "text-red-500"
            }`}>
              {project.riskLevel === "LOW" ? "shield" : project.riskLevel === "MEDIUM" ? "warning" : "error"}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              {project.riskLevel === "LOW" ? "Low" : project.riskLevel === "MEDIUM" ? "Medium" : "High"} Risk
            </p>
            <p className="text-xs text-text-muted">
              Please review all terms and risks before investing
            </p>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
          <p className="text-xs text-text-muted leading-relaxed">
            Before investing, you will need to review and accept the Terms of Service
            and Risk Disclosure, verify your identity (KYC), and connect your wallet
            on the Base network.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
          <button
            onClick={onContinue}
            className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
