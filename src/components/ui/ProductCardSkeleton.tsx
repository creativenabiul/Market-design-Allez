import React from 'react';
import { Skeleton } from './Skeleton.tsx';

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className = '' }: ProductCardSkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden ${className}`}
      aria-label="Loading product..."
    >
      {/* Top Image Skeleton */}
      <div className="relative aspect-[4/3] bg-slate-200 animate-shimmer" />

      {/* Card Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-16 h-2.5 rounded" />
            <Skeleton className="w-20 h-2.5 rounded" />
          </div>

          {/* Product Title (2 lines) */}
          <div className="space-y-1.5 mt-1">
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-3/4 h-3.5 rounded" />
          </div>

          {/* Ratings & Stock */}
          <div className="flex items-center gap-2 mt-3">
            <Skeleton className="w-12 h-3 rounded" />
            <Skeleton className="w-8 h-3 rounded" />
            <Skeleton className="w-14 h-3 rounded ml-auto" />
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="w-24 h-5 rounded" />
            <Skeleton className="w-28 h-2 rounded" />
          </div>
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 8,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
}: ProductGridSkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
