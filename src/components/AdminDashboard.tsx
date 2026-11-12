import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  TrendingUp,
  Settings,
  Tag,
  Shield,
  Layers,
  Search,
  RefreshCw,
  LogOut,
  X,
  CreditCard,
  Smartphone,
  Key,
  Lock,
  SlidersHorizontal,
  Eye,
  Check,
  FileText,
  MapPin,
  Calendar,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext.tsx';
import { Product, Order, OrderStatus, PaymentStatus, PaymentMethod, Category, Coupon, PaymentGatewayConfig, User } from '../types/index.ts';
import LazyImage from './ui/LazyImage.tsx';
import Skeleton from './ui/Skeleton.tsx';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export default function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const { user, token, login, logout, formatBDT, categories, refreshCategories, refreshPaymentGateways } = useShop();

  // Authentication check for Admin
  const [adminEmail, setAdminEmail] = useState('admin@allez.com.bd');
  const [adminPassword, setAdminPassword] = useState('NabiulAdmin@2026');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'gateways' | 'orders' | 'products' | 'users' | 'coupons' | 'settings'>('overview');

  // Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Search & Filters inside Admin
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modal States
  // 1. Gateway Config Modal
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null);
  const [gatewayForm, setGatewayForm] = useState<Partial<PaymentGatewayConfig>>({});
  const [savingGateway, setSavingGateway] = useState(false);

  // 2. Order Full Details Editor Modal
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<{
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentTxnId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    streetAddress: string;
    thana: string;
    district: string;
    division: string;
    postalCode: string;
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    grandTotal: number;
    notes: string;
    newTrackingNote: string;
  }>({
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    paymentTxnId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    streetAddress: '',
    thana: '',
    district: 'Gaibandha',
    division: 'Rangpur',
    postalCode: '',
    carrier: 'Allez Express',
    trackingNumber: '',
    estimatedDelivery: '',
    grandTotal: 0,
    notes: '',
    newTrackingNote: ''
  });
  const [savingOrder, setSavingOrder] = useState(false);

  // 3. Product Add/Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Electronics',
    categoryId: 'cat_electronics',
    brand: 'Allez Acoustic',
    basePrice: '',
    discountPrice: '',
    stockQuantity: '15',
    sku: '',
    description: '',
    imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
  });

  // 4. User Edit Modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userRoleForm, setUserRoleForm] = useState<'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'>('CUSTOMER');
  const [userPhoneForm, setUserPhoneForm] = useState('');
  const [userFullNameForm, setUserFullNameForm] = useState('');

  // Fetch functions
  const fetchMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCoupons = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGateways = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/payment-gateways', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.paymentGateways) setGateways(data.paymentGateways);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setUsersList(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettingsForm(data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
      fetchAdminProducts();
      fetchAdminOrders();
      fetchCoupons();
      fetchGateways();
      fetchUsers();
      fetchSettings();
    }
  }, [isAdmin, token]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError('');
    const res = await login(adminEmail, adminPassword);
    setLoggingIn(false);
    if (!res.success) {
      setAuthError(res.error || 'Failed to authenticate as administrator');
    }
  };

  // ============================
  // PAYMENT GATEWAY EDIT LOGIC
  // ============================
  const openGatewayEditor = (gw: PaymentGatewayConfig) => {
    setSelectedGateway(gw);
    setGatewayForm({ ...gw });
  };

  const handleToggleGatewayStatus = async (gw: PaymentGatewayConfig) => {
    const newEnabled = !gw.enabled;
    try {
      const res = await fetch(`/api/admin/payment-gateways/${gw.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: newEnabled })
      });
      if (res.ok) {
        fetchGateways();
        refreshPaymentGateways();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;
    setSavingGateway(true);

    try {
      const res = await fetch(`/api/admin/payment-gateways/${selectedGateway.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(gatewayForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedGateway(null);
        fetchGateways();
        refreshPaymentGateways();
      } else {
        alert(data.error || 'Failed to update payment gateway');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSavingGateway(false);
    }
  };

  // ============================
  // ORDER DETAILS EDIT LOGIC
  // ============================
  const openOrderEditor = (ord: Order) => {
    setEditingOrder(ord);
    setOrderForm({
      status: ord.status,
      paymentStatus: ord.paymentStatus,
      paymentMethod: ord.paymentMethod,
      paymentTxnId: ord.paymentTxnId || '',
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      customerEmail: ord.customerEmail,
      streetAddress: ord.shippingAddress?.streetAddress || '',
      thana: ord.shippingAddress?.thana || '',
      district: ord.shippingAddress?.district || 'Gaibandha',
      division: ord.shippingAddress?.division || 'Rangpur',
      postalCode: ord.shippingAddress?.postalCode || '',
      carrier: ord.carrier,
      trackingNumber: ord.trackingNumber,
      estimatedDelivery: ord.estimatedDelivery,
      grandTotal: ord.grandTotal,
      notes: ord.notes || '',
      newTrackingNote: ''
    });
  };

  const handleSaveOrderDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setSavingOrder(true);

    const updatePayload = {
      status: orderForm.status,
      paymentStatus: orderForm.paymentStatus,
      paymentMethod: orderForm.paymentMethod,
      paymentTxnId: orderForm.paymentTxnId,
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      customerEmail: orderForm.customerEmail,
      shippingAddress: {
        streetAddress: orderForm.streetAddress,
        thana: orderForm.thana,
        district: orderForm.district,
        division: orderForm.division,
        postalCode: orderForm.postalCode
      },
      carrier: orderForm.carrier,
      trackingNumber: orderForm.trackingNumber,
      estimatedDelivery: orderForm.estimatedDelivery,
      grandTotal: Number(orderForm.grandTotal),
      notes: orderForm.newTrackingNote || orderForm.notes
    };

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        setEditingOrder(null);
        fetchAdminOrders();
        fetchMetrics();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save order');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order record?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEditingOrder(null);
        fetchAdminOrders();
        fetchMetrics();
      }
    } catch {
      alert('Failed to delete order');
    }
  };

  // ============================
  // USER DETAILS EDIT LOGIC
  // ============================
  const openUserEditor = (u: any) => {
    setEditingUser(u);
    setUserRoleForm(u.role);
    setUserPhoneForm(u.phone || '');
    setUserFullNameForm(u.fullName);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          role: userRoleForm,
          phone: userPhoneForm,
          fullName: userFullNameForm
        })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update user');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating user');
    }
  };

  // ============================
  // PRODUCT SAVE LOGIC
  // ============================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    const payload = {
      ...productForm,
      basePrice: Number(productForm.basePrice),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stockQuantity: Number(productForm.stockQuantity),
      images: [productForm.imageUrl]
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowProductModal(false);
        setEditingProduct(null);
        fetchAdminProducts();
        fetchMetrics();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminProducts();
        fetchMetrics();
      }
    } catch {
      alert('Failed to delete product');
    }
  };

  // ============================
  // SYSTEM SETTINGS SAVE LOGIC
  // ============================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsSavedMessage(true);
        setTimeout(() => setSettingsSavedMessage(false), 3000);
      }
    } catch {
      alert('Failed to save settings');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !orderSearch ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus =
      orderStatusFilter === 'all' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Login Screen if not Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF5722] flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black font-display">Allez Admin Portal</h2>
            <p className="text-xs text-slate-500">
              Administrator system access. Pre-configured for Super Administrator <strong>Nabiul</strong>.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {authError}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 border rounded-lg text-[11px] text-slate-600">
              <strong>Initial Admin Credentials:</strong>
              <div className="font-mono text-slate-800 mt-0.5">
                Email: admin@allez.com.bd<br />
                Pass: NabiulAdmin@2026
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-lg transition-colors text-sm"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full text-center text-slate-500 hover:text-slate-800 text-xs py-1"
            >
              Return to Storefront
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Nav */}
      <header className="bg-[#0A1128] text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
            AL<span className="text-[#FF5722]">LEZ</span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
              ADMIN CONTROL CENTER
            </span>
          </span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold hidden sm:inline-block">
            Gaibandha DB Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-300 hidden sm:inline">
            Admin: <strong>{user?.fullName}</strong> ({user?.role})
          </span>
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium border border-white/10"
          >
            Live Storefront
          </button>
          <button
            onClick={logout}
            className="p-1.5 text-red-400 hover:text-red-300"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'overview' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'gateways' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Payment Gateways ({gateways.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Order Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'products' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Customer Accounts ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeTab === 'coupons' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-[#FF5722] text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> System Settings
          </button>
        </div>

        {/* ========================================= */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ========================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="w-24 h-3" />
                      <Skeleton className="w-32 h-6" />
                      <Skeleton className="w-20 h-2.5" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Total Gross Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                      {formatBDT(metrics?.totalRevenue || 0)}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" /> Live Transaction Volume
                    </span>
                  </div>
                  <div className="p-3 bg-orange-50 text-[#FF5722] rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Total Orders</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                      {metrics?.totalOrders || 0}
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {metrics?.pendingOrders || 0} awaiting dispatch
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Catalog Inventory</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                      {metrics?.totalProducts || 0}
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Across 12 Departments
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Low Stock Warnings</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
                      {metrics?.lowStockCount || 0}
                    </h3>
                    <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                      Re-order required
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions & Audit Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#FF5722] font-semibold hover:underline"
                  >
                    Manage Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3">Order Number</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(metrics?.recentOrders || []).map((ord: Order) => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {ord.orderNumber}
                          </td>
                          <td className="py-2.5 px-3">{ord.customerName}</td>
                          <td className="py-2.5 px-3 font-bold tabular-nums">
                            {formatBDT(ord.grandTotal)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-orange-100 text-[#FF5722]'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                openOrderEditor(ord);
                              }}
                              className="text-xs text-[#FF5722] font-semibold hover:underline"
                            >
                              Edit Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#FF5722]" /> Admin System Audit Log
                </h3>
                <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                  {(metrics?.auditLogs || []).map((log: any) => (
                    <div key={log.id} className="py-2">
                      <p className="font-bold text-slate-800 text-[11px]">{log.action}</p>
                      <p className="text-[10px] text-slate-500">By: {log.adminName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: EDITABLE PAYMENT GATEWAYS */}
        {/* ========================================= */}
        {activeTab === 'gateways' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FF5722]" /> Payment Gateway Configuration & Editing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin can enable/disable gateways, switch between Sandbox and Live modes, edit merchant phone numbers, API keys, passwords, and service charges.
                  </p>
                </div>
                <button
                  onClick={fetchGateways}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 self-start"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Gateways
                </button>
              </div>

              {/* Gateway Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                {gateways.map((gw) => (
                  <div
                    key={gw.id}
                    className={`rounded-xl border-2 p-5 transition-all flex flex-col justify-between ${
                      gw.enabled ? 'border-slate-300 bg-white shadow-xs' : 'border-slate-200 bg-slate-50/80 opacity-75'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          {gw.method === 'COD' && (
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          )}
                          {gw.method === 'BKASH' && (
                            <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
                              <Smartphone className="w-5 h-5" />
                            </div>
                          )}
                          {gw.method === 'NAGAD' && (
                            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                              <Smartphone className="w-5 h-5" />
                            </div>
                          )}
                          {gw.method === 'ROCKET' && (
                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                              <Smartphone className="w-5 h-5" />
                            </div>
                          )}
                          {gw.method === 'SSLCOMMERZ' && (
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                              <CreditCard className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{gw.name}</h4>
                            <span className="font-mono text-[10px] text-slate-400 uppercase">
                              Method: {gw.method}
                            </span>
                          </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => handleToggleGatewayStatus(gw)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                            gw.enabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Click to enable/disable gateway"
                        >
                          {gw.enabled ? 'ACTIVE' : 'DISABLED'}
                        </button>
                      </div>

                      {/* Mode Badge & Charge */}
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            gw.mode === 'LIVE' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {gw.mode} MODE
                        </span>
                        {gw.chargePercentage ? (
                          <span className="text-[11px] text-slate-600 font-medium">
                            Fee: {gw.chargePercentage}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium">0% Extra Fee</span>
                        )}
                      </div>

                      {/* Gateway Details Summary */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600 font-mono">
                        {gw.merchantPhone && (
                          <p className="truncate">
                            <span className="text-slate-400">Merchant Phone:</span> {gw.merchantPhone}
                          </p>
                        )}
                        {gw.storeId && (
                          <p className="truncate">
                            <span className="text-slate-400">Store ID:</span> {gw.storeId}
                          </p>
                        )}
                        {gw.merchantId && (
                          <p className="truncate">
                            <span className="text-slate-400">Merchant ID:</span> {gw.merchantId}
                          </p>
                        )}
                        {gw.appKey && (
                          <p className="truncate">
                            <span className="text-slate-400">App Key:</span> {gw.appKey.slice(0, 8)}...
                          </p>
                        )}
                        {gw.maxOrderLimit && (
                          <p className="truncate">
                            <span className="text-slate-400">Max COD Limit:</span> {formatBDT(gw.maxOrderLimit)}
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {gw.instructions || 'Customer checkout instructions.'}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Updated {new Date(gw.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => openGatewayEditor(gw)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-[#FF5722] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit Gateway Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: COMPREHENSIVE ORDER MANAGEMENT */}
        {/* ========================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FF5722]" /> Full Order Access & Management
                </h3>
                <p className="text-xs text-slate-500">
                  Admin can inspect any order, edit customer delivery address, update payment status, change delivery stages, and inject tracking events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs bg-white font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by order #, phone, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 border rounded-lg text-xs w-48 sm:w-64"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b">
                  <tr>
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer & Contact</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Total (BDT)</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Consignment Status</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No orders match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {ord.orderNumber}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {ord.trackingNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900">{ord.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{ord.customerPhone}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{ord.customerEmail}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <p className="font-medium text-slate-800">{ord.shippingAddress?.district}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            {ord.shippingAddress?.streetAddress}
                          </p>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                          {formatBDT(ord.grandTotal)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.paymentStatus === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.paymentStatus === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-[#FF5722]'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5">
                          <button
                            onClick={() => openOrderEditor(ord)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-[#FF5722] text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Order
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 4: PRODUCT MANAGEMENT */}
        {/* ========================================= */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Allez Product Catalog</h3>
                <p className="text-xs text-slate-500">Add, edit pricing, update inventory stock, or remove products</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    category: 'Electronics',
                    categoryId: 'cat_electronics',
                    brand: 'Allez Acoustic',
                    basePrice: '',
                    discountPrice: '',
                    stockQuantity: '20',
                    sku: `ALZ-${Math.floor(100 + Math.random() * 900)}`,
                    description: '',
                    imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b">
                  <tr>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 flex items-center gap-3 max-w-xs">
                        <LazyImage
                          src={p.images[0] || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          aspectRatioClass="w-10 h-10 rounded overflow-hidden border border-slate-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.brand}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.category}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{p.sku}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                        {formatBDT(p.discountPrice || p.basePrice)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stockQuantity <= 5
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} in stock
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name,
                              category: p.category,
                              categoryId: p.categoryId,
                              brand: p.brand,
                              basePrice: String(p.basePrice),
                              discountPrice: p.discountPrice ? String(p.discountPrice) : '',
                              stockQuantity: String(p.stockQuantity),
                              sku: p.sku,
                              description: p.description,
                              imageUrl: p.images[0] || ''
                            });
                            setShowProductModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 5: USER & CUSTOMER MANAGEMENT */}
        {/* ========================================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF5722]" /> Customer Accounts & Roles
                </h3>
                <p className="text-xs text-slate-500">
                  Admin has access to view customer emails, contact numbers, order metrics, and modify account roles.
                </p>
              </div>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b">
                  <tr>
                    <th className="py-3 px-3">User / Customer</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">System Role</th>
                    <th className="py-3 px-3">Orders Count</th>
                    <th className="py-3 px-3">Total Spent (BDT)</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{u.fullName}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{u.phone || 'N/A'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'ADMIN'
                              ? 'bg-orange-100 text-[#FF5722]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums font-semibold">{u.orderCount} orders</td>
                      <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                        {formatBDT(u.totalSpent || 0)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openUserEditor(u)}
                          className="px-3 py-1 bg-slate-900 hover:bg-[#FF5722] text-white rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 6: COUPONS */}
        {/* ========================================= */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Promotional Coupons</h3>
              <p className="text-xs text-slate-500">Manage promo codes for the Bangladesh marketplace</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-sm text-[#FF5722]">{c.code}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Discount: <strong>{c.discountType === 'PERCENTAGE' ? `${c.discountAmount}%` : `৳${c.discountAmount}`}</strong>
                  </p>
                  {c.minSpend && (
                    <p className="text-[11px] text-slate-500">Min spend: ৳{c.minSpend}</p>
                  )}
                  <p className="text-[10px] text-slate-400">Total Redeemed: {c.usageCount} times</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 7: COMPLETE SYSTEM & STORE SETTINGS */}
        {/* ========================================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl space-y-5 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#FF5722]" /> Store Logistics, Regional Hub & System Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure Gaibandha logistics hub fees, national shipping rules, free delivery threshold, and system parameters.
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" /> System settings updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store / Website Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settingsForm.currencySymbol}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Registered Business / Hub Address (Gaibandha HQ)
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Gaibandha Local Hub Delivery (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.insideDelivery}
                    onChange={(e) => setSettingsForm({ ...settingsForm, insideDelivery: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nationwide Courier Delivery (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.outsideDelivery}
                    onChange={(e) => setSettingsForm({ ...settingsForm, outsideDelivery: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Free Delivery Threshold (৳)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold || 5000}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-lg shadow-sm text-xs"
              >
                Save System Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT PAYMENT GATEWAY DETAILS (CREDENTIALS, KEYS) */}
      {/* ======================================================== */}
      {selectedGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedGateway(null)} />
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <span className="text-[10px] text-[#FF5722] uppercase font-bold tracking-wider">
                  Payment Gateway Settings
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  Configure {selectedGateway.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedGateway(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gateway Display Name *</label>
                  <input
                    type="text"
                    value={gatewayForm.name || ''}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Environment Mode *</label>
                  <select
                    value={gatewayForm.mode || 'SANDBOX'}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="SANDBOX">SANDBOX (Test Mode)</option>
                    <option value="LIVE">LIVE (Production Gateway)</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                <div>
                  <p className="font-bold text-slate-900">Enable Payment Method in Checkout</p>
                  <p className="text-[11px] text-slate-500">
                    If disabled, customers cannot select this gateway at checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(gatewayForm.enabled)}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, enabled: e.target.checked })}
                  className="w-5 h-5 accent-[#FF5722]"
                />
              </div>

              {/* Specific Gateway Credentials */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  API & Merchant Credentials
                </h4>

                {/* Merchant Phone (for MFS: bKash, Nagad, Rocket) */}
                {(selectedGateway.method === 'BKASH' ||
                  selectedGateway.method === 'NAGAD' ||
                  selectedGateway.method === 'ROCKET') && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Official Merchant Account Phone Number
                    </label>
                    <input
                      type="text"
                      value={gatewayForm.merchantPhone || ''}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, merchantPhone: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                    />
                  </div>
                )}

                {/* bKash Specific */}
                {selectedGateway.method === 'BKASH' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">bKash App Key</label>
                        <input
                          type="text"
                          value={gatewayForm.appKey || ''}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, appKey: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">bKash App Secret</label>
                        <input
                          type="password"
                          value={gatewayForm.appSecret || ''}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, appSecret: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">API Username</label>
                        <input
                          type="text"
                          value={gatewayForm.username || ''}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, username: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">API Password</label>
                        <input
                          type="password"
                          value={gatewayForm.password || ''}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, password: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* SSLCommerz Specific */}
                {selectedGateway.method === 'SSLCOMMERZ' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">SSLCommerz Store ID</label>
                      <input
                        type="text"
                        value={gatewayForm.storeId || ''}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, storeId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Store Secret Password
                      </label>
                      <input
                        type="password"
                        value={gatewayForm.storePassword || ''}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, storePassword: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Nagad Specific */}
                {selectedGateway.method === 'NAGAD' && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nagad Merchant ID</label>
                      <input
                        type="text"
                        value={gatewayForm.merchantId || ''}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, merchantId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nagad Public Key</label>
                      <input
                        type="text"
                        value={gatewayForm.publicKey || ''}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, publicKey: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono bg-white"
                      />
                    </div>
                  </>
                )}

                {/* COD Specific Limit */}
                {selectedGateway.method === 'COD' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Maximum Allowed Order Total for COD (BDT)
                    </label>
                    <input
                      type="number"
                      value={gatewayForm.maxOrderLimit || 50000}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, maxOrderLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
                    />
                  </div>
                )}

                {/* Service Charge */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Gateway Surcharge / Fee Percentage (%) (e.g. 0 for Free, or 1.5%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={gatewayForm.chargePercentage || 0}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, chargePercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Customer Instructions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Customer Instructions (Shown at Checkout)
                </label>
                <textarea
                  rows={2}
                  value={gatewayForm.instructions || ''}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Pay cash to courier upon arrival..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGateway(null)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGateway}
                  className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg font-bold shadow-sm"
                >
                  {savingGateway ? 'Saving Changes...' : 'Save Gateway Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT ANY ORDER DETAILS IN FULL */}
      {/* ======================================================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingOrder(null)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <span className="text-[10px] text-[#FF5722] uppercase font-bold tracking-wider">
                  Admin Full Order Editor
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  Order #{editingOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderDetails} className="space-y-4">
              {/* Status and Payment Control */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Consignment Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as OrderStatus })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold text-slate-900"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Status</label>
                  <select
                    value={orderForm.paymentStatus}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Gateway</label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-bold"
                  >
                    <option value="COD">COD</option>
                    <option value="BKASH">BKASH</option>
                    <option value="NAGAD">NAGAD</option>
                    <option value="ROCKET">ROCKET</option>
                    <option value="CARD">CARD</option>
                    <option value="SSLCOMMERZ">SSLCOMMERZ</option>
                  </select>
                </div>
              </div>

              {/* Transaction ID & Order Grand Total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Transaction ID</label>
                  <input
                    type="text"
                    value={orderForm.paymentTxnId}
                    onChange={(e) => setOrderForm({ ...orderForm, paymentTxnId: e.target.value })}
                    placeholder="e.g. BKH98230198"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grand Total (BDT ৳)</label>
                  <input
                    type="number"
                    value={orderForm.grandTotal}
                    onChange={(e) => setOrderForm({ ...orderForm, grandTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-[#FF5722]"
                    required
                  />
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-700">Recipient Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={orderForm.customerPhone}
                      onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Email</label>
                    <input
                      type="email"
                      value={orderForm.customerEmail}
                      onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-700">Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">District</label>
                    <input
                      type="text"
                      value={orderForm.district}
                      onChange={(e) => setOrderForm({ ...orderForm, district: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Thana / Upazila</label>
                    <input
                      type="text"
                      value={orderForm.thana}
                      onChange={(e) => setOrderForm({ ...orderForm, thana: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Division</label>
                    <input
                      type="text"
                      value={orderForm.division}
                      onChange={(e) => setOrderForm({ ...orderForm, division: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-slate-600 block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={orderForm.streetAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, streetAddress: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Logistics & Tracking Event Injection */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-700">Logistics & Courier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Carrier Fleet</label>
                    <input
                      type="text"
                      value={orderForm.carrier}
                      onChange={(e) => setOrderForm({ ...orderForm, carrier: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Tracking Code</label>
                    <input
                      type="text"
                      value={orderForm.trackingNumber}
                      onChange={(e) => setOrderForm({ ...orderForm, trackingNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Estimated Delivery</label>
                    <input
                      type="text"
                      value={orderForm.estimatedDelivery}
                      onChange={(e) => setOrderForm({ ...orderForm, estimatedDelivery: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Add Real-Time Tracking Event Note (Appends to Consignment Timeline)
                  </label>
                  <input
                    type="text"
                    value={orderForm.newTrackingNote}
                    onChange={(e) => setOrderForm({ ...orderForm, newTrackingNote: e.target.value })}
                    placeholder="e.g. Cleared Gaibandha Sorting Bay 3, dispatched to delivery rider."
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(editingOrder.id)}
                  className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold"
                >
                  Delete Order
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOrder}
                    className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg font-bold shadow-sm"
                  >
                    {savingOrder ? 'Saving...' : 'Save Order Modifications'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowProductModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
              </h3>
              <button onClick={() => setShowProductModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setProductForm({
                        ...productForm,
                        categoryId: e.target.value,
                        category: cat?.name || 'Electronics'
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Price (৳) *</label>
                  <input
                    type="number"
                    value={productForm.basePrice}
                    onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    value={productForm.discountPrice}
                    onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-[#FF5722]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL / Path</label>
                <input
                  type="text"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EDIT USER / CUSTOMER DETAILS */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-bold text-sm text-slate-900">
                Edit User Details ({editingUser.email})
              </h3>
              <button onClick={() => setEditingUser(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={userFullNameForm}
                  onChange={(e) => setUserFullNameForm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userPhoneForm}
                  onChange={(e) => setUserPhoneForm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role & Permissions</label>
                <select
                  value={userRoleForm}
                  onChange={(e) => setUserRoleForm(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-bold"
                >
                  <option value="CUSTOMER">CUSTOMER (Standard Shopper)</option>
                  <option value="ADMIN">ADMIN (Full Store Operations Access)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (System Owner)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5722] text-white rounded-lg font-bold"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
