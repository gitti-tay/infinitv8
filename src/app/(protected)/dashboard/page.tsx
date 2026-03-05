import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getCategoryIcon, getCategoryLabel } from "@/lib/utils/format";
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

/** Map project category to gradient classes for investment cards */
function getCategoryGradient(category: string) {
  switch (category) {
    case "HEALTHCARE":
      return {
        gradientFrom: "from-primary",
        gradientTo: "to-primary-dark",
        progressGradient: "from-primary to-primary-light",
        iconBg: "bg-primary/10",
        iconColor: "text-primary-light",
      };
    case "AGRICULTURE":
      return {
        gradientFrom: "from-accent",
        gradientTo: "to-accent-dark",
        progressGradient: "from-accent to-accent-light",
        iconBg: "bg-accent/10",
        iconColor: "text-accent-light",
      };
    case "REAL_ESTATE":
      return {
        gradientFrom: "from-purple",
        gradientTo: "to-purple-dark",
        progressGradient: "from-purple to-[#a78bfa]",
        iconBg: "bg-purple/10",
        iconColor: "text-purple",
      };
    case "COMMODITIES":
      return {
        gradientFrom: "from-amber",
        gradientTo: "to-amber-dark",
        progressGradient: "from-amber to-yellow-300",
        iconBg: "bg-amber/10",
        iconColor: "text-amber",
      };
    default:
      return {
        gradientFrom: "from-primary",
        gradientTo: "to-primary-dark",
        progressGradient: "from-primary to-primary-light",
        iconBg: "bg-primary/10",
        iconColor: "text-primary-light",
      };
  }
}

