import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  AlertCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { useShop } from '../context/ShopContext.tsx';
import LazyImage from './ui/LazyImage.tsx';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
}

const MILESTONES: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' }
];

export default function OrderTrackingView({ initialOrderNumber }: OrderTrackingViewProps) {
  const { currentTrackOrderNumber, formatBDT } = useShop();
  const [searchInput, setSearchInput] = useState(initialOrderNumber || currentTrackOrderNumber || 'ALZ-202603-7821');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}/track`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No consignment found with this ID');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError('Failed to fetch tracking data. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchInput) {
      fetchTracking(searchInput);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchInput);
  };

  const getStatusIndex = (status: OrderStatus) => {
    return MILESTONES.findIndex((m) => m.status === status);
  };

  const currentIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-[#FF5722]">
          Real-Time Consignment Tracker
        </span>
        <h2 className="text-3xl font-black text-slate-900 font-display">
          Track Your Allez Order
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your Order Number (e.g. <strong className="text-slate-700">ALZ-202603-7821</strong>) or Courier Tracking ID to view live transit milestones.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. ALZ-202603-7821 or TRK-ALZ-928172"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none bg-white shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors shrink-0"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs sm:text-sm max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Tracking Content */}
      {order && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Order Number</span>
                <span className="font-mono font-black text-slate-900 text-lg">{order.orderNumber}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Recipient: {order.customerName}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">Courier Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-0.5 ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-[#FF5722]'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Carrier / Fleet</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-bold block mt-0.5 truncate">
                {order.carrier}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tracking Code</span>
              <strong className="text-[#FF5722] font-mono text-xs sm:text-sm font-bold block mt-0.5">
                {order.trackingNumber}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Estimated Delivery</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-bold block mt-0.5">
                {order.estimatedDelivery}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Payment</span>
              <strong className="text-slate-800 text-xs sm:text-sm font-bold block mt-0.5">
                {order.paymentMethod} · {formatBDT(order.grandTotal)}
              </strong>
            </div>
          </div>

          {/* Visual Milestone Progress Bar */}
          {order.status !== 'CANCELLED' ? (
            <div className="py-6">
              <div className="relative">
                {/* Background Line */}
                <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 -z-0" />
                {/* Filled Line */}
                <div
                  className="absolute top-4 left-0 h-1 bg-[#FF5722] transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentIndex / (MILESTONES.length - 1)) * 100))}%`
                  }}
                />

                {/* Nodes */}
                <div className="flex justify-between items-start relative z-10">
                  {MILESTONES.map((step, idx) => {
                    const isDone = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={step.status} className="flex flex-col items-center max-w-[80px] text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            isDone
                              ? 'bg-[#FF5722] text-white ring-4 ring-orange-100'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-[10px] sm:text-xs font-semibold leading-tight ${
                            isCurrent ? 'text-[#FF5722] font-black' : isDone ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-3">
              <XCircle className="w-5 h-5" /> This consignment was cancelled and is not in transit.
            </div>
          )}

          {/* Tracking Events Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
              Consignment Event History
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {order.trackingEvents?.map((evt, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#FF5722] ring-4 ring-orange-100" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{evt.description}</p>
                    <time className="text-[11px] text-slate-400 tabular-nums">
                      {new Date(evt.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {evt.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              Items in this Package
            </h4>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <LazyImage
                      src={item.productImage || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                      aspectRatioClass="w-10 h-10 shrink-0 rounded overflow-hidden border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{item.productName}</p>
                      {item.variantTitle && <p className="text-[10px] text-slate-400">{item.variantTitle}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 tabular-nums">{formatBDT(item.unitPrice)}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
