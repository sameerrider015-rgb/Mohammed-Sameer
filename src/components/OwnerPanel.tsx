import React, { useState } from "react";
import {
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Plus,
  Minus,
  Settings,
  TrendingUp,
  BarChart3,
  Truck,
  Check,
  X,
  Share2,
} from "lucide-react";
import {
  ChickenProduct,
  Order,
  OrderStatus,
  ShopSettings,
  Language,
} from "../types";
import { orderAlert } from "../utils/audioAlert";

interface OwnerPanelProps {
  products: ChickenProduct[];
  orders: Order[];
  settings: ShopSettings;
  onUpdateRates: (updatedRates: { id: string; name: string; ratePerKg: number; yesterdayRatePerKg: number }[]) => Promise<void>;
  onToggleShopOpen: (isOpen: boolean) => Promise<void>;
  onToggleStock: (productId: string, inStock: boolean) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, rejectReason?: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
  lang: Language;
}

export const OwnerPanel: React.FC<OwnerPanelProps> = ({
  products,
  orders,
  settings,
  onUpdateRates,
  onToggleShopOpen,
  onToggleStock,
  onUpdateOrderStatus,
  onUpdateSettings,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<"rates" | "orders" | "stock" | "sales" | "settings">("rates");
  
  // Rate editor state (initialized from current products with yesterday's rate filled in)
  const [ratesDraft, setRatesDraft] = useState(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      ratePerKg: p.ratePerKg,
      yesterdayRatePerKg: p.yesterdayRatePerKg,
    }))
  );
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [ratesSaveSuccess, setRatesSaveSuccess] = useState(false);

  // Filter for orders
  const [orderFilter, setOrderFilter] = useState<"active" | "all" | "completed">("active");

  // Reject modal state
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Address outside Kamareddy municipal area");

  // Settings draft
  const [settingsDraft, setSettingsDraft] = useState({
    openTime: settings.openTime,
    closeTime: settings.closeTime,
    deliveryCharge: settings.deliveryCharge,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    minimumOrderAmount: settings.minimumOrderAmount,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    upiId: settings.upiId,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Quick rate adjustment (+/- ₹5 or ₹10)
  const adjustRate = (id: string, delta: number) => {
    setRatesDraft((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ratePerKg: Math.max(50, r.ratePerKg + delta) } : r))
    );
  };

  const handleSaveRates = async () => {
    setIsSavingRates(true);
    await onUpdateRates(ratesDraft);
    setIsSavingRates(false);
    setRatesSaveSuccess(true);
    setTimeout(() => setRatesSaveSuccess(false), 2500);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    await onUpdateSettings(settingsDraft);
    setIsSavingSettings(false);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2500);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "active") {
      return o.status === "Placed" || o.status === "Accepted" || o.status === "Packing" || o.status === "Out for delivery";
    }
    if (orderFilter === "completed") {
      return o.status === "Delivered" || o.status === "Rejected";
    }
    return true;
  });

  // Sales Summary Calculation
  const todayOrders = orders.filter(
    (o) => o.status !== "Rejected"
  );
  const totalSales = todayOrders.reduce((acc, o) => acc + o.grandTotal, 0);
  const onlineSales = todayOrders
    .filter((o) => o.paymentMethod !== "cod")
    .reduce((acc, o) => acc + o.grandTotal, 0);
  const cashSales = todayOrders
    .filter((o) => o.paymentMethod === "cod")
    .reduce((acc, o) => acc + o.grandTotal, 0);
  const totalKgSold = todayOrders.reduce((acc, o) => acc + o.totalWeightKg, 0);

  // Test sound helper
  const handleTestRingtone = () => {
    if (orderAlert.isAlarmPlaying()) {
      orderAlert.stopLoudAlarm();
    } else {
      orderAlert.startLoudAlarm();
      setTimeout(() => orderAlert.stopLoudAlarm(), 5000); // 5 sec test
    }
  };

  const whatsappPromoText = `Fresh Chicken is now online! Check today's rate and order from home. Link: ${window.location.origin}. Pay by PhonePe, Google Pay, Paytm or cash on delivery. Delivery in Kamareddy only. Call or WhatsApp +91 6302881596.`;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Shop Control Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center text-2xl font-black shadow-md">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">Shop Owner Dashboard</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-stone-950">
                Kamareddy
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Old Bus Stand Market • Phone & WhatsApp: +91 6302881596
            </p>
          </div>
        </div>

        {/* Shop Open / Closed Big Switch & Ringtone Test */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Sound Alarm Test */}
          <button
            onClick={handleTestRingtone}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 text-amber-300 border border-stone-700 text-xs font-bold hover:bg-stone-700 transition"
            title="Test Loud Order Ringtone"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Ringtone</span>
          </button>

          {/* Shop Open/Close One-Tap Switch */}
          <button
            onClick={() => onToggleShopOpen(!settings.isOpen)}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 ${
              settings.isOpen
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>{settings.isOpen ? "SHOP IS OPEN" : "SHOP IS CLOSED"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Owner */}
      <div className="flex items-center gap-1.5 bg-stone-200 p-1.5 rounded-2xl overflow-x-auto text-xs sm:text-sm font-black text-stone-700">
        <button
          onClick={() => setActiveTab("rates")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "rates"
              ? "bg-stone-900 text-white shadow"
              : "hover:bg-stone-300 text-stone-800"
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Today's Rate</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 relative ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow"
              : "hover:bg-stone-300 text-stone-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>Live Orders</span>
          {orders.filter((o) => o.status === "Placed").length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
              {orders.filter((o) => o.status === "Placed").length} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("stock")}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "stock"
              ? "bg-stone-900 text-white shadow"
              : "hover:bg-stone-300 text-stone-800"
          }`}
        >
          <Package className="w-4 h-4 text-blue-400" />
          <span>Stock</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "sales"
              ? "bg-stone-900 text-white shadow"
              : "hover:bg-stone-300 text-stone-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-yellow-400" />
          <span>Sales Report</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === "settings"
              ? "bg-stone-900 text-white shadow"
              : "hover:bg-stone-300 text-stone-800"
          }`}
        >
          <Settings className="w-4 h-4 text-stone-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* TAB 1: DAILY RATE SCREEN (Takes ~10 seconds) */}
      {activeTab === "rates" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                Daily Rate Screen
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Yesterday's rates are pre-filled below. Adjust in 10 seconds and tap Save.
              </p>
            </div>

            <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Last Updated: <span className="text-emerald-800 font-bold">{settings.lastRateUpdated}</span>
            </div>
          </div>

          {/* Rate Cards with huge touch targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratesDraft.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border-2 border-stone-200 bg-stone-50/70 hover:border-emerald-600/40 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-stone-900">{item.name}</h4>
                  <span className="text-xs text-stone-500 font-medium">
                    Yesterday: ₹{item.yesterdayRatePerKg}/kg
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Minus 10 */}
                  <button
                    type="button"
                    onClick={() => adjustRate(item.id, -10)}
                    className="w-10 h-10 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-sm flex items-center justify-center transition"
                  >
                    -10
                  </button>
                  {/* Minus 5 */}
                  <button
                    type="button"
                    onClick={() => adjustRate(item.id, -5)}
                    className="w-10 h-10 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-black text-sm flex items-center justify-center transition"
                  >
                    -5
                  </button>

                  {/* Direct input / Large Display */}
                  <div className="flex-1 flex items-center justify-center bg-white px-3 py-2 rounded-xl border border-stone-300">
                    <span className="text-lg font-bold text-stone-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={item.ratePerKg}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRatesDraft((prev) =>
                          prev.map((r) => (r.id === item.id ? { ...r, ratePerKg: val } : r))
                        );
                      }}
                      className="w-24 text-2xl font-black text-center text-stone-900 font-mono focus:outline-none"
                    />
                    <span className="text-xs text-stone-500 font-semibold ml-1">/kg</span>
                  </div>

                  {/* Plus 5 */}
                  <button
                    type="button"
                    onClick={() => adjustRate(item.id, 5)}
                    className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-sm flex items-center justify-center transition"
                  >
                    +5
                  </button>
                  {/* Plus 10 */}
                  <button
                    type="button"
                    onClick={() => adjustRate(item.id, 10)}
                    className="w-10 h-10 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-black text-sm flex items-center justify-center transition"
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Big Green Save Button */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSaveRates}
              disabled={isSavingRates}
              className="flex-1 py-4 sm:py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
            >
              {isSavingRates ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Saving Rates...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Rates (10 Seconds Update)</span>
                </>
              )}
            </button>

            {ratesSaveSuccess && (
              <div className="flex items-center gap-1.5 px-4 py-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-300 font-bold text-xs sm:text-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Live board updated!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ORDERS LIST */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Order Filter Sub-tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setOrderFilter("active")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderFilter === "active"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Active ({orders.filter((o) => o.status !== "Delivered" && o.status !== "Rejected").length})
              </button>
              <button
                onClick={() => setOrderFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderFilter === "all"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  orderFilter === "completed"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Completed ({orders.filter((o) => o.status === "Delivered" || o.status === "Rejected").length})
              </button>
            </div>

            <span className="text-xs text-stone-500 font-medium">
              Orders appear at top with locked price & address
            </span>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-200">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-stone-300" />
              <h3 className="font-bold text-base text-stone-700">No orders in this view</h3>
              <p className="text-xs text-stone-500 mt-1">
                New orders placed by customers in Kamareddy will show here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isNew = order.status === "Placed";

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border-2 transition p-5 sm:p-6 shadow-sm ${
                      isNew
                        ? "border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-500/20"
                        : "border-stone-200"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-stone-900">
                          #{order.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            order.status === "Placed"
                              ? "bg-amber-100 text-amber-900 animate-pulse"
                              : order.status === "Accepted"
                              ? "bg-blue-100 text-blue-900"
                              : order.status === "Packing"
                              ? "bg-purple-100 text-purple-900"
                              : order.status === "Out for delivery"
                              ? "bg-indigo-100 text-indigo-900"
                              : order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-red-100 text-red-900"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-stone-400">
                          • {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold text-stone-600">
                          Payment:{" "}
                          <strong className="uppercase text-stone-900">
                            {order.paymentMethod === "cod" ? "Cash on Delivery" : `Online (${order.paymentMethod})`}
                          </strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "PAID" : "COLLECT CASH"}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="my-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <div className="text-stone-500 font-bold uppercase tracking-wider text-[11px] mb-1">
                          Customer
                        </div>
                        <div className="text-base font-extrabold text-stone-900">
                          {order.customerName}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Call Button */}
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Call +91 {order.customerPhone}</span>
                          </a>

                          {/* WhatsApp Customer Backup Alert */}
                          <a
                            href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
                              `Hello ${order.customerName}, this is Fresh Chicken Old Bus Stand Market. Your order #${order.id} for ${order.totalWeightKg} kg is confirmed!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 font-bold text-xs hover:bg-stone-200 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <div className="text-stone-500 font-bold uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
                          <span>Delivery Address (Kamareddy)</span>
                          {/* Open in Maps button */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${order.address.addressLine}, ${order.address.locality}, Kamareddy, Telangana`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline flex items-center gap-1 font-bold text-xs"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Open in Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                        <p className="text-stone-900 font-semibold leading-relaxed">
                          {order.address.addressLine}, {order.address.locality}
                          {order.address.landmark ? ` (Near ${order.address.landmark})` : ""}
                        </p>
                        <p className="text-stone-500 text-xs mt-1">
                          Slot: <strong className="text-stone-700">{order.timeSlot}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items & Locked Price */}
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs mb-4">
                      <div className="font-bold text-stone-500 uppercase tracking-wider text-[11px]">
                        Items ({order.totalWeightKg} kg total):
                      </div>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-stone-800 font-semibold">
                          <span>
                            • {it.name} —{" "}
                            <strong className="text-stone-900">
                              {it.weightKg < 1 ? `${it.weightKg * 1000}g` : `${it.weightKg} kg`}
                            </strong>{" "}
                            (@ locked ₹{it.ratePerKg}/kg)
                          </span>
                          <span className="font-mono font-bold text-stone-900">₹{it.total}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                        <span>Total Amount to Collect:</span>
                        <span className="text-emerald-800 text-base font-mono">
                          ₹{order.grandTotal}
                        </span>
                      </div>
                    </div>

                    {/* Owner Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.status === "Placed" && (
                        <>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, "Accepted")}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Order</span>
                          </button>
                          <button
                            onClick={() => setRejectingOrderId(order.id)}
                            className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 font-bold text-xs"
                          >
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {order.status === "Accepted" && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "Packing")}
                          className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5"
                        >
                          <Package className="w-4 h-4" />
                          <span>Mark Packing</span>
                        </button>
                      )}

                      {order.status === "Packing" && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "Out for delivery")}
                          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Out for Delivery</span>
                        </button>
                      )}

                      {order.status === "Out for delivery" && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "Delivered")}
                          className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      {order.status === "Delivered" && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          ✓ Completed & Settled
                        </span>
                      )}

                      {order.status === "Rejected" && (
                        <span className="text-xs font-bold text-red-800 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                          ✕ Rejected: {order.rejectReason || "Address outside Kamareddy"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STOCK SWITCH PER ITEM */}
      {activeTab === "stock" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Stock & Inventory Control
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Mark an item as "Finished for today" when fresh stock runs out. Customers cannot order finished items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                  />
                  <div>
                    <h4 className="font-extrabold text-base text-stone-900">{p.name}</h4>
                    <span className="text-xs text-stone-500 font-semibold">₹{p.ratePerKg}/kg</span>
                    <span
                      className={`block text-[11px] font-bold mt-0.5 ${
                        p.inStock ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {p.inStock ? "Currently In Stock" : "Marked Finished for today"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleStock(p.id, !p.inStock)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition ${
                    p.inStock
                      ? "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {p.inStock ? "Mark Finished" : "In Stock"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SALES SUMMARY REPORT */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Sales Summary & Daily Report
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Live revenue and volume figures for Fresh Chicken, Kamareddy.
            </p>
          </div>

          {/* Big Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 text-white shadow space-y-1">
              <span className="text-xs text-stone-400 font-bold uppercase">Total Revenue</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                ₹{totalSales}
              </div>
              <span className="text-[11px] text-stone-400">{todayOrders.length} valid orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 space-y-1">
              <span className="text-xs text-emerald-800 font-bold uppercase">Weight Sold</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-900">
                {totalKgSold} kg
              </div>
              <span className="text-[11px] text-emerald-700">Dressed poultry meat</span>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 text-blue-950 border border-blue-200 space-y-1">
              <span className="text-xs text-blue-800 font-bold uppercase">Online Payments</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-blue-900">
                ₹{onlineSales}
              </div>
              <span className="text-[11px] text-blue-700">PhonePe / GPay / Cards</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 text-amber-950 border border-amber-200 space-y-1">
              <span className="text-xs text-amber-800 font-bold uppercase">Cash on Delivery</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-900">
                ₹{cashSales}
              </div>
              <span className="text-[11px] text-amber-700">To collect in cash</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              Shop Settings & Configuration
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Control shop timings, delivery fees, and contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Opening Time</label>
              <input
                type="text"
                value={settingsDraft.openTime}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, openTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Closing Time</label>
              <input
                type="text"
                value={settingsDraft.closeTime}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, closeTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                value={settingsDraft.deliveryCharge}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, deliveryCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                value={settingsDraft.freeDeliveryThreshold}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Shop Phone / WhatsApp</label>
              <input
                type="text"
                value={settingsDraft.phone}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">UPI ID for Payments</label>
              <input
                type="text"
                value={settingsDraft.upiId}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, upiId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="py-3 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition"
            >
              Save Settings
            </button>
            {settingsSuccess && (
              <span className="text-xs font-bold text-emerald-800">Saved successfully!</span>
            )}
          </div>

          {/* Marketing share message snippet */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h4 className="font-bold text-stone-800 text-sm mb-2 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp Customer Share Message</span>
            </h4>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-700 select-all">
              {whatsappPromoText}
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900">Select Rejection Reason</h3>
            <p className="text-xs text-stone-500">
              The customer will be notified with this exact reason and refunded.
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
            >
              <option value="Address outside Kamareddy municipal area">
                Address outside Kamareddy municipal area
              </option>
              <option value="Stock finished for selected cuts today">
                Stock finished for selected cuts today
              </option>
              <option value="Shop closed for today">Shop closed for today</option>
              <option value="Heavy rain / delivery partner unavailable">
                Heavy rain / delivery partner unavailable
              </option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onUpdateOrderStatus(rejectingOrderId, "Rejected", rejectReason);
                  setRejectingOrderId(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejectingOrderId(null)}
                className="py-3 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
