import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Menu,
  X,
  ChevronDown,
  Package,
  Shield,
  LogOut,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useShop } from '../context/ShopContext.tsx';

interface NavbarProps {
  onSearch: (query: string, category: string) => void;
  onNavigate: (view: 'home' | 'products' | 'deals' | 'bestsellers' | 'newarrivals' | 'track' | 'account' | 'admin') => void;
  currentView: string;
}

export default function Navbar({ onSearch, onNavigate, currentView }: NavbarProps) {
  const {
    user,
    logout,
    cartCount,
    cartSubtotal,
    wishlist,
    formatBDT,
    setIsCartOpen,
    setActiveModal,
    selectedDistrict,
    setSelectedDistrict,
    categories
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchCategory);
  };

  const bdDistricts = [
    'Gaibandha',
    'Dhaka',
    'Rangpur',
    'Bogura',
    'Chittagong',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barishal',
    'Mymensingh',
    'Dinajpur',
    'Kurigram'
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-colors duration-300 ${
          isScrolled || currentView !== 'home'
            ? 'bg-[#0A1128] shadow-md border-b border-slate-800 py-2.5'
            : 'bg-gradient-to-b from-[#0A1128]/95 via-[#0A1128]/75 to-transparent py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Top Bar */}
          <div className="flex items-center justify-between gap-4">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-1.5 focus:outline-none group text-left"
              >
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
                  AL<span className="text-[#FF5722] group-hover:text-[#ff7043] transition-colors">LEZ</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5722]" />
              </button>

              {/* Delivery Destination Selector */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="hidden lg:flex items-center gap-1.5 text-slate-200 hover:text-white px-2 py-1 rounded-md border border-transparent hover:border-slate-700 transition-colors text-left"
                title="Change Delivery Location"
              >
                <MapPin className="w-4 h-4 text-[#FF5722] shrink-0" />
                <div className="text-xs leading-tight">
                  <span className="text-slate-400 text-[10px] block">Deliver to</span>
                  <span className="font-semibold text-white truncate max-w-[110px] block">
                    {selectedDistrict}, BD
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative hidden md:block">
              <div className="flex items-center bg-white rounded-md shadow-inner overflow-hidden focus-within:ring-2 focus-within:ring-[#FF5722]">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-slate-100 text-slate-700 text-xs py-2.5 px-3 border-r border-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Allez for smartphones, electronics, fashion, audio..."
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#FF5722] hover:bg-[#F4511E] text-white px-5 py-2.5 flex items-center justify-center transition-colors shrink-0"
                  aria-label="Search Allez Catalog"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Zone 3: Actions (Account, Wishlist, Cart) */}
            <div className="flex items-center gap-4 sm:gap-5 text-white">
              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 hover:text-[#FF5722] transition-colors py-1 text-left"
                >
                  <User className="w-5 h-5 shrink-0" />
                  <div className="hidden sm:block text-xs leading-tight">
                    <span className="text-slate-300 text-[10px] block">
                      {user ? `Hello, ${user.fullName.split(' ')[0]}` : 'Hello, Sign In'}
                    </span>
                    <span className="font-bold flex items-center gap-0.5">
                      Account <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setAccountMenuOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-bold text-sm text-slate-900 truncate">{user.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#FF5722]">
                            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Store Admin' : 'Valued Customer'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigate('account');
                          }}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-slate-500" /> My Orders & History
                        </button>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onNavigate('track');
                          }}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Compass className="w-4 h-4 text-slate-500" /> Track Consignments
                        </button>

                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-4 py-2 text-xs bg-orange-50/70 hover:bg-orange-100/70 text-[#FF5722] font-semibold flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" /> Admin Console
                          </button>
                        )}

                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setActiveModal('auth');
                          }}
                          className="w-full bg-[#FF5722] hover:bg-[#F4511E] text-white py-2 rounded text-xs font-bold transition-colors text-center"
                        >
                          Sign In
                        </button>
                        <p className="text-[11px] text-slate-500 text-center">
                          New customer?{' '}
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              setActiveModal('auth');
                            }}
                            className="text-[#FF5722] font-semibold hover:underline"
                          >
                            Start here.
                          </button>
                        </p>
                        <div className="border-t border-slate-100 pt-2">
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:text-[#FF5722] flex items-center gap-2 rounded hover:bg-slate-50"
                          >
                            <Shield className="w-3.5 h-3.5" /> Admin Portal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => onNavigate('account')}
                className="relative hover:text-[#FF5722] transition-colors p-1"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#FF5722] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center tabular-nums">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 hover:text-[#FF5722] transition-colors p-1"
                aria-label="View Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#FF5722] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center tabular-nums">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-sm tabular-nums">
                  {formatBDT(cartSubtotal)}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white hover:text-[#FF5722] p-1"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Secondary Sub-Navigation Row */}
          <nav className="mt-2.5 pt-2 border-t border-slate-800/80 hidden md:flex items-center justify-between text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setCategoriesDrawerOpen(!categoriesDrawerOpen)}
                className="flex items-center gap-1.5 hover:text-[#FF5722] transition-colors font-semibold"
              >
                <Menu className="w-4 h-4 text-[#FF5722]" /> All Categories
              </button>
              <button
                onClick={() => onNavigate('deals')}
                className={`hover:text-[#FF5722] transition-colors ${currentView === 'deals' ? 'text-[#FF5722] font-bold' : ''}`}
              >
                Today&apos;s Deals
              </button>
              <button
                onClick={() => onNavigate('bestsellers')}
                className={`hover:text-[#FF5722] transition-colors ${currentView === 'bestsellers' ? 'text-[#FF5722] font-bold' : ''}`}
              >
                Best Sellers
              </button>
              <button
                onClick={() => onNavigate('newarrivals')}
                className={`hover:text-[#FF5722] transition-colors ${currentView === 'newarrivals' ? 'text-[#FF5722] font-bold' : ''}`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => onNavigate('track')}
                className={`hover:text-[#FF5722] transition-colors ${currentView === 'track' ? 'text-[#FF5722] font-bold' : ''}`}
              >
                Track Order
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="text-[11px]">
                Gaibandha Hub Delivery: <strong className="text-white">৳60</strong> · Nationwide: <strong className="text-white">৳120</strong>
              </span>
            </div>
          </nav>
        </div>

        {/* Mobile Search & Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1128] border-b border-slate-800 p-4 space-y-3 animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 text-sm text-slate-900 focus:outline-none"
              />
              <button type="submit" className="bg-[#FF5722] text-white px-4 py-2">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 pt-2">
              <button
                onClick={() => {
                  onNavigate('deals');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left hover:text-[#FF5722]"
              >
                Today&apos;s Deals
              </button>
              <button
                onClick={() => {
                  onNavigate('bestsellers');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left hover:text-[#FF5722]"
              >
                Best Sellers
              </button>
              <button
                onClick={() => {
                  onNavigate('newarrivals');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left hover:text-[#FF5722]"
              >
                New Arrivals
              </button>
              <button
                onClick={() => {
                  onNavigate('track');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left hover:text-[#FF5722]"
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  onNavigate('account');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left hover:text-[#FF5722]"
              >
                My Account
              </button>
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="py-2 text-left text-[#FF5722] font-bold"
              >
                Admin Portal
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Category Slider Drawer */}
      {categoriesDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setCategoriesDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 bg-[#0A1128] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FF5722]" />
                <h3 className="font-bold text-sm">Shop by Department</h3>
              </div>
              <button
                onClick={() => setCategoriesDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSearch('', cat.id);
                    setCategoriesDrawerOpen(false);
                  }}
                  className="w-full text-left py-3 px-2 text-sm text-slate-700 hover:text-[#FF5722] hover:bg-slate-50 flex items-center justify-between transition-colors rounded"
                >
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {cat.productCount} items
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowLocationModal(false)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF5722]" /> Select Delivery District
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Choose your location in Bangladesh to calculate exact courier delivery costs and dispatch times.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {bdDistricts.map((district) => (
                <button
                  key={district}
                  onClick={() => {
                    setSelectedDistrict(district);
                    setShowLocationModal(false);
                  }}
                  className={`px-3 py-2 text-xs rounded border text-left transition-all ${
                    selectedDistrict === district
                      ? 'border-[#FF5722] bg-orange-50 text-[#FF5722] font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {district}
                  {district === 'Gaibandha' && (
                    <span className="block text-[10px] text-emerald-600 font-semibold">Local Hub (৳60)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
