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
      <div className="pt-16 pb-24 px-5 flex flex-col items-center">
        {/* Success Icon */}
        <div className="mt-12 mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <span className="material-icons text-white text-5xl">
              check
            </span>
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 animate-ping" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2 text-center">
          Investment Successful!
        </h1>
        <p className="text-text-muted text-sm text-center mb-8">
          Your investment has been confirmed and is now active.
        </p>

        {/* Transaction Details Card */}
        <div className="w-full bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-100 dark:border-gray-800 mb-6">
          <h3 className="font-bold text-sm mb-4">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Amount</span>
              <span className="text-sm font-bold">
                $
                {numericAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Date</span>
              <span className="text-sm font-medium">{today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Transaction ID</span>
              <span className="text-xs font-mono text-text-muted">
                {investmentId
                  ? `${investmentId.slice(0, 8)}...${investmentId.slice(-4)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Link
            href="/portfolio"
            className="block w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-center font-bold rounded-xl shadow-glow hover:opacity-90 transition-opacity"
          >
            View in Portfolio
          </Link>
          <Link
            href="/dashboard"
            className="block w-full py-3.5 bg-card-light dark:bg-card-dark text-center font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
