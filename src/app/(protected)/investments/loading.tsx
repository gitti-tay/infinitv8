import { Header } from "@/components/ui/header";

export default function InvestmentsLoading() {
  return (
    <>
      <Header title="Investments" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        {/* Search bar */}
        <div className="mt-4 mb-4">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-11" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-8 w-20 flex-shrink-0"
            />
          ))}
        </div>

        {/* Project cards */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-36"
            />
          ))}
        </div>
      </div>
    </>
  );
}
