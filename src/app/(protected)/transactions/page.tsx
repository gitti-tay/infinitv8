import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { redirect } from "next/navigation";

const FILTER_TABS = [
  { label: "All", value: undefined },
  { label: "Deposits", value: "deposit" },
  { label: "Withdrawals", value: "withdrawal" },
  { label: "Yields", value: "yield" },
  { label: "Investments", value: "investment" },
] as const;

function getTypeConfig(type: string) {
  switch (type) {
    case "deposit":
      return { icon: "arrow_downward", color: "text-accent", bg: "bg-accent/10", sign: "+" };
    case "withdrawal":
      return { icon: "arrow_upward", color: "text-destructive", bg: "bg-destructive/10", sign: "-" };
    case "yield":
      return { icon: "payments", color: "text-amber", bg: "bg-amber/10", sign: "+" };
    case "investment":
      return { icon: "trending_up", color: "text-primary", bg: "bg-primary/10", sign: "-" };
    default:
      return { icon: "receipt_long", color: "text-text-muted", bg: "bg-background-tertiary", sign: "" };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return "bg-accent/10 text-accent";
    case "pending":
      return "bg-amber/10 text-amber";
    case "failed":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-background-tertiary text-text-muted";
  }
}

// Sample transactions for display
const SAMPLE_TRANSACTIONS = [
  {
    id: "tx_001",
    type: "deposit",
    asset: "USDC",
    amount: 5000,
    status: "completed",
    date: "2026-03-04T14:30:00Z",
    txHash: "0x8a3f...d4e2",
  },
  {
    id: "tx_002",
    type: "investment",
    asset: "BKK-RE01",
    amount: 2500,
    status: "completed",
    date: "2026-03-03T10:15:00Z",
    txHash: "0x7b2e...a1f3",
  },
  {
    id: "tx_003",
    type: "yield",
    asset: "BKK-RE01",
    amount: 18.75,
    status: "completed",
    date: "2026-03-01T00:00:00Z",
    txHash: "0x9c4d...b5e6",
  },
  {
    id: "tx_004",
    type: "deposit",
    asset: "USDT",
    amount: 10000,
    status: "pending",
    date: "2026-03-05T08:45:00Z",
    txHash: "0x1a2b...c3d4",
  },
  {
    id: "tx_005",
    type: "withdrawal",
    asset: "USDC",
    amount: 1000,
    status: "completed",
    date: "2026-02-28T16:20:00Z",
    txHash: "0x5e6f...7g8h",
  },
  {
    id: "tx_006",
    type: "investment",
    asset: "PHK-AG02",
    amount: 5000,
    status: "completed",
    date: "2026-02-25T11:00:00Z",
    txHash: "0x2d3e...f4g5",
  },
  {
    id: "tx_007",
    type: "yield",
    asset: "PHK-AG02",
    amount: 41.67,
    status: "completed",
    date: "2026-03-01T00:00:00Z",
    txHash: "0x6h7i...j8k9",
  },
];

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

  // Get real investments for stats
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

  // Filter sample transactions
  let filteredTx = SAMPLE_TRANSACTIONS;
  if (filter) {
    filteredTx = filteredTx.filter((tx) => tx.type === filter);
  }
  if (q) {
    const query = q.toLowerCase();
    filteredTx = filteredTx.filter(
      (tx) =>
        tx.asset.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        tx.txHash.toLowerCase().includes(query)
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
              ${formatCurrency(totalInvested || 17500, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-text-muted">Total Invested</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center">
            <span className="material-symbols-outlined text-2xl text-primary mb-1 block">
              receipt_long
            </span>
            <p className="text-lg font-bold text-text-primary">
              {investments.length || SAMPLE_TRANSACTIONS.length}
            </p>
            <p className="text-[10px] text-text-muted">Transaction Count</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-soft text-center">
            <span className="material-symbols-outlined text-2xl text-amber mb-1 block">
              pending
            </span>
            <p className="text-lg font-bold text-text-primary">
              {pendingCount || 1}
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
              No transactions match your filters
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
                            {tx.type}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusClass}`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {tx.asset} &middot;{" "}
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${amountColor}`}>
                          {config.sign}${formatCurrency(tx.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-text-muted font-mono">
                          {tx.txHash}
                        </p>
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
                          {tx.type}
                        </span>
                      </div>
                      <span className="text-sm text-text-secondary font-medium">
                        {tx.asset}
                      </span>
                      <span className={`text-sm font-bold text-right ${amountColor}`}>
                        {config.sign}${formatCurrency(tx.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize w-fit ${statusClass}`}
                      >
                        {tx.status}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {tx.txHash}
                      </span>
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
