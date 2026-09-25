import React from 'react';
import { Skeleton } from './ui/skeleton';

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#131926] border border-slate-800 rounded-2xl p-4 space-y-4">
          <Skeleton className="w-full aspect-[4/3] rounded-xl" />
          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-8 w-48 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-1 h-96 rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
