import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import {
  getCategoryIcon,
  getCategoryLabel,
  formatCurrency,
  getRiskColor,
} from "@/lib/utils/format";
import Link from "next/link";
import { redirect } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getCategoryColor(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "#3b82f6";
    case "AGRICULTURE":
      return "#10b981";
    case "REAL_ESTATE":
      return "#8b5cf6";
    case "COMMODITIES":
      return "#f59e0b";
    default:
      return "#3b82f6";
  }
}

function getCategoryBgClass(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "bg-primary/10 text-primary";
    case "AGRICULTURE":
      return "bg-accent/10 text-accent";
    case "REAL_ESTATE":
      return "bg-purple/10 text-purple";
    case "COMMODITIES":
      return "bg-amber/10 text-amber";
    default:
      return "bg-primary/10 text-primary";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent-light rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Active
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-amber/10 text-amber rounded-full">
          Pending
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-background-tertiary text-text-muted rounded-full">
          Cancelled
        </span>
      );
    default:
      return null;
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

/** Format a date to readable string */
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Sample payout history (hardcoded for now)                         */
/* ------------------------------------------------------------------ */

const SAMPLE_PAYOUTS = [
  { date: "Feb 15, 2026", asset: "SCN", category: "HEALTHCARE", amount: 125.5, status: "Completed" },
  { date: "Feb 10, 2026", asset: "MDD", category: "REAL_ESTATE", amount: 64.8, status: "Completed" },
  { date: "Jan 20, 2026", asset: "PTF", category: "AGRICULTURE", amount: 89.2, status: "Completed" },
  { date: "Jan 15, 2026", asset: "SCN", category: "HEALTHCARE", amount: 125.5, status: "Completed" },
  { date: "Jan 10, 2026", asset: "MDD", category: "REAL_ESTATE", amount: 64.8, status: "Completed" },
  { date: "Dec 20, 2025", asset: "PTF", category: "AGRICULTURE", amount: 89.2, status: "Completed" },
  { date: "Dec 15, 2025", asset: "SCN", category: "HEALTHCARE", amount: 125.5, status: "Completed" },
  { date: "Dec 10, 2025", asset: "MDD", category: "REAL_ESTATE", amount: 64.8, status: "Completed" },
];

/* ------------------------------------------------------------------ */
/*  Donut Chart (SVG, server-renderable)                              */
/* ------------------------------------------------------------------ */

