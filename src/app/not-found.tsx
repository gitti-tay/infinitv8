import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark flex items-center justify-center px-5">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Popup card */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-border p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">
            explore_off
          </span>
        </div>

        {/* Message */}
        <h2 className="text-xl font-extrabold tracking-tight text-center text-text-primary mb-2">
          Page Not Found
        </h2>
        <p className="text-text-muted text-sm text-center mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white text-[15px] font-bold rounded-xl shadow-glow hover:opacity-90 transition-opacity text-center"
          >
            Go Home
          </Link>
          <Link
            href="/auth/signin"
            className="w-full py-3 border border-border text-text-primary text-[15px] font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
