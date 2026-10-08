/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  MessageCircle,
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  History,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  ChickenProduct,
  CartItem,
  Order,
  OrderStatus,
  ShopSettings,
  Language,
  CustomerAddress,
  PaymentMethod,
} from "./types";
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from "./data/shopData";
import { Header } from "./components/Header";
import { RateBoard } from "./components/RateBoard";
import { ProductCard } from "./components/ProductCard";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { PaymentModal } from "./components/PaymentModal";
import { OrderSuccessModal } from "./components/OrderSuccessModal";
import { OrderTracker } from "./components/OrderTracker";
import { OrderHistoryModal } from "./components/OrderHistoryModal";
import { OwnerPanel } from "./components/OwnerPanel";
import { NewOrderAlertModal } from "./components/NewOrderAlertModal";
import { orderAlert } from "./utils/audioAlert";

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [activeView, setActiveView] = useState<"customer" | "owner">("customer");

  // Shop Data State
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<ChickenProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Customer Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingCheckoutDetails, setPendingCheckoutDetails] = useState<{
    customerName: string;
    customerPhone: string;
    address: CustomerAddress;
    deliveryType: "delivery" | "pickup";
    timeSlot: string;
    notes?: string;
  } | null>(null);

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [justPlacedOrder, setJustPlacedOrder] = useState<Order | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Owner Ringtone & New Order Modal State
  const [incomingAlertOrder, setIncomingAlertOrder] = useState<Order | null>(null);
  const acknowledgedOrderIds = useRef<Set<string>>(new Set());

  // Fetch live shop data and orders on load and on interval
  const fetchShopData = async () => {
    try {
      const [shopRes, ordersRes] = await Promise.all([
        fetch("/api/shop/info"),
        fetch("/api/orders"),
      ]);

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        if (shopData.settings) {
          setSettings(shopData.settings);
        }
        if (shopData.rates && Array.isArray(shopData.rates)) {
          setProducts((prev) =>
            prev.map((p) => {
              const matchedRate = shopData.rates.find((r: any) => r.id === p.id);
              const inStock =
                shopData.itemsStock && shopData.itemsStock[p.id] !== undefined
                  ? shopData.itemsStock[p.id]
                  : p.inStock;
              if (matchedRate) {
                return {
                  ...p,
                  ratePerKg: matchedRate.ratePerKg,
                  yesterdayRatePerKg: matchedRate.yesterdayRatePerKg,
                  inStock,
                };
              }
              return { ...p, inStock };
            })
          );
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);

          // Check if there is an unaccepted "Placed" order for the owner alert
          const latestUnaccepted = ordersData.find(
            (o: Order) => o.status === "Placed" && !acknowledgedOrderIds.current.has(o.id)
          );

          if (latestUnaccepted) {
            setIncomingAlertOrder(latestUnaccepted);
            // Trigger loud repeating ringtone
            orderAlert.startLoudAlarm();
          }
        }
      }
    } catch {
      // Offline fallback state is already populated
    }
  };

  useEffect(() => {
    fetchShopData();
    const interval = setInterval(fetchShopData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update tracking order if status changed
  useEffect(() => {
    if (activeTrackingOrder) {
      const updated = orders.find((o) => o.id === activeTrackingOrder.id);
      if (updated && updated.status !== activeTrackingOrder.status) {
        setActiveTrackingOrder(updated);
        orderAlert.playCustomerNotification();
      }
    }
  }, [orders, activeTrackingOrder]);

  // Cart Handlers
  const handleAddToCart = (product: ChickenProduct, weightKg: number) => {
    const calculatedTotal = Math.round(product.ratePerKg * weightKg);
    const existingIndex = cart.findIndex(
      (c) => c.productId === product.id && c.weightKg === weightKg
    );

    if (existingIndex > -1) {
      // Already in cart with same weight
      setIsCartOpen(true);
      return;
    }

    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      weightKg,
      ratePerKg: product.ratePerKg,
      itemTotal: calculatedTotal,
      image: product.image,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Checkout Flow
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = (details: {
    customerName: string;
    customerPhone: string;
    address: CustomerAddress;
    deliveryType: "delivery" | "pickup";
    timeSlot: string;
    notes?: string;
  }) => {
    setPendingCheckoutDetails(details);
    setIsCheckoutOpen(false);
    setIsPaymentOpen(true);
  };

  // Payment Completion & Order Placement
  const handleConfirmPayment = async (
    method: PaymentMethod,
    reference?: string
  ) => {
    if (!pendingCheckoutDetails || cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
    const totalWeightKg = cart.reduce((acc, item) => acc + item.weightKg, 0);
    const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
    const deliveryCharge =
      pendingCheckoutDetails.deliveryType === "pickup"
        ? 0
        : isFreeDelivery
        ? 0
        : settings.deliveryCharge;
    const grandTotal = subtotal + deliveryCharge;

    const orderPayload = {
      customerName: pendingCheckoutDetails.customerName,
      customerPhone: pendingCheckoutDetails.customerPhone,
      deliveryType: pendingCheckoutDetails.deliveryType,
      address: pendingCheckoutDetails.address,
      timeSlot: pendingCheckoutDetails.timeSlot,
      notes: pendingCheckoutDetails.notes,
      items: cart.map((it) => ({
        productId: it.productId,
        name: it.productName,
        weightKg: it.weightKg,
        ratePerKg: it.ratePerKg,
        total: it.itemTotal,
      })),
      totalWeightKg,
      subtotal,
      deliveryCharge,
      grandTotal,
      paymentMethod: method,
      paymentStatus: (method === "cod" ? "pending" : "paid") as "paid" | "pending",
      paymentReference: reference,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const createdOrder: Order = data.order;
        setOrders((prev) => [createdOrder, ...prev]);
        setJustPlacedOrder(createdOrder);
        setCart([]);
        setIsPaymentOpen(false);
        setPendingCheckoutDetails(null);
        return;
      }
    } catch {
      // Offline fallback order placement
    }

    const fallbackOrder: Order = {
      id: `FC-${Math.floor(1040 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: "Placed",
      ...orderPayload,
    };
    setOrders((prev) => [fallbackOrder, ...prev]);
    setJustPlacedOrder(fallbackOrder);
    setCart([]);
    setIsPaymentOpen(false);
    setPendingCheckoutDetails(null);
  };

  // Reorder Handler (Copies items to cart)
  const handleReorder = (order: Order) => {
    const reorderedCart: CartItem[] = order.items.map((it) => {
      const matched = products.find((p) => p.id === it.productId);
      const currentRate = matched ? matched.ratePerKg : it.ratePerKg;
      return {
        productId: it.productId,
        productName: it.name,
        weightKg: it.weightKg,
        ratePerKg: currentRate,
        itemTotal: Math.round(currentRate * it.weightKg),
        image: matched ? matched.image : products[0].image,
      };
    });
    setCart(reorderedCart);
    setIsCartOpen(true);
  };

  // Owner Handlers
  const handleOwnerAccept = async (orderId: string) => {
    orderAlert.stopLoudAlarm();
    acknowledgedOrderIds.current.add(orderId);
    setIncomingAlertOrder(null);
    await handleOwnerUpdateStatus(orderId, "Accepted");
  };

  const handleOwnerReject = async (orderId: string, reason?: string) => {
    orderAlert.stopLoudAlarm();
    acknowledgedOrderIds.current.add(orderId);
    setIncomingAlertOrder(null);
    await handleOwnerUpdateStatus(orderId, "Rejected", reason || "Order rejected by shop owner");
  };

  const handleOwnerUpdateStatus = async (
    orderId: string,
    status: OrderStatus,
    rejectReason?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, rejectReason } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectReason }),
      });
    } catch {
      // Handled locally
    }
  };

  const handleOwnerUpdateRates = async (
    updatedRates: { id: string; name: string; ratePerKg: number; yesterdayRatePerKg: number }[]
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        const u = updatedRates.find((r) => r.id === p.id);
        if (u) {
          return {
            ...p,
            ratePerKg: u.ratePerKg,
            yesterdayRatePerKg: u.yesterdayRatePerKg,
          };
        }
        return p;
      })
    );
    try {
      await fetch("/api/shop/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: updatedRates }),
      });
    } catch {
      // Local update successful
    }
  };

  const handleOwnerToggleShopOpen = async (isOpen: boolean) => {
    setSettings((prev) => ({ ...prev, isOpen }));
    try {
      await fetch("/api/shop/toggle-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen }),
      });
    } catch {
      // Local update successful
    }
  };

  const handleOwnerToggleStock = async (productId: string, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock } : p))
    );
    try {
      await fetch("/api/shop/toggle-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, inStock }),
      });
    } catch {
      // Local update successful
    }
  };

  const handleOwnerUpdateSettings = async (newSettings: Partial<ShopSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await fetch("/api/shop/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
    } catch {
      // Local update successful
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "Placed").length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Header */}
      <Header
        settings={settings}
        lang={lang}
        onLanguageChange={setLang}
        activeView={activeView}
        onViewChange={setActiveView}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        pendingOrdersCount={pendingOrdersCount}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
        {/* VIEW 1: CUSTOMER APP VIEW */}
        {activeView === "customer" && (
          <div className="space-y-8">
            {/* 1. Today's Rate Chalkboard Board */}
            <section id="rate-board-section">
              <RateBoard products={products} settings={settings} lang={lang} />
            </section>

            {/* Quick Actions Bar (My Orders & Express Guarantee) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Doorstep Delivery in 30–45 Mins
                  </h3>
                  <p className="text-xs text-stone-500">
                    Old Bus Stand Market, Kamareddy • 100% Fresh Cutting on Order
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition"
                >
                  <History className="w-4 h-4 text-emerald-800" />
                  <span>My Orders ({orders.length})</span>
                </button>
              </div>
            </div>

            {/* 2. Product List & Weight Selection */}
            <section id="products-section" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Choose Your Cuts & Weight
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select 500g, 1kg, 2kg, 3kg, 4kg or 5kg • Freshly weighed & dressed
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Daily Fresh Poultry
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    lang={lang}
                    onAddToCart={handleAddToCart}
                    shopOpen={settings.isOpen}
                  />
                ))}
              </div>
            </section>

            {/* 3. Shop Help & Location Card */}
            <section className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Store className="w-3.5 h-3.5" />
                    <span>Physical Butcher Shop</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Fresh Chicken, Kamareddy
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
                    Located at Old Bus Stand Market, Kamareddy. Serving the freshest broiler chicken, skinless cuts, boneless breasts, and authentic country chicken (Natu Kodi) with supreme hygiene standards.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+916302881596"
                    className="py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Call Shop (+91 6302881596)</span>
                  </a>

                  <a
                    href={`https://wa.me/916302881596?text=${encodeURIComponent(
                      "Hello Fresh Chicken, I want to order chicken."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Order</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SHOP OWNER PANEL */}
        {activeView === "owner" && (
          <OwnerPanel
            products={products}
            orders={orders}
            settings={settings}
            onUpdateRates={handleOwnerUpdateRates}
            onToggleShopOpen={handleOwnerToggleShopOpen}
            onToggleStock={handleOwnerToggleStock}
            onUpdateOrderStatus={handleOwnerUpdateStatus}
            onUpdateSettings={handleOwnerUpdateSettings}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200 bg-white py-6 text-stone-500 text-xs mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🍗</span>
            <span className="font-extrabold text-stone-900">Fresh Chicken</span>
            <span>•</span>
            <span>Old Bus Stand Market, Kamareddy - 503111</span>
          </div>

          <p className="text-stone-500 text-center sm:text-right">
            Phone & WhatsApp: <strong>+91 6302881596</strong> • Delivered inside Kamareddy Only
          </p>
        </div>
      </footer>

      {/* Floating Cart Button for Mobile when cart has items */}
      {cart.length > 0 && activeView === "customer" && !isCartOpen && (
        <div className="fixed bottom-5 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-200 border-2 border-emerald-600"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black">
                ₹{cart.reduce((a, b) => a + b.itemTotal, 0)}
              </span>
              <span>View Cart →</span>
            </div>
          </button>
        </div>
      )}

      {/* Customer Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        settings={settings}
        lang={lang}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={handleCheckoutSubmit}
        settings={settings}
        lang={lang}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmPayment}
        grandTotal={
          cart.reduce((a, b) => a + b.itemTotal, 0) +
          (pendingCheckoutDetails?.deliveryType === "pickup"
            ? 0
            : cart.reduce((a, b) => a + b.itemTotal, 0) >= settings.freeDeliveryThreshold
            ? 0
            : settings.deliveryCharge)
        }
        customerName={pendingCheckoutDetails?.customerName || "Customer"}
        settings={settings}
        lang={lang}
      />

      <OrderSuccessModal
        isOpen={Boolean(justPlacedOrder)}
        order={justPlacedOrder}
        onClose={() => setJustPlacedOrder(null)}
        onTrackOrder={(o) => {
          setJustPlacedOrder(null);
          setActiveTrackingOrder(o);
        }}
        lang={lang}
      />

      <OrderTracker
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        onReorder={handleReorder}
        lang={lang}
      />

      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={orders}
        onReorder={handleReorder}
        onTrackOrder={(o) => {
          setIsHistoryOpen(false);
          setActiveTrackingOrder(o);
        }}
        lang={lang}
      />

      {/* Shop Owner Full-Screen Repeating Ringtone Alert Modal */}
      <NewOrderAlertModal
        order={incomingAlertOrder}
        onAccept={handleOwnerAccept}
        onReject={handleOwnerReject}
        lang={lang}
      />
    </div>
  );
}
