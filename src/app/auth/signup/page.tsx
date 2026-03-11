"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isInAppBrowser } from "@/lib/detect-browser";

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  barColors: string[];
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const barColorMap: Record<number, string[]> = {
    0: ["bg-background-tertiary", "bg-background-tertiary", "bg-background-tertiary", "bg-background-tertiary"],
    1: ["bg-destructive", "bg-background-tertiary", "bg-background-tertiary", "bg-background-tertiary"],
    2: ["bg-amber", "bg-amber", "bg-background-tertiary", "bg-background-tertiary"],
    3: ["bg-amber", "bg-amber", "bg-accent", "bg-background-tertiary"],
    4: ["bg-accent", "bg-accent", "bg-accent", "bg-accent"],
  };

  const labels: Record<number, string> = {
    0: "",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return {
    level: score,
    label: labels[score] || "",
    barColors: barColorMap[score] || barColorMap[0],
  };
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  useEffect(() => {
    setInAppBrowser(isInAppBrowser());
  }, []);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* ===== LEFT PANEL - Branding (Desktop Only) ===== */}
      <div className="hidden lg:flex flex-col justify-center relative overflow-hidden bg-background-tertiary p-20">
        {/* Decorative background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-purple/[0.04]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-[520px]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple rounded-[10px] flex items-center justify-center text-xl font-black text-white">
              &infin;
            </div>
            <div className="text-[22px] font-extrabold tracking-tight text-text-primary">
              INFINIT<span className="text-primary-light">V8</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-[-1.5px] mb-5 text-text-primary">
            Start Your
            <br />
            <span className="bg-gradient-to-r from-primary-light to-primary-lighter bg-clip-text text-transparent">
              RWA Investment
            </span>
            <br />
            Journey Today
          </h1>

          {/* Description */}
          <p className="text-base text-text-tertiary leading-relaxed mb-10">
            Join 2,847+ investors building wealth through tokenized real-world
            assets. From premium real estate to clean energy — diversify your
            portfolio with institutional-grade opportunities.
          </p>

          {/* 4-step process */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/[0.15] border border-primary/30 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                1
              </div>
              <div className="pt-1">
                <div className="text-sm text-text-secondary">
                  Create your account in 60 seconds
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  Email verification &amp; profile setup
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/[0.15] border border-primary/30 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                2
              </div>
              <div className="pt-1">
                <div className="text-sm text-text-secondary">
                  Complete KYC verification
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  3-step identity check — approved within 24h
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/[0.15] border border-primary/30 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                3
              </div>
              <div className="pt-1">
                <div className="text-sm text-text-secondary">
                  Fund &amp; start investing
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  Deposit via bank, USDT, or USDC — min $50
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-primary/[0.15] border border-primary/30 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                4
              </div>
              <div className="pt-1">
                <div className="text-sm text-text-secondary">
                  Earn automated yield payouts
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  Monthly/quarterly returns — 11-22% APY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="absolute bottom-10 left-20 right-20 flex items-center gap-6 pt-5 border-t border-border z-10 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent-light text-sm">
              verified
            </span>
            Regulated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary-light text-sm">
              encrypted
            </span>
            Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-purple text-sm">
              gavel
            </span>
            Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber text-sm">
              workspace_premium
            </span>
            Audited
          </span>
        </div>
      </div>

      {/* ===== RIGHT PANEL - Signup Form ===== */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-background border-l border-border overflow-y-auto max-h-screen">
        <div className="mx-auto w-full max-w-[420px]">
          {/* Mobile Logo (hidden on desktop) */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-purple rounded-xl flex items-center justify-center text-[22px] font-black text-white shadow-glow">
              &infin;
            </div>
            <div className="text-xl font-extrabold tracking-tight text-text-primary">
              INFINIT<span className="text-primary-light">V8</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-7 lg:text-left text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight mb-1.5 text-text-primary">
              Create your account
            </h2>
            <p className="text-sm text-text-tertiary">
              Start investing in tokenized real-world assets
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/[0.08] border border-destructive/[0.15] rounded-lg mb-4 text-[13px] text-destructive">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                  placeholder="Your legal name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg pl-10 pr-11 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {/* Password strength meter */}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 mt-1.5">
                    {strength.barColors.map((color, i) => (
                      <div
                        key={i}
                        className={`h-[3px] flex-1 rounded-sm transition-colors ${color}`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p
                      className={`text-[11px] mt-1 ${
                        strength.level <= 1
                          ? "text-destructive"
                          : strength.level <= 2
                          ? "text-amber"
                          : "text-accent-light"
                      }`}
                    >
                      {strength.label}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                  lock
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg pl-10 pr-11 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
              />
              <span className="text-[13px] text-text-tertiary leading-relaxed">
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary-light underline hover:text-primary"
                >
                  Terms of Service
                </a>
                ,{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary-light underline hover:text-primary"
                >
                  Privacy Policy
                </a>
                , and{" "}
                <a
                  href="/risk-disclosure"
                  target="_blank"
                  className="text-primary-light underline hover:text-primary"
                >
                  Risk Disclosure
                </a>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-lg transition-all shadow-glow hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-px active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google OAuth — hidden in wallet in-app browsers */}
          {inAppBrowser ? (
            <div className="w-full py-3 px-4 rounded-lg text-sm text-center border border-amber/20 bg-amber/[0.06] text-text-secondary">
              <p className="mb-2">Google sign-up is not available in wallet browsers.</p>
              <a
                href={typeof window !== "undefined" ? window.location.href : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary-light font-semibold hover:underline"
              >
                <span className="material-symbols-outlined text-base">open_in_new</span>
                Open in system browser
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2.5 border border-border bg-background-secondary hover:bg-background-tertiary hover:border-border-light transition-all active:scale-[0.98] text-text-primary"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32l3.57 2.77c2.08-1.92 3.27-4.74 3.27-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          )}

          {/* Sign in link */}
          <div className="text-center mt-6 text-sm text-text-tertiary">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary-light font-semibold hover:text-primary hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
