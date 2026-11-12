import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  getDatabase,
  saveDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  createOrderInDB,
  updateOrderStatusInDB,
  updatePaymentGatewayInDB,
  updateOrderDetailsInDB,
  updateUserDetailsInDB
} from './server/db.ts';
import { Product, OrderStatus, PaymentMethod } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory simple token mapping for secure session verification
const tokenStore = new Map<string, { userId: string; role: string; email: string; fullName: string }>();

// Auth Middleware Helper
function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  const session = tokenStore.get(token);
  if (session) {
    (req as any).user = session;
  }
  next();
}

app.use(authenticateToken);

// ========================
// AUTHENTICATION ROUTES
// ========================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }
    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const user = createUser({ email, password, fullName, phone });
    const token = `alz_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    tokenStore.set(token, {
      userId: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName
    });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const userWithHash = findUserByEmail(email);
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isMatch = bcrypt.compareSync(password, userWithHash.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = `alz_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    tokenStore.set(token, {
      userId: userWithHash.id,
      role: userWithHash.role,
      email: userWithHash.email,
      fullName: userWithHash.fullName
    });

    const { passwordHash: _, ...safeUser } = userWithHash;
    return res.json({ user: safeUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  if (!sessionUser) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const dbUser = findUserById(sessionUser.userId);
  if (!dbUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = dbUser;
  return res.json({ user: safeUser });
});

// ========================
// CATEGORIES & BANNERS
// ========================

app.get('/api/categories', (req: Request, res: Response) => {
  const db = getDatabase();
  // Ensure product counts are current
  const categories = db.categories.map((cat) => ({
    ...cat,
    productCount: db.products.filter((p) => p.categoryId === cat.id).length
  }));
  res.json({ categories });
});

app.post('/api/categories', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const { name, slug, description, imageUrl, subcategories } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' });
  }
  const newCat = {
    id: `cat_${slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name,
    slug: slug.toLowerCase(),
    description: description || '',
    imageUrl: imageUrl || '',
    subcategories: subcategories || []
  };
  db.categories.push(newCat);
  saveDatabase();
  res.json({ category: newCat });
});

app.get('/api/banners', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ banners: db.banners.filter((b) => b.isActive) });
});

// ========================
// PRODUCTS & SEARCH
// ========================

app.get('/api/products', (req: Request, res: Response) => {
  const db = getDatabase();
  let list = [...db.products];

  const { search, category, brand, minPrice, maxPrice, inStock, sort, deal, bestSeller, newArrival } = req.query;

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    list = list.filter((p) => p.categoryId === category || p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (brand && brand !== 'all') {
    list = list.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) {
      list = list.filter((p) => (p.discountPrice || p.basePrice) >= min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) {
      list = list.filter((p) => (p.discountPrice || p.basePrice) <= max);
    }
  }

  if (inStock === 'true') {
    list = list.filter((p) => p.stockQuantity > 0);
  }

  if (deal === 'true') {
    list = list.filter((p) => p.isDeal);
  }

  if (bestSeller === 'true') {
    list = list.filter((p) => p.isBestSeller);
  }

  if (newArrival === 'true') {
    list = list.filter((p) => p.isNewArrival);
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => (a.discountPrice || a.basePrice) - (b.discountPrice || b.basePrice));
  } else if (sort === 'price_desc') {
    list.sort((a, b) => (b.discountPrice || b.basePrice) - (a.discountPrice || a.basePrice));
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products: list, total: list.length });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const product = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Related products from same category
  const related = db.products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  res.json({ product, related });
});

// Admin Product CRUD
app.post('/api/products', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const body = req.body;

  if (!body.name || !body.basePrice) {
    return res.status(400).json({ error: 'Name and base price are required' });
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: body.name,
    slug,
    sku: body.sku || `ALZ-${Math.floor(100 + Math.random() * 900)}`,
    description: body.description || '',
    basePrice: Number(body.basePrice),
    discountPrice: body.discountPrice ? Number(body.discountPrice) : undefined,
    stockQuantity: Number(body.stockQuantity || 10),
    isFeatured: Boolean(body.isFeatured),
    isDeal: Boolean(body.isDeal),
    isBestSeller: Boolean(body.isBestSeller),
    isNewArrival: Boolean(body.isNewArrival ?? true),
    category: body.category || 'Electronics',
    categoryId: body.categoryId || 'cat_electronics',
    brand: body.brand || 'Allez Select',
    images: body.images && body.images.length > 0 ? body.images : ['/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'],
    specifications: body.specifications || {},
    rating: 5.0,
    reviewCount: 0,
    shippingInfo: body.shippingInfo || 'Fast dispatch from Gaibandha Hub. ৳60 Inside Gaibandha, ৳120 Nationwide.',
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  saveDatabase();
  res.json({ product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.products[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    basePrice: req.body.basePrice !== undefined ? Number(req.body.basePrice) : existing.basePrice,
    discountPrice: req.body.discountPrice !== undefined ? (req.body.discountPrice ? Number(req.body.discountPrice) : undefined) : existing.discountPrice,
    stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : existing.stockQuantity
  };

  db.products[index] = updated;
  saveDatabase();
  res.json({ product: updated });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// ========================
// COUPONS
// ========================

app.post('/api/coupons/apply', (req: Request, res: Response) => {
  const db = getDatabase();
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code or expired' });
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return res.status(400).json({
      error: `Minimum spend of ৳${coupon.minSpend.toLocaleString()} is required for coupon ${coupon.code}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountAmount) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountAmount;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountAmount: coupon.discountAmount,
    discountTotal: Math.min(discount, subtotal),
    message: `Coupon ${coupon.code} applied successfully!`
  });
});

