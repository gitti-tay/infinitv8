"use client";

import { formatCurrency } from "@/lib/utils/format";

interface ActivityItem {
  id: string;
  icon: string;
  iconColor: "accent" | "primary" | "purple" | "destructive" | "amber";
  title: string;
  date: string;
  status: string;
  amount: number;
  isPositive: boolean;
}

const iconColorMap: Record<ActivityItem["iconColor"], string> = {
  accent: "bg-accent/10 text-accent",
  primary: "bg-primary/10 text-primary",
  purple: "bg-purple/10 text-purple",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber/10 text-amber",
};

interface RecentActivityProps {
  items?: ActivityItem[];
}

export function RecentActivity({ items = [] }: RecentActivityProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
        <a
          href="/transactions"
          className="text-xs text-primary font-medium hover:underline"
        >
          View All &rarr;
        </a>
      </div>
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <span className="material-symbols-outlined text-2xl text-text-muted mb-1 block">
            history
          </span>
          <p className="text-xs text-text-muted">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-background-secondary/60 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  iconColorMap[item.iconColor]
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-text-muted">
                  {item.date}
                  <span className={`ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    item.status === "Completed"
                      ? "bg-accent/10 text-accent"
                      : "bg-amber/10 text-amber"
                  }`}>
                    {item.status}
                  </span>
                </p>
              </div>
              <span
                className={`text-[13px] font-semibold tabular-nums ${
                  item.isPositive ? "text-accent" : "text-text-primary"
                }`}
              >
                {item.isPositive ? "+" : "-"}${formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
