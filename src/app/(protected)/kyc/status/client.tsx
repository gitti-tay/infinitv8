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

  useEffect(() => {
    if (!shouldRefresh) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [shouldRefresh, router]);

  function handleCopy() {
    navigator.clipboard.writeText(referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">
            Reference ID
          </p>
          <p className="text-sm font-mono font-bold mt-0.5">{referenceId}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-text-muted text-lg">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
      </div>
      {shouldRefresh && (
        <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs animate-spin">sync</span>
          Auto-refreshing every 15 seconds
        </p>
      )}
    </div>
  );
}
