"use client";

import { useEffect, useState } from "react";

interface ProjectRow {
  id: string;
  name: string;
  ticker: string;
  category: string;
  apy: number;
  status: string;
  raisedPercent: number;
  investors: number;
  targetAmount: number;
}

const fallbackProjects: ProjectRow[] = [
  { id: "1", name: "Seoul City Network", ticker: "SCN", category: "HEALTHCARE", apy: 12.5, status: "ACTIVE", raisedPercent: 78, investors: 142, targetAmount: 5000000 },
  { id: "2", name: "Pacific Trade Fund", ticker: "PTF", category: "AGRICULTURE", apy: 14.2, status: "ACTIVE", raisedPercent: 65, investors: 98, targetAmount: 3000000 },
  { id: "3", name: "Metro Dev District", ticker: "MDD", category: "REAL_ESTATE", apy: 11.8, status: "ACTIVE", raisedPercent: 92, investors: 215, targetAmount: 8000000 },
  { id: "4", name: "Green Valley AgriCo", ticker: "GVA", category: "AGRICULTURE", apy: 15.0, status: "COMING_SOON", raisedPercent: 0, investors: 0, targetAmount: 2000000 },
  { id: "5", name: "Harbor Bridge Complex", ticker: "HBC", category: "REAL_ESTATE", apy: 10.5, status: "SOLD_OUT", raisedPercent: 100, investors: 310, targetAmount: 10000000 },
  { id: "6", name: "Gold Reserve Token", ticker: "GRT", category: "COMMODITIES", apy: 8.5, status: "ACTIVE", raisedPercent: 45, investors: 67, targetAmount: 15000000 },
];

function categoryLabel(cat: string) {
  switch (cat) {
    case "REAL_ESTATE": return "Real Estate";
    case "AGRICULTURE": return "Agriculture";
    case "HEALTHCARE": return "Healthcare";
    case "COMMODITIES": return "Commodities";
    default: return cat;
  }
}

function categoryBadge(cat: string) {
  const colors: Record<string, string> = {
    HEALTHCARE: "bg-primary/10 text-primary-light",
    AGRICULTURE: "bg-accent/10 text-accent-light",
    REAL_ESTATE: "bg-purple/10 text-purple",
    COMMODITIES: "bg-amber/10 text-amber",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${colors[cat] || "bg-background-tertiary text-text-muted"}`}>
      {categoryLabel(cat)}
    </span>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent-light font-semibold">
          Active
        </span>
      );
    case "SOLD_OUT":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/10 text-destructive font-semibold">
          Sold Out
        </span>
      );
    case "COMING_SOON":
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-cyan/10 text-cyan font-semibold">
          Coming Soon
        </span>
      );
    default:
      return null;
  }
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const mapped: ProjectRow[] = (data.projects || data).map(
          (p: Record<string, unknown>) => ({
            id: p.id,
            name: p.name,
            ticker: p.ticker,
            category: p.category,
            apy: Number(p.apy),
            status: p.status,
            raisedPercent: Number(p.raisedPercent),
            investors: Number(p.investors ?? 0),
            targetAmount: Number(p.targetAmount),
          })
        );
        setProjects(mapped.length > 0 ? mapped : fallbackProjects);
      } catch {
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="p-5 md:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Projects</h1>
          <p className="text-[13px] text-text-muted mt-1">
            Manage investment projects on the platform
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-semibold hover:bg-primary-dark transition-colors">
          <span className="material-symbols-outlined text-base">add</span>
          Create Project
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background-tertiary">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Ticker</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">APY</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Funded</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">Investors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-16 bg-background-tertiary rounded animate-shimmer" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-text-muted">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-background-tertiary transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-text-secondary">
                      {project.ticker}
                    </td>
                    <td className="px-4 py-3">{categoryBadge(project.category)}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-accent-light">
                      {project.apy}%
                    </td>
                    <td className="px-4 py-3">{statusBadge(project.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(project.raisedPercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted font-mono">
                          {project.raisedPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary font-mono">
                      {project.investors}
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
