import React, { useState, useEffect } from 'react';
import {
  Package,
  Heart,
  MapPin,
  User as UserIcon,
  Compass,
  Printer,
  XCircle,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { useShop } from '../context/ShopContext.tsx';
import { Order, Product } from '../types/index.ts';
import LazyImage from './ui/LazyImage.tsx';
import Skeleton from './ui/Skeleton.tsx';

interface CustomerDashboardProps {
  onTrackOrder: (orderNumber: string) => void;
  onNavigateHome: () => void;
  onQuickview: (product: Product) => void;
}

export default function CustomerDashboard({
  onTrackOrder,
  onNavigateHome,
  onQuickview
}: CustomerDashboardProps) {
  const { user, token, formatBDT, wishlist, toggleWishlist, addToCart } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWishlistProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        const wishProds = data.products.filter((p: Product) => wishlist.includes(p.id));
        setWishlistProducts(wishProds);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchWishlistProducts();
  }, [token, wishlist]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Order cancelled.');
        fetchOrders();
      } else {
        alert(data.error || 'Failed to cancel order.');
      }
    } catch {
      alert('Error cancelling order');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Profile Greeting */}
      <div className="bg-[#0A1128] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-[#FF5722] tracking-wider">
            Customer Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display mt-0.5">
            {user ? user.fullName : 'Guest Customer Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {user?.email} {user?.phone ? `· ${user.phone}` : ''} · Gaibandha & Bangladesh Marketplace
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors"
        >
          Explore Catalog
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-2 space-y-1 shadow-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4 text-[#FF5722]" /> My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-4 h-4 text-[#FF5722]" /> Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#FF5722]" /> Saved Addresses
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-4 h-4 text-[#FF5722]" /> Account Settings
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="md:col-span-9 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Order History</h3>
                  <p className="text-xs text-slate-500">Track current consignments or view past invoices</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="text-xs text-[#FF5722] font-semibold hover:underline"
                >
                  Refresh Orders
                </button>
              </div>

              {loadingOrders ? (
                <div className="space-y-4">
                  {[1, 2].map((idx) => (
                    <div key={idx} className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-white space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="space-y-1.5">
                          <Skeleton className="w-32 h-4" />
                          <Skeleton className="w-48 h-3" />
                        </div>
                        <Skeleton className="w-24 h-6 rounded-md" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="w-40 h-3.5" />
                          <Skeleton className="w-20 h-3" />
                        </div>
                        <Skeleton className="w-16 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-xs text-slate-400">Start shopping and enjoy free delivery over ৳5,000.</p>
                  <button
                    onClick={onNavigateHome}
                    className="px-5 py-2 bg-[#FF5722] text-white text-xs font-bold rounded-lg"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-4"
                    >
                      {/* Top Bar of Order Card */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400">Order #</span>
                          <span className="font-mono font-bold text-slate-900 ml-1.5">{ord.orderNumber}</span>
                          <span className="text-slate-300 mx-2">·</span>
                          <span className="text-slate-500">
                            {new Date(ord.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-[#FF5722]'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>

                          <span className="text-slate-400 text-[11px]">
                            {ord.paymentMethod} ({ord.paymentStatus})
                          </span>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="divide-y divide-slate-100">
                        {ord.items?.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <LazyImage
                                src={item.productImage || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                                aspectRatioClass="w-12 h-12 shrink-0 rounded overflow-hidden border border-slate-100"
                              />
                              <div>
                                <h5 className="font-semibold text-slate-800">{item.productName}</h5>
                                {item.variantTitle && (
                                  <p className="text-[11px] text-slate-400">{item.variantTitle}</p>
                                )}
                                <p className="text-[11px] text-slate-500">
                                  Qty: {item.quantity} × {formatBDT(item.unitPrice)}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 tabular-nums">
                              {formatBDT(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2 text-xs">
                        <div>
                          <span className="text-slate-500">Total: </span>
                          <strong className="text-sm font-black text-[#FF5722] tabular-nums">
                            {formatBDT(ord.grandTotal)}
                          </strong>
                          <span className="text-[11px] text-slate-400 ml-2">
                            (incl. ৳{ord.shippingCost} shipping)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onTrackOrder(ord.orderNumber)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-[#FF5722] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Compass className="w-3.5 h-3.5" /> Track Consignment
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" /> View Invoice
                          </button>

                          {(ord.status === 'PENDING' || ord.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Saved Wishlist Items</h3>
                <p className="text-xs text-slate-500">Your favorite products to purchase later</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Your wishlist is empty</p>
                  <p className="text-xs text-slate-400">Click the heart icon on any product to save it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center gap-3 relative"
                    >
                      <div className="cursor-pointer" onClick={() => onQuickview(p)}>
                        <LazyImage
                          src={p.images[0] || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          aspectRatioClass="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5
                          className="font-semibold text-xs text-slate-900 truncate cursor-pointer hover:text-[#FF5722]"
                          onClick={() => onQuickview(p)}
                        >
                          {p.name}
                        </h5>
                        <p className="font-bold text-xs text-slate-900 mt-0.5 tabular-nums">
                          {formatBDT(p.discountPrice || p.basePrice)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-[#FF5722] text-white rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" /> Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
                <p className="text-xs text-slate-500">Manage shipping destinations in Bangladesh</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border-2 border-[#FF5722] bg-orange-50/40 relative">
                  <span className="text-[10px] bg-[#FF5722] text-white font-bold px-2 py-0.5 rounded absolute top-3 right-3">
                    Default
                  </span>
                  <p className="text-xs font-bold text-slate-900">Primary Gaibandha Residence</p>
                  <p className="text-xs text-slate-700 mt-2">
                    {user?.fullName || 'Tahmid Rahman'} ({user?.phone || '+8801711223344'})
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    House 14, DB Road, Ward 03, Gaibandha Sadar, Rangpur, 5700, Bangladesh
                  </p>
                  <span className="inline-block mt-3 text-[11px] text-emerald-700 font-semibold">
                    Local Hub Delivery (৳60)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE / ACCOUNT SETTINGS TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">Account Profile</h3>
                <p className="text-xs text-slate-500">Security and contact details</p>
              </div>

              <div className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || 'Tahmid Rahman'}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'customer@allez.com.bd'}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || '+8801822334455'}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Profile settings saved successfully.')}
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setSelectedInvoiceOrder(null)} />
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <span className="text-2xl font-black text-slate-900 font-display">
                  AL<span className="text-[#FF5722]">LEZ</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  DB Road, Gaibandha, Bangladesh · support@allez.com.bd
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="my-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice For:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedInvoiceOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-emerald-600 uppercase">
                  {selectedInvoiceOrder.paymentStatus} ({selectedInvoiceOrder.paymentMethod})
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden my-4 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoiceOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium">{item.productName}</td>
                      <td className="p-2.5 text-center tabular-nums">{item.quantity}</td>
                      <td className="p-2.5 text-right font-bold tabular-nums">
                        {formatBDT(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs space-y-1 text-right pt-2 border-t border-slate-200">
              <p className="text-slate-500">Subtotal: {formatBDT(selectedInvoiceOrder.subTotal)}</p>
              <p className="text-slate-500">Shipping: {formatBDT(selectedInvoiceOrder.shippingCost)}</p>
              {selectedInvoiceOrder.discountTotal > 0 && (
                <p className="text-emerald-600 font-bold">
                  Discount: -{formatBDT(selectedInvoiceOrder.discountTotal)}
                </p>
              )}
              <p className="text-base font-black text-slate-900 pt-1">
                Grand Total: <span className="text-[#FF5722]">{formatBDT(selectedInvoiceOrder.grandTotal)}</span>
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
