"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send verification code on mount
  useEffect(() => {
    if (email) {
      sendCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function sendCode() {
    try {
      setResending(true);
      await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
    } catch {
      setError("Failed to send code");
    } finally {
      setResending(false);
    }
  }

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const full = newCode.join("");
    if (full.length === 6 && newCode.every((d) => d !== "")) {
      handleVerify(full);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }

  async function handleVerify(codeStr?: string) {
    const fullCode = codeStr || code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-text-muted mb-4">No email specified.</p>
          <Link href="/auth/signup" className="text-primary-light font-semibold hover:underline">
            Go to Sign Up
          </Link>
        </div>
      </div>
    );
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
              Email Verified
            </h2>
            <p className="text-sm text-text-tertiary mb-4">
              Your account has been activated. Redirecting to sign in...
            </p>
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
              </div>
              <h2 className="text-[28px] font-extrabold tracking-tight mb-2 text-text-primary">
                Verify Your Email
              </h2>
              <p className="text-sm text-text-tertiary">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-text-primary mt-1">{email}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/[0.08] border border-destructive/[0.15] rounded-lg mb-5 text-[13px] text-destructive">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Code Input */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-background-secondary border border-border rounded-lg outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-primary/10 text-text-primary"
                  disabled={loading}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || code.some((d) => d === "")}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-[15px] font-bold rounded-lg transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-5"
            >
              {loading ? (
                <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Email</span>
                  <span className="material-symbols-outlined text-lg">verified</span>
                </>
              )}
            </button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-text-tertiary mb-2">
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={sendCode}
                disabled={resending || resendCooldown > 0}
                className="text-sm font-semibold text-primary-light hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : resending
                  ? "Sending..."
                  : "Resend Code"}
              </button>
            </div>

            {/* Back link */}
            <div className="text-center mt-8 text-sm text-text-tertiary">
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
