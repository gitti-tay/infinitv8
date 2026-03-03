import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-bg-light to-white dark:from-bg-dark dark:to-gray-900">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-8 flex flex-col min-h-dvh">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow">
            <span className="material-icons text-white text-3xl">account_balance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Infinity Ventures</h1>
          <p className="text-text-muted text-sm mt-1">Professional Asset Management</p>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center text-center mb-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />
            <div className="relative bg-card-light dark:bg-card-dark rounded-3xl p-8 shadow-soft border border-gray-100 dark:border-gray-800">
              <span className="material-icons text-primary text-5xl mb-4">trending_up</span>
              <h2 className="text-xl font-bold mb-2">Institutional-Grade Assets for Everyone</h2>
              <p className="text-text-muted text-sm leading-relaxed">
                Access fractional ownership in premium real estate, agriculture, and healthcare investments with transparent blockchain-powered returns.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
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
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/auth/signup"
            className="block w-full py-4 bg-primary text-white text-center font-semibold rounded-xl shadow-glow hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="block w-full py-4 bg-transparent text-text-main dark:text-white text-center font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
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
