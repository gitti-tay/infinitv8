export default function ProtectedLoading() {
  return (
    <div className="pt-6 pb-24 px-5">
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-6 w-32" />
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-36" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl h-28"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
