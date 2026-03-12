import { getCategoryLabel, getRiskLabelShort } from "@/lib/utils/format";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  ticker: string;
  category: string;
  apy: number | { toNumber?: () => number };
  riskLevel: string;
  investors: number;
  raisedPercent: number | { toNumber?: () => number };
  targetAmount: number | { toNumber?: () => number };
}

function toNumber(val: number | { toNumber?: () => number }): number {
  if (typeof val === "number") return val;
  if (val && typeof val.toNumber === "function") return val.toNumber();
  return Number(val);
}

const categoryGradients: Record<string, string> = {
  HEALTHCARE: "from-primary to-primary-dark",
  AGRICULTURE: "from-accent to-accent-dark",
  REAL_ESTATE: "from-purple to-purple-dark",
  COMMODITIES: "from-amber to-amber-dark",
};

const riskColors: Record<string, string> = {
  LOW: "bg-accent/10 text-accent",
  MEDIUM: "bg-amber/10 text-amber",
  HIGH: "bg-destructive/10 text-destructive",
};

export function MarketOverview({ projects }: { projects: Project[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-text-primary">
          RWA Market Overview
        </h3>
        <Link
          href="/marketplace"
          className="text-xs text-primary font-medium hover:underline"
        >
          Browse All &rarr;
        </Link>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {projects.map((project) => {
          const apy = toNumber(project.apy);
          const raised = toNumber(project.raisedPercent);
          const gradient = categoryGradients[project.category] ?? "from-primary to-primary-dark";
          const riskClass = riskColors[project.riskLevel] ?? "bg-background-tertiary text-text-muted";

          return (
            <Link
              key={project.id}
              href={`/investments/${project.id}`}
              className="group flex-shrink-0 w-[220px] bg-background-secondary border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200"
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${gradient}`} />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{project.ticker.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{project.ticker}</p>
                    <p className="text-[11px] text-text-muted truncate">{getCategoryLabel(project.category)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold text-accent tabular-nums">{apy}%</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${riskClass}`}>
                    {getRiskLabelShort(project.riskLevel)}
                  </span>
                </div>

                {/* Progress */}
                <div className="h-1 bg-background-tertiary rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    style={{ width: `${Math.min(100, raised)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>{raised.toFixed(0)}% funded</span>
                  <span>{project.investors} investors</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
