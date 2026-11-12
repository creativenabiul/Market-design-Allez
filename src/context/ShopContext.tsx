import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, CartItem, Order, Category, StoreSettings, PaymentGatewayConfig } from '../types/index.ts';

interface ShopContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string, variantTitle?: string, variantPrice?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  deliveryFee: number;
  formatBDT: (amount: number) => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeModal: 'none' | 'cart' | 'auth' | 'checkout' | 'track' | 'quickview';
  setActiveModal: (modal: 'none' | 'cart' | 'auth' | 'checkout' | 'track' | 'quickview') => void;
  quickviewProduct: Product | null;
  setQuickviewProduct: (product: Product | null) => void;
  currentTrackOrderNumber: string;
  setCurrentTrackOrderNumber: (num: string) => void;
  categories: Category[];
  refreshCategories: () => Promise<void>;
  storeSettings: StoreSettings;
  refreshSettings: () => Promise<void>;
  paymentGateways: PaymentGatewayConfig[];
  refreshPaymentGateways: () => Promise<void>;
}

const defaultSettings: StoreSettings = {
  storeName: 'Allez',
  address: 'DB Road, Gaibandha, Bangladesh',
  currency: 'BDT',
  currencySymbol: '৳',
  insideDelivery: 60,
  outsideDelivery: 120,
  freeShippingThreshold: 5000,
  contactEmail: 'support@allez.com.bd',
  contactPhone: '+8801711000000',
  maintenanceMode: false
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('allez_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('allez_token');
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('allez_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('allez_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Gaibandha');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'cart' | 'auth' | 'checkout' | 'track' | 'quickview'>('none');
  const [quickviewProduct, setQuickviewProduct] = useState<Product | null>(null);
  const [currentTrackOrderNumber, setCurrentTrackOrderNumber] = useState<string>('ALZ-202603-7821');
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([]);

  useEffect(() => {
    localStorage.setItem('allez_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('allez_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('allez_token', token);
      localStorage.setItem('allez_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('allez_token');
      localStorage.removeItem('allez_user');
    }
  }, [token, user]);

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setStoreSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const refreshPaymentGateways = async () => {
    try {
      const res = await fetch('/api/payment-gateways');
      const data = await res.json();
      if (data.paymentGateways) {
        setPaymentGateways(data.paymentGateways);
      }
    } catch (err) {
      console.error('Failed to load payment gateways', err);
    }
  };

  useEffect(() => {
    refreshCategories();
    refreshSettings();
    refreshPaymentGateways();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed' };
      }
      setUser(resData.user);
      setToken(resData.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const addToCart = (product: Product, quantity = 1, variantId?: string, variantTitle?: string, variantPrice?: number) => {
    setCart((prev) => {
      const unitPrice = variantPrice || product.discountPrice || product.basePrice;
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `cart_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: product.id,
        product,
        variantId,
        variantTitle,
        quantity,
        unitPrice
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const deliveryFee =
    cartSubtotal >= (storeSettings.freeShippingThreshold || 5000)
      ? 0
      : selectedDistrict.toLowerCase() === 'gaibandha'
      ? storeSettings.insideDelivery
      : storeSettings.outsideDelivery;

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const formatBDT = (amount: number) => {
    return `${storeSettings.currencySymbol} ${amount.toLocaleString('en-BD')}`;
  };

  return (
    <ShopContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isWishlisted,
        selectedDistrict,
        setSelectedDistrict,
        deliveryFee,
        formatBDT,
        isCartOpen,
        setIsCartOpen,
        activeModal,
        setActiveModal,
        quickviewProduct,
        setQuickviewProduct,
        currentTrackOrderNumber,
        setCurrentTrackOrderNumber,
        categories,
        refreshCategories,
        storeSettings,
        refreshSettings,
        paymentGateways,
        refreshPaymentGateways
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
