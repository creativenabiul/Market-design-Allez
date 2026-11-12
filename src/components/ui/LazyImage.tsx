import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, Package } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  placeholderColor?: string;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatioClass = 'aspect-[4/3]',
  placeholderColor = 'bg-slate-100',
  ...rest
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state if src changes
    setIsLoaded(false);
    setHasError(false);

    if (!containerRef.current) return;

    // Use IntersectionObserver to start loading when approaching viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '250px' }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      // Fallback: load immediately
      setIsInView(true);
    }
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${placeholderColor} ${aspectRatioClass} ${containerClassName}`}
    >
      {/* Animated Skeleton Shimmer Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200/90 animate-shimmer z-0" />
      )}

      {/* Actual Image once in view */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      )}

      {/* Elegant Fallback for Broken Images (Zero Broken Image Policy) */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400">
          <Package className="w-8 h-8 text-slate-300 stroke-1 mb-1.5" />
          <span className="text-[11px] font-medium text-slate-500 line-clamp-1 text-center">
            {alt || 'Allez Authentic Product'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">DB Road, Gaibandha</span>
        </div>
      )}
    </div>
  );
}
