import { Header } from "@/components/ui/header";

export default function PortfolioLoading() {
  return (
    <>
      <Header title="Portfolio" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        {/* Summary card */}
        <div className="mt-4 animate-pulse bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl p-5 h-36 mb-6" />

        {/* Section title */}
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-5 w-32 mb-3" />

        {/* Investment cards */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-28"
            />
          ))}
        </div>
      </div>
    </>
  );
}
