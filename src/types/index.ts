export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'COD'
  | 'BKASH'
  | 'NAGAD'
  | 'ROCKET'
  | 'CARD'
  | 'SSLCOMMERZ';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId?: string;
  title: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  thana: string;
  streetAddress: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  subcategories?: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  stockQuantity: number;
  isFeatured?: boolean;
  isDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  category: string;
  categoryId: string;
  brand: string;
  images: string[];
  specifications: Record<string, string>;
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  shippingInfo?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
}

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  location: string;
  description: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  subTotal: number;
  shippingCost: number;
  discountTotal: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTxnId?: string;
  couponCode?: string;
  notes?: string;
  items: OrderItem[];
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountAmount: number;
  minSpend?: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetUrl: string;
  badge?: string;
  isActive: boolean;
}

export interface PaymentGatewayConfig {
  id: string; // 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz'
  name: string;
  method: PaymentMethod;
  enabled: boolean;
  mode: 'SANDBOX' | 'LIVE';
  merchantPhone?: string;
  merchantId?: string;
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
  storeId?: string;
  storePassword?: string;
  publicKey?: string;
  privateKey?: string;
  chargePercentage?: number;
  instructions?: string;
  maxOrderLimit?: number;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  currency: string;
  currencySymbol: string;
  insideDelivery: number;
  outsideDelivery: number;
  freeShippingThreshold: number;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode?: boolean;
}

