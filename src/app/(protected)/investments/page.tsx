import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";

const CATEGORIES = [
  { label: "All", value: null },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Commodities", value: "COMMODITIES" },
] as const;

function getCategoryIcon(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "local_hospital";
    case "AGRICULTURE":
      return "eco";
    case "REAL_ESTATE":
      return "apartment";
    case "COMMODITIES":
      return "inventory_2";
    default:
      return "category";
  }
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "text-accent";
    case "MEDIUM":
      return "text-amber-600";
    case "HIGH":
      return "text-red-500";
    default:
      return "text-text-muted";
  }
}

function getRiskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Med";
    case "HIGH":
      return "High";
    default:
      return riskLevel;
  }
}

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
          SOON
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
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function InvestmentsPage({
  searchParams,
}: InvestmentsPageProps) {
  const { category, q } = await searchParams;

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

  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Investments" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        {/* Search Bar */}
        <div className="mt-4 mb-4">
          <form method="GET" className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl">
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
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
          {CATEGORIES.map((cat) => {
            const isActive = category
              ? category === cat.value
              : cat.value === null;
            return (
              <Link
                key={cat.label}
                href={
                  cat.value
                    ? `/investments?category=${cat.value}${q ? `&q=${q}` : ""}`
                    : `/investments${q ? `?q=${q}` : ""}`
                }
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

        {/* Project Cards */}
        <div className="space-y-3">
          {projects.length === 0 && (
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-text-muted mb-2">
                search_off
              </span>
              <p className="text-text-muted text-sm">No projects found</p>
            </div>
          )}
          {projects.map((project) => {
            const isSoldOut = project.status === "SOLD_OUT";
            const raisedAmount =
              (project.raisedPercent / 100) * project.targetAmount;

            return (
              <Link
                key={project.id}
                href={`/investments/${project.id}`}
                className={`block bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800 relative ${
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
                <div className="flex gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="material-icons text-primary text-2xl">
                      {getCategoryIcon(project.category)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-bold text-sm truncate">
                        {project.ticker} — {project.name}
                      </h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 mb-2">
                      <span className="material-icons text-[12px]">
                        location_on
                      </span>
                      {project.location}
                    </p>
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-[10px] text-text-muted">APY</p>
                        <p className="text-sm font-bold text-accent">
                          {project.apy}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted">Term</p>
                        <p className="text-sm font-bold text-secondary">
                          {project.term} Mo
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-muted">Risk</p>
                        <p
                          className={`text-xs font-semibold ${getRiskColor(project.riskLevel)}`}
                        >
                          {getRiskLabel(project.riskLevel)}
                        </p>
                      </div>
                    </div>
                    {/* Funding Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-text-muted">
                          $
                          {raisedAmount.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          / $
                          {project.targetAmount.toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-[10px] font-medium text-primary">
                          {project.raisedPercent}%
                        </p>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{
                            width: `${Math.min(project.raisedPercent, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
