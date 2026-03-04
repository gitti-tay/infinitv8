import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { getCategoryIcon, formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { redirect } from "next/navigation";

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          Active
        </span>
      );
    case "PENDING":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
          Pending
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
          Cancelled
        </span>
      );
    default:
      return null;
  }
}

function getColorGradient(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "from-blue-500 to-blue-600";
    case "AGRICULTURE":
      return "from-emerald-500 to-emerald-600";
    case "REAL_ESTATE":
      return "from-violet-500 to-violet-600";
    case "COMMODITIES":
      return "from-amber-500 to-amber-600";
    default:
      return "from-primary to-primary-dark";
  }
}

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

  const confirmedInvestments = investments.filter(
    (inv) => inv.status === "CONFIRMED"
  );
  const totalInvested = confirmedInvestments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  const estimatedReturn = confirmedInvestments.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );
  const totalValue = totalInvested + estimatedReturn;

  return (
    <>
      <Header title="Portfolio" showBack={false} />
      <div className="pt-14 pb-24 md:pb-8 animate-fadeIn">
        {/* Total Value Card - Premium Design */}
        <div className="px-5 pt-4">
          <div className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary rounded-3xl p-6 text-white shadow-glow overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-white/80">
                  account_balance_wallet
                </span>
                <p className="text-white/80 text-sm font-medium">
                  Total Portfolio Value
                </p>
              </div>
              <h2 className="text-4xl font-bold mb-2">
                ${formatCurrency(totalValue)}
              </h2>
              {estimatedReturn > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm">
                      trending_up
                    </span>
                    <span className="text-sm font-bold">
                      +${formatCurrency(estimatedReturn)}
                    </span>
                  </div>
                  <span className="text-emerald-300 font-bold">
                    +
                    {totalInvested > 0
                      ? ((estimatedReturn / totalInvested) * 100).toFixed(1)
                      : "0"}
                    %
                  </span>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mt-5 mb-5">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1 tracking-wide">
                    Invested
                  </p>
                  <p className="text-lg font-bold">
                    ${formatCurrency(totalInvested, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1 tracking-wide">
                    Returns
                  </p>
                  <p className="text-lg font-bold text-emerald-300">
                    +${formatCurrency(estimatedReturn, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1 tracking-wide">
                    Assets
                  </p>
                  <p className="text-lg font-bold">
                    {confirmedInvestments.length}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href="/investments"
                  className="flex-1 bg-white text-primary py-3 rounded-xl font-bold text-center text-sm"
                >
                  Invest More
                </Link>
                <Link
                  href="/transactions"
                  className="flex-1 bg-white/20 border border-white/30 backdrop-blur-sm py-3 rounded-xl font-bold text-center text-sm"
                >
                  Transactions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* My Assets */}
        <div className="px-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg">My Assets</h3>
              <p className="text-xs text-text-muted">
                {confirmedInvestments.length} active investment
                {confirmedInvestments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {investments.length === 0 ? (
            <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                account_balance_wallet
              </span>
              <p className="text-text-muted text-sm mb-1">
                No investments yet
              </p>
              <p className="text-text-muted text-xs mb-4">
                Start building your portfolio today
              </p>
              <Link
                href="/investments"
                className="inline-block px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {investments.map((investment) => {
                const estReturn =
                  Number(investment.amount) *
                  (Number(investment.project.apy) / 100);
                const currentValue =
                  Number(investment.amount) + estReturn;
                const performance =
                  Number(investment.amount) > 0
                    ? (estReturn / Number(investment.amount)) * 100
                    : 0;
                const gradient = getColorGradient(
                  investment.project.category
                );

                return (
                  <Link
                    key={investment.id}
                    href={`/portfolio/${investment.id}`}
                    className="block bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-800"
                  >
                    {/* Gradient Header */}
                    <div
                      className={`bg-gradient-to-r ${gradient} p-4 text-white`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <span className="material-symbols-outlined text-2xl">
                              {getCategoryIcon(investment.project.category)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-base mb-0.5">
                              {investment.project.ticker}
                            </h4>
                            <p className="text-xs text-white/80">
                              {investment.project.category
                                .replace("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l: string) =>
                                  l.toUpperCase()
                                )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/80 mb-0.5">
                            Current Value
                          </p>
                          <p className="font-bold text-xl">
                            ${formatCurrency(currentValue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                          <span className="material-symbols-outlined text-xs">
                            trending_up
                          </span>
                          <span className="text-xs font-bold">
                            +{performance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                          <span className="material-symbols-outlined text-xs">
                            location_on
                          </span>
                          <span className="text-xs font-medium">
                            {investment.project.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-text-muted uppercase mb-1">
                            Invested
                          </p>
                          <p className="text-sm font-bold">
                            $
                            {formatCurrency(Number(investment.amount), {
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase mb-1">
                            APY
                          </p>
                          <p className="text-sm font-bold text-accent">
                            {Number(investment.project.apy)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase mb-1">
                            Returns
                          </p>
                          <p className="text-sm font-bold text-primary">
                            +$
                            {formatCurrency(estReturn, {
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-text-muted uppercase mb-1">
                            Term
                          </p>
                          <p className="text-sm font-bold">
                            {investment.project.term} Mo
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        {getStatusBadge(investment.status)}
                        <span className="material-symbols-outlined text-text-muted">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Portfolio Insights */}
        {confirmedInvestments.length > 0 && (
          <div className="px-5 mt-6">
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">
                  lightbulb
                </span>
                <h3 className="font-bold text-lg">Portfolio Insights</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary shrink-0">
                      trending_up
                    </span>
                    <div className="text-sm">
                      <p className="font-bold mb-1">Earning Potential</p>
                      <p className="text-text-muted text-xs">
                        Your portfolio is generating an estimated $
                        {formatCurrency(estimatedReturn / 12, {
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                        })}{" "}
                        per month in returns.
                      </p>
                    </div>
                  </div>
                </div>

                {confirmedInvestments.length >= 2 && (
                  <div className="bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-xl p-4">
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-accent shrink-0">
                        diversity_3
                      </span>
                      <div className="text-sm">
                        <p className="font-bold mb-1">Diversified</p>
                        <p className="text-text-muted text-xs">
                          Your assets are spread across{" "}
                          {confirmedInvestments.length} investments, maintaining
                          balanced risk exposure.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
