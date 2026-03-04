import { Header } from "@/components/ui/header";

export default function TransactionsLoading() {
  return (
    <>
      <Header title="Transaction History" />
      <div className="pt-16 pb-24 px-5 animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        {/* Transaction List Skeleton */}
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800"
            />
          ))}
        </div>
      </div>
    </>
  );
}
