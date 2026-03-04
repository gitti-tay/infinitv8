import { Header } from "@/components/ui/header";

export default function WalletLoading() {
  return (
    <>
      <Header title="Wallet" showBack={false} />
      <div className="pt-14 pb-24 md:pb-8 px-5 animate-pulse">
        {/* Balance Card Skeleton */}
        <div className="mt-4 bg-gradient-to-br from-primary/30 to-primary-dark/30 rounded-3xl p-6 h-64" />
        {/* Tabs Skeleton */}
        <div className="mt-4 h-14 bg-muted dark:bg-gray-800 rounded-xl" />
        {/* Content Skeleton */}
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
      </div>
    </>
  );
}
