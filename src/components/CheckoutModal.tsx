import React, { useState } from 'react';
import {
  X,
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Tag,
  Printer,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShop } from '../context/ShopContext.tsx';
import { Order, PaymentMethod } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }: CheckoutModalProps) {
  const {
    user,
    cart,
    cartSubtotal,
    clearCart,
    formatBDT,
    selectedDistrict,
    setSelectedDistrict,
    storeSettings,
    paymentGateways
  } = useShop();

  if (!isOpen) return null;

  // Checkout Steps: 1: Customer, 2: Address, 3: Delivery, 4: Payment, 5: Review, 6: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+8801711223344');

  const [division, setDivision] = useState('Rangpur');
  const [district, setDistrict] = useState(selectedDistrict || 'Gaibandha');
  const [thana, setThana] = useState('Gaibandha Sadar');
  const [streetAddress, setStreetAddress] = useState('DB Road, Holding #42');
  const [postalCode, setPostalCode] = useState('5700');
  const [notes, setNotes] = useState('');

  // Payment
  const enabledGateways = paymentGateways.filter((g) => g.enabled);
  const initialMethod = enabledGateways.length > 0 ? enabledGateways[0].method : 'COD';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialMethod);
  const [mfsPhone, setMfsPhone] = useState('01711000000');
  const [mfsOtp, setMfsOtp] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  const [mfsStep, setMfsStep] = useState<'phone' | 'otp' | 'pin' | 'done'>('phone');
  const [mfsTxnId, setMfsTxnId] = useState<string | null>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Loading & Final Order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Shipping calculation
  const shippingCost =
    cartSubtotal >= 5000
      ? 0
      : district.toLowerCase() === 'gaibandha'
      ? storeSettings.insideDelivery
      : storeSettings.outsideDelivery;

  const discountTotal = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal + shippingCost - discountTotal);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, subtotal: cartSubtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discount: data.discountTotal,
          message: data.message
        });
      }
    } catch {
      setCouponError('Failed to apply coupon');
    }
  };

  const handleMfsSimulate = () => {
    if (mfsStep === 'phone') {
      setMfsStep('otp');
    } else if (mfsStep === 'otp') {
      setMfsStep('pin');
    } else if (mfsStep === 'pin') {
      const fakeTxn = `${paymentMethod}${Date.now().toString(36).toUpperCase()}`;
      setMfsTxnId(fakeTxn);
      setMfsStep('done');
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone || !streetAddress) {
      alert('Please fill out all contact and address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: {
          id: `addr_${Date.now()}`,
          title: 'Delivery Address',
          recipientName: customerName,
          phone: customerPhone,
          division,
          district,
          thana,
          streetAddress,
          postalCode,
          isDefault: true
        },
        items: cart.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          variantTitle: i.variantTitle,
          variantPrice: i.unitPrice,
          quantity: i.quantity
        })),
        paymentMethod,
        paymentTxnId: mfsTxnId || undefined,
        couponCode: appliedCoupon?.code,
        notes
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create order');
        setIsSubmitting(false);
        return;
      }

      setCompletedOrder(data.order);
      setCurrentStep(6); // Success view
      clearCart();

      // Fire confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      onOrderSuccess(data.order);
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Main Dialog */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl z-10 border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0A1128] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF5722]" />
            <h3 className="font-bold text-base font-display">
              {currentStep === 6 ? 'Order Confirmed!' : 'Secure 5-Step Checkout'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker (Steps 1-5) */}
        {currentStep <= 5 && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className={currentStep === 1 ? 'text-[#FF5722] font-bold' : currentStep > 1 ? 'text-slate-900' : ''}>
                1. Contact
              </span>
              <span>·</span>
              <span className={currentStep === 2 ? 'text-[#FF5722] font-bold' : currentStep > 2 ? 'text-slate-900' : ''}>
                2. Shipping
              </span>
              <span>·</span>
              <span className={currentStep === 3 ? 'text-[#FF5722] font-bold' : currentStep > 3 ? 'text-slate-900' : ''}>
                3. Delivery
              </span>
              <span>·</span>
              <span className={currentStep === 4 ? 'text-[#FF5722] font-bold' : currentStep > 4 ? 'text-slate-900' : ''}>
                4. Payment
              </span>
              <span>·</span>
              <span className={currentStep === 5 ? 'text-[#FF5722] font-bold' : ''}>
                5. Confirm
              </span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* STEP 1: Customer Contact Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900">Step 1: Contact Information</h4>
              <p className="text-xs text-slate-500">
                Provide your details for order delivery updates and tracking notifications.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Nabiul Islam / Tahmid Rahman"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mobile Phone Number * (For Delivery SMS & Calls)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+88017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address (For Invoices & Tracking)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900">Step 2: Shipping Address</h4>
              <p className="text-xs text-slate-500">
                Delivery anywhere in Gaibandha or all 64 districts in Bangladesh.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Rangpur">Rangpur</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setSelectedDistrict(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="Gaibandha">Gaibandha (Local Hub - ৳60)</option>
                    <option value="Dhaka">Dhaka (৳120)</option>
                    <option value="Rangpur">Rangpur (৳120)</option>
                    <option value="Bogura">Bogura (৳120)</option>
                    <option value="Chittagong">Chittagong (৳120)</option>
                    <option value="Sylhet">Sylhet (৳120)</option>
                    <option value="Rajshahi">Rajshahi (৳120)</option>
                    <option value="Khulna">Khulna (৳120)</option>
                    <option value="Kurigram">Kurigram (৳120)</option>
                    <option value="Dinajpur">Dinajpur (৳120)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thana / Upazila *
                  </label>
                  <input
                    type="text"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    placeholder="e.g. Gaibandha Sadar / Gobindaganj / Mirpur"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 5700"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Street Address & House/Flat Details *
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. DB Road, Holding 15, Near Rail Gate"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Order Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Deliver between 2-5pm or leave with guard"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Options */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900">Step 3: Delivery Options</h4>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    district.toLowerCase() === 'gaibandha'
                      ? 'border-[#FF5722] bg-orange-50/50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#FF5722]" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        Gaibandha Local Hub Express
                      </p>
                      <p className="text-xs text-slate-500">
                        Guaranteed within 24 Hours from DB Road Logistics Center.
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-slate-900 tabular-nums">
                    {cartSubtotal >= 5000 ? 'FREE' : formatBDT(storeSettings.insideDelivery)}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    district.toLowerCase() !== 'gaibandha'
                      ? 'border-[#FF5722] bg-orange-50/50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        Nationwide Courier Express
                      </p>
                      <p className="text-xs text-slate-500">
                        Delivering across all districts via Steadfast / RedX / Pathao courier.
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-slate-900 tabular-nums">
                    {cartSubtotal >= 5000 ? 'FREE' : formatBDT(storeSettings.outsideDelivery)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-base text-slate-900">Step 4: Select Payment Method</h4>
                  <p className="text-xs text-slate-500">
                    Admin-managed secure payment gateways for Bangladesh.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  {enabledGateways.length} Gateways Available
                </span>
              </div>

              {enabledGateways.length === 0 ? (
                <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs">
                  No payment methods are currently enabled. Please contact support or check back soon.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {enabledGateways.map((gw) => {
                    const isSelected = paymentMethod === gw.method;
                    const isCod = gw.method === 'COD';
                    const isExceedingCod = isCod && gw.maxOrderLimit && grandTotal > gw.maxOrderLimit;

                    return (
                      <button
                        key={gw.id}
                        type="button"
                        disabled={Boolean(isExceedingCod)}
                        onClick={() => {
                          setPaymentMethod(gw.method);
                          if (gw.method === 'BKASH' || gw.method === 'NAGAD' || gw.method === 'ROCKET') {
                            setMfsStep('phone');
                          }
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 relative ${
                          isExceedingCod
                            ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                            : isSelected
                            ? 'border-[#FF5722] bg-orange-50/60 ring-1 ring-[#FF5722]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {gw.method === 'COD' && (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {gw.method === 'BKASH' && (
                          <Smartphone className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                        )}
                        {gw.method === 'NAGAD' && (
                          <Smartphone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        )}
                        {gw.method === 'ROCKET' && (
                          <Smartphone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        )}
                        {gw.method === 'SSLCOMMERZ' && (
                          <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {gw.name}
                            </h5>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                              {gw.mode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {gw.instructions || 'Secure Bangladeshi payment method.'}
                          </p>
                          {gw.chargePercentage && gw.chargePercentage > 0 ? (
                            <span className="text-[10px] text-[#FF5722] font-semibold mt-1 block">
                              +{gw.chargePercentage}% gateway fee
                            </span>
                          ) : null}
                          {isExceedingCod && (
                            <span className="text-[10px] text-red-600 font-semibold mt-1 block">
                              Max COD limit: {formatBDT(gw.maxOrderLimit || 50000)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* MFS Simulator Box for bKash / Nagad */}
              {(paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' || paymentMethod === 'ROCKET') && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {paymentMethod} Secure Gateway Sandbox
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Sandbox Verified
                    </span>
                  </div>

                  {mfsStep === 'phone' && (
                    <div className="space-y-2">
                      <label className="text-xs text-slate-600 block">
                        Your {paymentMethod} Account Number:
                      </label>
                      <input
                        type="text"
                        value={mfsPhone}
                        onChange={(e) => setMfsPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 text-xs border rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleMfsSimulate}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold"
                      >
                        Send Verification Code
                      </button>
                    </div>
                  )}

                  {mfsStep === 'otp' && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">
                        Enter 4-digit OTP sent to {mfsPhone} (Simulation code: <strong>1234</strong>):
                      </p>
                      <input
                        type="text"
                        maxLength={4}
                        value={mfsOtp}
                        onChange={(e) => setMfsOtp(e.target.value)}
                        placeholder="1234"
                        className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest border rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleMfsSimulate}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold"
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}

                  {mfsStep === 'pin' && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">
                        Enter your 5-digit {paymentMethod} Secret PIN to authorize {formatBDT(grandTotal)}:
                      </p>
                      <input
                        type="password"
                        maxLength={5}
                        value={mfsPin}
                        onChange={(e) => setMfsPin(e.target.value)}
                        placeholder="•••••"
                        className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest border rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleMfsSimulate}
                        className="w-full py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded text-xs font-bold"
                      >
                        Confirm & Authorize Payment
                      </button>
                    </div>
                  )}

                  {mfsStep === 'done' && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" /> Payment Authorized Successfully!
                      </p>
                      <p className="text-[11px]">
                        Transaction ID: <span className="font-mono font-bold">{mfsTxnId}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-slate-900">Step 5: Review & Place Order</h4>

              {/* Coupon Field */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g., ALLEZ10, GAIBANDHA50)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-slate-900 hover:bg-[#FF5722] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {appliedCoupon.message} (-{formatBDT(appliedCoupon.discount)})
                  </p>
                )}
                {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              </div>

              {/* Items Summary */}
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl p-3">
                {cart.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-xs">{item.product.name}</p>
                      <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × {formatBDT(item.unitPrice)}</p>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatBDT(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatBDT(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({district})</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {shippingCost === 0 ? 'FREE' : formatBDT(shippingCost)}
                  </span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">-{formatBDT(discountTotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-[#FF5722] tabular-nums">{formatBDT(grandTotal)}</span>
                </div>
              </div>

              {/* Destination Summary */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">
                  <strong>Deliver to:</strong> {customerName} ({customerPhone})
                </p>
                <p className="text-slate-500">
                  <strong>Address:</strong> {streetAddress}, {thana}, {district}, {division} {postalCode}
                </p>
                <p className="text-slate-500">
                  <strong>Payment:</strong> {paymentMethod === 'COD' ? 'Cash on Delivery' : `${paymentMethod} (Ref: ${mfsTxnId || 'Direct'})`}
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: Order Placement Success */}
          {currentStep === 6 && completedOrder && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="inline-block text-xs uppercase font-bold tracking-wider text-[#FF5722]">
                  Order Placed Successfully
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-display mt-1">
                  Thank You, {completedOrder.customerName}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We have registered your order and initiated dispatch from Gaibandha Central Hub.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-mono font-bold text-slate-900">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tracking Code</span>
                  <span className="font-mono font-bold text-[#FF5722]">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Estimated Delivery</span>
                  <span className="font-semibold text-slate-800">{completedOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Payment Status</span>
                  <span className="font-bold text-emerald-600 uppercase">{completedOrder.paymentStatus} ({completedOrder.paymentMethod})</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-[#FF5722] tabular-nums">{formatBDT(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print / Save Invoice
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {currentStep <= 5 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && (!customerName || !customerPhone)) {
                    alert('Please enter your full name and phone number.');
                    return;
                  }
                  if (currentStep === 2 && !streetAddress) {
                    alert('Please provide your complete street address.');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-[#FF5722] text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
              >
                Continue to Step {currentStep + 1} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#FF5722] hover:bg-[#F4511E] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'} <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
