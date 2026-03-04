import { getCategoryLabel, getRiskLabelShort } from "@/lib/utils/format";

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

const categoryColors: Record<string, string> = {
  HEALTHCARE: "text-primary bg-primary/10",
  AGRICULTURE: "text-accent bg-accent/10",
  REAL_ESTATE: "text-cyan bg-cyan/10",
  COMMODITIES: "text-amber bg-amber/10",
};

const riskColors: Record<string, string> = {
  LOW: "bg-accent/10 text-accent-light",
  MEDIUM: "bg-amber/10 text-amber",
  HIGH: "bg-destructive/10 text-destructive",
};

export function MarketOverview({ projects }: { projects: Project[] }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">
          RWA Market Overview
        </h3>
        <a
          href="/investments"
          className="text-xs text-primary font-medium hover:underline"
        >
          Browse All &rarr;
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Asset
              </th>
              <th className="text-right py-2 px-4 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                APY
              </th>
              <th className="text-right py-2 px-4 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Category
              </th>
              <th className="text-right py-2 px-4 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Risk
              </th>
              <th className="text-right py-2 pl-4 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                Investors
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const apy = toNumber(project.apy);
              const colorClass =
                categoryColors[project.category] ?? "text-text-muted bg-background-tertiary";
              const riskClass =
                riskColors[project.riskLevel] ?? "bg-background-tertiary text-text-muted";

              return (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${colorClass}`}
                      >
                        {project.ticker.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {project.ticker}
                        </p>
                        <p className="text-[11px] text-text-muted truncate max-w-[140px]">
                          {project.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-accent-light">
                    {apy}%
                  </td>
                  <td className="text-right py-3 px-4 text-text-secondary">
                    {getCategoryLabel(project.category)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-semibold ${riskClass}`}
                    >
                      {getRiskLabelShort(project.riskLevel)}
                    </span>
                  </td>
                  <td className="text-right py-3 pl-4 font-mono font-semibold text-text-secondary">
                    {project.investors.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
