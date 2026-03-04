"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function KycStatusClient({
  referenceId,
  shouldRefresh,
}: {
  referenceId: string;
  shouldRefresh: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!shouldRefresh) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [shouldRefresh, router]);

  // Elapsed timer
  useEffect(() => {
    if (!shouldRefresh) return;

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldRefresh]);

  function handleCopy() {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mins = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="mt-6 space-y-4">
      {/* Timer */}
      {shouldRefresh && (
        <div className="flex justify-center gap-4">
          <div className="text-center px-5 py-3 bg-background-tertiary rounded-lg">
            <div className="text-xl font-bold font-mono text-text-primary">
              {mins}:{secs}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">Elapsed Time</div>
          </div>
          <div className="text-center px-5 py-3 bg-background-tertiary rounded-lg">
            <div className="text-xl font-bold font-mono text-amber">~15 min</div>
            <div className="text-[11px] text-text-muted mt-0.5">Avg. Review Time</div>
          </div>
        </div>
      )}

      {/* Reference ID */}
      <div className="bg-background-tertiary rounded-lg p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Reference ID
            </p>
            <p className="text-sm font-mono font-bold text-text-primary mt-0.5">
              {referenceId}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-card-hover transition-colors"
          >
            <span className="material-symbols-outlined text-text-muted text-lg">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        </div>
        {shouldRefresh && (
          <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs animate-spin">
              sync
            </span>
            Auto-refreshing every 15 seconds
          </p>
        )}
      </div>
    </div>
  );
}
