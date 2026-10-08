import React from "react";
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  Package,
  RotateCcw,
  AlertOctagon,
  X,
  MapPin,
  Calendar,
} from "lucide-react";
import { Order, OrderStatus, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface OrderTrackerProps {
  order: Order | null;
  onClose: () => void;
  onReorder?: (order: Order) => void;
  lang: Language;
}

const STAGES: OrderStatus[] = ["Placed", "Accepted", "Packing", "Out for delivery", "Delivered"];

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  order,
  onClose,
  onReorder,
  lang,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!order) return null;

  const currentStageIndex = STAGES.indexOf(order.status);
  const isRejected = order.status === "Rejected";

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case "Placed":
        return `Order #${order.id} received. The shop owner is reviewing it right now.`;
      case "Accepted":
        return `Your order #${order.id} is confirmed. We are getting it ready.`;
      case "Packing":
        return `We are currently cutting your fresh chicken and packing it securely at Old Bus Stand Market.`;
      case "Out for delivery":
        return `Your fresh chicken is on the way to ${order.address.locality}, Kamareddy.`;
      case "Delivered":
        return `Delivered. Thank you for ordering from Fresh Chicken.`;
      case "Rejected":
        return `Sorry, we could not accept order #${order.id}. ${
          order.rejectReason || "Address outside Kamareddy or shop closing."
        } Any online payment will be refunded.`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-stone-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Live Order Tracking</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Order #{order.id}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Dynamic Status Alert Box */}
        <div
          className={`p-4 rounded-2xl mb-6 text-sm font-semibold border ${
            isRejected
              ? "bg-red-50 text-red-900 border-red-200"
              : order.status === "Delivered"
              ? "bg-emerald-50 text-emerald-950 border-emerald-300"
              : "bg-amber-50 text-amber-950 border-amber-300"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isRejected ? (
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : order.status === "Delivered" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
            )}
            <div>
              <h4 className="font-extrabold text-sm mb-0.5">
                {isRejected
                  ? "Order Not Accepted"
                  : order.status === "Delivered"
                  ? "Delivered Successfully!"
                  : `Current Status: ${order.status}`}
              </h4>
              <p className="text-xs leading-relaxed font-normal">
                {getStatusMessage(order.status)}
              </p>
            </div>
          </div>
        </div>

        {/* 5-Step Stepper Progress Timeline */}
        {!isRejected && (
          <div className="mb-6 px-2">
            <div className="relative flex justify-between items-center">
              {/* Connecting background line */}
              <div className="absolute top-4 left-3 right-3 h-1 bg-stone-200 -z-0" />
              {/* Active progress bar line */}
              <div
                className="absolute top-4 left-3 h-1 bg-emerald-600 transition-all duration-500 -z-0"
                style={{
                  width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%`,
                }}
              />

              {STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition border-2 ${
                        isPassed
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/20"
                          : "bg-white text-stone-400 border-stone-300"
                      } ${isCurrent ? "scale-110" : ""}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mt-1.5 text-center leading-tight max-w-[60px] ${
                        isPassed ? "text-emerald-950 font-extrabold" : "text-stone-400"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2 mb-6 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider pb-1 border-b border-stone-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivery Destination: {order.address.locality}, Kamareddy</span>
          </div>
          <p className="text-stone-700 font-medium">
            {order.address.addressLine} {order.address.landmark ? `(Near ${order.address.landmark})` : ""}
          </p>

          <div className="pt-2 border-t border-stone-200 space-y-1">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-stone-800">
                <span>
                  {it.name} • {it.weightKg < 1 ? `${it.weightKg * 1000}g` : `${it.weightKg} kg`}
                </span>
                <span className="font-bold">₹{it.total}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 font-bold text-stone-900">
              <span>Total Paid/Payable:</span>
              <span className="text-emerald-800 text-sm font-mono">₹{order.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Help & Contact Shop Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href="tel:+916302881596"
            className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{t("callShop")}</span>
          </a>

          <a
            href={`https://wa.me/916302881596?text=${encodeURIComponent(
              `Hello Fresh Chicken, what is the status of my order #${order.id}?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t("whatsappShop")}</span>
          </a>
        </div>

        {/* Reorder Button */}
        {onReorder && (
          <button
            onClick={() => {
              onClose();
              onReorder(order);
            }}
            className="mt-3 w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>{t("repeatOrder")}</span>
          </button>
        )}
      </div>
    </div>
  );
};
