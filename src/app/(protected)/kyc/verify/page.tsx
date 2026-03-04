"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Header } from "@/components/ui/header";

interface SumsubSDKBuilder {
  on(event: string, handler: (...args: unknown[]) => void): SumsubSDKBuilder;
  build(): { launch(containerId: string): void };
}

declare global {
  interface Window {
    SNSWebSDK: {
      init(
        accessToken: string,
        flowCompletedHandler: () => void,
      ): {
        withConf(conf: { lang: string }): {
          withOptions(opts: { addViewportTag: boolean }): SumsubSDKBuilder;
        };
      };
    };
  }
}

async function fetchKycToken(): Promise<string> {
  const res = await fetch("/api/kyc/token");
  if (!res.ok) {
    throw new Error("Failed to fetch KYC token");
  }
  const data = await res.json();
  return data.token;
}

function loadSumsubScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.SNSWebSDK) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://static.sumsub.com/idensic/static/sns-websdk-builder.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Sumsub SDK"));
    document.head.appendChild(script);
  });
}

const PDPA_ITEMS = [
  {
    id: "pdpa-personal",
    label:
      'I consent to the collection and processing of my personal information (full name, date of birth, nationality, address) for identity verification purposes as required by applicable KYC/AML regulations.',
  },
  {
    id: "pdpa-biometric",
    label:
      'I consent to the collection and processing of my biometric data (facial images via selfie/liveness check) classified as sensitive personal data under PDPA Section 26. This data is used solely for identity verification and fraud prevention.',
  },
  {
    id: "pdpa-documents",
    label:
      'I consent to the collection and processing of my government-issued identity documents (passport, national ID card, or driver\'s license) for document verification purposes.',
  },
  {
    id: "pdpa-transfer",
    label:
      'I acknowledge that my data may be transferred internationally to Sumsub\'s secure servers for processing, with adequate safeguards in place as per PDPA Section 28.',
  },
];

export default function KycVerifyPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const [showSdk, setShowSdk] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({});

  const allConsented = PDPA_ITEMS.every((item) => consents[item.id]);

  const toggleConsent = (id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const initializeSdk = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await fetchKycToken();
      await loadSumsubScript();

      if (!containerRef.current) return;

      const sdk = window.SNSWebSDK.init(token, () => {
        router.push("/kyc/status");
      })
        .withConf({ lang: "en" })
        .withOptions({ addViewportTag: false })
        .on("onError", () => {
          setError("Verification encountered an error. Please try again.");
        });

      sdk.build().launch("sumsub-container");
      setLoading(false);
    } catch {
      setError("Failed to initialize verification. Please try again.");
      setLoading(false);
    }
  }, [router]);

  const handleProceed = () => {
    setShowSdk(true);
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeSdk();
    }
  };

  useEffect(() => {
    // Cleanup
  }, []);

  return (
    <>
      <Header title="Verify Identity" />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* PDPA Consent Section */}
        {!showSdk && (
          <div className="mt-4">
            {/* Info Banner */}
            <div className="flex items-start gap-3 px-4 py-4 rounded-lg mb-6 bg-primary/[0.08] border border-primary/15 text-primary-light">
              <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">
                info
              </span>
              <div className="text-[13px] leading-relaxed">
                <strong className="text-text-primary">PDPA Compliance Notice</strong>
                <br />
                In accordance with Thailand&apos;s Personal Data Protection Act
                (PDPA), we require your explicit consent before collecting and
                processing your personal data for identity verification.
              </div>
            </div>

            {/* Consent Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
              <h3 className="text-lg font-bold text-text-primary mb-1">
                Data Processing Consent
              </h3>
              <p className="text-[13px] text-text-tertiary mb-4">
                Please review and provide your consent for the following:
              </p>

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
                    <span className="text-[13px] text-text-secondary leading-relaxed">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Retention notice */}
              <div className="flex items-center gap-2 mt-4 px-3 py-3 bg-background-tertiary rounded-lg text-[12px] text-text-muted">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>
                  Data retention: Your KYC data will be retained for 5 years as
                  required by anti-money laundering regulations.
                </span>
              </div>

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
                  disabled={!allConsented}
                  className={`flex-[2] py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    allConsented
                      ? "bg-primary hover:bg-primary-dark cursor-pointer"
                      : "bg-primary/50 cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    verified_user
                  </span>
                  Proceed to Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sumsub SDK Section */}
        {showSdk && (
          <div className="mt-4">
            {/* Info Banner */}
            <div className="flex items-start gap-3 px-4 py-4 rounded-lg mb-6 bg-accent/[0.08] border border-accent/15 text-accent-light">
              <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">
                security
              </span>
              <div className="text-[13px] leading-relaxed">
                <strong className="text-text-primary">Secure Verification in Progress</strong>
                <br />
                Your verification is powered by Sumsub&apos;s encrypted
                platform. Please have your government-issued ID ready and ensure
                good lighting for the selfie check.
              </div>
            </div>

            {/* SDK Container */}
            <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[500px] relative shadow-soft">
              {loading && (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                  <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-text-tertiary">
                    Initializing secure verification...
                  </p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-destructive text-3xl">
                      error
                    </span>
                  </div>
                  <p className="text-sm text-destructive font-semibold">
                    Failed to initialize verification
                  </p>
                  <p className="text-[13px] text-text-tertiary text-center">
                    {error}
                  </p>
                  <button
                    onClick={() => {
                      initializedRef.current = false;
                      initializeSdk();
                    }}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Retry
                  </button>
                </div>
              )}

              <div
                id="sumsub-container"
                ref={containerRef}
                className={loading || error ? "hidden" : ""}
              />
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
                SOC 2 Type II
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
