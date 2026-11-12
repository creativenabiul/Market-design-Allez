import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useShop } from '../context/ShopContext.tsx';

import LazyImage from './ui/LazyImage.tsx';

interface HeroSectionProps {
  onShopNow: () => void;
  onExploreCategories: () => void;
  featuredProduct?: Product;
  onQuickview: (product: Product) => void;
}

export default function HeroSection({
  onShopNow,
  onExploreCategories,
  featuredProduct,
  onQuickview
}: HeroSectionProps) {
  const { formatBDT } = useShop();

  return (
    <section className="relative bg-[#0A1128] text-white pt-32 pb-16 lg:pt-36 lg:pb-20 overflow-hidden">
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[32rem] h-[32rem] bg-[#FF5722]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5722]" />
              Official Marketplace · DB Road, Gaibandha
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white font-display text-balance">
              Everything You Need, <br className="hidden sm:inline" />
              <span className="text-[#FF5722]">All in One Place.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Discover authentic gadgets, contemporary fashion, home appliances, and daily essentials. Fast local delivery in Gaibandha and express courier coverage across Bangladesh.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={onShopNow}
                className="bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30 transition-all hover:translate-y-[-1px] text-sm"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreCategories}
                className="bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-lg border border-white/20 transition-colors text-sm"
              >
                Explore Departments
              </button>
            </div>

            {/* Quick Stats */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-300">
              <div>
                <strong className="block text-white font-bold text-base tabular-nums">10,000+</strong>
                <span>Authentic Items</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <strong className="block text-white font-bold text-base tabular-nums">24h</strong>
                <span>Gaibandha Delivery</span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <strong className="block text-white font-bold text-base tabular-nums">৳60 / ৳120</strong>
                <span>Flat Rate Courier</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 p-4 sm:p-6 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-800 group">
                <LazyImage
                  src="/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg"
                  alt="Allez Lifestyle and Marketplace Showcase"
                  className="group-hover:scale-105 transition-transform duration-500"
                  aspectRatioClass="w-full h-full"
                  placeholderColor="bg-slate-900"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5722]">
                    Exclusive Highlight
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Premium Tech & Lifestyle Collection
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-1">
                    Official warranties, hassle-free returns, and Cash on Delivery enabled.
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-200">
                      Starting from <strong className="text-white text-sm font-bold">৳ 1,290</strong>
                    </span>
                    <button
                      onClick={onShopNow}
                      className="bg-white hover:bg-slate-100 text-[#0A1128] text-xs font-bold px-4 py-1.5 rounded transition-colors"
                    >
                      View Deals
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[#FF5722]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Fast Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-400">Gaibandha 24h, BD 48-72h</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[#FF5722]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">100% Genuine Products</h4>
              <p className="text-[11px] text-slate-400">Directly verified brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[#FF5722]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-400">Pay after verifying parcel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[#FF5722]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">7-Day Free Returns</h4>
              <p className="text-[11px] text-slate-400">Zero hassle refund policy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
