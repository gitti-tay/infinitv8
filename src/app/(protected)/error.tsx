"use client";

import Link from "next/link";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="pt-6 pb-24 px-5 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <span className="material-icons text-red-500 text-3xl">warning</span>
      </div>
      <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
      <p className="text-text-muted text-sm text-center mb-6 max-w-xs">
        {error.message || "We encountered an error loading this page."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:border-primary transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
