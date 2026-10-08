import React from "react";
import {
  X,
  History,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
} from "lucide-react";
import { Order, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onReorder: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  lang: Language;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onReorder,
  onTrackOrder,
  lang,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-stone-900 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 leading-none">
                {t("myOrders")}
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                Past chicken orders & 1-tap repeat
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Package className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <p className="font-bold text-stone-700">No orders placed yet</p>
              <p className="text-xs text-stone-500 mt-0.5">Your orders will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50 hover:border-emerald-500/40 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                      #{order.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                <div className="text-xs text-stone-700">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 font-medium">
                      <span>
                        {it.name} ({it.weightKg < 1 ? `${it.weightKg * 1000}g` : `${it.weightKg} kg`})
                      </span>
                      <span>₹{it.total}</span>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                    <span>Total Paid:</span>
                    <span className="text-emerald-800 font-mono">₹{order.grandTotal}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onTrackOrder(order);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
                  >
                    Track Status
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onReorder(order);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t("repeatOrder")}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
