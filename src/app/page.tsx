import Link from "next/link";
import { LandingNav } from "@/components/ui/landing-nav";

/* ---------- data ---------- */
const STATS = [
  { value: "5", label: "Live Projects" },
  { value: "15%", label: "Up to APY" },
  { value: "$5", label: "Min. Investment" },
  { value: "188", label: "Active Investors" },
];

const FEATURES: { icon: string; title: string; desc: string; accent: string }[] = [
  { icon: "token", title: "Fractional Tokenization", desc: "Own fractions of premium assets starting from just $5. Each token represents verified on-chain ownership.", accent: "primary" },
  { icon: "monitoring", title: "Real-Time Monitoring", desc: "Track revenue streams and asset valuations in real-time with institutional-grade data feeds.", accent: "accent" },
  { icon: "payments", title: "Automated Yield", desc: "Smart contract-powered yield payouts distributed monthly or quarterly with full transparency.", accent: "purple" },
  { icon: "verified_user", title: "KYC/AML Compliance", desc: "Institutional-grade identity verification with real-time AML screening and sanctions monitoring.", accent: "amber" },
  { icon: "account_balance_wallet", title: "Multi-Wallet Support", desc: "Connect MetaMask, Coinbase, or Trust Wallet. Pay with USDC, USDT, or ETH on Base.", accent: "cyan" },
  { icon: "shield", title: "Asset-Backed Security", desc: "Every investment backed by tangible assets with full legal documentation and third-party audits.", accent: "destructive" },
];

const STEPS = [
  { num: 1, title: "Create Account", desc: "Sign up in 60 seconds. Complete KYC with our streamlined 3-step verification process.", icon: "person_add" },
  { num: 2, title: "Connect Wallet", desc: "Connect MetaMask, Coinbase, or Trust Wallet. Fund with USDC, USDT, or ETH on Base.", icon: "account_balance_wallet" },
  { num: 3, title: "Choose & Invest", desc: "Browse curated RWA projects with due diligence reports. Select your plan and invest.", icon: "trending_up" },
  { num: 4, title: "Earn Yield", desc: "Receive automated payouts monthly or quarterly. Track portfolio growth in real-time.", icon: "payments" },
];

const ASSET_CLASSES = [
  { icon: "apartment", label: "Real Estate", desc: "Premium income-generating properties", apy: "10.5%", color: "purple" },
  { icon: "agriculture", label: "Agriculture", desc: "Sustainable farming operations", apy: "12.0%", color: "accent" },
  { icon: "medical_services", label: "Healthcare", desc: "Medical device & clinic networks", apy: "14.5%", color: "primary" },
  { icon: "inventory_2", label: "Commodities", desc: "Waste recovery & energy infrastructure", apy: "15.0%", color: "amber" },
];

const TRUST_BADGES = [
  { icon: "encrypted", label: "AES-256 Encryption" },
  { icon: "fingerprint", label: "Biometric Auth" },
  { icon: "gavel", label: "KYC/AML Verified" },
  { icon: "account_balance", label: "Segregated Custody" },
  { icon: "description", label: "Third-Party Audited" },
  { icon: "dns", label: "Smart Contract Audited" },
];

const PROJECTS = [
  { sym: "SPPS", name: "Smart Produce Supply", cat: "Agriculture", loc: "Chiang Mai", apy: 12.0, raised: 1200000, target: 5000000, investors: 34 },
  { sym: "MDD", name: "re:H Medical Device Distribution", cat: "Healthcare", loc: "Bangkok", apy: 11.8, raised: 800000, target: 8000000, investors: 18 },
  { sym: "KBB", name: "K-Beauty Clinic Bangkok", cat: "Healthcare", loc: "Sukhumvit", apy: 14.5, raised: 600000, target: 4000000, investors: 22 },
  { sym: "WRP", name: "Waste Recovery Plant", cat: "Commodities", loc: "Eastern Seaboard", apy: 15.0, raised: 2040000, target: 12000000, investors: 28 },
  { sym: "REI", name: "Prime City Real Estate Income", cat: "Real Estate", loc: "Bangkok", apy: 10.5, raised: 3500000, target: 10000000, investors: 86 },
];

function accentClasses(accent: string) {
  const map: Record<string, string> = {
    primary: "bg-primary/8 text-primary dark:bg-primary/15 dark:text-primary-light",
    accent: "bg-accent/8 text-accent-dark dark:bg-accent/15 dark:text-accent-light",
    purple: "bg-purple/8 text-purple dark:bg-purple/15 dark:text-purple",
    amber: "bg-amber/8 text-amber-dark dark:bg-amber/15 dark:text-amber",
    cyan: "bg-cyan/8 text-cyan dark:bg-cyan/15 dark:text-cyan",
    destructive: "bg-destructive/8 text-destructive dark:bg-destructive/15 dark:text-destructive",
  };
  return map[accent] ?? map.primary;
}

