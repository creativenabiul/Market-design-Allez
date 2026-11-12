import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rounded' | 'circular' | 'rectangular';
  isDark?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  isDark = false
}: SkeletonProps) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded h-3.5 my-1'
      : variant === 'rectangular'
      ? 'rounded-none'
      : 'rounded-xl';

  const baseTheme = isDark
    ? 'bg-white/10 animate-shimmer-dark'
    : 'bg-slate-200/80 animate-shimmer';

  return (
    <div
      className={`${baseTheme} ${variantClass} ${className}`}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
