"use client";

import { useCallback, useEffect, useState } from "react";

interface TransactionRow {
  id: string;
  userName: string;
  type: string;
  asset: string;
  amount: number;
  status: string;
  createdAt: string;
}

const fallbackTransactions: TransactionRow[] = [
  { id: "t1", userName: "Sarah Kim", type: "DEPOSIT", asset: "USDT", amount: 15000, status: "PENDING", createdAt: "2026-02-28T12:34:00Z" },
  { id: "t2", userName: "James Park", type: "DEPOSIT", asset: "USD", amount: 8500, status: "PENDING", createdAt: "2026-02-28T11:22:00Z" },
  { id: "t3", userName: "Lisa Chen", type: "WITHDRAWAL", asset: "USDC", amount: 5000, status: "PENDING", createdAt: "2026-02-28T10:15:00Z" },
  { id: "t4", userName: "Tom Wilson", type: "DEPOSIT", asset: "USDT", amount: 12000, status: "COMPLETED", createdAt: "2026-02-28T09:47:00Z" },
  { id: "t5", userName: "Ana Rodriguez", type: "WITHDRAWAL", asset: "USD", amount: 3800, status: "COMPLETED", createdAt: "2026-02-27T22:08:00Z" },
  { id: "t6", userName: "Wei Zhang", type: "INVESTMENT", asset: "SCN", amount: 10000, status: "COMPLETED", createdAt: "2026-02-27T16:30:00Z" },
  { id: "t7", userName: "Maria Santos", type: "YIELD", asset: "USDT", amount: 125.5, status: "COMPLETED", createdAt: "2026-02-27T12:00:00Z" },
  { id: "t8", userName: "Alex Petrov", type: "DEPOSIT", asset: "USDT", amount: 25000, status: "FAILED", createdAt: "2026-02-26T15:20:00Z" },
];

const typeFilters = [
  { label: "All Types", value: "" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Withdrawal", value: "WITHDRAWAL" },
  { label: "Investment", value: "INVESTMENT" },
  { label: "Yield", value: "YIELD" },
];

const statusFilters = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    DEPOSIT: "bg-accent/10 text-accent-light",
    WITHDRAWAL: "bg-destructive/10 text-destructive",
    INVESTMENT: "bg-primary/10 text-primary-light",
    YIELD: "bg-purple/10 text-purple",
    TRANSFER: "bg-cyan/10 text-cyan",
    FEE: "bg-amber/10 text-amber",
  };
  const labels: Record<string, string> = {
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    INVESTMENT: "Investment",
    YIELD: "Yield",
    TRANSFER: "Transfer",
    FEE: "Fee",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${colors[type] || "bg-background-tertiary text-text-muted"}`}>
      {labels[type] || type}
    </span>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent-light font-semibold">Completed</span>;
    case "PENDING":
      return <span className="px-2 py-0.5 text-xs rounded-full bg-amber/10 text-amber font-semibold">Pending</span>;
    case "FAILED":
      return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-semibold">Failed</span>;
    case "CANCELLED":
      return <span className="px-2 py-0.5 text-xs rounded-full bg-background-tertiary text-text-muted font-semibold">Cancelled</span>;
    default:
      return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/transactions?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch {
      // filter fallback data client-side
      let filtered = fallbackTransactions;
      if (typeFilter) filtered = filtered.filter((t) => t.type === typeFilter);
      if (statusFilter) filtered = filtered.filter((t) => t.status === statusFilter);
      setTransactions(filtered);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function handleAction(txId: string, action: "approve" | "reject") {
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "COMPLETED" : "CANCELLED",
        }),
      });
      if (res.ok) {
        await fetchTransactions();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Transactions</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Review and manage platform transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-primary"
        >
          {typeFilters.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-primary"
        >
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Asset</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-muted">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {tx.userName}
                    </td>
                    <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">{tx.asset}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-text-primary">
                      ${formatAmount(tx.amount)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(tx.status)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      {tx.status === "PENDING" ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAction(tx.id, "approve")}
                            disabled={actionLoading === tx.id}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(tx.id, "reject")}
                            disabled={actionLoading === tx.id}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
