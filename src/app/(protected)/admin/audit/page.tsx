"use client";

import { useCallback, useEffect, useState } from "react";

interface AuditEntry {
  id: string;
  adminName: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const fallbackAuditLog: AuditEntry[] = [
  { id: "a1", adminName: "Admin JK", action: "DEPOSIT_APPROVED", target: "Sarah Kim", details: { amount: "$15,000 USDT" }, createdAt: "2026-02-28T12:45:00Z" },
  { id: "a2", adminName: "Admin JK", action: "KYC_APPROVED", target: "Wei Zhang", details: { document: "Passport verified" }, createdAt: "2026-02-28T11:30:00Z" },
  { id: "a3", adminName: "System", action: "SETTINGS_UPDATED", target: "Platform", details: { setting: "deposit_max: 100000" }, createdAt: "2026-02-28T10:20:00Z" },
  { id: "a4", adminName: "System", action: "YIELD_DISTRIBUTED", target: "All Investors", details: { amount: "$42,350 distributed" }, createdAt: "2026-02-28T09:00:00Z" },
  { id: "a5", adminName: "Admin JK", action: "WITHDRAWAL_REJECTED", target: "Suspicious User", details: { amount: "$25,000", reason: "AML flag" }, createdAt: "2026-02-27T23:15:00Z" },
  { id: "a6", adminName: "Admin JK", action: "BALANCE_ADJUSTED", target: "Tom Wilson", details: { amount: "+$500 correction" }, createdAt: "2026-02-27T18:00:00Z" },
  { id: "a7", adminName: "Admin JK", action: "KYC_REJECTED", target: "Maria Santos", details: { reason: "Document expired" }, createdAt: "2026-02-27T16:30:00Z" },
  { id: "a8", adminName: "System", action: "USER_REGISTERED", target: "Alex Petrov", details: null, createdAt: "2026-02-27T14:45:00Z" },
];

const actionTypes = [
  { label: "All Actions", value: "" },
  { label: "KYC Review", value: "KYC" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Withdrawal", value: "WITHDRAWAL" },
  { label: "Yield", value: "YIELD" },
  { label: "Settings", value: "SETTINGS" },
  { label: "Balance", value: "BALANCE" },
];

function actionBadge(action: string) {
  if (action.includes("APPROVED") || action.includes("CONFIRMED")) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent-light font-semibold">{formatAction(action)}</span>;
  }
  if (action.includes("REJECTED") || action.includes("FAILED")) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-semibold">{formatAction(action)}</span>;
  }
  if (action.includes("YIELD") || action.includes("DISTRIBUTED")) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-purple/10 text-purple font-semibold">{formatAction(action)}</span>;
  }
  if (action.includes("SETTINGS") || action.includes("UPDATED")) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary-light font-semibold">{formatAction(action)}</span>;
  }
  if (action.includes("BALANCE") || action.includes("ADJUSTED")) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-amber/10 text-amber font-semibold">{formatAction(action)}</span>;
  }
  return <span className="px-2 py-0.5 text-xs rounded-full bg-background-tertiary text-text-muted font-semibold">{formatAction(action)}</span>;
}

function formatAction(action: string) {
  return action
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function detailsText(details: Record<string, unknown> | null): string {
  if (!details) return "--";
  const values = Object.values(details);
  return values.map(String).join(", ");
}

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAuditLog = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (actionFilter) params.set("action", actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setEntries(data.entries || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch {
      let filtered = fallbackAuditLog;
      if (actionFilter) {
        filtered = filtered.filter((e) => e.action.includes(actionFilter));
      }
      setEntries(filtered);
      setPagination({ page: 1, limit: 20, total: filtered.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAuditLog(1);
  }, [fetchAuditLog]);

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Audit Log</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Track all admin actions and system events
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-primary"
        >
          {actionTypes.map((f) => (
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
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Admin</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Action</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Target</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Details</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 bg-background-tertiary rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">
                    No audit log entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {entry.adminName}
                    </td>
                    <td className="px-4 py-3">{actionBadge(entry.action)}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {entry.target || "--"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-text-muted max-w-[200px] truncate">
                      {detailsText(entry.details)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchAuditLog(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-background-tertiary border border-border text-text-secondary disabled:opacity-40 hover:text-text-primary transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchAuditLog(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-background-tertiary border border-border text-text-secondary disabled:opacity-40 hover:text-text-primary transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
