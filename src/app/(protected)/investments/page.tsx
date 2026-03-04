import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import {
  getCategoryIcon,
  getRiskColor,
  getRiskLabelShort,
  formatCurrency,
} from "@/lib/utils/format";
import Link from "next/link";

const CATEGORIES = [
  { label: "All", value: null },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Commodities", value: "COMMODITIES" },
] as const;

function getStatusBadge(status: string) {
  switch (status) {
    case "SOLD_OUT":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
          Sold Out
        </span>
      );
    case "COMING_SOON":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
          Coming Soon
        </span>
      );
    case "ACTIVE":
      return (
        <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          Active
        </span>
      );
    default:
      return null;
  }
}

interface InvestmentsPageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}

export default async function InvestmentsPage({
  searchParams,
}: InvestmentsPageProps) {
  const { category, q, sort } = await searchParams;

  const where: Record<string, unknown> = {};
  if (category && category !== "All") {
    where.category = category;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { ticker: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "apy") orderBy = { apy: "desc" };
  else if (sort === "min") orderBy = { minInvestment: "asc" };
  else if (sort === "funded") orderBy = { raisedPercent: "desc" };

  const projects = await prisma.project.findMany({ where, orderBy });

  const totalProjects = projects.length;
  const avgApy =
    totalProjects > 0
      ? projects.reduce((sum, p) => sum + Number(p.apy), 0) / totalProjects
      : 0;
  const totalFunding = projects.reduce(
    (sum, p) => sum + Number(p.targetAmount),
    0
  );

  const buildUrl = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", params.category);
    if (params.q) sp.set("q", params.q);
    if (params.sort) sp.set("sort", params.sort);
    const qs = sp.toString();
    return `/investments${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <Header title="Investments" showBack={false} />
      <div className="pt-16 pb-24 px-5 animate-fadeIn">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-primary">{totalProjects}</p>
            <p className="text-[10px] text-text-muted">Projects</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-accent">
              {avgApy.toFixed(1)}%
            </p>
            <p className="text-[10px] text-text-muted">Avg APY</p>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-secondary">
              ${formatCurrency(totalFunding, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-text-muted">Total Funding</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <form method="GET" className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">
              search
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4">
          {CATEGORIES.map((cat) => {
            const isActive = category
              ? category === cat.value
              : cat.value === null;
            return (
              <Link
                key={cat.label}
                href={buildUrl({
                  category: cat.value ?? undefined,
                  q: q ?? undefined,
                  sort: sort ?? undefined,
                })}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-muted hover:border-primary"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
          {[
            { label: "Newest", value: undefined },
            { label: "Highest APY", value: "apy" },
            { label: "Lowest Min", value: "min" },
            { label: "Most Funded", value: "funded" },
          ].map((opt) => {
            const isActive = sort
              ? sort === opt.value
              : opt.value === undefined;
            return (
              <Link
                key={opt.label}
                href={buildUrl({
                  category: category ?? undefined,
                  q: q ?? undefined,
                  sort: opt.value,
                })}
                className={`flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        {/* Project Cards */}
        <div className="space-y-3">
          {projects.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-text-muted mb-2">
                search_off
              </span>
              <p className="text-text-muted text-sm">No projects found</p>
            </div>
          )}
          {projects.map((project) => {
            const isSoldOut = project.status === "SOLD_OUT";
            const raisedAmount =
              (Number(project.raisedPercent) / 100) *
              Number(project.targetAmount);

            return (
              <div
                key={project.id}
                className={`bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-800 relative ${
                  isSoldOut ? "opacity-80 grayscale" : ""
                }`}
              >
                {isSoldOut && (
                  <div className="absolute inset-0 bg-white/30 dark:bg-black/30 rounded-2xl z-10 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full -rotate-12">
                      Sold Out
                    </span>
                  </div>
                )}
                {/* Image area */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/10 relative overflow-hidden">
                  {project.imageUrl?.startsWith("http") ? (
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary/40 text-6xl">
                        {getCategoryIcon(project.category)}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {project.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary/90 text-white rounded-lg backdrop-blur-sm">
                        {project.badge}
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-xs font-bold bg-white/90 dark:bg-card-dark/90 text-accent rounded-lg">
                      {Number(project.apy)}% APY
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-0.5">
                    {project.ticker} — {project.name}
                  </h3>
                  <p className="text-[10px] text-text-muted flex items-center gap-1 mb-3">
                    <span className="material-symbols-outlined text-[12px]">
                      location_on
                    </span>
                    {project.location}
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <p className="text-[10px] text-text-muted">Term</p>
                      <p className="text-sm font-bold text-secondary">
                        {project.term} Mo
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Min</p>
                      <p className="text-sm font-bold">
                        ${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Risk</p>
                      <p
                        className={`text-xs font-semibold ${getRiskColor(project.riskLevel)}`}
                      >
                        {getRiskLabelShort(project.riskLevel)}
                      </p>
                    </div>
                  </div>
                  {/* Funding Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-text-muted">
                        ${formatCurrency(raisedAmount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} / $
                        {formatCurrency(Number(project.targetAmount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] font-medium text-primary">
                        {Number(project.raisedPercent)}%
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                        style={{
                          width: `${Math.min(Number(project.raisedPercent), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/investments/${project.id}/invest`}
                      className="flex-1 py-2.5 bg-primary text-white text-center text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Invest
                    </Link>
                    <Link
                      href={`/investments/${project.id}`}
                      className="flex-1 py-2.5 bg-card-light dark:bg-card-dark text-center text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
