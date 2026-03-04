"use client";

import { useCallback, useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  kycStatus: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const fallbackUsers: UserRow[] = [
  { id: "1", name: "Sarah Kim", email: "sarah.k@email.com", role: "INVESTOR", kycStatus: "APPROVED", createdAt: "2025-11-15T00:00:00Z" },
  { id: "2", name: "James Park", email: "james.p@email.com", role: "INVESTOR", kycStatus: "APPROVED", createdAt: "2025-12-01T00:00:00Z" },
  { id: "3", name: "Lisa Chen", email: "lisa.c@email.com", role: "INVESTOR", kycStatus: "PENDING", createdAt: "2026-01-10T00:00:00Z" },
  { id: "4", name: "Tom Wilson", email: "tom.w@email.com", role: "INVESTOR", kycStatus: "NONE", createdAt: "2026-02-05T00:00:00Z" },
  { id: "5", name: "Admin JK", email: "admin@infinitv8.com", role: "ADMIN", kycStatus: "APPROVED", createdAt: "2025-06-01T00:00:00Z" },
  { id: "6", name: "Wei Zhang", email: "wei.z@email.com", role: "INVESTOR", kycStatus: "PENDING", createdAt: "2026-02-20T00:00:00Z" },
  { id: "7", name: "Maria Santos", email: "maria.s@email.com", role: "INVESTOR", kycStatus: "REJECTED", createdAt: "2026-01-25T00:00:00Z" },
  { id: "8", name: "Alex Petrov", email: "alex.p@email.com", role: "INVESTOR", kycStatus: "PENDING", createdAt: "2026-02-28T00:00:00Z" },
];

function roleBadge(role: string) {
  if (role === "ADMIN") {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-semibold">
        Admin
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-semibold">
      Investor
    </span>
  );
}

function kycBadge(status: string) {
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
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-background-tertiary text-text-muted font-semibold">
          None
        </span>
      );
  }
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (kycFilter) params.set("kycStatus", kycFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch {
      setUsers(fallbackUsers);
      setPagination({ page: 1, limit: 20, total: fallbackUsers.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, kycFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
          <p className="text-[13px] text-text-muted mt-1">
            Manage platform users and their roles
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          {pagination.total} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined text-lg text-text-muted absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-primary"
        >
          <option value="">All Roles</option>
          <option value="INVESTOR">Investor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className="px-3 py-2.5 bg-background-tertiary border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:border-primary"
        >
          <option value="">All KYC</option>
          <option value="NONE">None</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Email</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">KYC Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-background-tertiary rounded animate-shimmer" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {user.name || "Unnamed"}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">{kycBadge(user.kycStatus)}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatJoinDate(user.createdAt)}
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
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-background-tertiary border border-border text-text-secondary disabled:opacity-40 hover:text-text-primary transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
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