/* ---------- page ---------- */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-text-primary overflow-x-hidden">
      <LandingNav />

      {/* ===== HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background — subtle gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-[600px] h-[600px] bg-primary/[0.04] dark:bg-primary/[0.08] rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-purple/[0.03] dark:bg-purple/[0.06] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-[13px] font-medium text-primary mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
                Live on Base Mainnet
              </div>

              <h1 className="text-[2.75rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.08] tracking-[-0.03em] mb-6">
                Invest in{" "}
                <span className="gradient-text">Real World Assets</span>
                <br />
                Starting at $5
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-[520px]">
                Access fractional ownership in premium real estate, agriculture,
                healthcare, and energy. Earn 10&ndash;15% APY backed by real,
                auditable assets on-chain.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Start Investing
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <a
                  href="#assets"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold border border-border text-text-secondary rounded-xl hover:border-primary/40 hover:text-primary transition-all"
                >
                  Explore Assets
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-8 sm:gap-12">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <span className="text-2xl lg:text-3xl font-bold tracking-tight tabular-nums text-text-primary">
                      {s.value}
                    </span>
                    <span className="block text-xs text-text-muted mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Asset class preview cards */}
            <div className="hidden lg:block relative">
              <div className="grid grid-cols-2 gap-4">
                {ASSET_CLASSES.map((a, i) => (
                  <div
                    key={a.label}
                    className={`glass rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-medium ${i === 0 ? "translate-y-6" : i === 3 ? "translate-y-6" : ""}`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-${a.color}/10 dark:bg-${a.color}/20 flex items-center justify-center mb-3`}>
                      <span className={`material-symbols-outlined text-${a.color} text-xl`}>{a.icon}</span>
                    </div>
                    <h4 className="text-sm font-semibold mb-0.5">{a.label}</h4>
                    <p className="text-xs text-text-muted mb-3">{a.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tabular-nums text-accent">{a.apy}</span>
                      <span className="text-xs text-text-muted">APY</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF BAR ===== */}
      <section className="border-y border-border bg-background-secondary">
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-text-muted">
            <span>Powered by <strong className="text-text-primary">Base</strong> (Coinbase L2)</span>
            <span className="hidden sm:inline text-border">|</span>
            <span><strong className="text-text-primary">ERC-1155</strong> tokenized positions</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>Smart contracts <strong className="text-accent">verified</strong> on Basescan</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-tight mb-4">
              Built for Institutional-Grade RWA
            </h2>
            <p className="text-base text-text-tertiary max-w-[560px] mx-auto leading-relaxed">
              Every feature designed for tokenized real-world asset investment &mdash;
              from due diligence to yield distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-medium"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accentClasses(f.accent)}`}>
                  <span className="material-symbols-outlined text-xl">{f.icon}</span>
                </div>
                <h4 className="font-semibold mb-1.5 text-[15px]">{f.title}</h4>
                <p className="text-sm text-text-tertiary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ASSET CLASSES ===== */}
      <section id="assets" className="py-20 lg:py-28 bg-background-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">RWA Asset Classes</p>
              <h2 className="text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-tight mb-3">
                Tokenized Real World Assets
              </h2>
              <p className="text-base text-text-tertiary max-w-[520px] leading-relaxed">
                Diversify across premium asset classes &mdash; each backed by real
                revenue-generating properties and independently audited.
              </p>
            </div>
            <Link
              href="/investments"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg shadow-glow hover:bg-primary-dark transition-all self-start lg:self-auto"
            >
              View All Projects
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Project cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECTS.map((p) => {
              const pct = ((p.raised / p.target) * 100).toFixed(1);
              const fmtRaised = p.raised >= 1e6 ? `$${(p.raised / 1e6).toFixed(1)}M` : `$${(p.raised / 1e3).toFixed(0)}K`;
              const fmtTarget = p.target >= 1e6 ? `$${(p.target / 1e6).toFixed(0)}M` : `$${(p.target / 1e3).toFixed(0)}K`;
              return (
                <div key={p.sym} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-medium group">
                  {/* Card header gradient */}
                  <div className="h-1.5 bg-gradient-to-r from-primary via-purple to-accent" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-text-primary truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-semibold text-primary bg-primary/8 dark:bg-primary/15 px-1.5 py-0.5 rounded">{p.sym}</span>
                          <span className="text-[11px] text-text-muted">{p.cat}</span>
                          <span className="text-[11px] text-text-muted flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[10px]">location_on</span>
                            {p.loc}
                          </span>
                        </div>
                      </div>
                      <span className="text-xl font-bold tabular-nums text-accent">{p.apy}%</span>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="h-1 bg-background-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-text-muted mt-1.5">
                        <span>{fmtRaised} raised</span>
                        <span>{pct}% of {fmtTarget}</span>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border text-center">
                      <div>
                        <div className="text-sm font-bold tabular-nums text-accent">{p.apy}%</div>
                        <div className="text-[10px] text-text-muted">APY</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold tabular-nums">$5</div>
                        <div className="text-[10px] text-text-muted">Min.</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold tabular-nums text-primary">{p.investors}</div>
                        <div className="text-[10px] text-text-muted">Investors</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-tight mb-4">
              Start Investing in 4 Steps
            </h2>
            <p className="text-base text-text-tertiary max-w-[520px] mx-auto leading-relaxed">
              From account creation to your first yield payout &mdash;
              intuitive, secure, and transparent.
            </p>
          </div>

          {/* Horizontal stepper on desktop, vertical on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="relative group">
                <div className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/20 hover:shadow-medium h-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple flex items-center justify-center text-base font-bold text-white mb-4">
                    {s.num}
                  </div>
                  <h4 className="font-semibold text-[15px] mb-2">{s.title}</h4>
                  <p className="text-sm text-text-tertiary leading-relaxed">{s.desc}</p>
                </div>
                {/* Connector line (desktop only, not on last item) */}
                {s.num < 4 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECURITY & TRUST ===== */}
      <section id="security" className="py-20 lg:py-28 bg-background-secondary">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Security & Compliance</p>
            <h2 className="text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-tight mb-4">
              Institutional-Grade Security
            </h2>
            <p className="text-base text-text-tertiary max-w-[520px] mx-auto leading-relaxed">
              Your assets are protected by multiple layers of security &mdash;
              from bank-level encryption to regulatory compliance.
            </p>
          </div>

          {/* Trust badges — horizontal pill strip */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TRUST_BADGES.map((b) => (
              <div
                key={b.label}
                className="inline-flex items-center gap-2.5 px-5 py-3 glass rounded-xl transition-all hover:shadow-medium hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-primary text-lg">{b.icon}</span>
                <span className="text-sm font-medium text-text-secondary">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED NETWORKS ===== */}
      <section className="py-12 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-[11px] uppercase text-text-muted tracking-[3px] mb-6 font-medium">
            Supported Networks & Standards
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
            {["Ethereum", "Polygon", "Arbitrum", "Base", "Optimism"].map((n) => (
              <span key={n} className="text-base sm:text-lg font-semibold text-text-muted/60">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="relative glass rounded-2xl p-12 sm:p-16 lg:p-20 text-center overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-tight mb-4">
                Start Building Your
                <br />
                <span className="gradient-text">RWA Portfolio</span> Today
              </h2>
              <p className="text-base text-text-tertiary max-w-[460px] mx-auto mb-8 leading-relaxed">
                Earn institutional-grade returns on tokenized real-world
                assets. Invest from as little as $5.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl shadow-glow hover:shadow-glow-lg transition-all hover:-translate-y-0.5"
                >
                  Create Free Account
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <a
                  href="#assets"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold border border-border text-text-secondary rounded-xl hover:border-primary/40 hover:text-primary transition-all"
                >
                  View Assets
                </a>
              </div>
              <p className="text-xs text-text-muted mt-5">
                No credit card required &bull; KYC verification in 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-background-secondary border-t border-border pt-14 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="lg:col-span-1 max-w-[280px]">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple rounded-lg flex items-center justify-center text-white text-base font-black">
                  &infin;
                </div>
                <span className="text-text-primary">
                  INFINIT<span className="text-primary">V8</span>
                </span>
              </Link>
              <p className="text-sm text-text-tertiary leading-relaxed">
                Institutional-grade access to tokenized real-world assets.
                Fractional ownership starting at $5.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Platform</h4>
              <nav className="flex flex-col gap-0.5">
                <Link href="/investments" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Marketplace</Link>
                <Link href="/dashboard" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Dashboard</Link>
                <Link href="/portfolio" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Portfolio</Link>
                <Link href="/wallet" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Wallet</Link>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Company</h4>
              <nav className="flex flex-col gap-0.5">
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">About Us</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Blog & Research</a>
                <a href="mailto:info@infinitv8.com" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Contact</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Legal</h4>
              <nav className="flex flex-col gap-0.5">
                <Link href="/terms" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Privacy Policy</Link>
                <Link href="/risk-disclosure" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Risk Disclosure</Link>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-3 text-xs text-text-muted">
            <span>&copy; 2026 INFINITV8. All rights reserved.</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
