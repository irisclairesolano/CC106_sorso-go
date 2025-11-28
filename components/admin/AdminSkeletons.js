"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-36" />
      </div>
      <div className="space-y-3">
        <div className="hidden md:grid md:grid-cols-[48px_repeat(var(--columns),1fr)] md:gap-4" style={{ "--columns": columns }}>
          {[...Array(columns + 1)].map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-6" />
          ))}
        </div>
        {[...Array(rows)].map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid grid-cols-1 gap-3 rounded-lg border p-4 md:grid-cols-[48px_repeat(var(--columns),1fr)] md:gap-4 md:border-none md:p-0"
            style={{ "--columns": columns }}
          >
            {[...Array(columns + 1)].map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
