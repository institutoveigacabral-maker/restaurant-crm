export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-6 w-6 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 w-48 bg-gray-100 rounded" />
        <div className="h-3 w-40 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
        <div className="h-8 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50 border-b" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b last:border-0">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-7 w-16 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-12 w-12 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}
