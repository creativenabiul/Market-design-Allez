import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Send
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { useShop } from '../context/ShopContext.tsx';
import LazyImage from './ui/LazyImage.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number, variantId?: string, variantTitle?: string, variantPrice?: number) => void;
}

export default function ProductDetailModal({ product, onClose, onBuyNow }: ProductDetailModalProps) {
  const { addToCart, toggleWishlist, isWishlisted, formatBDT } = useShop();
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const wish = isWishlisted(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.basePrice);
  const originalPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const hasDiscount = product.discountPrice && !selectedVariant;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
          userName: reviewName || 'Verified Buyer'
        })
      });
      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewForm(false);
          setReviewSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Gallery */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                <LazyImage
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  aspectRatioClass="w-full h-full"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImage === idx ? 'border-[#FF5722] ring-2 ring-orange-200' : 'border-slate-200'
                      }`}
                    >
                      <LazyImage
                        src={img}
                        alt={`Thumbnail ${idx}`}
                        className="w-full h-full object-cover"
                        aspectRatioClass="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Callouts */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Truck className="w-4 h-4 text-[#FF5722] shrink-0" />
                  <span>Gaibandha Hub Delivery: ৳60 (24h) · Nationwide: ৳120</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#FF5722] shrink-0" />
                  <span>100% Authentic Guaranteed with Official Brand Seal</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <RotateCcw className="w-4 h-4 text-[#FF5722] shrink-0" />
                  <span>7-Day Return Policy & Cash on Delivery Available</span>
                </div>
              </div>
            </div>

            {/* Right: Product Purchase Module */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <span>{product.brand}</span>
                  <span className="font-mono text-[11px]">SKU: {product.sku}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Review Bar */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold ml-1 text-slate-900 text-sm tabular-nums">{product.rating}</span>
                  </div>
                  <span className="text-slate-500">({product.reviewCount} verified reviews)</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-emerald-600">
                    {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Pricing Display */}
              <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100/80">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {formatBDT(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      {formatBDT(originalPrice)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-[#FF5722] text-white text-xs font-bold px-2 py-0.5 rounded">
                      Save {formatBDT(originalPrice - currentPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Inclusive of all VAT & taxes. Cash on delivery available.
                </p>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                    Select Option / Variant:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2.5 text-xs text-left rounded-lg border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-[#FF5722] bg-orange-50 text-slate-900 font-bold ring-1 ring-[#FF5722]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <p className="font-medium">{v.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 tabular-nums">
                          {formatBDT(v.price)} · {v.stock} in stock
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>{product.description}</p>
              </div>

              {/* Quantity Stepper & CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-bold text-sm text-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2.5 border rounded-lg transition-colors ${
                      wish ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-500'
                    }`}
                    title={wish ? 'Wishlisted' : 'Add to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${wish ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      addToCart(
                        product,
                        quantity,
                        selectedVariant?.id,
                        selectedVariant?.title,
                        selectedVariant?.price
                      );
                      onClose();
                    }}
                    disabled={product.stockQuantity <= 0}
                    className="w-full bg-[#0A1128] hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>

                  <button
                    onClick={() => {
                      onBuyNow(
                        product,
                        quantity,
                        selectedVariant?.id,
                        selectedVariant?.title,
                        selectedVariant?.price
                      );
                      onClose();
                    }}
                    disabled={product.stockQuantity <= 0}
                    className="w-full bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-3">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{key}</span>
                  <span className="text-slate-900 font-semibold text-right tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Customer Ratings & Reviews</h3>
                <p className="text-xs text-slate-500">Authentic reviews from verified Bangladesh buyers</p>
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs text-[#FF5722] font-bold hover:underline"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {/* Review Submission Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-3">
                {reviewSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                    <Check className="w-4 h-4" /> Thank you! Your review has been recorded.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className={`p-1 ${reviewRating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (e.g., Nabiul / Customer)"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="px-3 py-2 text-xs border border-slate-200 rounded bg-white"
                      />
                    </div>
                    <textarea
                      placeholder="Share your experience with this product..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-white"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Review
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Mustafizur R. (Gaibandha Sadar)</span>
                  <div className="flex text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
                <p className="text-slate-600">
                  Received within 24 hours via Allez Gaibandha dispatch. Packaging was pristine and official brand seal intact. Outstanding quality!
                </p>
                <span className="text-[10px] text-slate-400">Verified Purchase · 2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
