"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-15%] right-[-10%] w-64 h-64 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />

      <div className="max-w-md mx-auto w-full px-5 pt-10 pb-8 flex-1 flex flex-col relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-3xl">
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-text-muted text-sm mt-1">
            Sign in to your account
          </p>

          {/* Security badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xs">
              lock
            </span>
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
              Bank-Grade Encryption
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Password</label>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-semibold rounded-xl shadow-glow hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-6">
          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>

          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-text-muted text-xs">
                lock
              </span>
              <span className="text-[10px] text-text-muted">
                256-bit SSL
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-text-muted text-xs">
                verified_user
              </span>
              <span className="text-[10px] text-text-muted">
                KYC/AML Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
