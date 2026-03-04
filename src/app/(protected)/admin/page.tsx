"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardMetrics {
  totalUsers: number;
  pendingKyc: number;
  activeProjects: number;
  totalTransactions: number;
}

const fallbackMetrics: DashboardMetrics = {
  totalUsers: 2847,
  pendingKyc: 3,
  activeProjects: 8,
  totalTransactions: 1234,
};

const quickLinks = [
  {
    label: "Users",
    href: "/admin/users",
    icon: "group",
    description: "Manage user accounts and roles",
    color: "text-primary-light",
    bg: "bg-primary",
  },
  {
    label: "KYC Queue",
    href: "/admin/kyc",
    icon: "id_card",
    description: "Review identity verifications",
    color: "text-amber",
    bg: "bg-amber",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: "business_center",
    description: "Manage investment projects",
    color: "text-purple",
    bg: "bg-purple",
  },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: "receipt_long",
    description: "Review pending transactions",
    color: "text-accent-light",
    bg: "bg-accent",
  },
  {
    label: "Yield Engine",
    href: "/admin/yield",
    icon: "payments",
    description: "Distribute investor yields",
    color: "text-cyan",
    bg: "bg-cyan",
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    icon: "history",
    description: "View admin activity history",
    color: "text-text-secondary",
    bg: "bg-text-muted",
  },
];

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(fallbackMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [usersRes, kycRes] = await Promise.all([
          fetch("/api/admin/users?limit=1").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/admin/kyc?limit=1").then((r) => (r.ok ? r.json() : null)),
        ]);
        setMetrics({
          totalUsers: usersRes?.stats?.totalUsers ?? fallbackMetrics.totalUsers,
          pendingKyc: kycRes?.stats?.pending ?? fallbackMetrics.pendingKyc,
          activeProjects: fallbackMetrics.activeProjects,
          totalTransactions: fallbackMetrics.totalTransactions,
        });
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const hasPending = metrics.pendingKyc > 0;

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-[13px] text-text-muted mt-1">Platform overview and quick actions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">System Status</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent-light">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Operational
          </span>
        </div>
      </div>

      {/* Alert banner */}
      {hasPending && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber/10 border border-amber/20 text-amber mb-5">
          <span className="material-symbols-outlined text-base">warning</span>
          <span className="text-[13px] font-medium">
            {metrics.pendingKyc} pending KYC verification{metrics.pendingKyc !== 1 ? "s" : ""} require
            attention
          </span>
          <Link
            href="/admin/kyc"
            className="ml-auto text-xs font-semibold underline hover:no-underline"
          >
            Review now
          </Link>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon="group"
          color="text-primary-light"
          glow="bg-primary"
          sub="+23 this week"
          loading={loading}
        />
        <MetricCard
          label="Pending KYC"
          value={metrics.pendingKyc.toString()}
          icon="id_card"
          color="text-amber"
          glow="bg-amber"
          sub="Avg. review: 4.2h"
          loading={loading}
        />
        <MetricCard
          label="Active Projects"
          value={metrics.activeProjects.toString()}
          icon="business_center"
          color="text-purple"
          glow="bg-purple"
          sub="$48.2M total funded"
          loading={loading}
        />
        <MetricCard
          label="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          icon="receipt_long"
          color="text-accent-light"
          glow="bg-accent"
          sub="5 pending approval"
          loading={loading}
        />
      </div>

      {/* Quick Access Cards */}
      <h2 className="text-base font-bold text-text-primary mb-3">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-card border border-border rounded-xl p-5 shadow-soft hover:border-border-light transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${link.bg}/10 flex items-center justify-center shrink-0`}
              >
                <span className={`material-symbols-outlined text-xl ${link.color}`}>
                  {link.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{link.description}</p>
              </div>
              <span className="material-symbols-outlined text-lg text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
  glow,
  sub,
  loading,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  glow: string;
  sub: string;
  loading: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden">
      <div className={`absolute -top-4 -right-4 w-14 h-14 rounded-full ${glow} opacity-[0.06]`} />
      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
        <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
        {label}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-background-tertiary rounded animate-shimmer" />
      ) : (
        <div className={`text-2xl font-extrabold tracking-tight font-mono ${color}`}>{value}</div>
      )}
      <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>
    </div>
  );
}