function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative w-[160px] h-[160px] lg:w-[180px] lg:h-[180px] shrink-0">
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          className="stroke-background-tertiary"
          strokeWidth="20"
        />
        {segments.map((seg, i) => {
          const dashLen = total > 0 ? (seg.value / total) * circumference : 0;
          const dashOffset = -offset;
          offset += dashLen;
          return (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] text-text-muted uppercase tracking-widest">
          {centerLabel}
        </span>
        <span className="text-2xl font-extrabold text-text-primary">
          {centerValue}
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page Component                                                    */
/* ================================================================== */

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const investments = await prisma.investment.findMany({
    where: { userId: session.user.id },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  /* ---- Derived data ---- */
  const confirmed = investments.filter((inv) => inv.status === "CONFIRMED");
  const totalInvested = confirmed.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  const totalYield = confirmed.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );
  const monthlyYield = totalYield / 12;
  const totalValue = totalInvested + totalYield;
  const gainPct =
    totalInvested > 0 ? ((totalYield / totalInvested) * 100).toFixed(1) : "0";
  const avgApy =
    confirmed.length > 0
      ? (
          confirmed.reduce((s, inv) => s + Number(inv.project.apy), 0) /
          confirmed.length
        ).toFixed(1)
      : "0";

  /* Donut segments */
  const donutSegments = confirmed.map((inv) => ({
    value: Number(inv.amount),
    color: getCategoryColor(inv.project.category),
  }));

  return (
    <>
      <Header title="Portfolio" showBack={false} />
      <div className="pt-14 pb-24 md:pb-8 animate-fadeIn">
        <div className="px-4 md:px-6 pt-4 space-y-6">
          {/* ====================================================== */}
          {/*  1. Portfolio Hero Card                                 */}
          {/* ====================================================== */}
          <div className="bg-gradient-to-br from-primary/[0.08] to-purple/[0.06] border border-primary/15 rounded-xl p-6 md:p-8 shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Left: value + metrics */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-muted uppercase tracking-widest mb-1">
                  Portfolio Value
                </p>
                <h2 className="text-4xl md:text-[44px] font-black tracking-tight font-mono text-text-primary leading-none mb-2">
                  ${formatCurrency(totalValue)}
                </h2>

                {totalYield > 0 && (
                  <div className="flex items-center gap-2 text-accent-light font-semibold text-base">
                    <span className="material-symbols-outlined text-lg">
                      trending_up
                    </span>
                    <span>
                      +${formatCurrency(totalYield)} (+{gainPct}%)
                    </span>
                    <span className="text-xs text-text-muted font-normal">
                      all time
                    </span>
                  </div>
                )}

                {/* Metrics grid */}
                <div className="flex flex-wrap gap-x-10 gap-y-3 mt-5">
                  <div>
                    <p className="text-xl font-bold font-mono text-text-primary">
                      ${formatCurrency(totalInvested, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Total Invested
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-accent-light">
                      ${formatCurrency(totalYield)}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Total Yield
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-primary-light">
                      ${formatCurrency(monthlyYield)}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Monthly Yield
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-amber">
                      {avgApy}%
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">Avg. APY</p>
                  </div>
                </div>
              </div>

              {/* Right: donut chart */}
              {confirmed.length > 0 && (
                <DonutChart
                  segments={donutSegments}
                  centerLabel="Assets"
                  centerValue={String(confirmed.length)}
                />
              )}
            </div>
          </div>

          {/* ====================================================== */}
          {/*  2. Active Investments                                  */}
          {/* ====================================================== */}
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Active Investments ({confirmed.length})
            </h3>

            {investments.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 shadow-soft text-center py-16">
                <span className="material-symbols-outlined text-4xl text-text-muted mb-3 block">
                  account_balance_wallet
                </span>
                <p className="text-text-muted text-sm mb-1">
                  No investments yet
                </p>
                <p className="text-text-muted text-xs mb-5">
                  Start building your portfolio today
                </p>
                <Link
                  href="/investments"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {investments.map((investment) => {
                  const amount = Number(investment.amount);
                  const apy = Number(investment.project.apy);
                  const estYield = amount * (apy / 100);
                  const currentValue = amount + estYield;
                  const gainPercent =
                    amount > 0
                      ? ((estYield / amount) * 100).toFixed(1)
                      : "0";
                  const totalGain = estYield;
                  const maturityPct = getMaturityProgress(
                    investment.createdAt,
                    investment.project.term
                  );
                  const catColor = getCategoryColor(
                    investment.project.category
                  );
                  const catBgClass = getCategoryBgClass(
                    investment.project.category
                  );
                  const catLabel = getCategoryLabel(
                    investment.project.category
                  );

                  // Calculate next payout: one month from most recent month boundary
                  const nextPayout = new Date(investment.createdAt);
                  const now = new Date();
                  while (nextPayout < now) {
                    nextPayout.setMonth(nextPayout.getMonth() + 1);
                  }
                  const monthlyPayout = (amount * (apy / 100)) / 12;

                  // Maturity date
                  const maturityDate = new Date(investment.createdAt);
                  maturityDate.setMonth(
                    maturityDate.getMonth() + investment.project.term
                  );

                  return (
                    <div
                      key={investment.id}
                      className="bg-card border border-border rounded-xl overflow-hidden shadow-soft hover:border-border-light transition-colors"
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 p-5 border-b border-border">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${catBgClass}`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {getCategoryIcon(investment.project.category)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-text-primary text-sm truncate">
                              {investment.project.name}
                            </span>
                            <span className="text-[11px] font-semibold text-primary-light bg-primary/10 px-1.5 py-0.5 rounded">
                              {investment.project.ticker}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {catLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate">
                            Maturity: {fmtDate(maturityDate)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-extrabold font-mono text-text-primary">
                            ${formatCurrency(currentValue)}
                          </p>
                          <p className="text-xs font-semibold text-accent-light">
                            +{gainPercent}% ($
                            {formatCurrency(totalGain)})
                          </p>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5">
                        {/* Metrics grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-background-tertiary rounded-lg">
                            <p className="text-sm font-bold font-mono text-text-primary">
                              ${formatCurrency(amount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              Invested
                            </p>
                          </div>
                          <div className="text-center p-3 bg-background-tertiary rounded-lg">
                            <p className="text-sm font-bold font-mono text-accent-light">
                              {apy}%
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              APY
                            </p>
                          </div>
                          <div className="text-center p-3 bg-background-tertiary rounded-lg">
                            <p className="text-sm font-bold font-mono text-accent-light">
                              ${formatCurrency(estYield)}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              Yield Earned
                            </p>
                          </div>
                          <div className="text-center p-3 bg-background-tertiary rounded-lg">
                            <p className="text-sm font-bold font-mono text-primary-light">
                              +${formatCurrency(estYield)}
                            </p>
                            <p className="text-[11px] text-text-muted mt-0.5">
                              Unrealized Gain
                            </p>
                          </div>
                        </div>

                        {/* Progress to maturity */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-text-muted">
                              Progress to Maturity
                            </span>
                            <span className="font-semibold text-text-primary">
                              {maturityPct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                              style={{ width: `${maturityPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="flex items-center justify-between px-5 py-3 bg-background-tertiary border-t border-border">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-text-muted">
                            Next:{" "}
                            <span className="text-accent-light font-bold font-mono">
                              ${formatCurrency(monthlyPayout)}
                            </span>{" "}
                            on {fmtDate(nextPayout)}
                          </span>
                          {getStatusBadge(investment.status)}
                        </div>
                        <Link
                          href={`/portfolio/${investment.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white rounded-md transition-colors"
                          style={{ backgroundColor: catColor }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ====================================================== */}
          {/*  3. Payout History + 4. Yield Analytics                  */}
          {/* ====================================================== */}
          {confirmed.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Payout History */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-text-primary">
                    Payout History
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-accent/10 text-accent-light rounded-full">
                    {SAMPLE_PAYOUTS.length} total payouts
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {SAMPLE_PAYOUTS.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: getCategoryColor(p.category),
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary">
                          {p.asset} Yield Payout
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {p.date}
                        </p>
                      </div>
                      <span className="text-sm font-bold font-mono text-accent-light">
                        +${p.amount.toFixed(2)}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-accent/10 text-accent-light rounded-full">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Yield Analytics */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
                <h4 className="text-base font-bold text-text-primary mb-4">
                  Yield Analytics
                </h4>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      label: "Total Yield Earned",
                      value: `$${formatCurrency(totalYield)}`,
                      color: "text-accent-light",
                    },
                    {
                      label: "Average Monthly Yield",
                      value: `$${formatCurrency(monthlyYield)}`,
                      color: "text-text-primary",
                    },
                    {
                      label: "Yield on Cost",
                      value:
                        totalInvested > 0
                          ? `${((totalYield / totalInvested) * 100).toFixed(2)}%`
                          : "0%",
                      color: "text-amber",
                    },
                    {
                      label: "Projected Annual Yield",
                      value: `$${formatCurrency(monthlyYield * 12)}`,
                      color: "text-primary-light",
                    },
                    {
                      label: "Next Payout Date",
                      value: "Mar 10, 2026",
                      color: "text-text-primary",
                    },
                    {
                      label: "Unrealized Gain",
                      value: `+$${formatCurrency(totalYield)}`,
                      color: "text-accent-light",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg"
                    >
                      <span className="text-sm text-text-tertiary">
                        {row.label}
                      </span>
                      <span
                        className={`text-base font-bold font-mono ${row.color}`}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
