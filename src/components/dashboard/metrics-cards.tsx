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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Total Balance */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft relative overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-primary opacity-[0.08]" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-primary-light text-sm">
            account_balance_wallet
          </span>
          Total Balance
        </div>
        <div className="text-[28px] font-extrabold tracking-tight font-mono">
          ${formatCurrency(metrics.totalBalance, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-sm text-text-muted">.00</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-xl bg-accent/10 text-accent-light">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          +{metrics.balanceChangePercent}% all time
        </span>
        <p className="text-[11px] text-text-muted mt-1">
          Available: ${formatCurrency(metrics.availableBalance)}
        </p>
      </div>

      {/* Total Yield Earned */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft relative overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-accent opacity-[0.08]" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-accent-light text-sm">
            payments
          </span>
          Total Yield Earned
        </div>
        <div className="text-[28px] font-extrabold tracking-tight font-mono text-accent-light">
          ${formatCurrency(metrics.totalYieldEarned, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-sm text-text-muted">
            .{(metrics.totalYieldEarned % 1).toFixed(2).slice(2)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-xl bg-accent/10 text-accent-light">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          +${formatCurrency(metrics.monthlyYield)} this month
        </span>
        <p className="text-[11px] text-text-muted mt-1">
          Next payout: {metrics.nextPayoutDate}
        </p>
      </div>

      {/* Portfolio Value */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft relative overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-purple opacity-[0.08]" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-purple text-sm">
            pie_chart
          </span>
          Portfolio Value
        </div>
        <div className="text-[28px] font-extrabold tracking-tight font-mono">
          ${formatCurrency(metrics.portfolioValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          <span className="text-sm text-text-muted">.00</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-xl bg-accent/10 text-accent-light">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          +${formatCurrency(metrics.unrealizedGain, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} unrealized
        </span>
        <p className="text-[11px] text-text-muted mt-1">
          {metrics.activeInvestmentCount} active investment{metrics.activeInvestmentCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Avg. APY */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-soft relative overflow-hidden">
        <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-amber opacity-[0.08]" />
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium uppercase tracking-wide mb-2">
          <span className="material-symbols-outlined text-amber text-sm">
            speed
          </span>
          Avg. APY
        </div>
        <div className="text-[28px] font-extrabold tracking-tight font-mono text-amber">
          {metrics.avgApy}
          <span className="text-sm">%</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-xl bg-accent/10 text-accent-light">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          +{metrics.vsMarketPercent}% vs. market
        </span>
        <p className="text-[11px] text-text-muted mt-1">Weighted across portfolio</p>
      </div>
    </div>
  );
}
