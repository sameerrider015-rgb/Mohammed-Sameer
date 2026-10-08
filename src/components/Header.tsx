import React from "react";
import {
  Phone,
  MessageCircle,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Languages,
  BellRing,
} from "lucide-react";
import { Language, ShopSettings } from "../types";
import { getTranslation } from "../utils/translations";

interface HeaderProps {
  settings: ShopSettings;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeView: "customer" | "owner";
  onViewChange: (view: "customer" | "owner") => void;
  cartCount: number;
  onOpenCart: () => void;
  pendingOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  lang,
  onLanguageChange,
  activeView,
  onViewChange,
  cartCount,
  onOpenCart,
  pendingOrdersCount,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-emerald-900/10 shadow-sm">
      {/* Top Shop Announcement & Kamareddy Notice Bar */}
      <div className="bg-emerald-900 text-emerald-50 px-3 py-1.5 text-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="font-semibold text-white">Old Bus Stand Market, Kamareddy</span>
            <span className="text-emerald-300 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-200">
              {t("kamareddyOnly")}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1 text-emerald-200">
              <Clock className="w-3 h-3 text-emerald-300" />
              {settings.openTime} – {settings.closeTime}
            </span>

            <div className="h-3 w-px bg-emerald-700 hidden sm:block" />

            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1 text-white hover:text-emerald-200 transition font-bold"
            >
              <Phone className="w-3 h-3" />
              <span>{settings.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand & Tagline */}
        <div
          onClick={() => onViewChange("customer")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md shadow-emerald-950/20 text-2xl group-hover:scale-105 transition">
            🍗
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-none">
                {settings.shopName}
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Halal
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 font-medium tracking-tight mt-0.5">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Direct WhatsApp Shop Button */}
          <a
            href={`https://wa.me/916302881596?text=${encodeURIComponent(
              "Hello Fresh Chicken Kamareddy, I want to know today's chicken rate and place an order."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          {/* Language Selector */}
          <div className="relative flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                lang === "en"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("te")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                lang === "te"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                lang === "hi"
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Cart Icon (Customer View) */}
          {activeView === "customer" && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{t("yourCart")}</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-black text-xs shadow">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* View Switch: Customer vs Shop Owner */}
          <button
            onClick={() => onViewChange(activeView === "customer" ? "owner" : "customer")}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              activeView === "owner"
                ? "bg-amber-500 text-stone-950 border-amber-600 shadow-md animate-pulse"
                : "bg-stone-900 text-white border-stone-800 hover:bg-stone-800"
            }`}
            title="Switch View"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">
              {activeView === "customer" ? "Owner Panel" : "Customer App"}
            </span>
            <span className="sm:hidden">
              {activeView === "customer" ? "Owner" : "Customer"}
            </span>

            {/* Notification Badge if new unaccepted order waiting */}
            {pendingOrdersCount > 0 && activeView === "customer" && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-black shadow animate-bounce">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
