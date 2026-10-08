import React from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { ChickenProduct, Language, ShopSettings } from "../types";
import { getTranslation } from "../utils/translations";

interface RateBoardProps {
  products: ChickenProduct[];
  settings: ShopSettings;
  lang: Language;
}

export const RateBoard: React.FC<RateBoardProps> = ({ products, settings, lang }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Format today's date nicely: e.g. "8 October 2026"
  const formattedToday = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full">
      {/* 1. Open / Closed Banner */}
      <div className="mb-4">
        {settings.isOpen ? (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                  {t("shopOpen")}
                </span>
                <span className="text-xs text-emerald-800 ml-2 hidden sm:inline">
                  (Timings: {settings.openTime} – {settings.closeTime})
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-lg shadow-sm">
              Live Deliveries Active
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <span className="font-extrabold text-sm sm:text-base text-amber-950">
                  {t("shopClosed")} {settings.openTime}
                </span>
                <p className="text-xs text-amber-800">
                  You can still browse cuts and view rates. Fresh cutting starts at {settings.openTime}.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-600 text-white rounded-lg">
              Closed
            </span>
          </div>
        )}
      </div>

      {/* 2. Chalkboard Style Today's Rate Board */}
      <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-stone-100 p-5 sm:p-7 shadow-2xl border-4 border-amber-950/40">
        {/* Subtle chalkboard texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Board Top Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-lg font-bold">
              📋
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <span>Kamareddy Market Live Board</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Updated Daily at 6:30 AM</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-serif">
                {t("rateBoardHeading")} {formattedToday}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60 text-xs text-stone-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Price locked at order time</span>
          </div>
        </div>

        {/* Rate Cards Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {products.map((item) => {
            const diff = item.ratePerKg - item.yesterdayRatePerKg;

            return (
              <div
                key={item.id}
                className="relative bg-stone-950/70 rounded-2xl p-3.5 sm:p-4 border border-stone-800 hover:border-amber-500/50 transition flex flex-col justify-between"
              >
                {/* Product Name */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/40">
                      {item.tag || "Fresh"}
                    </span>
                    {!item.inStock && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950 px-1 rounded">
                        Finished
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                    {item.name}
                  </h3>
                  {item.nameLocal && (
                    <p className="text-[11px] text-stone-400 truncate mt-0.5 font-medium">
                      {lang === "te"
                        ? item.nameLocal.te
                        : lang === "hi"
                        ? item.nameLocal.hi
                        : item.nameLocal.te || item.subtitle}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="mt-3 pt-2 border-t border-stone-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-amber-300 font-bold">₹</span>
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {item.ratePerKg}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">/ kg</span>
                  </div>

                  {/* Yesterday Rate Trend */}
                  <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                    {diff > 0 ? (
                      <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                        <TrendingUp className="w-3 h-3" />
                        +₹{diff} vs yesterday
                      </span>
                    ) : diff < 0 ? (
                      <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                        <TrendingDown className="w-3 h-3" />
                        -₹{Math.abs(diff)} vs yesterday
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-stone-400">
                        <Minus className="w-3 h-3" />
                        Same as yesterday
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Board Bottom Footer Note */}
        <div className="relative z-10 mt-5 pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2 text-center sm:text-left">
          <p className="italic">
            * Rates are based on daily market wholesale prices at Old Bus Stand Market, Kamareddy.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span>Direct from hygienic local poultry</span>
            <span>•</span>
            <span>Freshly dressed on order</span>
          </div>
        </div>
      </div>
    </div>
  );
};
