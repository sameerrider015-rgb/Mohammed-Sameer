import React from "react";
import {
  BellRing,
  Phone,
  MapPin,
  Check,
  X,
  Volume2,
  VolumeX,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Order, Language } from "../types";
import { orderAlert } from "../utils/audioAlert";

interface NewOrderAlertModalProps {
  order: Order | null;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  lang: Language;
}

export const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({
  order,
  onAccept,
  onReject,
  lang,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-pulse">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-900 border-8 border-red-600 animate-in zoom-in-95 duration-150">
        {/* Flashing Top Alert Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 text-2xl animate-spin">
              🔔
            </div>
            <div>
              {/* Exact text: Title: NEW ORDER */}
              <h2 className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight leading-none uppercase">
                NEW ORDER!
              </h2>
              <span className="text-xs font-bold text-stone-600">
                Order #{order.id} • Ringing loudly until accepted
              </span>
            </div>
          </div>

          <button
            onClick={() => orderAlert.stopLoudAlarm()}
            className="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition"
            title="Silence alarm"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        </div>

        {/* Highlighted Banner: [name], [total weight] kg, Rs [amount] */}
        <div className="my-6 p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-red-700">
            Incoming Order Summary
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-stone-950 leading-tight">
            {order.customerName}, {order.totalWeightKg} kg, Rs {order.grandTotal}
          </h3>
          <p className="text-xs font-bold text-stone-700 mt-1">
            Payment:{" "}
            <span className="uppercase text-emerald-800">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : `Online (${order.paymentMethod})`}
            </span>
          </p>
        </div>

        {/* Customer & Delivery Details */}
        <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm mb-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-500">Customer Phone:</span>
            <a
              href={`tel:${order.customerPhone}`}
              className="font-black text-emerald-800 flex items-center gap-1 hover:underline text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>+91 {order.customerPhone}</span>
            </a>
          </div>

          <div className="flex items-start justify-between gap-3 pt-2 border-t border-stone-200">
            <span className="font-bold text-stone-500 shrink-0">Address:</span>
            <span className="font-semibold text-right text-stone-800">
              {order.address.addressLine}, {order.address.locality}, Kamareddy
            </span>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <span className="font-bold text-stone-500 block mb-1">Ordered Items:</span>
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between font-semibold text-stone-800">
                <span>
                  • {it.name} ({it.weightKg < 1 ? `${it.weightKg * 1000}g` : `${it.weightKg} kg`})
                </span>
                <span>₹{it.total}</span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="pt-2 border-t border-stone-200 text-xs">
              <span className="font-bold text-amber-800">Butcher Note:</span>
              <p className="text-stone-700 italic mt-0.5">"{order.notes}"</p>
            </div>
          )}
        </div>

        {/* HUGE Action Buttons (Owner needs large thumb targets in busy shop!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Big Green Accept Button */}
          <button
            onClick={() => {
              orderAlert.stopLoudAlarm();
              onAccept(order.id);
            }}
            className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-3 transition"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            {/* Exact requirement text: Tap to accept */}
            <span>TAP TO ACCEPT</span>
          </button>

          {/* Reject Button */}
          <button
            onClick={() => {
              orderAlert.stopLoudAlarm();
              onReject(order.id);
            }}
            className="w-full py-4 rounded-2xl bg-stone-200 hover:bg-red-100 hover:text-red-700 text-stone-700 font-bold text-sm sm:text-base transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            <span>Reject Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
