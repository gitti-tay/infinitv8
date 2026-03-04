import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import { getCategoryIcon, formatCurrency, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

function getColorGradient(category: string): string {
  switch (category) {
    case "HEALTHCARE":
      return "from-blue-500 to-blue-600";
    case "AGRICULTURE":
      return "from-emerald-500 to-emerald-600";
    case "REAL_ESTATE":
      return "from-violet-500 to-violet-600";
    case "COMMODITIES":
      return "from-amber-500 to-amber-600";
    default:
      return "from-primary to-primary-dark";
  }
}

interface InvestmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const investment = await prisma.investment.findUnique({
    where: { id, userId: session.user.id },
    include: { project: true },
  });

  if (!investment) {
    notFound();
  }

  const investedAmount = Number(investment.amount);
  const apy = Number(investment.project.apy);
  const annualReturn = investedAmount * (apy / 100);
  const currentValue = investedAmount + annualReturn;
  const performance =
    investedAmount > 0 ? (annualReturn / investedAmount) * 100 : 0;
  const monthlyIncome = annualReturn / 12;
  const gradient = getColorGradient(investment.project.category);
  const daysHeld = Math.floor(
    (new Date().getTime() - new Date(investment.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const maturityDate = new Date(investment.createdAt);
  maturityDate.setMonth(maturityDate.getMonth() + investment.project.term);

  return (
    <>
      <Header title="Investment Details" />
      <div className="pt-14 pb-24 animate-fadeIn">
        {/* Hero Card */}
        <div className="px-5 pt-4">
          <div
            className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white shadow-2xl overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shrink-0">
                  <span className="material-symbols-outlined text-3xl">
                    {getCategoryIcon(investment.project.category)}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">
                    {investment.project.ticker}
                  </h2>
                  <p className="text-white/80 text-sm mb-2">
                    {investment.project.category
                      .replace("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <div className="flex items-center gap-1.5 text-white/80 text-xs">
                    <span className="material-symbols-outlined text-sm">
                      location_on
                    </span>
                    {investment.project.location}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-white/70 text-sm mb-1">Current Value</p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-bold">
                    ${formatCurrency(currentValue, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </h3>
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                    <span className="material-symbols-outlined text-sm">
                      trending_up
                    </span>
                    <span className="font-bold">+{performance.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1">
                    Invested
                  </p>
                  <p className="font-bold">
                    ${formatCurrency(investedAmount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1">
                    Returns
                  </p>
                  <p className="font-bold text-emerald-300">
                    +${formatCurrency(annualReturn, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <p className="text-white/60 text-[10px] uppercase mb-1">
                    APY
                  </p>
                  <p className="font-bold">{apy}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="px-5 mt-6">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
              Key Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase mb-1">
                  Monthly Income
                </p>
                <p className="text-xl font-bold text-accent">
                  +${formatCurrency(monthlyIncome)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {investment.project.payout}
                </p>
              </div>

              <div className="bg-muted dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase mb-1">
                  Days Held
                </p>
                <p className="text-xl font-bold">{daysHeld}</p>
                <p className="text-xs text-text-muted mt-1">
                  Since {formatDate(investment.createdAt)}
                </p>
              </div>

              <div className="bg-muted dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase mb-1">
                  Est. Total Return
                </p>
                <p className="text-xl font-bold text-primary">
                  +${formatCurrency(annualReturn * (investment.project.term / 12), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-text-muted mt-1">Over full term</p>
              </div>

              <div className="bg-muted dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase mb-1">
                  Maturity
                </p>
                <p className="text-xl font-bold">
                  {maturityDate.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {investment.project.term} month term
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Payout Card */}
        <div className="px-5 mt-4">
          <div className="bg-gradient-to-br from-accent to-green-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined">schedule</span>
              <h3 className="font-bold">Next Payout</h3>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/80 text-xs mb-1">Expected Amount</p>
                  <p className="text-3xl font-bold">
                    +${formatCurrency(monthlyIncome)}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">
                    payments
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Frequency</span>
                <span className="font-bold">{investment.project.payout}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Details */}
        <div className="px-5 mt-4">
          <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {getCategoryIcon(investment.project.category)}
              </span>
              Asset Details
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-text-muted text-sm">Project</span>
                <span className="font-bold">{investment.project.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-text-muted text-sm">Category</span>
                <span className="font-bold">
                  {investment.project.category
                    .replace("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-text-muted text-sm">
                  Investment Date
                </span>
                <span className="font-bold">
                  {formatDate(investment.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-text-muted text-sm">Maturity Date</span>
                <span className="font-bold">{formatDate(maturityDate)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-muted text-sm">Risk Level</span>
                <span className="font-bold">
                  {investment.project.riskLevel === "LOW"
                    ? "Low"
                    : investment.project.riskLevel === "MEDIUM"
                      ? "Medium"
                      : "High"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <Link
            href={`/investments/${investment.project.id}`}
            className="bg-card-light dark:bg-card-dark border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              info
            </span>
            <div>
              <p className="font-bold text-sm">View Project</p>
              <p className="text-xs text-text-muted">Full details</p>
            </div>
          </Link>

          <Link
            href="/portfolio"
            className="bg-card-light dark:bg-card-dark border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              pie_chart
            </span>
            <div>
              <p className="font-bold text-sm">Portfolio</p>
              <p className="text-xs text-text-muted">All investments</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
