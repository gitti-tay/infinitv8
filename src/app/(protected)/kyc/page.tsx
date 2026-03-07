import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/ui/header";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function KycStartPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  if (user.kycStatus === "APPROVED") {
    redirect("/dashboard");
  }

  if (user.kycStatus === "PENDING") {
    redirect("/kyc/status");
  }

  const levels = [
    {
      level: 1,
      name: "Basic Verification",
      description: "Email & phone verification",
      status: "completed" as const,
      statusLabel: "Completed",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      icon: "person",
      borderColor: "border-accent/30",
      perks: [
        { icon: "check_circle", label: "View marketplace", color: "text-accent" },
        { icon: "check_circle", label: "Connect wallet", color: "text-accent" },
        { icon: "check_circle", label: "View token balances", color: "text-accent" },
        { icon: "check_circle", label: "Explore RWA projects", color: "text-accent" },
      ],
    },
    {
      level: 2,
      name: "Identity Verification",
      description: "Government ID + Biometric selfie verification",
      status: "current" as const,
      statusLabel: "Recommended",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      icon: "badge",
      borderColor: "border-primary/40",
      perks: [
        { icon: "lock_open", label: "Unlimited investment access", color: "text-primary" },
        { icon: "lock_open", label: "Deposit up to $50,000", color: "text-primary" },
        { icon: "lock_open", label: "Withdraw up to $10,000/day", color: "text-primary" },
        { icon: "lock_open", label: "Yield payouts enabled", color: "text-primary" },
      ],
    },
    {
      level: 3,
      name: "Enhanced Verification",
      description: "Proof of address + Source of funds",
      status: "locked" as const,
      statusLabel: "Locked",
      iconBg: "bg-purple/10",
      iconColor: "text-purple",
      icon: "workspace_premium",
      borderColor: "border-border",
      perks: [
        { icon: "lock", label: "Unlimited deposits", color: "text-text-muted" },
        { icon: "lock", label: "Unlimited withdrawals", color: "text-text-muted" },
        { icon: "lock", label: "OTC trading access", color: "text-text-muted" },
        { icon: "lock", label: "Institutional features", color: "text-text-muted" },
      ],
    },
  ];

  const faqs = [
    {
      q: "What documents are accepted?",
      a: "We accept valid government-issued photo IDs including: Passport, National ID Card, and Driver's License. The document must be current (not expired) and in good condition.",
    },
    {
      q: "How long does verification take?",
      a: "Most verifications are completed within 5-30 minutes during business hours. In rare cases requiring manual review, it may take up to 24 hours.",
    },
    {
      q: "How is my data protected?",
      a: "Your verification data is processed by Sumsub, a SOC 2 Type II certified provider. All data is encrypted with 256-bit TLS in transit and AES-256 at rest.",
    },
    {
      q: "Can I delete my KYC data?",
      a: "Under PDPA, you have the right to request deletion. However, financial regulations require retention for a minimum of 5 years, after which data is securely deleted.",
    },
  ];

  return (
    <>
      <Header title="Identity Verification" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* Hero */}
        <div className="text-center mt-6 mb-8">
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-primary/15 to-purple/12 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary-light text-4xl">
              shield
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-text-primary">
            Verify Your Identity
          </h2>
          <p className="text-text-tertiary text-sm max-w-[520px] mx-auto">
            Complete identity verification to unlock full platform features.
            Powered by <strong className="text-text-secondary">Sumsub</strong> — trusted by Binance, Gate.io, and 2000+ companies.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-start justify-center gap-0 mb-10">
          {/* Step 1: Done */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-accent border-2 border-accent flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">check</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Account Created</p>
              <p className="text-[11px] text-text-muted">Email verified</p>
            </div>
          </div>
          {/* Line (done) */}
          <div className="flex-1 h-0.5 bg-accent mt-5 min-w-[40px]" />
          {/* Step 2: Active */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-primary border-2 border-primary flex items-center justify-center text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)]">
              <span className="text-sm font-bold">2</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Identity Check</p>
              <p className="text-[11px] text-text-muted">Document + Selfie</p>
            </div>
          </div>
          {/* Line (pending) */}
          <div className="flex-1 h-0.5 bg-border mt-5 min-w-[40px]" />
          {/* Step 3: Pending */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-background-tertiary border-2 border-border flex items-center justify-center text-text-muted">
              <span className="text-sm font-bold">3</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Fully Verified</p>
              <p className="text-[11px] text-text-muted">All features unlocked</p>
            </div>
          </div>
        </div>

        {/* Level Cards */}
        <div className="flex flex-col gap-4 mb-8">
          {levels.map((level) => (
            <div
              key={level.level}
              className={`bg-card border rounded-xl p-6 shadow-soft relative overflow-hidden transition-all ${
                level.status === "completed"
                  ? "border-accent/30"
                  : level.status === "current"
                    ? "border-primary/40 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                    : "border-border"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${level.iconBg}`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${level.iconColor}`}
                  >
                    {level.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-text-primary">
                    Level {level.level} — {level.name}
                  </p>
                  <p className="text-[13px] text-text-tertiary">
                    {level.description}
                  </p>
                </div>
                {/* Status Badge */}
                {level.status === "completed" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent-light">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Completed
                  </span>
                )}
                {level.status === "current" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-sm">recommend</span>
                    Recommended
                  </span>
                )}
                {level.status === "locked" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background-tertiary text-text-muted">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Locked
                  </span>
                )}
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {level.perks.map((perk) => (
                  <div
                    key={perk.label}
                    className={`flex items-center gap-2 text-[13px] text-text-secondary px-3 py-2 bg-background-tertiary rounded-lg ${
                      level.status === "locked" ? "opacity-50" : ""
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${perk.color}`}
                    >
                      {perk.icon}
                    </span>
                    {perk.label}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {level.status === "current" && (
                <Link
                  href="/kyc/verify"
                  className="w-full py-3 bg-primary text-white text-center text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                  Start Verification
                </Link>
              )}
              {level.status === "locked" && (
                <button
                  disabled
                  className="w-full py-3 bg-background-tertiary text-text-muted text-center text-sm font-semibold rounded-lg border border-border cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  Complete Level 2 First
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">help</span>
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group px-4 py-3 bg-background-tertiary rounded-lg cursor-pointer"
              >
                <summary className="text-sm font-semibold text-text-primary list-none flex items-center justify-between">
                  {faq.q}
                  <span className="material-symbols-outlined text-base text-text-muted group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="mt-2.5 text-[13px] text-text-tertiary leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
