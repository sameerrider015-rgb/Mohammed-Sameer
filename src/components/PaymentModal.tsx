import React, { useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { PaymentMethod, Language, ShopSettings } from "../types";
import { getTranslation } from "../utils/translations";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (method: PaymentMethod, reference?: string) => void;
  grandTotal: number;
  customerName: string;
  settings: ShopSettings;
  lang: Language;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  grandTotal,
  customerName,
  settings,
  lang,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("phonepe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate payment gateway verification (Razorpay / PhonePe)
    setTimeout(() => {
      setIsProcessing(false);
      const refId =
        selectedMethod === "cod"
          ? undefined
          : `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      onConfirmPayment(selectedMethod, refId);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-stone-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Checkout</span>
          </div>
          {/* Exact text: Heading: How do you want to pay? */}
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {t("howToPay")}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pay online via UPI / Cards or pay cash when your fresh chicken arrives.
          </p>
        </div>

        {/* Total to pay banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-900">Amount to Pay</span>
            <p className="text-xs text-stone-500 font-medium">Customer: {customerName}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-900 font-mono">
              ₹{grandTotal}
            </span>
            <span className="block text-[10px] text-emerald-700 font-bold uppercase">
              Price Locked
            </span>
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-2.5 mb-6">
          {/* 1. PhonePe */}
          <label
            onClick={() => {
              setSelectedMethod("phonepe");
              setShowQrCode(false);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "phonepe"
                ? "bg-purple-50/80 border-purple-600 shadow-sm ring-1 ring-purple-600"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                पे
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">PhonePe</h4>
                <p className="text-[11px] text-stone-500">Instant UPI payment</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "phonepe"}
              onChange={() => setSelectedMethod("phonepe")}
              className="accent-purple-600 w-4 h-4"
            />
          </label>

          {/* 2. Google Pay */}
          <label
            onClick={() => {
              setSelectedMethod("gpay");
              setShowQrCode(false);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "gpay"
                ? "bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-600"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-black text-xs shadow-sm text-blue-600">
                GPay
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Google Pay</h4>
                <p className="text-[11px] text-stone-500">Fast UPI intent</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "gpay"}
              onChange={() => setSelectedMethod("gpay")}
              className="accent-blue-600 w-4 h-4"
            />
          </label>

          {/* 3. Paytm */}
          <label
            onClick={() => {
              setSelectedMethod("paytm");
              setShowQrCode(false);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "paytm"
                ? "bg-sky-50/80 border-sky-600 shadow-sm ring-1 ring-sky-600"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                Paytm
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Paytm</h4>
                <p className="text-[11px] text-stone-500">Wallet, Postpaid or UPI</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "paytm"}
              onChange={() => setSelectedMethod("paytm")}
              className="accent-sky-600 w-4 h-4"
            />
          </label>

          {/* 4. Other UPI / QR Code */}
          <label
            onClick={() => {
              setSelectedMethod("upi");
              setShowQrCode(true);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "upi"
                ? "bg-amber-50/80 border-amber-600 shadow-sm ring-1 ring-amber-600"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Other UPI App / QR</h4>
                <p className="text-[11px] text-stone-500">Scan QR or enter UPI ID ({settings.upiId})</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "upi"}
              onChange={() => setSelectedMethod("upi")}
              className="accent-amber-600 w-4 h-4"
            />
          </label>

          {/* 5. Card or net banking */}
          <label
            onClick={() => {
              setSelectedMethod("card");
              setShowQrCode(false);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "card"
                ? "bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-600"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Card or Net Banking</h4>
                <p className="text-[11px] text-stone-500">Debit card, credit card, netbanking</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "card"}
              onChange={() => setSelectedMethod("card")}
              className="accent-emerald-600 w-4 h-4"
            />
          </label>

          {/* 6. Cash on delivery */}
          <label
            onClick={() => {
              setSelectedMethod("cod");
              setShowQrCode(false);
            }}
            className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
              selectedMethod === "cod"
                ? "bg-stone-100 border-stone-800 shadow-sm ring-1 ring-stone-800"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">Cash on Delivery</h4>
                <p className="text-[11px] text-stone-500">Pay cash when fresh chicken is delivered</p>
              </div>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === "cod"}
              onChange={() => setSelectedMethod("cod")}
              className="accent-stone-800 w-4 h-4"
            />
          </label>
        </div>

        {/* QR Code view if UPI selected */}
        {showQrCode && (
          <div className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center text-center">
            <div className="w-36 h-36 bg-white p-2 border border-stone-300 rounded-xl shadow-inner flex items-center justify-center">
              {/* Clean SVG QR mockup with UPI colors */}
              <div className="w-full h-full bg-stone-900 rounded-lg p-2 text-white flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-emerald-400" />
                <span className="text-[9px] font-mono mt-1 text-stone-300">UPI: {settings.upiId}</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 font-semibold mt-2">
              Scan with any UPI app to pay ₹{grandTotal}
            </p>
          </div>
        )}

        {/* Place Order CTA Button */}
        <div>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                {/* Exact text: Place order */}
                <span>{t("placeOrder")} (₹{grandTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
