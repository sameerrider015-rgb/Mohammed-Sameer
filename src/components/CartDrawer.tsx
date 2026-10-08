import React from "react";
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Scale,
  AlertCircle,
  Truck,
} from "lucide-react";
import { CartItem, Language, ShopSettings } from "../types";
import { getTranslation } from "../utils/translations";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  settings: ShopSettings;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onProceedToCheckout,
  settings,
  lang,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const totalWeightKg = cart.reduce((acc, item) => acc + item.weightKg, 0);

  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryCharge = cart.length === 0 ? 0 : isFreeDelivery ? 0 : settings.deliveryCharge;
  const grandTotal = subtotal + deliveryCharge;

  const isBelowMinWeight = totalWeightKg < settings.minimumOrderKg;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 leading-none">
                {t("yourCart")}
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {cart.length} item{cart.length !== 1 ? "s" : ""} • {totalWeightKg} kg total
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-3xl mb-3">
                🍗
              </div>
              <h3 className="text-base font-bold text-stone-800">Your cart is empty</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Check today's live rates on the chalkboard above and choose your fresh cuts.
              </p>
            </div>
          ) : (
            <>
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.weightKg}-${index}`}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Weight: <strong className="text-stone-900">{item.weightKg < 1 ? `${item.weightKg * 1000}g` : `${item.weightKg} kg`}</strong>{" "}
                        <span className="text-stone-400">(@ ₹{item.ratePerKg}/kg)</span>
                      </p>
                      <span className="text-xs font-black text-emerald-800">
                        ₹{item.itemTotal}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Exact Business Rule Requirement Notice */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2.5 text-xs">
                <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Note:</strong> {t("cartNote")}
                </p>
              </div>

              {/* Delivery threshold hint */}
              {!isFreeDelivery && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Add ₹{settings.freeDeliveryThreshold - subtotal} more for FREE delivery</span>
                  </span>
                  <span className="font-bold text-emerald-800">Threshold: ₹{settings.freeDeliveryThreshold}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t("subtotal")}</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t("deliveryFee")} (Kamareddy)</span>
                {isFreeDelivery ? (
                  <span className="font-bold text-emerald-700 uppercase tracking-wider">
                    {t("freeDelivery")}
                  </span>
                ) : (
                  <span className="font-bold text-stone-900">₹{deliveryCharge}</span>
                )}
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm sm:text-base font-extrabold text-stone-950">
                <span>{t("grandTotal")}</span>
                <span className="text-emerald-800 font-mono text-lg">₹{grandTotal}</span>
              </div>
            </div>

            {/* Minimum Order Check Warning */}
            {isBelowMinWeight && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-800 text-xs font-bold border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>
                  Minimum order is {settings.minimumOrderKg} kg. Current total: {totalWeightKg} kg.
                </span>
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={onProceedToCheckout}
              disabled={isBelowMinWeight}
              className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
