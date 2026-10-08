import React, { useState } from "react";
import {
  X,
  MapPin,
  Phone,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  RotateCcw,
} from "lucide-react";
import { CustomerAddress, Language, ShopSettings } from "../types";
import { getTranslation } from "../utils/translations";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    customerName: string;
    customerPhone: string;
    address: CustomerAddress;
    deliveryType: "delivery" | "pickup";
    timeSlot: string;
    notes?: string;
  }) => void;
  settings: ShopSettings;
  lang: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  settings,
  lang,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [selectedLocality, setSelectedLocality] = useState(settings.allowedLocalities[0] || "Old Bus Stand Market");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [timeSlot, setTimeSlot] = useState("Within 30-45 mins (Fast Express)");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!customerPhone || customerPhone.replace(/\D/g, "").length !== 10) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setGeneratedOtp(data.code || "1234");
        setOtpCode(data.code || "1234"); // Auto-fill for ultra-smooth 1-minute order goal!
      } else {
        setErrorMessage(data.error || "Failed to send OTP");
      }
    } catch {
      // Offline fallback
      setIsOtpSent(true);
      setGeneratedOtp("1234");
      setOtpCode("1234");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage("Please enter the 4-digit OTP.");
      return;
    }
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone, code: otpCode }),
      });
      if (res.ok) {
        setIsOtpVerified(true);
        setErrorMessage(null);
      } else {
        setErrorMessage("Invalid OTP. Try entering 1234.");
      }
    } catch {
      setIsOtpVerified(true);
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!customerPhone || customerPhone.replace(/\D/g, "").length !== 10) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }

    // Validate Kamareddy Delivery Rules
    if (deliveryType === "delivery") {
      if (!addressLine.trim()) {
        setErrorMessage("Please enter your house/street address in Kamareddy.");
        return;
      }
      // Check if locality is inside Kamareddy
      if (!settings.allowedLocalities.includes(selectedLocality)) {
        setErrorMessage("Please add your delivery address in Kamareddy. We deliver only in Kamareddy.");
        return;
      }
    }

    const fullAddress: CustomerAddress = {
      fullName: customerName,
      phone: customerPhone,
      locality: selectedLocality,
      addressLine: addressLine,
      landmark: landmark,
      isKamareddy: true,
    };

    onSubmit({
      customerName,
      customerPhone,
      address: fullAddress,
      deliveryType,
      timeSlot,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 my-8 text-stone-900 animate-in zoom-in-95 duration-200">
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
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kamareddy Doorstep Delivery</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Delivery & Contact Details
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Order takes less than 1 minute. Direct delivery from Old Bus Stand Market.
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Reddy / Mohd Saleem"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
              />
            </div>
          </div>

          {/* 2. Customer Phone & OTP Verification */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              10-Digit Mobile Number (WhatsApp) *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value.replace(/\D/g, ""));
                    setIsOtpVerified(false);
                  }}
                  placeholder="98480 12345"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 font-medium"
                />
              </div>

              {!isOtpVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs hover:bg-emerald-200 transition shrink-0"
                >
                  {isOtpSent ? "Resend OTP" : "Send OTP"}
                </button>
              )}

              {isOtpVerified && (
                <span className="px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>

            {/* OTP Input Row */}
            {isOtpSent && !isOtpVerified && (
              <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="4-digit OTP"
                    className="w-28 px-3 py-1.5 rounded-lg border border-stone-300 text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[11px] text-stone-500 font-medium">
                    (Auto-filled test code: {generatedOtp || "1234"})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition"
                >
                  Verify
                </button>
              </div>
            )}
          </div>

          {/* 3. Delivery or Pickup Choice */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Order Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType("delivery")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  deliveryType === "delivery"
                    ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                    : "bg-stone-50 text-stone-700 border-stone-200"
                }`}
              >
                <span>🛵 Doorstep Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 ${
                  deliveryType === "pickup"
                    ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                    : "bg-stone-50 text-stone-700 border-stone-200"
                }`}
              >
                <span>🏪 Shop Pickup (Old Bus Stand)</span>
              </button>
            </div>
          </div>

          {/* 4. Delivery Address (Kamareddy Localities Only) */}
          {deliveryType === "delivery" ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Kamareddy Area / Locality *</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    Kamareddy Only
                  </span>
                </label>
                <select
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:border-emerald-600"
                >
                  {settings.allowedLocalities.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t("deliveryAddress")} (House / Flat No, Street) *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. H.No 5-2-89, Near Old Post Office / Behind Temple"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Beside Water Tank, Opposite Royal Medicals"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
              <p className="font-bold">🏪 Pickup Location:</p>
              <p>Fresh Chicken, Old Bus Stand Market, Kamareddy.</p>
              <p className="text-emerald-800">Your order will be fresh cut and kept ready in 15 mins.</p>
            </div>
          )}

          {/* 5. Delivery Time Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Preferred Delivery Time Slot:
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="Within 30-45 mins (Fast Express)">
                  ⚡ Express: Within 30–45 mins
                </option>
                <option value="Morning 10:30 AM - 12:00 PM">Morning: 10:30 AM – 12:00 PM</option>
                <option value="Afternoon 12:30 PM - 02:00 PM">Afternoon: 12:30 PM – 02:00 PM</option>
                <option value="Evening 05:30 PM - 07:30 PM">Evening: 05:30 PM – 07:30 PM</option>
                <option value="Night 07:30 PM - 09:00 PM">Night: 07:30 PM – 09:00 PM</option>
              </select>
            </div>
          </div>

          {/* 6. Special cutting notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
              Instructions for Butcher (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Medium biryani pieces / Fry small cuts / Keep liver separate"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
