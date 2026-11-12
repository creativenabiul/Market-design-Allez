import React from 'react';
import { Skeleton } from './Skeleton.tsx';

interface CategorySkeletonProps {
  count?: number;
}

export function CategorySkeletonGrid({ count = 6 }: CategorySkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-3.5 bg-white rounded-xl border border-slate-200/90 flex flex-col justify-between h-28"
        >
          <div className="space-y-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-28 h-2.5 rounded" />
          </div>
          <Skeleton className="w-16 h-3 rounded mt-3" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-4">
          <Skeleton className="w-3/4 h-3.5 rounded" />
        </td>
      ))}
    </tr>
  );
}
