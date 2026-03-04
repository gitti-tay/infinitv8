"use client";

import { useEffect, useState } from "react";

interface YieldProject {
  id: string;
  name: string;
  ticker: string;
  apy: number;
  investors: number;
  totalInvested: number;
  lastDistribution: string | null;
}

interface RecentDistribution {
  id: string;
  projectName: string;
  amount: number;
  recipients: number;
  date: string;
}

const fallbackProjects: YieldProject[] = [
  { id: "1", name: "Seoul City Network", ticker: "SCN", apy: 12.5, investors: 142, totalInvested: 3900000, lastDistribution: "2026-02-15T00:00:00Z" },
  { id: "2", name: "Pacific Trade Fund", ticker: "PTF", apy: 14.2, investors: 98, totalInvested: 1950000, lastDistribution: "2026-02-15T00:00:00Z" },
  { id: "3", name: "Metro Dev District", ticker: "MDD", apy: 11.8, investors: 215, totalInvested: 7360000, lastDistribution: "2026-02-15T00:00:00Z" },
  { id: "4", name: "Gold Reserve Token", ticker: "GRT", apy: 8.5, investors: 67, totalInvested: 6750000, lastDistribution: null },
];

const fallbackDistributions: RecentDistribution[] = [
  { id: "d1", projectName: "Metro Dev District", amount: 72340, recipients: 215, date: "2026-02-15T09:00:00Z" },
  { id: "d2", projectName: "Seoul City Network", amount: 40625, recipients: 142, date: "2026-02-15T09:00:00Z" },
  { id: "d3", projectName: "Pacific Trade Fund", amount: 23075, recipients: 98, date: "2026-02-15T09:00:00Z" },
  { id: "d4", projectName: "Metro Dev District", amount: 71800, recipients: 210, date: "2026-01-15T09:00:00Z" },
  { id: "d5", projectName: "Seoul City Network", amount: 39500, recipients: 138, date: "2026-01-15T09:00:00Z" },
];

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminYieldPage() {
  const [projects, setProjects] = useState<YieldProject[]>([]);
  const [distributions, setDistributions] = useState<RecentDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/yield");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProjects(data.projects || fallbackProjects);
        setDistributions(data.recentDistributions || fallbackDistributions);
      } catch {
        setProjects(fallbackProjects);
        setDistributions(fallbackDistributions);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalDistributed = fallbackDistributions.reduce((s, d) => s + d.amount, 0);
  const monthlyDistribution = fallbackDistributions
    .filter((d) => new Date(d.date).getMonth() === new Date().getMonth())
    .reduce((s, d) => s + d.amount, 0);

  async function handleDistribute(projectId: string) {
    setDistributing(projectId);
    try {
      await fetch(`/api/admin/yield/distribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
    } catch {
      // ignore
    } finally {
      setDistributing(null);
    }
  }

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Yield Engine</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Manage yield distributions across projects
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-accent opacity-[0.06]" />
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Total Distributed
          </div>
          <div className="text-2xl font-extrabold font-mono text-accent-light">
            {formatCurrency(totalDistributed)}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">All time</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-amber opacity-[0.06]" />
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Pending Payouts
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber">
            {projects.filter((p) => !p.lastDistribution || new Date(p.lastDistribution) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)).length}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">Projects due</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-purple opacity-[0.06]" />
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide mb-1">
            Monthly Distribution
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple">
            {formatCurrency(monthlyDistribution)}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">Current month</p>
        </div>
      </div>

      {/* Projects with distribute button */}
      <h2 className="text-base font-bold text-text-primary mb-3">Projects</h2>
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Project</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">APY</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Investors</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Total Invested</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Last Distribution</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-text-primary">{project.name}</div>
                      <div className="text-xs font-mono text-text-muted">{project.ticker}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-accent-light">
                      {project.apy}%
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">
                      {project.investors}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-primary">
                      {formatCurrency(project.totalInvested)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {project.lastDistribution ? formatDate(project.lastDistribution) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDistribute(project.id)}
                        disabled={distributing === project.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded bg-purple/10 text-purple hover:bg-purple/20 transition-colors disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-sm">payments</span>
                        {distributing === project.id ? "Processing..." : "Distribute Yield"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent distributions */}
      <h2 className="text-base font-bold text-text-primary mb-3">Recent Distributions</h2>
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Project</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Recipients</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {distributions.map((dist) => (
                <tr key={dist.id} className="hover:bg-background-tertiary transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                    {dist.projectName}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-accent-light">
                    ${dist.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{dist.recipients}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{formatDate(dist.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
