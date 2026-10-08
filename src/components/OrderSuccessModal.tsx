import React from "react";
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Order, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
  lang: Language;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  lang,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-stone-900 animate-in zoom-in-95 duration-200">
        {/* Animated Success Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/10 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Exact text requirement: Heading: Order placed! */}
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {t("orderPlaced")}
        </h2>

        {/* Exact text requirement: Message: Thank you, [name]. We will confirm your order shortly. */}
        <p className="text-sm text-stone-600 mt-2 font-medium">
          {t("orderSuccessMsg").replace("{name}", order.customerName)}
        </p>

        {/* Order Details Snippet Card */}
        <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-200">
            <span className="font-bold text-stone-500 uppercase tracking-wider">Order ID</span>
            <span className="font-mono font-black text-emerald-800 text-sm">#{order.id}</span>
          </div>

          <div className="space-y-1 text-xs">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-stone-700 font-medium">
                <span>
                  {it.name} ({it.weightKg < 1 ? `${it.weightKg * 1000}g` : `${it.weightKg} kg`})
                </span>
                <span className="font-bold">₹{it.total}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-extrabold text-stone-900">
            <span>Total Payable:</span>
            <span className="text-emerald-800 font-mono">₹{order.grandTotal}</span>
          </div>

          <div className="text-[11px] text-stone-500 pt-1">
            <span>Payment: </span>
            <strong className="uppercase text-stone-700">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : `Online (${order.paymentMethod})`}
            </strong>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={`https://wa.me/916302881596?text=${encodeURIComponent(
              `Hello Fresh Chicken Kamareddy, I placed order #${order.id} for ${order.totalWeightKg} kg chicken (Rs ${order.grandTotal}). Name: ${order.customerName}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Send Order Copy on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
