import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import {
  getCategoryIcon,
  getCategoryLabel,
  getRiskBadgeColor,
  getRiskLabel,
  formatCurrency,
} from "@/lib/utils/format";
import Link from "next/link";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || "overview";

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

  const investorCount = project.investors || project.investments.length;
  const raisedAmount =
    (Number(project.raisedPercent) / 100) * Number(project.targetAmount);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "terms", label: "Terms" },
    { key: "waterfall", label: "Waterfall" },
    { key: "diligence", label: "Diligence" },
    { key: "faqs", label: "FAQs" },
  ];

  return (
    <>
      <Header title={project.ticker} />
      <div className="pt-14 pb-28 animate-fadeIn">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary-dark px-5 pt-6 pb-8 relative overflow-hidden">
          {project.imageUrl?.startsWith("http") ? (
            <div className="absolute inset-0">
              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-dark/90" />
            </div>
          ) : (
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[120px]">
                  {getCategoryIcon(project.category)}
                </span>
              </div>
            </div>
          )}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-3xl">
                  {getCategoryIcon(project.category)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm">
                  {getCategoryLabel(project.category)}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full ${getRiskBadgeColor(project.riskLevel)}`}
                >
                  {getRiskLabel(project.riskLevel)}
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {project.name}
            </h1>
            <p className="text-white/70 text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                location_on
              </span>
              {project.location}
            </p>
          </div>
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
                value: `$${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`,
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

        {/* Badge */}
        {project.badge && (
          <div className="px-5 mt-4">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">
                verified
              </span>
              <p className="text-[10px] text-green-700 dark:text-green-300 font-medium">
                {project.badge} · Audited · KYC/AML Verified
              </p>
            </div>
          </div>
        )}

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
                ${formatCurrency(raisedAmount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })} raised
              </span>
              <span>
                ${formatCurrency(Number(project.targetAmount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })} target
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">
                group
              </span>
              <span className="text-xs text-text-muted">
                {investorCount} investor{investorCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Tab Navigation */}
        <div className="px-5 mt-4">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-muted dark:bg-gray-800 rounded-xl p-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={`/investments/${id}?tab=${t.key}`}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t.key
                    ? "bg-card-light dark:bg-card-dark text-primary shadow-sm"
                    : "text-text-muted hover:text-primary"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 mt-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Investment Thesis */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm mb-3">Investment Thesis</h3>
                {(project.investmentThesis || project.description).split("\n\n").map((p, i) => (
                  <p key={i} className="text-sm text-text-muted leading-relaxed mb-3 last:mb-0">{p}</p>
                ))}
              </div>

              {/* Key Highlights */}
              {project.keyHighlights && (
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-sm mb-3">Key Highlights</h3>
                  <div className="space-y-2.5">
                    {(project.keyHighlights as string[]).map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-accent text-sm mt-0.5">check_circle</span>
                        <span className="text-sm text-text-muted">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tagline badge */}
              {project.tagline && (
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs text-primary font-medium">{project.tagline}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "terms" && (
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm mb-4">Term Sheet</h3>
              <div className="space-y-3">
                {project.termSheet ? (
                  Object.entries(project.termSheet as Record<string, string>).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="text-xs text-text-muted capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-xs font-medium text-right max-w-[55%]">{value}</span>
                    </div>
                  ))
                ) : (
                  [
                    { label: "Raise Size", value: `$${formatCurrency(Number(project.targetAmount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` },
                    { label: "Tenor", value: `${project.term} Months` },
                    { label: "Target Yield", value: `${Number(project.apy)}% APY` },
                    { label: "Payout", value: project.payout },
                    { label: "Min Investment", value: `$${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="text-xs text-text-muted">{item.label}</span>
                      <span className="text-xs font-medium">{item.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "waterfall" && (
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm mb-4">Payout Waterfall</h3>
              <div className="space-y-3">
                {(project.payoutWaterfall as { step: number; title: string; desc: string }[] || [
                  { step: 1, title: "Revenue Collection", desc: "Asset generates income from operations" },
                  { step: 2, title: "Operating Expenses", desc: "Management fees and operational costs deducted" },
                  { step: 3, title: "Reserve Fund", desc: "5% allocated to maintenance reserve" },
                  { step: 4, title: "Investor Distribution", desc: `${Number(project.apy)}% APY distributed ${project.payout.toLowerCase()} to token holders` },
                ]).map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {item.step}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "diligence" && (
            <div className="space-y-4">
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-sm mb-4">Verification Checklist</h3>
                <div className="space-y-3">
                  {(project.diligenceItems as { icon: string; label: string; status: string }[] || [
                    { icon: "description", label: "Legal Structure Review", status: "Verified" },
                    { icon: "account_balance", label: "Financial Audit", status: "Completed" },
                    { icon: "security", label: "Smart Contract Audit", status: "Passed" },
                  ]).map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">
                          {item.icon}
                        </span>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-xs font-medium text-accent">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {project.documents && (
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-sm mb-4">Data Room</h3>
                  <div className="space-y-2">
                    {(project.documents as { name: string; type: string; size: string }[]).map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-red-500 text-lg">
                            {doc.type === "PDF" ? "picture_as_pdf" : "table_chart"}
                          </span>
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-text-muted">{doc.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="space-y-3">
              {(project.faqs as { q: string; a: string }[] || [
                { q: "What is the minimum investment?", a: `The minimum investment for this project is $${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}.` },
                { q: "How are returns distributed?", a: `Returns are distributed ${project.payout.toLowerCase()} directly to your wallet at ${Number(project.apy)}% APY.` },
                { q: "What happens at maturity?", a: `At the end of the ${project.term}-month term, your principal plus final distribution will be returned to your wallet.` },
              ]).map((faq) => (
                <div
                  key={faq.q}
                  className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800"
                >
                  <h4 className="text-sm font-medium mb-2">{faq.q}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      {project.status === "ACTIVE" && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <div className="max-w-md mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
            <Link
              href={`/investments/${project.id}/invest`}
              className="block w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors"
            >
              Invest Now — Min ${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
