import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">
            explore_off
          </span>
        </div>
        <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
        <p className="text-text-muted text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-glow hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-border text-text-primary font-bold rounded-xl hover:bg-background-secondary transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
