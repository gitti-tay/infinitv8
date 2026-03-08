"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/header";

const PDPA_ITEMS = [
  {
    id: "pdpa-personal",
    label: 'I consent to the collection and processing of my personal information (full name, date of birth, nationality, address) for identity verification purposes as required by applicable KYC/AML regulations.',
  },
  {
    id: "pdpa-biometric",
    label: 'I consent to the collection and processing of my biometric data (facial images via selfie/liveness check) classified as sensitive personal data under PDPA Section 26. This data is used solely for identity verification and fraud prevention.',
  },
  {
    id: "pdpa-documents",
    label: 'I consent to the collection and processing of my government-issued identity documents (passport, national ID card, or driver\'s license) for document verification purposes.',
  },
  {
    id: "pdpa-transfer",
    label: 'I acknowledge that my data may be transferred internationally to Didit\'s secure servers for processing, with adequate safeguards in place as per PDPA Section 28.',
  },
];

export default function KycVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consents, setConsents] = useState<Record<string, boolean>>({});

  const allConsented = PDPA_ITEMS.every((item) => consents[item.id]);

  const toggleConsent = (id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleProceed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kyc/token");
      if (!res.ok) {
        throw new Error("Failed to create verification session");
      }
      const data = await res.json();
      if (data.verificationUrl) {
        window.location.href = data.verificationUrl;
      } else {
        throw new Error("No verification URL received");
      }
    } catch {
      setError("Failed to start verification. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Verify Identity" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        <div className="mt-4">
          {/* Info Banner */}
          <div className="flex items-start gap-3 px-4 py-4 rounded-lg mb-6 bg-primary/[0.08] border border-primary/15 text-primary-light">
            <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">info</span>
            <div className="text-[13px] leading-relaxed">
              <strong className="text-text-primary">PDPA Compliance Notice</strong>
              <br />
              In accordance with Thailand&apos;s Personal Data Protection Act (PDPA), we require your explicit consent before collecting and processing your personal data for identity verification.
            </div>
          </div>

          {/* Consent Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <h3 className="text-lg font-bold text-text-primary mb-1">Data Processing Consent</h3>
            <p className="text-[13px] text-text-tertiary mb-4">Please review and provide your consent for the following:</p>

            <div className="space-y-2">
              {PDPA_ITEMS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-background-tertiary border border-border rounded-lg cursor-pointer hover:border-border-light transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!consents[item.id]}
                    onChange={() => toggleConsent(item.id)}
                    className="mt-1 w-[18px] h-[18px] accent-primary flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-[13px] text-text-secondary leading-relaxed">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Retention notice */}
            <div className="flex items-center gap-2 mt-4 px-3 py-3 bg-background-tertiary rounded-lg text-[12px] text-text-muted">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span>Data retention: Your KYC data will be retained for 5 years as required by anti-money laundering regulations.</span>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => router.back()}
                className="flex-1 py-3 rounded-lg text-sm font-semibold bg-background-tertiary border border-border text-text-secondary hover:bg-card-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={!allConsented || loading}
                className={`flex-[2] py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                  allConsented && !loading
                    ? "bg-primary hover:bg-primary-dark cursor-pointer"
                    : "bg-primary/50 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    Proceed to Verification
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 mt-4 text-[12px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              256-bit TLS
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield</span>
              GDPR & PDPA
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              Secure Verification
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
