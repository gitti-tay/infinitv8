import Link from "next/link";
import { Header } from "@/components/ui/header";

interface SuccessPageProps {
  searchParams: Promise<{ amount?: string; investmentId?: string }>;
}

export default async function InvestmentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { amount, investmentId } = await searchParams;
  const numericAmount = parseFloat(amount || "0");
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header title="Confirmation" />
      <div className="pt-16 pb-24 px-5 flex flex-col items-center animate-fadeIn">
        {/* Success Animation */}
        <div className="mt-12 mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-green-600 flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-white text-5xl">
              check_circle
            </span>
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-accent/30 animate-ping" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold mb-2 text-center">
          Investment Successful!
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Your investment has been confirmed and is now active
        </p>

        {/* Investment Details Card */}
        <div className="w-full bg-card-light dark:bg-card-dark rounded-2xl overflow-hidden shadow-soft border border-gray-100 dark:border-gray-800 mb-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm mb-1">Investment Amount</p>
              <p className="text-4xl font-bold">
                $
                {numericAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Date</span>
              <span className="text-sm font-bold">{today}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-text-muted">Status</span>
              <span className="text-sm font-bold text-accent">Confirmed</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-text-muted">Transaction ID</span>
              <span className="text-xs font-mono text-text-muted">
                {investmentId
                  ? `${investmentId.slice(0, 8)}...${investmentId.slice(-4)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              lightbulb
            </span>
            <h3 className="font-bold">What&apos;s Next?</h3>
          </div>
          <ul className="space-y-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-accent text-lg">
                check
              </span>
              <span>
                Your first dividend payment will arrive on the next payout cycle
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-accent text-lg">
                check
              </span>
              <span>
                Track your investment performance in the Portfolio section
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-accent text-lg">
                check
              </span>
              <span>
                Receive monthly updates on your investment project
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link
            href="/portfolio"
            className="flex w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-glow hover:bg-primary-dark transition-colors items-center justify-center gap-2"
          >
            View My Portfolio
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link
            href="/investments"
            className="block w-full py-3.5 bg-card-light dark:bg-card-dark text-center font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
          >
            Explore More Opportunities
          </Link>
        </div>
      </div>
    </>
  );
}
