import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Product,
  Order,
  Coupon,
  StoreSettings,
  Banner,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  TrackingEvent,
  PaymentGatewayConfig
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'allez_db.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: StoreSettings;
  paymentGateways: PaymentGatewayConfig[];
  auditLogs: { id: string; action: string; adminName: string; timestamp: string; details?: any }[];
}

let dbInstance: DatabaseSchema | null = null;

function getInitialData(): DatabaseSchema {
  const initialAdminPass = process.env.ADMIN_INITIAL_PASSWORD || 'NabiulAdmin@2026';
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync(initialAdminPass, salt);
  const customerHash = bcrypt.hashSync('customer123', salt);

  const initialUsers: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin_nabiul',
      email: 'admin@allez.com.bd',
      fullName: 'Nabiul',
      phone: '+8801711000000',
      role: 'SUPER_ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z',
      passwordHash: adminHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'usr_customer_demo',
      email: 'customer@allez.com.bd',
      fullName: 'Tahmid Rahman',
      phone: '+8801822334455',
      role: 'CUSTOMER',
      createdAt: '2026-02-15T10:00:00.000Z',
      passwordHash: customerHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  ];

  const initialCategories: Category[] = [
    {
      id: 'cat_electronics',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Audio gear, cameras, smart devices, and high-performance electronics.',
      imageUrl: '/src/assets/images/product_flagship_audio_1794459673964.jpg',
      subcategories: ['Headphones', 'Speakers', 'Wearables', 'Cameras']
    },
    {
      id: 'cat_mobiles',
      name: 'Mobile Phones',
      slug: 'mobile-phones',
      description: 'Latest flagship & budget smartphones with official Bangladesh warranty.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Flagship Phones', 'Budget Phones', 'Gaming Phones']
    },
    {
      id: 'cat_laptops',
      name: 'Computers & Laptops',
      slug: 'computers-laptops',
      description: 'Workstations, ultrabooks, gaming rigs, and peripherals.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Ultrabooks', 'Gaming Laptops', 'Monitors', 'Keyboards']
    },
    {
      id: 'cat_fashion',
      name: 'Fashion & Clothing',
      slug: 'fashion-clothing',
      description: 'Contemporary Bangladeshi and international urban apparel.',
      imageUrl: '/src/assets/images/product_mens_sneaker_1794459674733.jpg',
      subcategories: ['Casual Wear', 'Formal Wear', 'Footwear', 'Outerwear']
    },
    {
      id: 'cat_mens_fashion',
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Shirts, polos, denim, panjabi, and sneakers designed for comfort.',
      imageUrl: '/src/assets/images/product_mens_sneaker_1794459674733.jpg',
      subcategories: ['Panjabi & Kurta', 'Polo Shirts', 'Sneakers', 'Trousers']
    },
    {
      id: 'cat_womens_fashion',
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Traditional sarees, salwar kameez, and contemporary western wear.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Sarees', 'Salwar Kameez', 'Handbags', 'Footwear']
    },
    {
      id: 'cat_home_kitchen',
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Modern cookware, coffee makers, and aesthetic home organizers.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Kitchen Appliances', 'Dinnerware', 'Home Decor']
    },
    {
      id: 'cat_smart_home',
      name: 'Smart Home Devices',
      slug: 'smart-home',
      description: 'Smart lighting, security cameras, and automated home hubs.',
      imageUrl: '/src/assets/images/product_smartwatch_elite_1794459674312.jpg',
      subcategories: ['Smart Bulbs', 'Security Cameras', 'Smart Plugs']
    },
    {
      id: 'cat_beauty',
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Authentic dermatologist-approved skincare, fragrances, and grooming.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Skincare', 'Haircare', 'Fragrances']
    },
    {
      id: 'cat_sports',
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Gym gear, resistance bands, cricket equipment, and fitness trackers.',
      imageUrl: '/src/assets/images/product_mens_sneaker_1794459674733.jpg',
      subcategories: ['Cardio Gear', 'Cricket Equipment', 'Yoga Mats']
    },
    {
      id: 'cat_books',
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Bestselling literature, academic texts, and luxury journals.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      subcategories: ['Fiction', 'Non-Fiction', 'Notebooks & Pens']
    },
    {
      id: 'cat_accessories',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Leather wallets, mechanical watch straps, phone cases, and fast chargers.',
      imageUrl: '/src/assets/images/product_smartwatch_elite_1794459674312.jpg',
      subcategories: ['Wallets', 'Watch Straps', 'Chargers & Cables']
    }
  ];

  const initialProducts: Product[] = [
    {
      id: 'prod_flagship_audio_01',
      name: 'Allez Apex ANC Wireless Studio Headphones',
      slug: 'allez-apex-anc-wireless-studio-headphones',
      sku: 'ALZ-AUD-701',
      description: 'Engineered for audiophiles and producers with custom 45mm neodymium drivers, hybrid active noise cancellation (up to -38dB), dual transparency modes, and 42-hour continuous battery life. Features ultra-plush memory foam earcups and quick USB-C 15-minute charge for 6 hours of playback.',
      basePrice: 8500,
      discountPrice: 6990,
      stockQuantity: 24,
      isFeatured: true,
      isDeal: true,
      isBestSeller: true,
      isNewArrival: false,
      category: 'Electronics',
      categoryId: 'cat_electronics',
      brand: 'Allez Acoustic',
      images: [
        '/src/assets/images/product_flagship_audio_1794459673964.jpg',
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Driver Unit': '45mm Neodymium Dynamic',
        'Noise Cancellation': 'Hybrid Active ANC (-38dB)',
        'Battery Life': '42 Hours with ANC On',
        'Connectivity': 'Bluetooth 5.3 + 3.5mm Hi-Res Cable',
        'Charging Port': 'USB Type-C Fast Charge',
        'Warranty': '1 Year Official Warranty'
      },
      rating: 4.9,
      reviewCount: 38,
      shippingInfo: 'Guaranteed 24-hour dispatch from Gaibandha Hub. ৳60 Inside Gaibandha, ৳120 Nationwide.',
      createdAt: '2026-03-01T12:00:00.000Z'
    },
    {
      id: 'prod_smartwatch_elite_02',
      name: 'Astrael Titanium Smartwatch Series 7',
      slug: 'astrael-titanium-smartwatch-series-7',
      sku: 'ALZ-WAT-802',
      description: 'Crafted from aerospace-grade Grade-5 titanium with a sapphire crystal display and breathable obsidian silicone strap. Measures continuous SpO2, heart rate variability, sleep stages, and over 120 sports tracking modes. Water-resistant up to 50 meters (5 ATM) with 14-day battery endurance.',
      basePrice: 12500,
      discountPrice: 9800,
      stockQuantity: 18,
      isFeatured: true,
      isDeal: true,
      isBestSeller: true,
      isNewArrival: true,
      category: 'Smart Home Devices',
      categoryId: 'cat_smart_home',
      brand: 'Astrael',
      images: [
        '/src/assets/images/product_smartwatch_elite_1794459674312.jpg',
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Case Material': 'Grade-5 Aerospace Titanium',
        'Display': '1.43" Ultra-Bright AMOLED (1000 nits)',
        'Glass': 'Sapphire Crystal Anti-Scratch',
        'Battery Life': 'Up to 14 Days Normal Usage',
        'Water Resistance': '5 ATM (50m Waterproof)',
        'Sensors': 'Optical PPG Heart Rate, SpO2, Accelerometer, Gyroscope'
      },
      rating: 4.8,
      reviewCount: 42,
      shippingInfo: 'Official seal intact. Free shipping on orders over ৳5,000.',
      createdAt: '2026-03-05T12:00:00.000Z'
    },
    {
      id: 'prod_mens_sneaker_03',
      name: 'Allez Aerostride Pro Running Sneakers',
      slug: 'allez-aerostride-pro-running-sneakers',
      sku: 'ALZ-FSH-503',
      description: 'Built for urban road running and daily lifestyle comfort. Features responsive nitrogen-infused dual foam cushioning, engineered breathable mesh upper with vibrant electric orange accents, and durable high-traction rubber outsole calibrated for Bangladeshi monsoon and tarmac surfaces.',
      basePrice: 4200,
      discountPrice: 3450,
      stockQuantity: 32,
      isFeatured: true,
      isDeal: false,
      isBestSeller: true,
      isNewArrival: true,
      category: "Men's Fashion",
      categoryId: 'cat_mens_fashion',
      brand: 'Allez Sport',
      images: [
        '/src/assets/images/product_mens_sneaker_1794459674733.jpg'
      ],
      specifications: {
        'Upper Material': 'Engineered Breathable Mesh',
        'Midsole': 'Nitrogen-Infused Rebound Foam',
        'Outsole': 'High-Abrasion Anti-Slip Rubber',
        'Closure': 'Secure Lace-up Fit',
        'Ideal For': 'Running, Gym, Daily Walking'
      },
      variants: [
        { id: 'v_sneaker_41', title: 'Size 41 (UK 7) - Bone White / Orange', sku: 'ALZ-FSH-503-41', price: 3450, stock: 10, attributes: { size: '41', color: 'White/Orange' } },
        { id: 'v_sneaker_42', title: 'Size 42 (UK 8) - Bone White / Orange', sku: 'ALZ-FSH-503-42', price: 3450, stock: 12, attributes: { size: '42', color: 'White/Orange' } },
        { id: 'v_sneaker_43', title: 'Size 43 (UK 9) - Bone White / Orange', sku: 'ALZ-FSH-503-43', price: 3450, stock: 10, attributes: { size: '43', color: 'White/Orange' } }
      ],
      rating: 4.7,
      reviewCount: 29,
      shippingInfo: 'Ships with original brand box and replacement insoles.',
      createdAt: '2026-03-08T09:00:00.000Z'
    },
    {
      id: 'prod_ultrabook_pro_04',
      name: 'Zenith Book 14 OLED Ultrabook (Core i7 / 16GB / 512GB)',
      slug: 'zenith-book-14-oled-ultrabook',
      sku: 'ALZ-COM-904',
      description: 'Ultra-thin all-aluminum magnesium chassis weighing only 1.18kg. Features a stunning 2.8K 90Hz OLED Pantone-validated display, 13th Gen Intel Core i7 processor, 16GB LPDDR5 RAM, and backlit keyboard with full-size precision glass trackpad. Perfect for university and business power users.',
      basePrice: 94000,
      discountPrice: 88500,
      stockQuantity: 8,
      isFeatured: true,
      isDeal: true,
      isBestSeller: false,
      isNewArrival: true,
      category: 'Computers & Laptops',
      categoryId: 'cat_laptops',
      brand: 'Zenith',
      images: [
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Processor': 'Intel Core i7-1360P (12 Cores, up to 5.0GHz)',
        'Display': '14.0-inch 2.8K (2880 x 1800) OLED 90Hz 100% DCI-P3',
        'RAM': '16GB LPDDR5 4800MHz',
        'Storage': '512GB NVMe M.2 PCIe Gen 4 SSD',
        'Weight': '1.18 kg',
        'Battery': '75Wh (Up to 15 hours life)'
      },
      rating: 4.9,
      reviewCount: 15,
      shippingInfo: 'High-value insured courier delivery with door-to-door verification.',
      createdAt: '2026-03-02T15:00:00.000Z'
    },
    {
      id: 'prod_smartphone_flagship_05',
      name: 'Nova Pro 5G Smartphone (12GB + 256GB, Cyber Black)',
      slug: 'nova-pro-5g-smartphone',
      sku: 'ALZ-MOB-105',
      description: 'Next-generation flagship smartphone with 50MP Sony IMX890 triple camera system, 120Hz LTPO Curved AMOLED display, Snapdragon 8 Gen 2 processor, and 80W SuperVOOC flash charge that recharges 0-100% in just 28 minutes. BTRC approved official handset with 1 year warranty.',
      basePrice: 58000,
      discountPrice: 53999,
      stockQuantity: 14,
      isFeatured: true,
      isDeal: false,
      isBestSeller: true,
      isNewArrival: true,
      category: 'Mobile Phones',
      categoryId: 'cat_mobiles',
      brand: 'Nova',
      images: [
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Chipset': 'Snapdragon 8 Gen 2 (4nm)',
        'Display': '6.78" 1.5K 120Hz LTPO AMOLED',
        'Rear Camera': '50MP OIS + 32MP Telephoto + 8MP Ultrawide',
        'Front Camera': '32MP Sony Sensor',
        'Battery': '5000mAh with 80W Fast Charger in Box',
        'BTRC Status': 'Approved Official Bangladesh IMEI'
      },
      rating: 4.8,
      reviewCount: 51,
      shippingInfo: 'Official BTRC approved seal. 24hr delivery inside Gaibandha.',
      createdAt: '2026-03-07T11:00:00.000Z'
    },
    {
      id: 'prod_leather_wallet_06',
      name: 'Artisan Full-Grain Tan Leather Bifold Wallet',
      slug: 'artisan-full-grain-tan-leather-bifold-wallet',
      sku: 'ALZ-ACC-306',
      description: 'Handcrafted by master leather artisans from authentic Bangladeshi full-grain cowhide leather. Hand-stitched with bonded nylon thread, features 8 card slots, 2 cash compartments designed specifically for BDT banknotes, and embedded RFID blocking technology.',
      basePrice: 1650,
      discountPrice: 1290,
      stockQuantity: 45,
      isFeatured: false,
      isDeal: true,
      isBestSeller: true,
      isNewArrival: false,
      category: 'Accessories',
      categoryId: 'cat_accessories',
      brand: 'Allez Heritage',
      images: [
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Material': '100% Genuine Full-Grain Cowhide Leather',
        'Dimensions': '11.5cm x 9.5cm (Pocket Fit)',
        'Capacity': '8-10 Cards + 2 Currency Compartments',
        'Security': 'Integrated RFID Signal Blocker',
        'Origin': 'Handcrafted in Bangladesh'
      },
      rating: 4.9,
      reviewCount: 64,
      shippingInfo: 'Presented in signature embossed gift box.',
      createdAt: '2026-02-20T10:00:00.000Z'
    },
    {
      id: 'prod_panjabi_cotton_07',
      name: 'Royal Heritage Mercerized Cotton Panjabi - Midnight Blue',
      slug: 'royal-heritage-mercerized-cotton-panjabi-midnight-blue',
      sku: 'ALZ-FSH-407',
      description: 'Sophisticated festive and Friday traditional wear made from 100% premium mercerized combed cotton with subtle metallic button accents and geometric embroidery along the placket. Breathable, sweat-resistant, and maintains vibrant color wash after wash.',
      basePrice: 3200,
      discountPrice: 2650,
      stockQuantity: 28,
      isFeatured: true,
      isDeal: false,
      isBestSeller: true,
      isNewArrival: true,
      category: "Men's Fashion",
      categoryId: 'cat_mens_fashion',
      brand: 'Allez Heritage',
      images: [
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Fabric': '100% Mercerized Fine Combed Cotton',
        'Collar': 'Classic Mandarin Collar with Hand Embroidery',
        'Fit': 'Modern Regular Tailored Fit',
        'Care Instructions': 'Hand wash or gentle machine wash'
      },
      rating: 4.8,
      reviewCount: 31,
      shippingInfo: 'Comes with garment cover.',
      createdAt: '2026-03-04T14:00:00.000Z'
    },
    {
      id: 'prod_smart_kettle_08',
      name: 'PureBoil Smart Variable Temperature Glass Kettle 1.7L',
      slug: 'pureboil-smart-variable-temperature-glass-kettle',
      sku: 'ALZ-HMK-608',
      description: 'Borosilicate thermal shock resistant glass electric kettle with precision digital temperature presets (60°C to 100°C) tailored for green tea, pour-over coffee, and infant milk. Features 30-minute keep-warm function, quiet boil technology, and auto shut-off safety protection.',
      basePrice: 3800,
      discountPrice: 2990,
      stockQuantity: 22,
      isFeatured: false,
      isDeal: true,
      isBestSeller: false,
      isNewArrival: true,
      category: 'Home & Kitchen',
      categoryId: 'cat_home_kitchen',
      brand: 'PureBoil',
      images: [
        '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'
      ],
      specifications: {
        'Capacity': '1.7 Liters',
        'Power': '1850-2200W Rapid Boil',
        'Material': 'Food-Grade Borosilicate Glass & 304 Stainless Steel',
        'Features': 'LED Temperature Ring, 30min Keep Warm'
      },
      rating: 4.6,
      reviewCount: 19,
      shippingInfo: 'Double protective bubble packaging for safe glass transit.',
      createdAt: '2026-03-06T16:00:00.000Z'
    }
  ];

  const initialOrders: Order[] = [
    {
      id: 'ord_1001',
      orderNumber: 'ALZ-202603-7821',
      userId: 'usr_customer_demo',
      customerName: 'Tahmid Rahman',
      customerEmail: 'customer@allez.com.bd',
      customerPhone: '+8801822334455',
      shippingAddress: {
        id: 'addr_101',
        title: 'Home',
        recipientName: 'Tahmid Rahman',
        phone: '+8801822334455',
        division: 'Rangpur',
        district: 'Gaibandha',
        thana: 'Gaibandha Sadar',
        streetAddress: 'House 14, DB Road, Ward 03',
        postalCode: '5700',
        isDefault: true
      },
      subTotal: 6990,
      shippingCost: 60,
      discountTotal: 0,
      grandTotal: 7050,
      status: 'SHIPPED',
      paymentMethod: 'BKASH',
      paymentStatus: 'SUCCESS',
      paymentTxnId: 'BKH93821038X',
      items: [
        {
          id: 'ord_item_01',
          productId: 'prod_flagship_audio_01',
          productName: 'Allez Apex ANC Wireless Studio Headphones',
          productImage: '/src/assets/images/product_flagship_audio_1794459673964.jpg',
          quantity: 1,
          unitPrice: 6990,
          totalPrice: 6990
        }
      ],
      trackingNumber: 'TRK-ALZ-928172',
      carrier: 'Allez Express - Gaibandha Express Fleet',
      estimatedDelivery: 'Tomorrow by 4:00 PM',
      trackingEvents: [
        {
          id: 'evt_1',
          status: 'PENDING',
          location: 'Allez Central Hub, DB Road, Gaibandha',
          description: 'Order registered and payment verified via bKash.',
          timestamp: '2026-03-09T09:15:00.000Z'
        },
        {
          id: 'evt_2',
          status: 'CONFIRMED',
          location: 'Allez Fulfillment Center',
          description: 'Merchant accepted order and reserved warehouse stock.',
          timestamp: '2026-03-09T10:30:00.000Z'
        },
        {
          id: 'evt_3',
          status: 'PROCESSING',
          location: 'Gaibandha Sorting Bay 2',
          description: 'Quality check completed and packaged with tamper-proof seal.',
          timestamp: '2026-03-09T14:00:00.000Z'
        },
        {
          id: 'evt_4',
          status: 'SHIPPED',
          location: 'Gaibandha Central Logistics Depot',
          description: 'Package handed over to delivery executive for transit.',
          timestamp: '2026-03-10T08:45:00.000Z'
        }
      ],
      createdAt: '2026-03-09T09:15:00.000Z',
      updatedAt: '2026-03-10T08:45:00.000Z'
    }
  ];

  const initialCoupons: Coupon[] = [
    {
      id: 'coup_1',
      code: 'ALLEZ10',
      discountType: 'PERCENTAGE',
      discountAmount: 10,
      minSpend: 2000,
      maxDiscount: 1000,
      validUntil: '2027-12-31',
      isActive: true,
      usageCount: 142
    },
    {
      id: 'coup_2',
      code: 'GAIBANDHA50',
      discountType: 'FLAT',
      discountAmount: 150,
      minSpend: 1500,
      validUntil: '2027-12-31',
      isActive: true,
      usageCount: 89
    },
    {
      id: 'coup_3',
      code: 'FREESHIP',
      discountType: 'FLAT',
      discountAmount: 60,
      minSpend: 1000,
      validUntil: '2027-12-31',
      isActive: true,
      usageCount: 215
    }
  ];

  const initialBanners: Banner[] = [
    {
      id: 'ban_1',
      title: 'Grand E-Commerce Festival in Gaibandha',
      subtitle: 'Up to 35% off on authentic flagship electronics, smartphones and apparel.',
      imageUrl: '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg',
      targetUrl: '/deals',
      badge: 'Official Launch Special',
      isActive: true
    }
  ];

  const initialSettings: StoreSettings = {
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

  const initialGateways: PaymentGatewayConfig[] = [
    {
      id: 'cod',
      name: 'Cash on Delivery (COD)',
      method: 'COD',
      enabled: true,
      mode: 'LIVE',
      maxOrderLimit: 50000,
      instructions: 'Pay cash in hand to delivery executive upon physical package inspection and verification.',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'bkash',
      name: 'bKash Direct Wallet',
      method: 'BKASH',
      enabled: true,
      mode: 'SANDBOX',
      merchantPhone: '01711000000',
      appKey: 'bkash_live_app_key_allez99',
      appSecret: 'bkash_secret_sec_778844',
      username: 'allez_merchant',
      password: 'bKash@Password2026',
      chargePercentage: 0,
      instructions: 'Instant bKash payment with zero additional charge. Pay via wallet OTP & PIN.',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'nagad',
      name: 'Nagad Post Office MFS',
      method: 'NAGAD',
      enabled: true,
      mode: 'SANDBOX',
      merchantPhone: '01822334455',
      merchantId: 'NGD_ALLEZ_MERC_88',
      publicKey: 'nagad_pub_key_2026_xyz',
      privateKey: 'nagad_priv_key_2026_abc',
      chargePercentage: 0,
      instructions: 'Bangladesh Post Office digital wallet fast checkout.',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'rocket',
      name: 'Rocket (Dutch-Bangla Bank)',
      method: 'ROCKET',
      enabled: true,
      mode: 'SANDBOX',
      merchantPhone: '01911998877',
      chargePercentage: 0,
      instructions: 'Dutch-Bangla Bank Rocket mobile banking direct transaction.',
      updatedAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'sslcommerz',
      name: 'SSLCommerz Gateway',
      method: 'SSLCOMMERZ',
      enabled: true,
      mode: 'SANDBOX',
      storeId: 'allez_gaibandha_live',
      storePassword: 'allez_store_secret',
      chargePercentage: 0,
      instructions: 'Accepts all major Visa, Mastercard, UnionPay, and Bangladeshi Internet Banking portals.',
      updatedAt: '2026-03-01T00:00:00.000Z'
    }
  ];

  return {
    users: initialUsers,
    categories: initialCategories,
    products: initialProducts,
    orders: initialOrders,
    coupons: initialCoupons,
    banners: initialBanners,
    settings: initialSettings,
    paymentGateways: initialGateways,
    auditLogs: [
      {
        id: 'log_01',
        action: 'SYSTEM_BOOTSTRAP',
        adminName: 'Nabiul (System)',
        timestamp: new Date().toISOString(),
        details: { store: 'Allez Gaibandha Main DB' }
      }
    ]
  };
}

