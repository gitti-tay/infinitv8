import { formatCurrency } from "@/lib/utils/format";

interface MetricsData {
  totalBalance: number;
  availableBalance: number;
  balanceChangePercent: number;
  totalYieldEarned: number;
  monthlyYield: number;
  nextPayoutDate: string;
  portfolioValue: number;
  unrealizedGain: number;
  activeInvestmentCount: number;
  avgApy: number;
  vsMarketPercent: number;
}

export function MetricsCards({ metrics }: { metrics: MetricsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Hero Balance Card */}
      <div className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10 border border-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Portfolio Value</span>
          </div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-extrabold tracking-tight tabular-nums">
              ${formatCurrency(metrics.totalBalance, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +{metrics.balanceChangePercent}%
            </span>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">Yield Earned</p>
              <p className="text-lg font-bold text-accent tabular-nums">${formatCurrency(metrics.totalYieldEarned)}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">Monthly Income</p>
              <p className="text-lg font-bold text-text-primary tabular-nums">${formatCurrency(metrics.monthlyYield)}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">Unrealized</p>
              <p className="text-lg font-bold text-purple tabular-nums">+${formatCurrency(metrics.unrealizedGain)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side metrics */}
      <div className="flex flex-col gap-4">
        {/* Avg APY */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-amber/10 blur-xl" />
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-semibold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-amber text-sm">speed</span>
            Avg. APY
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-amber tabular-nums">
            {metrics.avgApy}<span className="text-lg">%</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">
            {metrics.activeInvestmentCount} active position{metrics.activeInvestmentCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Next Payout */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-accent/10 blur-xl" />
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-semibold uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-accent text-sm">event</span>
            Next Payout
          </div>
          <div className="text-lg font-bold text-text-primary">{metrics.nextPayoutDate}</div>
          <p className="text-[11px] text-text-muted mt-1">
            Est. ${formatCurrency(metrics.monthlyYield)}/month
          </p>
        </div>
      </div>
    </div>
  );
}
