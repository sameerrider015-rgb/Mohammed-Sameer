import React, { useState } from "react";
import { Plus, Check, AlertCircle } from "lucide-react";
import { ChickenProduct, Language } from "../types";
import { getTranslation } from "../utils/translations";

interface ProductCardProps {
  product: ChickenProduct;
  lang: Language;
  onAddToCart: (product: ChickenProduct, weightKg: number) => void;
  shopOpen: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onAddToCart,
  shopOpen,
}) => {
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  // Calculate price dynamically: rate per kg * weight
  const calculatedPrice = Math.round(product.ratePerKg * selectedWeight);

  const formatWeightLabel = (w: number) => {
    if (w < 1) {
      return `${w * 1000} g`;
    }
    return `${w} kg`;
  };

  const handleAdd = () => {
    if (!product.inStock || !shopOpen) return;
    onAddToCart(product, selectedWeight);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
      {/* Product Image and Badges */}
      <div>
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
            loading="lazy"
          />

          {/* Tag badge */}
          {product.tag && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-800 text-white shadow-md">
              {product.tag}
            </span>
          )}

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-[2px] flex items-center justify-center p-4">
              <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs sm:text-sm shadow-lg uppercase tracking-wide">
                {t("finishedToday")}
              </span>
            </div>
          )}

          {/* Rate per kg badge in corner */}
          <div className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white shadow-md border border-stone-800 flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">₹</span>
            <span className="text-lg font-black">{product.ratePerKg}</span>
            <span className="text-[11px] text-stone-300">/kg</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug">
                {product.name}
              </h3>
              {product.nameLocal && (
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  {lang === "te"
                    ? product.nameLocal.te
                    : lang === "hi"
                    ? product.nameLocal.hi
                    : product.nameLocal.te}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Weight Selection Buttons */}
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
              Select Weight:
            </label>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {product.availableWeights.map((w) => {
                const isSelected = selectedWeight === w;
                return (
                  <button
                    key={w}
                    type="button"
                    disabled={!product.inStock}
                    onClick={() => setSelectedWeight(w)}
                    className={`py-2 text-center rounded-xl text-xs font-extrabold transition border ${
                      isSelected
                        ? "bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {formatWeightLabel(w)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Area / Add to Cart Button */}
      <div className="p-4 sm:p-5 pt-0">
        {!product.inStock ? (
          <button
            disabled
            className="w-full py-3.5 rounded-2xl bg-stone-200 text-stone-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-stone-400" />
            <span>{t("finishedToday")}</span>
          </button>
        ) : !shopOpen ? (
          <button
            disabled
            className="w-full py-3.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm cursor-not-allowed text-center"
          >
            Shop Closed • Opens at 6:30 AM
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-md ${
              isAdded
                ? "bg-emerald-900 text-white"
                : "bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-lg"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Added to cart!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {/* Exact text requirement: Add [weight] kg, [price] */}
                <span>
                  {t("addWeight")} {formatWeightLabel(selectedWeight)}, ₹{calculatedPrice}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
