import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const investments = await prisma.investment.findMany({
    where: { userId: user?.id, status: "CONFIRMED" },
    include: { project: true },
  });

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const estimatedReturn = investments.reduce(
    (sum, inv) => sum + Number(inv.amount) * (Number(inv.project.apy) / 100),
    0
  );

  return (
    <div className="pt-6 pb-24 px-5">
      <div className="mb-6">
        <p className="text-text-muted text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold">{user?.name || "Investor"}</h1>
      </div>

      <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-5 text-white mb-6 shadow-glow">
        <p className="text-white/70 text-xs mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold mb-4">
          ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-6">
          <div>
            <p className="text-white/70 text-[10px]">Invested</p>
            <p className="text-sm font-bold">
              $
              {totalInvested.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-white/70 text-[10px]">Est. Annual Return</p>
            <p className="text-sm font-bold text-green-300">
              +$
              {estimatedReturn.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: "travel_explore", label: "Invest", href: "/investments" },
          { icon: "pie_chart", label: "Portfolio", href: "/portfolio" },
          { icon: "verified_user", label: "KYC", href: "/kyc" },
          { icon: "person", label: "Profile", href: "/profile" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-1.5 p-3 bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-colors"
          >
            <span className="material-icons text-primary text-2xl">
              {action.icon}
            </span>
            <span className="text-[10px] font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-base">Active Opportunities</h2>
          <Link
            href="/investments"
            className="text-primary text-xs font-medium"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/investments/${project.id}`}
              className="block bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="material-icons text-primary text-2xl">
                    {project.category === "HEALTHCARE"
                      ? "local_hospital"
                      : project.category === "AGRICULTURE"
                        ? "eco"
                        : project.category === "REAL_ESTATE"
                          ? "apartment"
                          : "inventory_2"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-0.5">
                    {project.ticker} — {project.name}
                  </h3>
                  <p className="text-[10px] text-text-muted flex items-center gap-1 mb-2">
                    <span className="material-icons text-[12px]">
                      location_on
                    </span>
                    {project.location}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-text-muted">APY</p>
                      <p className="text-sm font-bold text-accent">
                        {Number(project.apy)}%
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
                        className={`text-xs font-semibold ${
                          project.riskLevel === "LOW"
                            ? "text-accent"
                            : project.riskLevel === "MEDIUM"
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {project.riskLevel === "LOW"
                          ? "Low"
                          : project.riskLevel === "MEDIUM"
                            ? "Med"
                            : "High"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
