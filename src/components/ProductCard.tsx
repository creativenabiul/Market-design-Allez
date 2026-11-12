import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useShop } from '../context/ShopContext.tsx';
import LazyImage from './ui/LazyImage.tsx';

interface ProductCardProps {
  product: Product;
  onQuickview: (product: Product) => void;
}

export default function ProductCard({ product, onQuickview }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, formatBDT } = useShop();
  const wish = isWishlisted(product.id);

  const discountPercent = product.discountPrice
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Image Showcase with Lazy Loading & Skeleton */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onQuickview(product)}>
        <LazyImage
          src={product.images[0] || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
          alt={product.name}
          className="group-hover:scale-105 transition-transform duration-300"
          aspectRatioClass="aspect-[4/3]"
        />

        {/* Subtle Discount / Deal Tag */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#FF5722] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Quick Actions (Wishlist & Quickview) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md shadow-xs transition-colors ${
              wish ? 'bg-red-50 text-red-500' : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
            }`}
            aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${wish ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickview(product);
            }}
            className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#FF5722] backdrop-blur-md shadow-xs transition-colors"
            aria-label="Quick preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-wider mb-1 font-medium">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickview(product)}
            className="font-semibold text-sm text-slate-900 group-hover:text-[#FF5722] transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold ml-1 text-slate-800 text-xs tabular-nums">{product.rating}</span>
            </div>
            <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tabular-nums font-sans">
                {formatBDT(product.discountPrice || product.basePrice)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatBDT(product.basePrice)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Free delivery over ৳5k</p>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity <= 0}
            className={`p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              product.stockQuantity > 0
                ? 'bg-slate-900 hover:bg-[#FF5722] text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Add to Shopping Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
