"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Header } from "@/components/ui/header";

declare global {
  interface Window {
    SNSWebSDK: {
      init(
        accessToken: string,
        flowCompletedHandler: () => void,
      ): {
        withConf(conf: { lang: string }): {
          withOptions(opts: { addViewportTag: boolean }): {
            on(event: string, handler: (...args: unknown[]) => void): unknown;
            build(): { launch(containerId: string): void };
          };
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

export default function KycVerifyPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const initializeSdk = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const token = await fetchKycToken();
      await loadSumsubScript();

      if (!containerRef.current) return;

      const sdk = window.SNSWebSDK.init(token, () => {
        router.push("/kyc/status");
      })
        .withConf({ lang: "en" })
        .withOptions({ addViewportTag: false })
        .on("onError", (err: unknown) => {
          console.error("Sumsub SDK error:", err);
          setError("Verification encountered an error. Please try again.");
        });

      sdk.build().launch("sumsub-container");
      setLoading(false);
    } catch (err) {
      console.error("KYC init error:", err);
      setError("Failed to initialize verification. Please try again.");
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initializeSdk();
  }, [initializeSdk]);

  return (
    <>
      <Header title="Verify Identity" />
      <div className="pt-16 pb-24 px-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-text-muted text-sm">
              Loading verification...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <span className="material-icons text-red-500 text-3xl">
                error_outline
              </span>
            </div>
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            <button
              onClick={() => {
                initializedRef.current = false;
                initializeSdk();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        <div
          id="sumsub-container"
          ref={containerRef}
          className={loading || error ? "hidden" : "mt-4"}
        />
      </div>
    </>
  );
}
