import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark relative overflow-hidden flex flex-col">
      {/* Decorative background blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/15 rounded-full blur-3xl" />
      <div className="absolute top-[40%] right-[-5%] w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-md mx-auto w-full px-6 flex flex-col min-h-dvh relative z-10">
        {/* Top spacer */}
        <div className="flex-1" />

        {/* Center content */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-4xl">
              account_balance_wallet
            </span>
          </div>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-card-light dark:bg-card-dark px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 mb-6">
            <span className="material-symbols-outlined text-accent text-sm">
              verified
            </span>
            <span className="text-xs font-medium text-text-muted">
              Trusted by 50,000+ Investors
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Institutional-Grade
            <br />
            <span className="text-primary">Real World Assets</span>
          </h1>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs mx-auto">
            Access fractional ownership in premium real estate, agriculture, and
            healthcare investments with blockchain-powered returns.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">15%+</p>
            <p className="text-[10px] text-text-muted">Avg. APY</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-secondary">$20M+</p>
            <p className="text-[10px] text-text-muted">Assets Managed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-accent">2,500+</p>
            <p className="text-[10px] text-text-muted">Investors</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pb-8">
          <Link
            href="/auth/signup"
            className="block w-full py-4 bg-primary text-white text-center font-semibold rounded-xl shadow-glow hover:bg-primary-dark active:scale-[0.98] transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full py-4 bg-card-light dark:bg-card-dark text-text-main dark:text-white text-center font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
          >
            Log In
          </Link>
          <p className="text-center text-[10px] text-text-muted mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