/** Calculate maturity progress as a percentage (0-100) */
function getMaturityProgress(investedAt: Date, termMonths: number): number {
  const now = new Date();
  const maturityDate = new Date(investedAt);
  maturityDate.setMonth(maturityDate.getMonth() + termMonths);
  const totalMs = maturityDate.getTime() - investedAt.getTime();
  const elapsedMs = now.getTime() - investedAt.getTime();
  if (totalMs <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
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

  /* ── Compute real metrics ── */
  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  // Paid yield payouts
  const paidPayouts = await prisma.yieldPayout.findMany({
    where: { userId: user?.id ?? "", paid: true },
  });
  const totalYieldEarned = paidPayouts.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  // Prorated yield for investments that haven't paid yet
  const now = new Date();
  const proratedYield = investments.reduce((sum, inv) => {
    const amount = Number(inv.amount);
    const apy = Number(inv.project.apy);
    const daysHeld = Math.max(
      0,
      (now.getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (amount * apy) / 100 * (daysHeld / 365);
  }, 0);

  const portfolioValue = totalInvested + totalYieldEarned;
  const unrealizedGain = proratedYield - totalYieldEarned;
  const avgApy =
    investments.length > 0
      ? investments.reduce((s, inv) => s + Number(inv.project.apy), 0) /
        investments.length
      : 0;

  // Monthly yield estimate: total annual yield / 12
  const annualYieldEstimate = investments.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );
  const monthlyYield = annualYieldEstimate / 12;

  // Next payout date: earliest unpaid yield payout, or fallback text
  const nextUnpaidPayout = await prisma.yieldPayout.findFirst({
    where: { userId: user?.id ?? "", paid: false },
    orderBy: { payoutDate: "asc" },
  });
  const nextPayoutDate = nextUnpaidPayout
    ? nextUnpaidPayout.payoutDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No payouts scheduled";

  // Balance change percent (yield earned vs invested, all time)
  const balanceChangePercent =
    totalInvested > 0
      ? Number(((totalYieldEarned / totalInvested) * 100).toFixed(1))
      : 0;

  const metrics = {
    totalBalance: totalInvested + totalYieldEarned,
    availableBalance: 0,
    balanceChangePercent,
    totalYieldEarned,
    monthlyYield,
    nextPayoutDate,
    portfolioValue,
    unrealizedGain: Math.max(0, unrealizedGain),
    activeInvestmentCount: investments.length,
    avgApy: Number(avgApy.toFixed(1)),
    vsMarketPercent: 0,
  };

  /* ── Map real investments to active investment display shape ── */
  const activeInvestments = investments.slice(0, 3).map((inv) => {
    const amount = Number(inv.amount);
    const apy = Number(inv.project.apy);
    const daysHeld = Math.max(
      0,
      (now.getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const proratedGain = (amount * apy) / 100 * (daysHeld / 365);
    const currentValue = amount + proratedGain;
    const gainPercent = amount > 0 ? Number(((proratedGain / amount) * 100).toFixed(1)) : 0;
    const maturityPercent = getMaturityProgress(inv.createdAt, inv.project.term);
    const gradient = getCategoryGradient(inv.project.category);

    return {
      id: inv.id,
      ticker: inv.project.ticker,
      name: getCategoryLabel(inv.project.category),
      icon: getCategoryIcon(inv.project.category),
      invested: amount,
      currentValue,
      gainPercent,
      maturityPercent,
      apy,
      ...gradient,
    };
  });

  /* ── Upcoming payouts from YieldPayout where paid = false ── */
  const unpaidPayouts = await prisma.yieldPayout.findMany({
    where: { userId: user?.id ?? "", paid: false },
    include: { project: true },
    orderBy: { payoutDate: "asc" },
    take: 5,
  });

  const upcomingPayouts = unpaidPayouts.map((p) => {
    const gradient = getCategoryGradient(p.project.category);
    return {
      id: p.id,
      name: `${p.project.ticker} Payout`,
      date: p.payoutDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amount: Number(p.amount),
      frequency: p.project.payout,
      iconBg: gradient.iconBg,
      iconColor: gradient.iconColor,
    };
  });

  /* ── Recent activity for the RecentActivity component ── */
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: user?.id ?? "" },
    include: { project: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentActivity = recentTransactions.map((tx) => {
    const typeMap: Record<string, { icon: string; iconColor: "accent" | "primary" | "purple" | "destructive" | "amber"; isPositive: boolean }> = {
      DEPOSIT: { icon: "add_circle", iconColor: "primary", isPositive: true },
      WITHDRAWAL: { icon: "arrow_circle_up", iconColor: "destructive", isPositive: false },
      INVESTMENT: { icon: "trending_up", iconColor: "purple", isPositive: false },
      YIELD: { icon: "payments", iconColor: "accent", isPositive: true },
      TRANSFER: { icon: "swap_horiz", iconColor: "primary", isPositive: false },
      FEE: { icon: "receipt_long", iconColor: "amber", isPositive: false },
    };

    const config = typeMap[tx.type] ?? { icon: "receipt_long", iconColor: "primary" as const, isPositive: false };
    const label = tx.type === "YIELD"
      ? `Yield Received — ${tx.project?.ticker ?? tx.asset}`
      : tx.type === "INVESTMENT"
        ? `Investment — ${tx.project?.ticker ?? tx.asset}`
        : tx.type === "DEPOSIT"
          ? `Deposit — ${tx.asset}`
          : tx.type === "WITHDRAWAL"
            ? `Withdrawal — ${tx.asset}`
            : `${tx.type} — ${tx.asset}`;

    return {
      id: tx.id,
      icon: config.icon,
      iconColor: config.iconColor,
      title: label,
      date: tx.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: tx.status === "COMPLETED" ? "Completed" : tx.status === "PENDING" ? "Pending" : tx.status,
      amount: Number(tx.amount),
      isPositive: config.isPositive,
    };
  });

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
            {activeInvestments.length === 0 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-text-muted mb-2 block">
                  account_balance_wallet
                </span>
                <p className="text-sm text-text-muted">No active investments yet</p>
                <Link
                  href="/investments"
                  className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Browse Projects
                </Link>
              </div>
            ) : (
              activeInvestments.map((inv, idx) => (
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
            ))
            )}
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
            {upcomingPayouts.length === 0 ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-2xl text-text-muted mb-1 block">
                  event_busy
                </span>
                <p className="text-xs text-text-muted">No upcoming payouts</p>
              </div>
            ) : (
              <>
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
                    Upcoming Payouts
                  </span>
                  <span className="text-base font-extrabold text-accent-light font-mono">
                    ${formatCurrency(upcomingPayouts.reduce((s, p) => s + p.amount, 0))}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <RecentActivity items={recentActivity} />
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
