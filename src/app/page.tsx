import Link from "next/link";
import { LandingNav } from "@/components/ui/landing-nav";

/* ---------- data ---------- */
const STATS = [
  { value: "5", label: "Live Projects", color: "text-text-primary" },
  { value: "Up to 15%", label: "APY Returns", color: "text-accent-light" },
  { value: "$5", label: "Min. Investment", color: "text-primary-light" },
  { value: "Base", label: "Blockchain", color: "text-text-primary" },
];

const FEATURES: { icon: string; title: string; desc: string; color: string }[] = [
  { icon: "token", title: "Fractional Tokenization", desc: "Own fractions of premium assets starting from just $5. Each token represents verified ownership backed by legal documentation and on-chain proof.", color: "bg-primary/10 text-primary-light" },
  { icon: "monitoring", title: "Real-Time Asset Monitoring", desc: "Track occupancy rates, revenue streams, and asset valuations in real-time. Live dashboards with institutional-grade data feeds.", color: "bg-accent/10 text-accent-light" },
  { icon: "payments", title: "Automated Yield Distribution", desc: "Smart contract-powered yield payouts -- monthly or quarterly. Track every payment with full transparency and on-chain verification.", color: "bg-purple/10 text-purple" },
  { icon: "verified_user", title: "KYC/AML Compliance", desc: "Institutional-grade identity verification with real-time AML screening, PEP checks, and sanctions list monitoring.", color: "bg-amber/10 text-amber" },
  { icon: "account_balance_wallet", title: "Multi-Chain Wallet", desc: "Connect MetaMask, Coinbase, or Trust Wallet. Support for Ethereum, Polygon, Arbitrum, Base, and Optimism networks.", color: "bg-cyan/10 text-cyan" },
  { icon: "shield", title: "Asset-Backed Security", desc: "Every investment backed by tangible assets -- real estate, energy infrastructure, forestry. Full legal documentation and third-party audits.", color: "bg-destructive/10 text-destructive" },
];

const STEPS = [
  { num: 1, title: "Create & Verify Account", desc: "Sign up in 60 seconds. Complete KYC verification with our streamlined 3-step process -- personal info, ID upload, and selfie verification. Approved within 24 hours." },
  { num: 2, title: "Connect Your Wallet", desc: "Connect MetaMask, Coinbase Wallet, or Trust Wallet. Fund with USDC, USDT, or ETH on the Base network. No minimum deposit, no hidden fees." },
  { num: 3, title: "Choose & Invest", desc: "Browse curated RWA projects with full due diligence reports. Select your investment plan -- Flexible, Standard, or Premium -- and confirm with bank-level encryption." },
  { num: 4, title: "Earn Yield & Track", desc: "Receive automated yield payouts monthly or quarterly. Monitor asset performance, occupancy rates, and your portfolio growth in real-time from your dashboard." },
];

const SECURITY = [
  { icon: "encrypted", title: "Bank-Level Encryption", desc: "AES-256 encryption for all data at rest and TLS 1.3 for data in transit." },
  { icon: "fingerprint", title: "Biometric Authentication", desc: "Face ID and fingerprint login with hardware-level secure enclave storage." },
  { icon: "gavel", title: "Regulatory Compliance", desc: "KYC/AML verification, PEP screening, and sanctions monitoring for all users." },
  { icon: "account_balance", title: "Segregated Custody", desc: "Client assets held in segregated accounts, never commingled with platform funds." },
  { icon: "description", title: "Third-Party Audits", desc: "Independent audits of all underlying assets with published reports and on-chain verification." },
  { icon: "dns", title: "Smart Contract Audits", desc: "Audited smart contracts across all 5 supported blockchain networks." },
];

const NETWORKS = ["Ethereum", "Polygon", "Arbitrum", "Base", "Optimism"];

