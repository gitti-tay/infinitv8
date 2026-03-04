import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  getCategoryIcon,
  getRiskColor,
  getRiskLabelShort,
} from "@/lib/utils/format";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const investments = await prisma.investment.findMany({
    where: { userId: user?.id, status: "CONFIRMED" },
    include: { project: true },
  });

  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  const estimatedReturn = investments.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );

  return (
    <div className="pt-6 pb-24 md:pb-8 px-5 animate-fadeIn">
      {/* Welcome */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-text-muted text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.name || "Investor"}</h1>
        </div>
        <Link
          href="/notifications"
          className="w-10 h-10 rounded-full bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-text-muted text-xl">
            notifications
          </span>
        </Link>
      </div>

      {/* Portfolio Value Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white mb-6 shadow-glow">
        <p className="text-white/70 text-xs mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold mb-4">
          ${formatCurrency(totalInvested)}
        </p>
        <div className="flex gap-6">
          <div>
            <p className="text-white/70 text-[10px]">Invested</p>
            <p className="text-sm font-bold">${formatCurrency(totalInvested)}</p>
          </div>
          <div>
            <p className="text-white/70 text-[10px]">Est. Annual Return</p>
            <p className="text-sm font-bold text-green-300">
              +${formatCurrency(estimatedReturn)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          {
            icon: "account_balance_wallet",
            label: "Deposit",
            href: "/wallet",
          },
          { icon: "send", label: "Withdraw", href: "/wallet" },
          { icon: "bar_chart", label: "Reports", href: "/portfolio" },
          { icon: "travel_explore", label: "Invest", href: "/investments" },
          { icon: "verified_user", label: "KYC", href: "/kyc" },
          { icon: "settings", label: "Settings", href: "/profile" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-1.5 py-4 bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              {action.icon}
            </span>
            <span className="text-[10px] font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Featured Opportunities - Horizontal Scroll */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-base">Featured Opportunities</h2>
          <Link
            href="/investments"
            className="text-primary text-xs font-medium"
          >
            View All
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/investments/${project.id}`}
              className="flex-shrink-0 w-64 md:w-auto bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-800"
            >
              {/* Image */}
              <div className="h-28 bg-gradient-to-br from-primary/30 to-secondary/20 relative overflow-hidden">
                {project.imageUrl?.startsWith("http") ? (
                  <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/60 text-5xl">
                      {getCategoryIcon(project.category)}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 dark:bg-card-dark/90 text-primary rounded-full">
                    {Number(project.apy)}% APY
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-0.5 truncate">
                  {project.ticker} — {project.name}
                </h3>
                <p className="text-[10px] text-text-muted flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-[12px]">
                    location_on
                  </span>
                  {project.location}
                </p>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-text-muted">
                    {project.term} Mo Term
                  </span>
                  <span className={getRiskColor(project.riskLevel)}>
                    {getRiskLabelShort(project.riskLevel)} Risk
                  </span>
                </div>
                {/* Funding progress */}
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(Number(project.raisedPercent), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">
                    {Number(project.raisedPercent)}% funded
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Compliance Badge */}
      <div className="flex items-center gap-2 bg-card-light dark:bg-card-dark rounded-xl p-3 border border-gray-100 dark:border-gray-800">
        <span className="material-symbols-outlined text-primary text-lg">
          verified
        </span>
        <p className="text-[10px] text-text-muted">
          All investments are KYC/AML verified and audited by independent firms
        </p>
      </div>
    </div>
  );
}
