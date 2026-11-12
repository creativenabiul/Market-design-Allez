import React, { useState } from 'react';
import { Mail, MapPin, Phone, ShieldCheck, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext.tsx';

interface FooterProps {
  onNavigate: (view: 'home' | 'products' | 'deals' | 'bestsellers' | 'newarrivals' | 'track' | 'account' | 'admin') => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { storeSettings } = useShop();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#0A1128] text-white pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-10 border-b border-slate-800">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-black tracking-tight text-white font-display">
                AL<span className="text-[#FF5722]">LEZ</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-[#FF5722]" />
            </div>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed font-sans">
              Bangladesh&apos;s fastest growing multi-category marketplace. Authentic brands, transparent pricing in BDT, and dedicated 24-hour dispatch from our Gaibandha fulfillment center.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email for exclusive deals & coupon drops..."
                className="px-4 py-3 bg-white/10 text-white placeholder-slate-400 text-xs rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF5722] flex-1"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Welcome to Allez! Check your inbox for your 10% welcome coupon.
              </p>
            )}
          </div>
        </div>

        {/* 4 Multi-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-slate-300">
          {/* Col 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-display">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('track')} className="hover:text-[#FF5722] transition-colors">
                  Track Order / Consignment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-[#FF5722] transition-colors">
                  My Account & Invoices
                </button>
              </li>
              <li>
                <span className="text-slate-400">7-Day Free Returns</span>
              </li>
              <li>
                <span className="text-slate-400">Cash on Delivery Terms</span>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-display">
              Shop Departments
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5722] transition-colors">
                  Electronics & Audio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5722] transition-colors">
                  Smartphones & Gadgets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5722] transition-colors">
                  Men&apos;s & Women&apos;s Fashion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-[#FF5722] transition-colors">
                  Home & Kitchen Appliances
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Badges */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-display">
              Payment Methods
            </h4>
            <p className="text-[11px] text-slate-400">
              Safe & secure local payment options:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[10px] text-pink-400">
                bKash
              </span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[10px] text-orange-400">
                Nagad
              </span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[10px] text-purple-400">
                Rocket
              </span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[10px] text-blue-400">
                Visa / MC
              </span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[10px] text-emerald-400">
                Cash on Delivery
              </span>
            </div>
          </div>

          {/* Col 4: Business Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-display">
              Gaibandha Hub
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5722] shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
                <span>{storeSettings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF5722] shrink-0" />
                <span>{storeSettings.contactEmail}</span>
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="mt-2 text-[11px] text-slate-400 hover:text-white underline block"
            >
              Merchant Admin Login
            </button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 Allez Technologies Bangladesh. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>DB Road, Gaibandha, Bangladesh</span>
            <span>·</span>
            <span>Official BTRC & BSTI Certified Handsets</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
