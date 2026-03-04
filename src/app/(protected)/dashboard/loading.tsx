export default function DashboardLoading() {
  return (
    <div className="pt-6 pb-24 md:pb-8 px-5">
      {/* Welcome text */}
      <div className="mb-6">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-24 mb-2" />
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-7 w-40" />
      </div>

      {/* Portfolio card */}
      <div className="animate-pulse bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl p-5 mb-6 h-36" />

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"
          />
        ))}
      </div>

      {/* Section title */}
      <div className="flex justify-between items-center mb-3">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-5 w-40" />
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-16" />
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-28"
          />
        ))}
      </div>
    </div>
  );
}
