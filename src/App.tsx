/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShopProvider,
  useShop
} from './context/ShopContext.tsx';
import Navbar from './components/Navbar.tsx';
import HeroSection from './components/HeroSection.tsx';
import ProductCard from './components/ProductCard.tsx';
import ProductDetailModal from './components/ProductDetailModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import OrderTrackingView from './components/OrderTrackingView.tsx';
import CustomerDashboard from './components/CustomerDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AuthModal from './components/AuthModal.tsx';
import Footer from './components/Footer.tsx';
import { Product, Order } from './types/index.ts';
import { ProductGridSkeleton } from './components/ui/ProductCardSkeleton.tsx';
import { CategorySkeletonGrid } from './components/ui/CategorySkeleton.tsx';
import {
  SlidersHorizontal,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  Truck,
  Check,
  Star,
  RefreshCw
} from 'lucide-react';

function Storefront() {
  const {
    formatBDT,
    categories,
    activeModal,
    setActiveModal,
    quickviewProduct,
    setQuickviewProduct,
    setCurrentTrackOrderNumber,
    addToCart
  } = useShop();

  const [currentView, setCurrentView] = useState<
    'home' | 'products' | 'deals' | 'bestsellers' | 'newarrivals' | 'track' | 'account' | 'admin'
  >('home');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortOption, setSortOption] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100000);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory && filterCategory !== 'all') params.append('category', filterCategory);
      if (inStockOnly) params.append('inStock', 'true');
      if (maxPriceFilter < 100000) params.append('maxPrice', String(maxPriceFilter));

      if (currentView === 'deals') params.append('deal', 'true');
      if (currentView === 'bestsellers') params.append('bestSeller', 'true');
      if (currentView === 'newarrivals') params.append('newArrival', 'true');

      if (sortOption !== 'featured') params.append('sort', sortOption);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentView, searchQuery, filterCategory, sortOption, inStockOnly, maxPriceFilter]);

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setFilterCategory(category);
    setCurrentView('products');
  };

  const handleQuickview = (product: Product) => {
    setQuickviewProduct(product);
    setActiveModal('quickview');
  };

  const handleBuyNow = (
    product: Product,
    quantity: number,
    variantId?: string,
    variantTitle?: string,
    variantPrice?: number
  ) => {
    addToCart(product, quantity, variantId, variantTitle, variantPrice);
    setActiveModal('checkout');
  };

  const handleTrackOrderFromAnywhere = (orderNumber: string) => {
    setCurrentTrackOrderNumber(orderNumber);
    setCurrentView('track');
  };

  // If currently in Admin Console
  if (currentView === 'admin') {
    return <AdminDashboard onExitAdmin={() => setCurrentView('home')} />;
  }

  const dealsProducts = products.filter((p) => p.isDeal);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNewArrival);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navigation */}
      <Navbar
        onSearch={handleSearch}
        onNavigate={(view) => {
          if (view !== 'products') {
            setSearchQuery('');
            setFilterCategory('all');
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentView={currentView}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="space-y-14 pb-16">
            {/* Hero Section */}
            <HeroSection
              onShopNow={() => {
                setCurrentView('products');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreCategories={() => {
                const el = document.getElementById('departments-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onQuickview={handleQuickview}
            />

            {/* Shop by Category / Department */}
            <section id="departments-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5722]">
                    Curated Catalog
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 font-display">
                    Shop by Department
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView('products')}
                  className="text-xs font-bold text-[#FF5722] hover:underline flex items-center gap-1"
                >
                  View All Products <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {categories.length === 0 ? (
                <CategorySkeletonGrid count={6} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFilterCategory(cat.id);
                        setCurrentView('products');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-[#FF5722] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#FF5722] transition-colors leading-tight">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {cat.subcategories?.join(' · ') || 'Authentic Brands'}
                        </p>
                      </div>
                      <span className="mt-4 text-[11px] font-semibold text-slate-500 tabular-nums">
                        {cat.productCount || 0} products →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Today's Highlight Deals Section */}
            {(loading || dealsProducts.length > 0) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 text-[#FF5722] rounded-lg">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FF5722]">
                        Limited Time Offers
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 font-display">
                        Today&apos;s Highlight Deals
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('deals')}
                    className="text-xs font-bold text-[#FF5722] hover:underline"
                  >
                    See all deals →
                  </button>
                </div>

                {loading ? (
                  <ProductGridSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dealsProducts.slice(0, 4).map((p) => (
                      <ProductCard key={p.id} product={p} onQuickview={handleQuickview} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Gaibandha Regional Hub Promotional Callout */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0A1128] via-[#111c44] to-[#0A1128] text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
                <div className="max-w-xl space-y-4 relative z-10">
                  <span className="inline-block text-xs uppercase font-bold tracking-wider text-[#FF5722] bg-white/10 px-3 py-1 rounded-full">
                    Logistics Center · DB Road, Gaibandha
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                    Same-Day & 24-Hour Dispatch Across North Bengal & Nationwide
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Our direct fulfillment facility in Gaibandha guarantees local delivery within 24 hours for only ৳60. Full Cash on Delivery supported across all 64 districts in Bangladesh.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setCurrentView('products')}
                      className="px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Browse Gaibandha Stock
                    </button>
                    <button
                      onClick={() => setCurrentView('track')}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20"
                    >
                      Track Your Parcel
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Sellers Section */}
            {(loading || bestSellers.length > 0) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Top Customer Choices
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 font-display">
                        Best Sellers in Bangladesh
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('bestsellers')}
                    className="text-xs font-bold text-[#FF5722] hover:underline"
                  >
                    View all bestsellers →
                  </button>
                </div>

                {loading ? (
                  <ProductGridSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.slice(0, 4).map((p) => (
                      <ProductCard key={p.id} product={p} onQuickview={handleQuickview} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* New Arrivals Section */}
            {(loading || newArrivals.length > 0) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Just Landed
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 font-display">
                        New Arrivals & Fresh Releases
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('newarrivals')}
                    className="text-xs font-bold text-[#FF5722] hover:underline"
                  >
                    View all new items →
                  </button>
                </div>

                {loading ? (
                  <ProductGridSkeleton count={4} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newArrivals.slice(0, 4).map((p) => (
                      <ProductCard key={p.id} product={p} onQuickview={handleQuickview} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* CATALOG / SEARCH / FILTERED PRODUCTS VIEW */}
        {(currentView === 'products' ||
          currentView === 'deals' ||
          currentView === 'bestsellers' ||
          currentView === 'newarrivals') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-6">
            {/* View Breadcrumb / Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-[#FF5722] uppercase font-bold tracking-wider">
                  Allez Marketplace
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display mt-0.5">
                  {currentView === 'deals'
                    ? "Today's Deals & Flash Offers"
                    : currentView === 'bestsellers'
                    ? 'Best Selling Products'
                    : currentView === 'newarrivals'
                    ? 'New Arrivals'
                    : searchQuery
                    ? `Results for "${searchQuery}"`
                    : 'Explore All Products'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Showing {products.length} products · Local dispatch from Gaibandha
                </p>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Split Filter + Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Filter Sidebar */}
              <aside className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#FF5722]" /> Filters
                  </h3>
                  <button
                    onClick={() => {
                      setFilterCategory('all');
                      setSearchQuery('');
                      setInStockOnly(false);
                      setMaxPriceFilter(100000);
                    }}
                    className="text-[11px] text-[#FF5722] hover:underline"
                  >
                    Reset
                  </button>
                </div>

                {/* Departments */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Department
                  </h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`w-full text-left py-1 px-2 rounded transition-colors ${
                        filterCategory === 'all'
                          ? 'bg-orange-50 text-[#FF5722] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      All Departments
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFilterCategory(c.id)}
                        className={`w-full text-left py-1 px-2 rounded transition-colors ${
                          filterCategory === c.id
                            ? 'bg-orange-50 text-[#FF5722] font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price Range */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Price Range
                    </h4>
                    <span className="font-mono font-bold text-slate-900">
                      Up to {formatBDT(maxPriceFilter)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-full accent-[#FF5722]"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-[#FF5722] focus:ring-[#FF5722]"
                    />
                    <span className="text-slate-700 font-medium">In Stock Items Only</span>
                  </label>
                </div>
              </aside>

              {/* Product Grid */}
              <div className="lg:col-span-9">
                {loading ? (
                  <ProductGridSkeleton
                    count={6}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  />
                ) : products.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
                    <p className="font-bold text-slate-800 text-base">No products match your criteria</p>
                    <p className="text-xs text-slate-500">
                      Try clearing your search filters or browse another category.
                    </p>
                    <button
                      onClick={() => {
                        setFilterCategory('all');
                        setSearchQuery('');
                        setMaxPriceFilter(100000);
                      }}
                      className="px-5 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-lg"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} onQuickview={handleQuickview} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ORDER TRACKING VIEW */}
        {currentView === 'track' && <OrderTrackingView />}

        {/* CUSTOMER DASHBOARD VIEW */}
        {currentView === 'account' && (
          <CustomerDashboard
            onTrackOrder={handleTrackOrderFromAnywhere}
            onNavigateHome={() => setCurrentView('home')}
            onQuickview={handleQuickview}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setActiveModal('checkout')} />

      {/* 5-Step Checkout Modal */}
      <CheckoutModal
        isOpen={activeModal === 'checkout'}
        onClose={() => setActiveModal('none')}
        onOrderSuccess={(ord: Order) => {
          fetchProducts();
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickviewProduct}
        onClose={() => setActiveModal('none')}
        onBuyNow={handleBuyNow}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={activeModal === 'auth'} onClose={() => setActiveModal('none')} />

      {/* Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <Storefront />
    </ShopProvider>
  );
}
