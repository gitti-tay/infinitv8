"use client";

import { useCallback, useEffect, useState } from "react";

interface KycItem {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  status: string;
  createdAt: string;
}

interface KycStats {
  pending: number;
  approved: number;
  rejected: number;
}

const fallbackQueue: KycItem[] = [
  { id: "k1", userId: "u1", userName: "Wei Zhang", userEmail: "wei.z@email.com", status: "PENDING", createdAt: "2026-02-28T08:15:00Z" },
  { id: "k2", userId: "u2", userName: "Maria Santos", userEmail: "maria.s@email.com", status: "PENDING", createdAt: "2026-02-27T19:30:00Z" },
  { id: "k3", userId: "u3", userName: "Alex Petrov", userEmail: "alex.p@email.com", status: "PENDING", createdAt: "2026-02-27T14:45:00Z" },
];

const fallbackStats: KycStats = { pending: 3, approved: 42, rejected: 5 };

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function statusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent-light font-semibold">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-amber/10 text-amber font-semibold">
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-semibold">
          Rejected
        </span>
      );
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

export default function AdminKycPage() {
  const [queue, setQueue] = useState<KycItem[]>([]);
  const [stats, setStats] = useState<KycStats>(fallbackStats);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/kyc?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setQueue(data.queue);
      setStats(data.stats);
    } catch {
      setQueue(fallbackQueue);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  async function handleAction(userId: string, status: "APPROVED" | "REJECTED") {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        await fetchQueue();
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
        <h1 className="text-2xl font-extrabold tracking-tight">KYC Queue</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Review and manage identity verifications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Pending
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber">{stats.pending}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Approved
          </div>
          <div className="text-2xl font-extrabold font-mono text-accent-light">{stats.approved}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Rejected
          </div>
          <div className="text-2xl font-extrabold font-mono text-destructive">{stats.rejected}</div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-background-tertiary rounded-md p-0.5 mb-5 w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 text-[13px] font-medium rounded transition-colors ${
              statusFilter === tab.value
                ? "bg-destructive text-white"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Submitted</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-background-tertiary rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">
                    No KYC verifications found
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {item.userName || "Unnamed"}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{item.userEmail}</td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {item.status === "PENDING" ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAction(item.userId, "APPROVED")}
                            disabled={actionLoading === item.userId}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-accent/10 text-accent-light hover:bg-accent/20 transition-colors disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(item.userId, "REJECTED")}
                            disabled={actionLoading === item.userId}
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