export function getDatabase(): DatabaseSchema {
  if (dbInstance) return dbInstance;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(raw);
    } else {
      dbInstance = getInitialData();
      saveDatabase();
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial data:', err);
    dbInstance = getInitialData();
    saveDatabase();
  }

  // Ensure paymentGateways exist if upgrading old database
  if (dbInstance && (!dbInstance.paymentGateways || dbInstance.paymentGateways.length === 0)) {
    const fallbackGateways = getInitialData().paymentGateways;
    dbInstance.paymentGateways = fallbackGateways;
    saveDatabase();
  }

  // Ensure freeShippingThreshold exists on settings
  if (dbInstance && dbInstance.settings && dbInstance.settings.freeShippingThreshold === undefined) {
    dbInstance.settings.freeShippingThreshold = 5000;
    saveDatabase();
  }

  // Update category counts
  if (dbInstance) {
    dbInstance.categories.forEach((cat) => {
      cat.productCount = dbInstance!.products.filter((p) => p.categoryId === cat.id).length;
    });
  }

  return dbInstance!;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

// User Helpers
export function findUserByEmail(email: string) {
  const db = getDatabase();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
  const db = getDatabase();
  return db.users.find((u) => u.id === id);
}

export function createUser(userData: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ADMIN';
}) {
  const db = getDatabase();
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(userData.password, salt);

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: userData.email.toLowerCase().trim(),
    fullName: userData.fullName.trim(),
    phone: userData.phone?.trim() || '',
    role: userData.role || 'CUSTOMER',
    createdAt: new Date().toISOString(),
    passwordHash
  };

  db.users.push(newUser);
  saveDatabase();

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}

