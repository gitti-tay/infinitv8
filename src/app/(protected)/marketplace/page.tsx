"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import {
  getCategoryIcon,
  getCategoryLabel,
  getRiskBadgeColor,
  getRiskLabelShort,
} from "@/lib/utils/format";

interface Project {
  id: string;
  name: string;
  ticker: string;
  description: string;
  location: string;
  category: string;
  apy: number;
  term: number;
  riskLevel: string;
  status: string;
  raisedPercent: number;
  targetAmount: number;
  minInvestment: number;
  imageUrl: string | null;
  payout: string;
  badge: string | null;
  investors: number;
}

type SortOption =
  | "apy-desc"
  | "apy-asc"
  | "funded-desc"
  | "min-asc"
  | "investors-desc";

const CATEGORIES = [
  { label: "All", value: "all", icon: "" },
  { label: "Real Estate", value: "REAL_ESTATE", icon: "apartment" },
  { label: "Agriculture", value: "AGRICULTURE", icon: "agriculture" },
  { label: "Healthcare", value: "HEALTHCARE", icon: "medical_services" },
  { label: "Commodities", value: "COMMODITIES", icon: "inventory_2" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Highest APY", value: "apy-desc" },
  { label: "Lowest APY", value: "apy-asc" },
  { label: "Most Funded", value: "funded-desc" },
  { label: "Lowest Min", value: "min-asc" },
  { label: "Most Investors", value: "investors-desc" },
];

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function MarketplacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("apy-desc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    let result = [...projects];

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ticker.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    // Sort
    const [key, dir] = sortBy.split("-") as [string, string];
    result.sort((a, b) => {
      let va: number, vb: number;
      switch (key) {
        case "apy":
          va = a.apy;
          vb = b.apy;
          break;
        case "funded":
          va = a.raisedPercent;
          vb = b.raisedPercent;
          break;
        case "min":
          va = a.minInvestment;
          vb = b.minInvestment;
          break;
        case "investors":
          va = a.investors;
          vb = b.investors;
          break;
        default:
          va = a.apy;
          vb = b.apy;
      }
      return dir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [projects, activeCategory, search, sortBy]);

  return (
    <>
      <Header title="Marketplace" showBack={false} />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-6">
          {[
            { value: "$48.2M", label: "Total Value Locked", color: "text-text-primary" },
            { value: "14.8%", label: "Avg. APY", color: "text-accent-light" },
            { value: "391", label: "Total Investors", color: "text-text-primary" },
            { value: "$6.8M", label: "Yield Distributed", color: "text-primary-light" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-4 text-center"
            >
              <p className={`text-xl md:text-2xl font-extrabold font-mono ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters & Search ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-background-secondary text-text-secondary border border-border hover:border-primary/30"
                  }`}
                >
                  {cat.icon && (
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                  )}
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 md:ml-auto">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg text-[13px] bg-background-secondary border border-border text-text-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Search input */}
            <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-full">
              <span className="material-symbols-outlined text-base text-text-muted">
                search
              </span>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] text-text-primary placeholder:text-text-muted w-40 md:w-44"
              />
            </div>
          </div>
        </div>

        {/* ── Loading / Error / Empty ── */}
        {loading && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              progress_activity
            </span>
            <p className="text-text-muted text-sm mt-2">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-destructive mb-2">
              error
            </span>
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
              search_off
            </span>
            <p className="text-text-muted text-sm">No projects found</p>
          </div>
        )}

        {/* ── Project Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => {
              const raisedAmount =
                (project.raisedPercent / 100) * project.targetAmount;

              return (
                <div
                  key={project.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all group"
                >
                  {/* Image area */}
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/10 relative overflow-hidden">
                    {project.imageUrl?.startsWith("http") ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40 text-6xl">
                          {getCategoryIcon(project.category)}
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary/90 text-white rounded-full">
                        {getCategoryLabel(project.category)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRiskBadgeColor(project.riskLevel)}`}
                      >
                        {getRiskLabelShort(project.riskLevel)} Risk
                      </span>
                    </div>

                    {/* APY float */}
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-center">
                      <p className="text-lg font-extrabold font-mono text-accent-light leading-none">
                        {project.apy}%
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-text-muted">APY</p>
                    </div>

                    {/* Location */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-white/80">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {project.location}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-bold truncate">{project.name}</h3>
                      <span className="text-xs font-semibold text-primary-light bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        {project.ticker}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mb-3">
                      {getCategoryLabel(project.category)} &bull; {project.payout} Payouts &bull;{" "}
                      {project.term} Mo
                    </p>

                    {/* Progress bar */}
                    <div className="h-1 bg-background-secondary rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                        style={{ width: `${Math.min(project.raisedPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-text-muted mb-3">
                      <span>{formatMoney(raisedAmount)} raised</span>
                      <span>
                        {project.raisedPercent.toFixed(1)}% of {formatMoney(project.targetAmount)}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="text-[13px] font-bold font-mono text-accent-light">
                          {project.apy}%
                        </p>
                        <p className="text-[10px] text-text-muted">APY</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-bold font-mono">
                          ${project.minInvestment.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-text-muted">Min. Invest</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-bold font-mono text-primary-light">
                          {project.investors}
                        </p>
                        <p className="text-[10px] text-text-muted">Investors</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    {project.badge && (
                      <span className="text-[11px] font-semibold text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">
                        {project.badge}
                      </span>
                    )}
                    {!project.badge && <span />}
                    <div className="flex gap-2">
                      <Link
                        href={`/investments/${project.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-text-secondary hover:border-primary/30 transition-all"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/investments/${project.id}`}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        Invest
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
