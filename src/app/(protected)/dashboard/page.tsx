import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { MarketOverview } from "@/components/dashboard/market-overview";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  const investments = await prisma.investment.findMany({
    where: { userId: user?.id, status: "CONFIRMED" },
    include: { project: true },
  });

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  const estimatedReturn = investments.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );

  // Hardcoded metrics (will be connected to real APIs in Phase 4)
  const metrics = {
    totalBalance: 42590,
    availableBalance: 7540,
    balanceChangePercent: 18.4,
    totalYieldEarned: 1245.8,
    monthlyYield: 279.5,
    nextPayoutDate: "Mar 15, 2026",
    portfolioValue: 35050,
    unrealizedGain: 7050,
    activeInvestmentCount: investments.length || 3,
    avgApy: 14.8,
    vsMarketPercent: 2.1,
  };

  // Hardcoded active investments for display (matches reference design)
  const activeInvestments = [
    {
      id: "1",
      ticker: "SCN",
      name: "Healthcare",
      icon: "medical_services",
      invested: 15000,
      currentValue: 18420,
      gainPercent: 22.8,
      maturityPercent: 75,
      apy: 12.5,
      gradientFrom: "from-primary",
      gradientTo: "to-primary-dark",
      progressGradient: "from-primary to-primary-light",
    },
    {
      id: "2",
      ticker: "PTF",
      name: "Agriculture",
      icon: "agriculture",
      invested: 12000,
      currentValue: 14280,
      gainPercent: 19.0,
      maturityPercent: 60,
      apy: 14.2,
      gradientFrom: "from-accent",
      gradientTo: "to-accent-dark",
      progressGradient: "from-accent to-accent-light",
    },
    {
      id: "3",
      ticker: "MDD",
      name: "Real Estate",
      icon: "apartment",
      invested: 8000,
      currentValue: 9890,
      gainPercent: 23.6,
      maturityPercent: 45,
      apy: 11.8,
      gradientFrom: "from-purple",
      gradientTo: "to-purple-dark",
      progressGradient: "from-purple to-[#a78bfa]",
    },
  ];

  // Hardcoded upcoming payouts
  const upcomingPayouts = [
    {
      id: "1",
      name: "MDD Payout",
      date: "Mar 10, 2026",
      amount: 64.8,
      frequency: "Monthly",
      iconBg: "bg-primary/10",
      iconColor: "text-primary-light",
    },
    {
      id: "2",
      name: "SCN Payout",
      date: "Mar 15, 2026",
      amount: 125.5,
      frequency: "Monthly",
      iconBg: "bg-accent/10",
      iconColor: "text-accent-light",
    },
    {
      id: "3",
      name: "PTF Payout",
      date: "Mar 20, 2026",
      amount: 89.2,
      frequency: "Monthly",
      iconBg: "bg-purple/10",
      iconColor: "text-purple",
    },
  ];

  const firstName = user?.name?.split(" ")[0] || "Investor";

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* ── Welcome Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-[13px] text-text-muted mb-1">
            {getGreeting()}, {getFormattedDate()}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {firstName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-lg text-[13px] font-semibold transition-colors hover:bg-primary-dark"
          >
            <span className="material-symbols-outlined text-base">
              add_circle
            </span>
            Deposit
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-background-tertiary border border-border text-text-secondary rounded-lg text-[13px] font-semibold transition-colors hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-base">
              arrow_circle_up
            </span>
            Withdraw
          </Link>
          <Link
            href="/investments"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-lg text-[13px] font-semibold transition-colors hover:bg-accent-dark"
          >
            <span className="material-symbols-outlined text-base">
              trending_up
            </span>
            Invest
          </Link>
        </div>
      </div>

      {/* ── Metrics Row ── */}
      <MetricsCards metrics={metrics} />

      {/* ── Active Investments + Upcoming Payouts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Active Investments */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-text-primary">
              Active Investments
            </h3>
            <Link
              href="/portfolio"
              className="text-xs text-primary font-medium hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div>
            {activeInvestments.map((inv, idx) => (
              <div
                key={inv.id}
                className={`flex items-center gap-4 py-3.5 ${
                  idx < activeInvestments.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${inv.gradientFrom} ${inv.gradientTo} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-lg text-white">
                    {inv.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">
                      {inv.ticker} &mdash; {inv.name}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-accent/10 text-accent-light">
                      +{inv.gainPercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-muted">
                      ${formatCurrency(inv.invested, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} invested
                    </span>
                    <span className="text-sm font-bold font-mono text-text-primary">
                      ${formatCurrency(inv.currentValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${inv.progressGradient}`}
                      style={{ width: `${inv.maturityPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[11px] text-text-muted">
                    <span>{inv.maturityPercent}% to maturity</span>
                    <span>{inv.apy}% APY</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Payouts + Recent Activity */}
        <div className="flex flex-col gap-4">
          {/* Upcoming Payouts */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary">
                Upcoming Payouts
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-accent/10 text-accent-light">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                {upcomingPayouts.length} scheduled
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {upcomingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center gap-3 p-2.5 bg-background-tertiary rounded-lg"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${payout.iconBg} flex items-center justify-center`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${payout.iconColor}`}
                    >
                      event
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-text-primary">
                      {payout.name}
                    </p>
                    <p className="text-[11px] text-text-muted">{payout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent-light font-mono">
                      ${formatCurrency(payout.amount)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {payout.frequency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
              <span className="text-xs text-text-muted">
                Total March Payouts
              </span>
              <span className="text-base font-extrabold text-accent-light font-mono">
                ${formatCurrency(upcomingPayouts.reduce((s, p) => s + p.amount, 0))}
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* ── Market Overview ── */}
      <MarketOverview
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          ticker: p.ticker,
          category: p.category,
          apy: Number(p.apy),
          riskLevel: p.riskLevel,
          investors: p.investors,
          raisedPercent: Number(p.raisedPercent),
          targetAmount: Number(p.targetAmount),
        }))}
      />
    </div>
  );
}
