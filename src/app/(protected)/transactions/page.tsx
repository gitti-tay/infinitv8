import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { formatCurrency } from "@/lib/utils/format";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
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

  const pendingCount = investments.filter(
    (inv) => inv.status === "PENDING"
  ).length;

  return (
    <>
      <Header title="Transaction History" />
      <div className="pt-16 pb-24 px-5 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gradient-to-br from-accent to-green-600 rounded-2xl p-4 text-white">
            <span className="material-symbols-outlined text-2xl mb-2 opacity-80">
              arrow_downward
            </span>
            <p className="text-xs opacity-80 mb-1">Invested</p>
            <p className="text-lg font-bold">
              ${formatCurrency(totalInvested, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-4 text-white">
            <span className="material-symbols-outlined text-2xl mb-2 opacity-80">
              receipt_long
            </span>
            <p className="text-xs opacity-80 mb-1">Transactions</p>
            <p className="text-lg font-bold">{investments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
            <span className="material-symbols-outlined text-2xl mb-2 opacity-80">
              pending
            </span>
            <p className="text-xs opacity-80 mb-1">Pending</p>
            <p className="text-lg font-bold">{pendingCount}</p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-4">All Transactions</h3>

          {investments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-text-muted">
                  receipt_long
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">No Transactions</h3>
              <p className="text-sm text-text-muted">
                You haven&apos;t made any transactions yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">
                          arrow_downward
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">Investment</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              inv.status === "CONFIRMED"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : inv.status === "PENDING"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                            }`}
                          >
                            {inv.status.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {inv.project.ticker} — {inv.project.name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(inv.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-accent">
                          ${formatCurrency(Number(inv.amount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-text-muted">
                          {Number(inv.project.apy)}% APY
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Term</span>
                        <span className="font-medium">
                          {inv.project.term} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Transaction ID</span>
                        <span className="font-mono font-medium truncate ml-2 max-w-[140px]">
                          {inv.id.slice(0, 8)}...{inv.id.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