/* ---------- page ---------- */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background text-text-primary overflow-x-hidden">
      <LandingNav />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] bg-purple/[0.05] rounded-full blur-3xl" />
          <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-accent/[0.03] rounded-full blur-3xl" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 w-full">
          <div className="max-w-[680px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary-light mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live &mdash; Regulated RWA Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.05] tracking-[-2px] mb-6">
              Institutional-Grade
              <br />
              <span className="bg-gradient-to-br from-primary-light to-primary-lighter bg-clip-text text-transparent">
                Real World Assets
              </span>
              <br />
              For{" "}
              <span className="bg-gradient-to-br from-accent-light to-[#6ee7b7] bg-clip-text text-transparent">
                Everyone
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-text-tertiary leading-relaxed mb-10 max-w-[560px]">
              Access fractional ownership in premium real estate, sustainable
              agriculture, clean energy, and healthcare &mdash; starting from
              just $5. Earn 10&ndash;15% APY backed by real, auditable assets.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-primary text-white rounded shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-0.5"
              >
                Start Investing
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <a
                href="#assets"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold border border-border-light text-text-secondary rounded hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                Explore Assets
                <span className="material-symbols-outlined text-lg">explore</span>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className={`text-2xl lg:text-[28px] font-extrabold tracking-tight ${s.color}`}>
                    {s.value}
                  </span>
                  <span className="text-xs text-text-muted mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/15 rounded-full text-xs font-semibold text-primary-light uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mb-4">
              Built for Institutional-Grade
              <br />
              RWA Investment
            </h2>
            <p className="text-base text-text-tertiary max-w-[600px] mx-auto leading-relaxed">
              Every feature designed specifically for tokenized real-world asset
              investment &mdash; from due diligence to yield distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-lg p-8 transition-all hover:border-border-light hover:-translate-y-1 hover:shadow-medium"
              >
                <div className={`w-[52px] h-[52px] rounded flex items-center justify-center mb-5 ${f.color}`}>
                  <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                </div>
                <h4 className="font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-text-tertiary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ASSET CLASSES (placeholder anchor) ===== */}
      <section id="assets" className="py-16 lg:py-24 bg-background-secondary">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/15 rounded-full text-xs font-semibold text-primary-light uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">apartment</span>
              RWA Asset Classes
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mb-4">
                  Tokenized Real World Assets
                </h2>
                <p className="text-base text-text-tertiary max-w-[600px] leading-relaxed">
                  Diversify across premium asset classes &mdash; each backed by real
                  revenue-generating properties and independently audited.
                </p>
              </div>
              <Link
                href="/investments"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-white rounded-sm shadow-glow hover:bg-primary-dark transition-colors self-start lg:self-auto"
              >
                View All Projects
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* 5 project cards -- hardcoded from existing DB projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { sym: "SPPS", name: "Smart Produce Supply", cat: "Agriculture", loc: "Chiang Mai, Thailand", apy: 12.0, min: 5, risk: "Medium", raised: 1200000, target: 5000000, investors: 34 },
              { sym: "MDD", name: "re:H Medical Device Distribution", cat: "Healthcare", loc: "Bangkok, Thailand", apy: 11.8, min: 5, risk: "Medium", raised: 800000, target: 8000000, investors: 18 },
              { sym: "KBB", name: "K-Beauty Clinic Bangkok", cat: "Healthcare", loc: "Sukhumvit, Bangkok", apy: 14.5, min: 5, risk: "Medium", raised: 600000, target: 4000000, investors: 22 },
              { sym: "WRP", name: "Waste Recovery Plant", cat: "Commodities", loc: "Eastern Seaboard, Thailand", apy: 15.0, min: 5, risk: "Medium", raised: 2040000, target: 12000000, investors: 28 },
              { sym: "REI", name: "Prime City Real Estate Income", cat: "Real Estate", loc: "Bangkok & Chiang Mai", apy: 10.5, min: 5, risk: "Low", raised: 3500000, target: 10000000, investors: 86 },
            ].map((p) => {
              const pct = ((p.raised / p.target) * 100).toFixed(1);
              const fmtRaised = p.raised >= 1e6 ? `$${(p.raised / 1e6).toFixed(1)}M` : `$${(p.raised / 1e3).toFixed(0)}K`;
              const fmtTarget = p.target >= 1e6 ? `$${(p.target / 1e6).toFixed(0)}M` : `$${(p.target / 1e3).toFixed(0)}K`;
              const riskColor = p.risk === "Low" ? "bg-accent/15 text-accent-light" : p.risk === "Medium" ? "bg-amber/15 text-amber" : "bg-destructive/15 text-destructive";
              return (
                <div key={p.sym} className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:border-border-light hover:-translate-y-1 hover:shadow-medium">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-text-primary">{p.name}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${riskColor}`}>
                        {p.risk}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-background-tertiary text-text-tertiary border border-border">{p.sym}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-background-tertiary text-text-tertiary border border-border">{p.cat}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-background-tertiary text-text-tertiary border border-border">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {p.loc.split(",")[0]}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted mb-4">
                      <span>{fmtRaised} raised</span>
                      <span>{pct}% of {fmtTarget}</span>
                    </div>
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-base font-bold font-mono text-accent-light">{p.apy}%</div>
                        <div className="text-[11px] text-text-muted mt-0.5">APY</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold font-mono text-text-primary">${p.min}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">Min. Invest</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold font-mono text-primary-light">{p.investors}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">Investors</div>
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
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/15 rounded-full text-xs font-semibold text-primary-light uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">route</span>
              How It Works
            </div>
            <h2 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mb-4">
              Start Investing in 4 Steps
            </h2>
            <p className="text-base text-text-tertiary max-w-[600px] mx-auto leading-relaxed">
              From account creation to your first yield payout &mdash; everything
              is designed to be intuitive, secure, and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="flex gap-6 p-8 rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-glow"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple flex items-center justify-center text-xl font-extrabold text-white shrink-0">
                  {s.num}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{s.title}</h4>
                  <p className="text-sm text-text-tertiary leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECURITY & COMPLIANCE ===== */}
      <section id="security" className="py-16 lg:py-24 bg-background-secondary">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/15 rounded-full text-xs font-semibold text-primary-light uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">security</span>
              Security & Compliance
            </div>
            <h2 className="text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mb-4">
              Institutional-Grade Security
            </h2>
            <p className="text-base text-text-tertiary max-w-[600px] mx-auto leading-relaxed">
              Your assets are protected by multiple layers of security &mdash;
              from bank-level encryption to regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY.map((s) => (
              <div key={s.title} className="flex gap-4 p-6 rounded border border-border bg-card">
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center bg-accent/10 text-accent-light shrink-0">
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </div>
                <div>
                  <h5 className="font-semibold mb-1 text-sm">{s.title}</h5>
                  <p className="text-xs text-text-tertiary leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED NETWORKS ===== */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p className="text-xs uppercase text-text-muted tracking-[3px] mb-8 font-semibold">
            Supported Networks & Standards
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-10 flex-wrap opacity-50">
            {NETWORKS.map((n) => (
              <span key={n} className="text-lg sm:text-xl font-semibold text-text-muted">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="relative bg-gradient-to-br from-primary/15 to-purple/10 border border-primary/20 rounded-xl sm:rounded-2xl p-10 sm:p-20 text-center overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/15 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold tracking-tight leading-tight mb-4">
                Start Building Your
                <br />
                RWA Portfolio Today
              </h2>
              <p className="text-base text-text-tertiary max-w-[500px] mx-auto mb-8 leading-relaxed">
                Earn institutional-grade returns on tokenized real-world
                assets. Invest from as little as $5.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-primary text-white rounded shadow-glow hover:bg-primary-dark transition-all hover:-translate-y-0.5"
                >
                  Create Free Account
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
                <a
                  href="#assets"
                  className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border border-border-light text-text-secondary rounded hover:border-primary hover:text-primary transition-colors"
                >
                  View Assets
                </a>
              </div>
              <p className="text-xs text-text-muted mt-4">
                No credit card required &bull; KYC verification in 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-background-secondary border-t border-border pt-16 pb-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1 max-w-[320px]">
              <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple rounded-[10px] flex items-center justify-center text-white text-lg font-black">
                  &infin;
                </div>
                <span className="text-text-primary">
                  INFINIT<span className="text-primary-light">V8</span>
                </span>
              </Link>
              <p className="text-sm text-text-tertiary mb-4 leading-relaxed">
                Institutional-grade access to tokenized real-world assets.
                Fractional ownership in premium real estate, agriculture, energy,
                and private credit.
              </p>
              <p className="text-xs text-text-muted">INFINITV8 Inc.</p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Platform</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/investments" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Marketplace</Link>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Portfolio Tracker</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Yield Calculator</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Asset Reports</a>
              </nav>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Company</h4>
              <nav className="flex flex-col gap-1">
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">About Us</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Careers</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Blog & Research</a>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Contact</a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[1.5px] text-text-muted mb-4">Legal</h4>
              <nav className="flex flex-col gap-1">
                <Link href="/terms" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Terms of Service</Link>
                <Link href="/privacy" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Privacy Policy</Link>
                <Link href="/risk-disclosure" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Risk Disclosure</Link>
                <a href="#" className="text-sm text-text-tertiary hover:text-text-primary transition-colors py-1">Cookie Policy</a>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-3 text-xs text-text-muted">
            <span>&copy; 2026 INFINITV8. All rights reserved.</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/15 text-accent-light rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
