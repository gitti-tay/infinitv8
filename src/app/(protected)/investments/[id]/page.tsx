import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";

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

function getCategoryLabel(category: string): string {
  switch (category) {
    case "REAL_ESTATE":
      return "Real Estate";
    case "AGRICULTURE":
      return "Agriculture";
    case "HEALTHCARE":
      return "Healthcare";
    case "COMMODITIES":
      return "Commodities";
    default:
      return category;
  }
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getRiskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "Low Risk";
    case "MEDIUM":
      return "Medium Risk";
    case "HIGH":
      return "High Risk";
    default:
      return riskLevel;
  }
}

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      investments: {
        select: { id: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const investorCount = project.investments.length;
  const raisedAmount = (Number(project.raisedPercent) / 100) * Number(project.targetAmount);

  return (
    <>
      <Header title={project.ticker} />
      <div className="pt-14 pb-28">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-secondary px-5 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-icons text-white text-3xl">
                {getCategoryIcon(project.category)}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-white/20 text-white rounded-full">
                {getCategoryLabel(project.category)}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${getRiskColor(project.riskLevel)}`}
              >
                {getRiskLabel(project.riskLevel)}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {project.name}
          </h1>
          <p className="text-white/70 text-sm flex items-center gap-1">
            <span className="material-icons text-sm">location_on</span>
            {project.location}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="px-5 -mt-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "APY",
                value: `${Number(project.apy)}%`,
                color: "text-accent",
              },
              {
                label: "Term",
                value: `${project.term} Mo`,
                color: "text-secondary",
              },
              {
                label: "Min. Invest",
                value: `$${Number(project.minInvestment).toLocaleString("en-US")}`,
                color: "text-primary",
              },
              {
                label: "Payout",
                value: project.payout,
                color: "text-text-main dark:text-white",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-card-light dark:bg-card-dark rounded-xl p-3 text-center shadow-soft border border-gray-100 dark:border-gray-800"
              >
                <p className="text-[10px] text-text-muted mb-1">
                  {metric.label}
                </p>
                <p className={`text-sm font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Progress Card */}
        <div className="px-5 mt-4">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">Funding Progress</h3>
              <span className="text-xs font-semibold text-primary">
                {Number(project.raisedPercent)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                style={{
                  width: `${Math.min(Number(project.raisedPercent), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>
                $
                {raisedAmount.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                raised
              </span>
              <span>
                $
                {Number(project.targetAmount).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                target
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-icons text-primary text-sm">
                group
              </span>
              <span className="text-xs text-text-muted">
                {investorCount} investor{investorCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="px-5 mt-4">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm mb-3">Overview</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      {project.status === "ACTIVE" && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-md mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
            <Link
              href={`/investments/${project.id}/invest`}
              className="block w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-center font-bold rounded-xl shadow-glow hover:opacity-90 transition-opacity"
            >
              Invest Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
