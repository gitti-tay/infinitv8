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
  accent: "bg-accent/10 text-accent-light",
  primary: "bg-primary/10 text-primary-light",
  purple: "bg-purple/10 text-purple",
  destructive: "bg-destructive/10 text-destructive",
  amber: "bg-amber/10 text-amber",
};

const hardcodedActivity: ActivityItem[] = [
  {
    id: "1",
    icon: "payments",
    iconColor: "accent",
    title: "Yield Received — SCN",
    date: "Feb 15, 2026",
    status: "Completed",
    amount: 125.5,
    isPositive: true,
  },
  {
    id: "2",
    icon: "trending_up",
    iconColor: "purple",
    title: "Investment — MDD",
    date: "Feb 10, 2026",
    status: "Confirmed",
    amount: 8000,
    isPositive: false,
  },
  {
    id: "3",
    icon: "add_circle",
    iconColor: "primary",
    title: "Deposit — USDT",
    date: "Feb 8, 2026",
    status: "Completed",
    amount: 10000,
    isPositive: true,
  },
  {
    id: "4",
    icon: "payments",
    iconColor: "amber",
    title: "Yield Received — PTF",
    date: "Jan 20, 2026",
    status: "Completed",
    amount: 89.2,
    isPositive: true,
  },
  {
    id: "5",
    icon: "payments",
    iconColor: "accent",
    title: "Yield Received — MDD",
    date: "Jan 10, 2026",
    status: "Completed",
    amount: 64.8,
    isPositive: true,
  },
];

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Recent Activity</h3>
        <a
          href="/transactions"
          className="text-xs text-primary font-medium hover:underline"
        >
          View All &rarr;
        </a>
      </div>
      <div>
        {hardcodedActivity.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 py-3 ${
              idx < hardcodedActivity.length - 1
                ? "border-b border-border"
                : ""
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                iconColorMap[item.iconColor]
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {item.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text-primary">
                {item.title}
              </p>
              <p className="text-[11px] text-text-muted">
                {item.date} &bull; {item.status}
              </p>
            </div>
            <span
              className={`text-[13px] font-bold font-mono ${
                item.isPositive ? "text-accent-light" : "text-text-primary"
              }`}
            >
              {item.isPositive ? "+" : "-"}${formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
