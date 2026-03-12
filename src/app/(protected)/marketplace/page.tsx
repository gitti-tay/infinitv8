"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
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

const categoryGradients: Record<string, string> = {
  HEALTHCARE: "from-primary to-primary-dark",
  AGRICULTURE: "from-accent to-accent-dark",
  REAL_ESTATE: "from-purple to-purple-dark",
  COMMODITIES: "from-amber to-amber-dark",
};

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

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ticker.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    const [key, dir] = sortBy.split("-") as [string, string];
    result.sort((a, b) => {
      let va: number, vb: number;
      switch (key) {
        case "apy":
          va = a.apy; vb = b.apy; break;
        case "funded":
          va = a.raisedPercent; vb = b.raisedPercent; break;
        case "min":
          va = a.minInvestment; vb = b.minInvestment; break;
        case "investors":
          va = a.investors; vb = b.investors; break;
        default:
          va = a.apy; vb = b.apy;
      }
      return dir === "desc" ? vb - va : va - vb;
    });

    return result;
  }, [projects, activeCategory, search, sortBy]);

  // Featured project (highest APY)
  const featured = projects.length > 0
    ? [...projects].sort((a, b) => b.apy - a.apy)[0]
    : null;

  return (
    <>
      <Header title="Marketplace" showBack={false} />
      <div className="p-4 md:p-6 lg:p-8 animate-fadeIn max-w-[1400px]">

        {/* Featured Project Banner */}
        {featured && !loading && (
          <Link
            href={`/investments/${featured.id}`}
            className="block mb-6 bg-gradient-to-r from-primary/10 to-purple/10 dark:from-primary/20 dark:to-purple/20 border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${categoryGradients[featured.category] ?? "from-primary to-primary-dark"} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-white text-xl">
                  {getCategoryIcon(featured.category)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Featured</span>
                  {featured.badge && (
                    <span className="text-[10px] font-semibold text-amber bg-amber/10 px-1.5 py-0.5 rounded-full">{featured.badge}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-text-primary">{featured.name}</h2>
                <p className="text-xs text-text-muted mt-0.5">{getCategoryLabel(featured.category)} &middot; {featured.location} &middot; {featured.term} months</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-accent tabular-nums">{featured.apy}%</p>
                  <p className="text-[10px] text-text-muted">APY</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary tabular-nums">{formatMoney(featured.targetAmount)}</p>
                  <p className="text-[10px] text-text-muted">Target</p>
                </div>
                <div className="hidden md:block text-[13px] font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  View Details &rarr;
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { value: "$48.2M", label: "Total Value Locked", color: "text-text-primary" },
            { value: "14.8%", label: "Avg. APY", color: "text-accent" },
            { value: "391", label: "Total Investors", color: "text-text-primary" },
            { value: "$6.8M", label: "Yield Distributed", color: "text-primary" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center"
            >
              <p className={`text-xl md:text-2xl font-extrabold tabular-nums ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-glow"
                      : "bg-background-secondary/60 text-text-secondary border border-border hover:border-primary/30"
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

          <div className="flex gap-2 md:ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl text-[13px] bg-background-secondary/60 border border-border text-text-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 px-3 py-2 bg-background-secondary/60 border border-border rounded-xl">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] text-text-primary placeholder:text-text-muted w-36 md:w-44"
              />
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="text-text-muted text-sm mt-2">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-destructive mb-2">error</span>
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-4xl text-text-muted mb-2">search_off</span>
            <p className="text-text-muted text-sm">No projects found</p>
          </div>
        )}

        {/* Project Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => {
              const raisedAmount = (project.raisedPercent / 100) * project.targetAmount;
              const gradient = categoryGradients[project.category] ?? "from-primary to-primary-dark";

              return (
                <Link
                  key={project.id}
                  href={`/investments/${project.id}`}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  {/* Image area */}
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-purple/5 relative overflow-hidden">
                    {project.imageUrl?.startsWith("http") ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/20 text-5xl">
                          {getCategoryIcon(project.category)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r ${gradient} text-white`}>
                        {getCategoryLabel(project.category)}
                      </span>
                    </div>

                    {/* APY badge */}
                    <div className="absolute top-3 right-3 glass px-2.5 py-1 rounded-xl text-center">
                      <p className="text-base font-extrabold text-accent tabular-nums leading-none">{project.apy}%</p>
                      <p className="text-[8px] uppercase tracking-wider text-text-muted">APY</p>
                    </div>

                    {/* Location */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-white/80">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {project.location}
                    </div>

                    {/* Risk */}
                    <div className="absolute bottom-2.5 right-3">
                      <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${getRiskBadgeColor(project.riskLevel)}`}>
                        {getRiskLabelShort(project.riskLevel)}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[14px] font-bold truncate">{project.name}</h3>
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                        {project.ticker}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted mb-3">
                      {project.payout} Payouts &middot; {project.term} Mo term
                    </p>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
                        style={{ width: `${Math.min(project.raisedPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mb-3">
                      <span>{formatMoney(raisedAmount)} raised</span>
                      <span>{project.raisedPercent.toFixed(0)}% of {formatMoney(project.targetAmount)}</span>
                    </div>

                    {/* Bottom metrics */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[12px] font-bold tabular-nums">${project.minInvestment.toLocaleString()}</p>
                          <p className="text-[9px] text-text-muted">Min. Invest</p>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold tabular-nums text-primary">{project.investors}</p>
                          <p className="text-[9px] text-text-muted">Investors</p>
                        </div>
                      </div>
                      {project.badge && (
                        <span className="text-[10px] font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
                          {project.badge}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Invest
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
