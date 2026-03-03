import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { redirect } from "next/navigation";

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

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          Confirmed
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

  const totalInvested = investments
    .filter((inv) => inv.status === "CONFIRMED")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const estimatedReturn = investments
    .filter((inv) => inv.status === "CONFIRMED")
    .reduce((sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100), 0);

  return (
    <>
      <Header title="Portfolio" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        {/* Portfolio Summary Card */}
        <div className="mt-4 bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white shadow-glow">
          <p className="text-white/70 text-xs mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold mb-4">
            $
            {totalInvested.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="flex gap-6">
            <div>
              <p className="text-white/70 text-[10px]">Invested</p>
              <p className="text-sm font-bold">
                $
                {totalInvested.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-[10px]">Est. Annual Return</p>
              <p className="text-sm font-bold text-green-300">
                +$
                {estimatedReturn.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* My Investments Section */}
        <div className="mt-6">
          <h2 className="font-bold text-base mb-3">My Investments</h2>

          {investments.length === 0 ? (
            <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
              <span className="material-icons text-4xl text-text-muted mb-2">
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
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((investment) => {
                const estReturn =
                  Number(investment.amount) * (Number(investment.project.apy) / 100);

                return (
                  <Link
                    key={investment.id}
                    href={`/investments/${investment.project.id}`}
                    className="block bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="material-icons text-primary text-xl">
                          {getCategoryIcon(investment.project.category)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm truncate">
                              {investment.project.ticker} —{" "}
                              {investment.project.name}
                            </h3>
                            <p className="text-[10px] text-text-muted flex items-center gap-1">
                              <span className="material-icons text-[12px]">
                                location_on
                              </span>
                              {investment.project.location}
                            </p>
                          </div>
                          {getStatusBadge(investment.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-[10px] text-text-muted">
                              Invested
                            </p>
                            <p className="text-sm font-bold">
                              $
                              {Number(investment.amount).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-text-muted">APY</p>
                            <p className="text-sm font-bold text-accent">
                              {Number(investment.project.apy)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-text-muted">
                              Est. Return
                            </p>
                            <p className="text-sm font-bold text-green-500">
                              +$
                              {estReturn.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
