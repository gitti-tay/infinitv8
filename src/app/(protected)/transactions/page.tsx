import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { redirect } from "next/navigation";

const FILTER_TABS = [
  { label: "All", value: undefined },
  { label: "Deposits", value: "DEPOSIT" },
  { label: "Withdrawals", value: "WITHDRAWAL" },
  { label: "Yields", value: "YIELD" },
  { label: "Investments", value: "INVESTMENT" },
] as const;

function getTypeConfig(type: string) {
  switch (type) {
    case "DEPOSIT":
      return { icon: "arrow_downward", color: "text-accent", bg: "bg-accent/10", sign: "+" };
    case "WITHDRAWAL":
      return { icon: "arrow_upward", color: "text-destructive", bg: "bg-destructive/10", sign: "-" };
    case "YIELD":
      return { icon: "payments", color: "text-amber", bg: "bg-amber/10", sign: "+" };
    case "INVESTMENT":
      return { icon: "trending_up", color: "text-primary", bg: "bg-primary/10", sign: "-" };
    case "TRANSFER":
      return { icon: "swap_horiz", color: "text-primary", bg: "bg-primary/10", sign: "" };
    case "FEE":
      return { icon: "receipt_long", color: "text-text-muted", bg: "bg-background-tertiary", sign: "-" };
    default:
      return { icon: "receipt_long", color: "text-text-muted", bg: "bg-background-tertiary", sign: "" };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-accent/10 text-accent";
    case "PENDING":
      return "bg-amber/10 text-amber";
    case "FAILED":
      return "bg-destructive/10 text-destructive";
    case "CANCELLED":
      return "bg-background-tertiary text-text-muted";
    default:
      return "bg-background-tertiary text-text-muted";
  }
}

/** Truncate a tx hash for display: 0x1234...abcd */
function truncateHash(hash: string): string {
  if (hash.length <= 13) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

interface TransactionsPageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { filter, q } = await searchParams;

  /* ── Fetch real transactions from the database ── */
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { name: true, ticker: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  /* ── Stats ── */
  const totalInvested = transactions
    .filter((tx) => tx.type === "INVESTMENT" && tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const pendingCount = transactions.filter(
    (tx) => tx.status === "PENDING"
  ).length;

  /* ── Apply filters to real transactions ── */
  let filteredTx = transactions;
  if (filter) {
    filteredTx = filteredTx.filter((tx) => tx.type === filter);
  }
  if (q) {
    const query = q.toLowerCase();
    filteredTx = filteredTx.filter(
      (tx) =>
        tx.asset.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        (tx.txHash?.toLowerCase().includes(query) ?? false) ||
        (tx.project?.name?.toLowerCase().includes(query) ?? false) ||
        (tx.project?.ticker?.toLowerCase().includes(query) ?? false)
    );
  }

  const buildUrl = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (params.filter) sp.set("filter", params.filter);
    if (params.q) sp.set("q", params.q);
    const qs = sp.toString();
    return `/transactions${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <Header title="Transaction History" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center">
            <span className="material-symbols-outlined text-2xl text-accent mb-1 block">
              account_balance
            </span>
            <p className="text-lg font-bold text-text-primary">
              ${formatCurrency(totalInvested, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-text-muted">Total Invested</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center">
            <span className="material-symbols-outlined text-2xl text-primary mb-1 block">
              receipt_long
            </span>
            <p className="text-lg font-bold text-text-primary">
              {transactions.length}
            </p>
            <p className="text-[10px] text-text-muted">Transaction Count</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center">
            <span className="material-symbols-outlined text-2xl text-amber mb-1 block">
              pending
            </span>
            <p className="text-lg font-bold text-text-primary">
              {pendingCount}
            </p>
            <p className="text-[10px] text-text-muted">Pending Count</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4">
          {FILTER_TABS.map((tab) => {
            const isActive = filter ? filter === tab.value : !tab.value;
            return (
              <Link
                key={tab.label}
                href={buildUrl({
                  filter: tab.value,
                  q: q ?? undefined,
                })}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-card border border-border text-text-muted hover:border-primary"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6">
          <form method="GET" className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">
              search
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {filter && <input type="hidden" name="filter" value={filter} />}
          </form>
        </div>

        {/* Transaction Table */}
        {filteredTx.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-text-muted">
                receipt_long
              </span>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">No Transactions</h3>
            <p className="text-sm text-text-muted">
              {transactions.length === 0
                ? "You have no transactions yet"
                : "No transactions match your filters"}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            {/* Table Header (desktop) */}
            <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_1fr_0.7fr_0.8fr_0.8fr] gap-4 px-6 py-3 border-b border-border text-[11px] text-text-muted font-semibold uppercase tracking-wider">
              <span>Type</span>
              <span>Asset</span>
              <span className="text-right">Amount</span>
              <span>Status</span>
              <span>Date</span>
              <span>TX Hash</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filteredTx.map((tx) => {
                const config = getTypeConfig(tx.type);
                const statusClass = getStatusBadge(tx.status);
                const amountColor =
                  config.sign === "+" ? "text-accent" : "text-destructive";
                const displayAsset = tx.project?.ticker ?? tx.asset;
                const displayHash = tx.txHash ? truncateHash(tx.txHash) : null;
                const basescanUrl = tx.txHash
                  ? `https://basescan.org/tx/${tx.txHash}`
                  : null;

                return (
                  <div
                    key={tx.id}
                    className="px-4 md:px-6 py-4 hover:bg-card-hover transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="flex items-center gap-3 md:hidden">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <span
                          className={`material-symbols-outlined ${config.color} text-lg`}
                        >
                          {config.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary capitalize">
                            {tx.type.toLowerCase()}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusClass}`}
                          >
                            {tx.status.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {displayAsset} &middot;{" "}
                          {tx.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${amountColor}`}>
                          {config.sign}${formatCurrency(Number(tx.amount), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {displayHash && (
                          basescanUrl ? (
                            <a
                              href={basescanUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary font-mono hover:underline"
                            >
                              {displayHash}
                            </a>
                          ) : (
                            <p className="text-[10px] text-text-muted font-mono">
                              {displayHash}
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:grid md:grid-cols-[1fr_0.8fr_1fr_0.7fr_0.8fr_0.8fr] gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
                        >
                          <span
                            className={`material-symbols-outlined ${config.color} text-base`}
                          >
                            {config.icon}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary capitalize">
                          {tx.type.toLowerCase()}
                        </span>
                      </div>
                      <span className="text-sm text-text-secondary font-medium">
                        {displayAsset}
                      </span>
                      <span className={`text-sm font-bold text-right ${amountColor}`}>
                        {config.sign}${formatCurrency(Number(tx.amount), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${statusClass}`}
                      >
                        {tx.status.toLowerCase()}
                      </span>
                      <span className="text-xs text-text-muted">
                        {tx.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {basescanUrl ? (
                        <a
                          href={basescanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary font-mono hover:underline"
                        >
                          {displayHash}
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted font-mono">
                          {displayHash ?? "—"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
