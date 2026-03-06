"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";

  // If token present in URL, show reset form; otherwise show email form
  if (tokenParam) {
    return <ResetPasswordForm token={tokenParam} email={emailParam} />;
  }
  return <RequestResetForm />;
}

function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-[14px] flex items-center justify-center text-2xl font-black text-white shadow-glow">
            &infin;
          </div>
          <div className="text-xl font-extrabold tracking-tight text-text-primary">
            INFINIT<span className="text-primary-light">V8</span>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-accent text-4xl">mark_email_read</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-text-primary">
              Check Your Email
            </h2>
            <p className="text-sm text-text-tertiary mb-2">
              If an account exists for <strong className="text-text-primary">{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <p className="text-sm text-text-tertiary mb-6">
              The link expires in 30 minutes.
            </p>
            <Link
              href="/auth/signin"
              className="text-sm font-semibold text-primary-light hover:text-primary hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
              </div>
              <h2 className="text-[28px] font-extrabold tracking-tight mb-2 text-text-primary">
                Forgot Password?
              </h2>
              <p className="text-sm text-text-tertiary">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/[0.08] border border-destructive/[0.15] rounded-lg mb-5 text-[13px] text-destructive">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-[15px] text-text-primary outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-lg transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-5"
              >
                {loading ? (
                  <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-symbols-outlined text-lg">send</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-sm text-text-tertiary">
              <Link
                href="/auth/signin"
                className="text-primary-light font-semibold hover:text-primary hover:underline transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-[14px] flex items-center justify-center text-2xl font-black text-white shadow-glow">
            &infin;
          </div>
          <div className="text-xl font-extrabold tracking-tight text-text-primary">
            INFINIT<span className="text-primary-light">V8</span>
          </div>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-accent text-4xl">check_circle</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-text-primary">
              Password Reset
            </h2>
            <p className="text-sm text-text-tertiary mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-lg transition-all shadow-glow"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">password</span>
              </div>
              <h2 className="text-[28px] font-extrabold tracking-tight mb-2 text-text-primary">
                Set New Password
              </h2>
              <p className="text-sm text-text-tertiary">
                Choose a strong password for your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/[0.08] border border-destructive/[0.15] rounded-lg mb-5 text-[13px] text-destructive">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={10}
                    placeholder="Min 10 chars, upper, lower, digit, special"
                    className="w-full px-4 py-3 pr-12 bg-background-secondary border border-border rounded-lg text-[15px] text-text-primary outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-[15px] text-text-primary outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10 placeholder:text-text-tertiary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-lg transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