app.get('/api/admin/coupons', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  res.json({ coupons: db.coupons });
});

app.post('/api/admin/coupons', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const { code, discountType, discountAmount, minSpend, maxDiscount, validUntil } = req.body;
  const newCoupon = {
    id: `coup_${Date.now()}`,
    code: code.toUpperCase().trim(),
    discountType: discountType || 'PERCENTAGE',
    discountAmount: Number(discountAmount),
    minSpend: minSpend ? Number(minSpend) : undefined,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    validUntil: validUntil || '2027-12-31',
    isActive: true,
    usageCount: 0
  };
  db.coupons.push(newCoupon);
  saveDatabase();
  res.json({ coupon: newCoupon });
});

// ========================
// CHECKOUT & ORDERS
// ========================

app.post('/api/checkout', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      paymentMethod,
      couponCode,
      notes,
      paymentTxnId
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Your cart has no items.' });
    }
    if (!customerName || !customerPhone || !shippingAddress || !shippingAddress.streetAddress) {
      return res.status(400).json({ error: 'Full customer name, phone, and delivery address are required.' });
    }

    // Verify payment gateway is enabled
    const gateway = db.paymentGateways?.find((g) => g.method === paymentMethod);
    if (gateway && !gateway.enabled) {
      return res.status(400).json({
        error: `${gateway.name} is currently disabled by administration. Please select another payment method.`
      });
    }

    // Calculate subtotal and verify stock
    let subTotal = 0;
    const validatedItems = [];
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.productName || item.productId}` });
      }
      if (prod.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.name}". Only ${prod.stockQuantity} left in stock.`
        });
      }
      const unitPrice = item.variantPrice || prod.discountPrice || prod.basePrice;
      const totalPrice = unitPrice * item.quantity;
      subTotal += totalPrice;
      validatedItems.push({
        id: `ord_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0] || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice,
        totalPrice
      });
    }

    // Delivery calculation
    // Inside Gaibandha = ৳60, Outside = ৳120, Free above ৳5000
    let shippingCost = db.settings.outsideDelivery;
    if (shippingAddress.district && shippingAddress.district.toLowerCase() === 'gaibandha') {
      shippingCost = db.settings.insideDelivery;
    }
    if (subTotal >= 5000) {
      shippingCost = 0; // Promotional Free delivery
    }

    // Coupon discount
    let discountTotal = 0;
    if (couponCode) {
      const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive);
      if (coupon && (!coupon.minSpend || subTotal >= coupon.minSpend)) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountTotal = (subTotal * coupon.discountAmount) / 100;
          if (coupon.maxDiscount && discountTotal > coupon.maxDiscount) {
            discountTotal = coupon.maxDiscount;
          }
        } else {
          discountTotal = coupon.discountAmount;
        }
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }

    const grandTotal = Math.max(0, subTotal + shippingCost - discountTotal);
    const sessionUser = (req as any).user;
    const userId = sessionUser ? sessionUser.userId : `guest_${Date.now()}`;

    const newOrder = createOrderInDB({
      userId,
      customerName,
      customerEmail: customerEmail || (sessionUser ? sessionUser.email : 'guest@allez.com.bd'),
      customerPhone,
      shippingAddress,
      subTotal,
      shippingCost,
      discountTotal,
      grandTotal,
      status: 'CONFIRMED',
      paymentMethod: (paymentMethod as PaymentMethod) || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
      paymentTxnId: paymentTxnId || (paymentMethod === 'COD' ? undefined : `TXN-ALZ-${Date.now()}`),
      couponCode,
      notes,
      items: validatedItems
    });

    return res.json({
      success: true,
      order: newOrder,
      message: 'Order created successfully!'
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

app.get('/api/orders', (req: Request, res: Response) => {
  const db = getDatabase();
  const sessionUser = (req as any).user;
  if (!sessionUser) {
    return res.status(401).json({ error: 'Please log in to view orders' });
  }

  // If Admin, can view all
  if (sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPER_ADMIN') {
    return res.json({ orders: db.orders });
  }

  // Otherwise, user's orders
  const userOrders = db.orders.filter(
    (o) => o.userId === sessionUser.userId || o.customerEmail.toLowerCase() === sessionUser.email.toLowerCase()
  );
  res.json({ orders: userOrders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order });
});

app.get('/api/orders/:id/track', (req: Request, res: Response) => {
  const db = getDatabase();
  const query = req.params.id.trim();
  const order = db.orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === query.toLowerCase() ||
      o.trackingNumber.toLowerCase() === query.toLowerCase() ||
      o.id.toLowerCase() === query.toLowerCase()
  );
  if (!order) {
    return res.status(404).json({ error: 'No order found with this tracking or order number.' });
  }
  res.json({
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    status: order.status,
    customerName: order.customerName,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
    shippingAddress: order.shippingAddress,
    items: order.items,
    grandTotal: order.grandTotal,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    trackingEvents: order.trackingEvents,
    createdAt: order.createdAt
  });
});

app.post('/api/orders/:id/status', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { status, note } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = updateOrderStatusInDB(req.params.id, status as OrderStatus, note, session.fullName);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order: updated });
});

app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
  const session = (req as any).user;
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Only allowed if PENDING or CONFIRMED
  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    return res.status(400).json({ error: 'Order cannot be cancelled as it is already being processed or shipped.' });
  }

  const updated = updateOrderStatusInDB(order.id, 'CANCELLED', 'Order cancelled by customer.', session?.fullName || 'Customer');
  res.json({ order: updated, message: 'Order has been successfully cancelled.' });
});

// ========================
// REVIEWS
// ========================

app.post('/api/reviews', (req: Request, res: Response) => {
  const db = getDatabase();
  const { productId, rating, comment, userName } = req.body;
  const prod = db.products.find((p) => p.id === productId);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Update product rating
  const currentTotal = prod.rating * prod.reviewCount;
  prod.reviewCount += 1;
  prod.rating = parseFloat(((currentTotal + Number(rating)) / prod.reviewCount).toFixed(1));

  saveDatabase();
  res.json({ success: true, newRating: prod.rating, reviewCount: prod.reviewCount });
});

// ========================
// BANGLADESH PAYMENT SIMULATOR
// ========================

app.post('/api/payment/mfs-verify', (req: Request, res: Response) => {
  const { method, accountPhone, pin, amount } = req.body;
  if (!method || !accountPhone || !pin) {
    return res.status(400).json({ error: 'Wallet provider, account phone number, and PIN are required.' });
  }

  // Verification simulator
  if (pin.length < 4) {
    return res.status(400).json({ error: 'Invalid PIN length.' });
  }

  const txnId = `${method.toUpperCase()}${Date.now().toString(36).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    txnId,
    method,
    amount,
    account: accountPhone.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2'),
    timestamp: new Date().toISOString()
  });
});