// Order Helpers
export function createOrderInDB(orderData: Omit<Order, 'id' | 'orderNumber' | 'trackingNumber' | 'carrier' | 'estimatedDelivery' | 'trackingEvents' | 'createdAt' | 'updatedAt'>): Order {
  const db = getDatabase();
  const orderNumber = `ALZ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const now = new Date().toISOString();
  const newOrder: Order = {
    ...orderData,
    id: `ord_${Date.now()}`,
    orderNumber,
    trackingNumber,
    carrier: 'Allez Express - Gaibandha Hub Fleet',
    estimatedDelivery: orderData.shippingAddress.district.toLowerCase() === 'gaibandha' ? 'Within 24 Hours' : '2-3 Business Days',
    trackingEvents: [
      {
        id: `evt_${Date.now()}_1`,
        status: orderData.status || 'PENDING',
        location: 'Allez Fulfillment Center, DB Road, Gaibandha',
        description: `Order received with ${orderData.paymentMethod} payment method.`,
        timestamp: now
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  // Deduct inventory
  for (const item of newOrder.items) {
    const prod = db.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
    }
  }

  db.orders.unshift(newOrder);

  // Record audit log
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'ORDER_PLACED',
    adminName: orderData.customerName,
    timestamp: now,
    details: { orderNumber, total: orderData.grandTotal }
  });

  saveDatabase();
  return newOrder;
}

export function updateOrderStatusInDB(orderId: string, status: OrderStatus, note?: string, adminName = 'Nabiul (Admin)') {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;

  order.status = status;
  order.updatedAt = new Date().toISOString();

  let location = 'Allez Hub, DB Road, Gaibandha';
  if (status === 'OUT_FOR_DELIVERY') {
    location = `${order.shippingAddress.thana}, ${order.shippingAddress.district}`;
  } else if (status === 'DELIVERED') {
    location = `${order.shippingAddress.streetAddress}, ${order.shippingAddress.district}`;
    if (order.paymentMethod === 'COD') {
      order.paymentStatus = 'SUCCESS';
    }
  }

  const defaultDescriptions: Record<OrderStatus, string> = {
    PENDING: 'Order registered and awaiting fulfillment.',
    CONFIRMED: 'Order confirmed by Allez merchant team.',
    PROCESSING: 'Order items being assembled and quality inspected.',
    PACKED: 'Package sealed in tamper-evident Allez branded box.',
    SHIPPED: 'Package departed central Gaibandha logistics hub.',
    OUT_FOR_DELIVERY: 'Courier is out for final delivery to recipient address.',
    DELIVERED: 'Package delivered to recipient successfully.',
    CANCELLED: 'Order cancelled.',
    RETURNED: 'Order returned to merchant.',
    REFUNDED: 'Payment refunded to customer account.'
  };

  const newEvent: TrackingEvent = {
    id: `evt_${Date.now()}`,
    status,
    location,
    description: note || defaultDescriptions[status] || `Status updated to ${status}`,
    timestamp: new Date().toISOString()
  };

  order.trackingEvents.push(newEvent);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'ORDER_STATUS_UPDATE',
    adminName,
    timestamp: new Date().toISOString(),
    details: { orderNumber: order.orderNumber, status, note }
  });

  saveDatabase();
  return order;
}

export function updatePaymentGatewayInDB(
  gatewayId: string,
  updateData: Partial<PaymentGatewayConfig>,
  adminName = 'Nabiul (Admin)'
) {
  const db = getDatabase();
  const gateway = db.paymentGateways.find((g) => g.id === gatewayId);
  if (!gateway) return null;

  Object.assign(gateway, updateData, { updatedAt: new Date().toISOString() });

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'PAYMENT_GATEWAY_CONFIG_UPDATE',
    adminName,
    timestamp: new Date().toISOString(),
    details: { gatewayId, name: gateway.name, enabled: gateway.enabled, mode: gateway.mode }
  });

  saveDatabase();
  return gateway;
}

export function updateOrderDetailsInDB(
  orderId: string,
  updateData: Partial<Order>,
  adminName = 'Nabiul (Admin)'
) {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;

  if (updateData.status && updateData.status !== order.status) {
    updateOrderStatusInDB(order.id, updateData.status, updateData.notes, adminName);
  }

  if (updateData.customerName) order.customerName = updateData.customerName;
  if (updateData.customerPhone) order.customerPhone = updateData.customerPhone;
  if (updateData.customerEmail) order.customerEmail = updateData.customerEmail;
  if (updateData.shippingAddress) {
    order.shippingAddress = { ...order.shippingAddress, ...updateData.shippingAddress };
  }
  if (updateData.paymentStatus) order.paymentStatus = updateData.paymentStatus;
  if (updateData.paymentMethod) order.paymentMethod = updateData.paymentMethod;
  if (updateData.paymentTxnId !== undefined) order.paymentTxnId = updateData.paymentTxnId;
  if (updateData.trackingNumber) order.trackingNumber = updateData.trackingNumber;
  if (updateData.carrier) order.carrier = updateData.carrier;
  if (updateData.estimatedDelivery) order.estimatedDelivery = updateData.estimatedDelivery;
  if (updateData.grandTotal !== undefined) order.grandTotal = updateData.grandTotal;
  if (updateData.notes !== undefined) order.notes = updateData.notes;

  order.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'ORDER_DETAILS_MODIFIED',
    adminName,
    timestamp: new Date().toISOString(),
    details: { orderNumber: order.orderNumber, changedFields: Object.keys(updateData) }
  });

  saveDatabase();
  return order;
}

export function updateUserDetailsInDB(
  userId: string,
  updateData: Partial<User>,
  adminName = 'Nabiul (Admin)'
) {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  if (updateData.fullName) user.fullName = updateData.fullName;
  if (updateData.phone) user.phone = updateData.phone;
  if (updateData.role) user.role = updateData.role;

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'USER_ROLE_OR_DETAILS_MODIFIED',
    adminName,
    timestamp: new Date().toISOString(),
    details: { userId, email: user.email, updatedRole: user.role }
  });

  saveDatabase();
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

