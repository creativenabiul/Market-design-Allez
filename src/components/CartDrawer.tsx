import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext.tsx';
import LazyImage from './ui/LazyImage.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export default function CartDrawer({ onProceedToCheckout }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    deliveryFee,
    formatBDT,
    selectedDistrict
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#0A1128] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF5722]" />
            <h3 className="font-bold text-sm font-display">
              Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 text-xs text-slate-700">
          {cartSubtotal >= 5000 ? (
            <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> You unlocked FREE nationwide delivery!
            </p>
          ) : (
            <p>
              Add <strong className="text-[#FF5722] font-bold">{formatBDT(5000 - cartSubtotal)}</strong> more for <strong>FREE Delivery</strong> across Bangladesh.
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our catalog for the latest electronics, fashion, and home products.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-[#FF5722] hover:bg-[#F4511E] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <LazyImage
                  src={item.product.images[0] || '/src/assets/images/hero_marketplace_lifestyle_1794459672929.jpg'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                  aspectRatioClass="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {item.product.name}
                  </h4>
                  {item.variantTitle && (
                    <p className="text-[11px] text-slate-500 truncate">{item.variantTitle}</p>
                  )}
                  <p className="text-xs font-bold text-slate-900 mt-1 tabular-nums">
                    {formatBDT(item.unitPrice)}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 font-bold text-slate-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">{formatBDT(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery ({selectedDistrict})</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : formatBDT(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="tabular-nums text-[#FF5722]">{formatBDT(cartSubtotal + deliveryFee)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold py-3.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:translate-y-[-1px]"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={clearCart}
              className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 py-1"
            >
              Clear Entire Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