// ========================
// ADMIN METRICS & SETTINGS
// ========================

app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const db = getDatabase();
  const totalRevenue = db.orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED' && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const totalOrders = db.orders.length;
  const totalCustomers = db.users.filter((u) => u.role === 'CUSTOMER').length;
  const totalProducts = db.products.length;
  const pendingOrders = db.orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const lowStock = db.products.filter((p) => p.stockQuantity <= 5);

  res.json({
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    lowStockCount: lowStock.length,
    lowStockProducts: lowStock,
    recentOrders: db.orders.slice(0, 10),
    auditLogs: db.auditLogs.slice(0, 10),
    storeAddress: db.settings.address,
    currency: db.settings.currencySymbol
  });
});

app.get('/api/admin/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase();
  res.json({ settings: db.settings });
});

// ========================
// PAYMENT GATEWAYS (PUBLIC & ADMIN)
// ========================

// Public: Get list of enabled payment methods with customer-facing info
app.get('/api/payment-gateways', (_req: Request, res: Response) => {
  const db = getDatabase();
  const publicList = (db.paymentGateways || [])
    .filter((g) => g.enabled)
    .map((g) => ({
      id: g.id,
      name: g.name,
      method: g.method,
      enabled: g.enabled,
      mode: g.mode,
      chargePercentage: g.chargePercentage || 0,
      instructions: g.instructions || '',
      maxOrderLimit: g.maxOrderLimit,
      merchantPhone: g.merchantPhone
    }));
  res.json({ paymentGateways: publicList });
});

