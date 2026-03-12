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
    { key: "overview", label: "Overview", icon: "info" },
    { key: "terms", label: "Terms", icon: "description" },
    { key: "waterfall", label: "Waterfall", icon: "waterfall_chart" },
    { key: "diligence", label: "Diligence", icon: "verified_user" },
    { key: "faqs", label: "FAQs", icon: "help" },
  ];

  const plans = project.plans as { name: string; apy: number; min: number; term: number; lockup: string; payout: string; badge: string | null; description: string }[] | null;

  return (
    <>
      <Header title={project.ticker} />
      <div className="pb-28 animate-fadeIn">
        {/* Hero Section — Full-width with image overlay */}
        <div className="relative overflow-hidden">
          {project.imageUrl?.startsWith("http") ? (
            <div className="absolute inset-0">
              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-purple">
              <div className="absolute inset-0 opacity-[0.07]">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[180px]">
                    {getCategoryIcon(project.category)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10 px-5 lg:px-8 pt-8 pb-10">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="px-3 py-1 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/10">
                {getCategoryLabel(project.category)}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getRiskBadgeColor(project.riskLevel)}`}>
                {getRiskLabel(project.riskLevel)}
              </span>
              {project.badge && (
                <span className="px-3 py-1 text-xs font-semibold bg-accent/20 text-accent-light rounded-full backdrop-blur-sm border border-accent/20">
                  {project.badge}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-300 rounded-full backdrop-blur-sm border border-green-500/20">
                {project.status === "ACTIVE" ? "Open for Investment" : project.status}
              </span>
            </div>

            {/* Title + Location */}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-sm mb-6">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {project.location}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">group</span>
                {investorCount} investor{investorCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {project.term} months
              </span>
            </div>

            {/* Key Metrics — Glass cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Target APY", value: `${Number(project.apy)}%`, icon: "trending_up", color: "text-green-400" },
                { label: "Term", value: `${project.term} Mo`, icon: "calendar_month", color: "text-blue-400" },
                { label: "Min. Investment", value: `$${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`, icon: "payments", color: "text-purple-400" },
                { label: "Payout", value: project.payout, icon: "account_balance_wallet", color: "text-amber-400" },
              ].map((metric) => (
                <div key={metric.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-base ${metric.color}`}>{metric.icon}</span>
                    <span className="text-[11px] text-white/60 uppercase tracking-wider font-medium">{metric.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        {project.badge && (
          <div className="px-5 lg:px-8 -mt-3 mb-4">
            <div className="flex items-center gap-3 bg-accent/[0.06] rounded-xl p-4 border border-accent/20">
              <span className="material-symbols-outlined text-accent text-lg">verified</span>
              <div>
                <p className="text-xs font-semibold text-accent">{project.badge} - Audited - KYC/AML Verified</p>
                <p className="text-[10px] text-text-muted mt-0.5">Independently verified by third-party auditors</p>
              </div>
            </div>
          </div>
        )}

        {/* Funding Progress */}
        <div className="px-5 lg:px-8 mt-4">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-text-primary">Funding Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-primary">{Number(project.raisedPercent)}%</span>
                <span className="text-xs text-text-muted">funded</span>
              </div>
            </div>
            <div className="h-3 bg-background-tertiary rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-primary via-purple to-accent rounded-full transition-all"
                style={{ width: `${Math.min(Number(project.raisedPercent), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="font-semibold text-text-primary">${formatCurrency(raisedAmount, { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
                <span className="text-text-muted ml-1">raised</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">${formatCurrency(Number(project.targetAmount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span>
                <span className="text-text-muted ml-1">target</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-text-primary">{investorCount}</p>
                <p className="text-[11px] text-text-muted">Investors</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent">{Number(project.apy)}%</p>
                <p className="text-[11px] text-text-muted">APY</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</p>
                <p className="text-[11px] text-text-muted">Min Invest</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 lg:px-8 mt-6">
          <div className="flex gap-1 overflow-x-auto hide-scrollbar bg-background-tertiary rounded-2xl p-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={`/investments/${id}?tab=${t.key}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === t.key
                    ? "bg-card text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-5 lg:px-8 mt-5">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Investment Thesis */}
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-lg">lightbulb</span>
                  <h3 className="font-bold text-base text-text-primary">Investment Thesis</h3>
                </div>
                {(project.investmentThesis || project.description).split("\n\n").map((p, i) => (
                  <p key={i} className="text-sm text-text-secondary leading-relaxed mb-3 last:mb-0">{p}</p>
                ))}
              </div>

              {/* Key Highlights */}
              {project.keyHighlights && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-accent text-lg">stars</span>
                    <h3 className="font-bold text-base text-text-primary">Key Highlights</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {(project.keyHighlights as string[]).map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-accent/[0.04] rounded-lg p-3">
                        <span className="material-symbols-outlined text-accent text-base mt-0.5 flex-shrink-0">check_circle</span>
                        <span className="text-sm text-text-secondary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Plans */}
              {plans && plans.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-purple text-lg">workspace_premium</span>
                    <h3 className="font-bold text-base text-text-primary">Investment Plans</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {plans.map((plan, i) => (
                      <Link
                        key={i}
                        href={`/investments/${project.id}/invest?plan=${i}`}
                        className={`block rounded-xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5 ${plan.badge === "Popular" ? "border-primary/30 bg-primary/[0.03] hover:border-primary/50" : "border-border bg-background-secondary hover:border-primary/30"} relative group`}
                      >
                        {plan.badge && (
                          <span className={`absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            plan.badge === "Popular" ? "bg-primary text-white" : plan.badge === "Pro" ? "bg-purple text-white" : "bg-accent text-white"
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-text-primary mb-1">{plan.name}</h4>
                          <span className="material-symbols-outlined text-text-muted group-hover:text-primary text-base transition-colors">arrow_forward</span>
                        </div>
                        <p className="text-xs text-text-muted mb-3">{plan.description}</p>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-extrabold text-primary">{plan.apy}%</span>
                          <span className="text-xs text-text-muted">APY</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-text-secondary">
                          <div className="flex justify-between"><span>Minimum</span><span className="font-medium">${plan.min.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Lockup</span><span className="font-medium">{plan.lockup}</span></div>
                          <div className="flex justify-between"><span>Payout</span><span className="font-medium">{plan.payout}</span></div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tagline */}
              {project.tagline && (
                <div className="bg-gradient-to-r from-primary/10 to-purple/10 rounded-xl p-5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                    <p className="text-sm text-primary font-medium">{project.tagline}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "terms" && (
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-lg">description</span>
                <h3 className="font-bold text-base text-text-primary">Term Sheet</h3>
              </div>
              <div className="space-y-0">
                {project.termSheet ? (
                  Object.entries(project.termSheet as Record<string, string>).map(([key, value], i) => (
                    <div key={key} className={`flex justify-between items-center py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                      <span className="text-sm text-text-muted capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="text-sm font-semibold text-text-primary text-right max-w-[55%]">{value}</span>
                    </div>
                  ))
                ) : (
                  [
                    { label: "Raise Size", value: `$${formatCurrency(Number(project.targetAmount), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` },
                    { label: "Tenor", value: `${project.term} Months` },
                    { label: "Target Yield", value: `${Number(project.apy)}% APY` },
                    { label: "Payout", value: project.payout },
                    { label: "Min Investment", value: `$${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}` },
                  ].map((item, i) => (
                    <div key={item.label} className={`flex justify-between items-center py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
                      <span className="text-sm text-text-muted">{item.label}</span>
                      <span className="text-sm font-semibold text-text-primary">{item.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "waterfall" && (
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-lg">waterfall_chart</span>
                <h3 className="font-bold text-base text-text-primary">Payout Waterfall</h3>
              </div>
              <p className="text-xs text-text-muted mb-5">Revenue flows through each stage sequentially. Investors receive distributions after operating costs and reserves.</p>
              <div className="space-y-0">
                {(project.payoutWaterfall as { step: number; title: string; desc: string }[] || [
                  { step: 1, title: "Revenue Collection", desc: "Asset generates income from operations" },
                  { step: 2, title: "Operating Expenses", desc: "Management fees and operational costs deducted" },
                  { step: 3, title: "Reserve Fund", desc: "Allocated to maintenance reserve" },
                  { step: 4, title: "Investor Distribution", desc: `${Number(project.apy)}% APY distributed ${project.payout.toLowerCase()} to token holders` },
                ]).map((item, i, arr) => (
                  <div key={item.step} className="flex gap-4 relative">
                    {i < arr.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center z-10 border-2 border-card">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "diligence" && (
            <div className="space-y-5">
              <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-accent text-lg">verified_user</span>
                  <h3 className="font-bold text-base text-text-primary">Verification Checklist</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(project.diligenceItems as { icon: string; label: string; status: string }[] || [
                    { icon: "description", label: "Legal Structure Review", status: "Verified" },
                    { icon: "account_balance", label: "Financial Audit", status: "Completed" },
                    { icon: "security", label: "Smart Contract Audit", status: "Passed" },
                  ]).map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-lg bg-background-secondary border border-border">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                        <span className="text-sm text-text-primary">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {project.documents && (
                <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-primary text-lg">folder_open</span>
                    <h3 className="font-bold text-base text-text-primary">Data Room</h3>
                  </div>
                  <div className="space-y-2">
                    {(project.documents as { name: string; type: string; size: string }[]).map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between py-3 px-4 rounded-lg bg-background-secondary border border-border hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined text-lg ${doc.type === "PDF" ? "text-red-500" : "text-green-600"}`}>
                            {doc.type === "PDF" ? "picture_as_pdf" : "table_chart"}
                          </span>
                          <div>
                            <span className="text-sm font-medium text-text-primary">{doc.name}</span>
                            <p className="text-[10px] text-text-muted">{doc.type} - {doc.size}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-lg border border-primary/10">
                    <span className="material-symbols-outlined text-primary text-base">mail</span>
                    <p className="text-xs text-text-secondary">
                      Documents available upon request. Contact us at{" "}
                      <a href="mailto:info@infinitv8.com" className="text-primary font-semibold hover:underline">
                        info@infinitv8.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-lg">help</span>
                <h3 className="font-bold text-base text-text-primary">Frequently Asked Questions</h3>
              </div>
              {(project.faqs as { q: string; a: string }[] || [
                { q: "What is the minimum investment?", a: `The minimum investment for this project is $${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}.` },
                { q: "How are returns distributed?", a: `Returns are distributed ${project.payout.toLowerCase()} directly to your wallet at ${Number(project.apy)}% APY.` },
                { q: "What happens at maturity?", a: `At the end of the ${project.term}-month term, your principal plus final distribution will be returned to your wallet.` },
              ]).map((faq, i) => (
                <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border border-border">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0">quiz</span>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">{faq.q}</h4>
                      <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      {project.status === "ACTIVE" && (
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-[240px] right-0 z-40">
          <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-background via-background/95">
            <Link
              href={`/investments/${project.id}/invest`}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-primary to-purple text-white text-center font-bold rounded-2xl shadow-glow hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-px active:scale-[0.98] transition-all text-[15px]"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              Invest Now — Min ${formatCurrency(Number(project.minInvestment), { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
