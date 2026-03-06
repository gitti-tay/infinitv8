"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface KycCheckStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export function KycCheckStep({ onContinue, onBack }: KycCheckStepProps) {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setKycStatus(data.kycStatus);
      } catch {
        setError("Failed to check verification status");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text-muted text-sm">Checking verification status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
          <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark">
            <button
              onClick={onBack}
              className="block w-full py-3.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-secondary transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = kycStatus === "APPROVED";
  const isPending = kycStatus === "PENDING";

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
          Identity Verification
        </h2>
        <p className="text-sm text-text-muted">
          KYC verification is required to invest
        </p>
      </div>

      {isApproved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-accent text-3xl">verified_user</span>
          </div>
          <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
            Identity Verified
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            Your identity has been verified. You can proceed with your investment.
          </p>
        </div>
      )}

      {isPending && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-500 text-3xl">hourglass_top</span>
          </div>
          <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-1">
            Verification In Progress
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            Your identity verification is being reviewed. This usually takes 5-30 minutes.
          </p>
          <Link
            href="/kyc/status"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Check Status
          </Link>
        </div>
      )}

      {!isApproved && !isPending && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">gpp_bad</span>
          </div>
          <h3 className="font-bold text-lg text-red-900 dark:text-red-100 mb-1">
            Verification Required
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            You must complete identity verification before investing. This involves submitting a government-issued ID and a biometric selfie.
          </p>
          <Link
            href="/kyc"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg shadow-glow hover:bg-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-base">badge</span>
            Complete KYC Verification
          </Link>
        </div>
      )}

      {/* CTAs */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40">
        <div className="max-w-5xl mx-auto px-5 pb-4 pt-3 bg-gradient-to-t from-bg-light dark:from-bg-dark flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3.5 border border-border rounded-xl text-sm font-semibold text-text-secondary hover:bg-background-secondary transition-colors"
          >
            Back
          </button>
          {isApproved && (
            <button
              onClick={onContinue}
              className="flex-1 py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