// Admin: Get all payment gateways with credentials, API keys, and settings
app.get('/api/admin/payment-gateways', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  res.json({ paymentGateways: db.paymentGateways || [] });
});

// Admin: Update payment gateway configuration
app.put('/api/admin/payment-gateways/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const updated = updatePaymentGatewayInDB(req.params.id, req.body, session.fullName);
  if (!updated) {
    return res.status(404).json({ error: 'Payment gateway not found' });
  }
  res.json({ success: true, gateway: updated });
});

// ========================
// USER & CUSTOMER MANAGEMENT
// ========================

app.get('/api/admin/users', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const usersWithMetrics = db.users.map((u) => {
    const userOrders = db.orders.filter(
      (o) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase()
    );
    const totalSpent = userOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const { passwordHash: _, ...safeUser } = u;
    return {
      ...safeUser,
      orderCount: userOrders.length,
      totalSpent
    };
  });
  res.json({ users: usersWithMetrics });
});

app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const updated = updateUserDetailsInDB(req.params.id, req.body, session.fullName);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: updated });
});

// ========================
// COMPREHENSIVE ORDER EDITING
// ========================

app.put('/api/admin/orders/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const updated = updateOrderDetailsInDB(req.params.id, req.body, session.fullName);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ order: updated });
});

app.delete('/api/admin/orders/:id', (req: Request, res: Response) => {
  const session = (req as any).user;
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const db = getDatabase();
  const index = db.orders.findIndex((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const deleted = db.orders.splice(index, 1)[0];
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'ORDER_DELETED',
    adminName: session.fullName,
    timestamp: new Date().toISOString(),
    details: { orderNumber: deleted.orderNumber }
  });
  saveDatabase();
  res.json({ success: true, deletedOrderNumber: deleted.orderNumber });
});

// ========================
// VITE INTEGRATION
// ========================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true }
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ALLEZ E-Commerce Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
