import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Data Store for Fresh Chicken Shop
interface ShopDataState {
  settings: {
    shopName: string;
    tagline: string;
    address: string;
    phone: string;
    whatsapp: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    deliveryCharge: number;
    freeDeliveryThreshold: number;
    minimumOrderKg: number;
    minimumOrderAmount: number;
    serviceArea: string;
    allowedLocalities: string[];
    upiId: string;
    backupWhatsAppPhone: string;
    lastRateUpdated: string;
  };
  rates: {
    id: string;
    name: string;
    ratePerKg: number;
    yesterdayRatePerKg: number;
  }[];
  itemsStock: Record<string, boolean>;
  orders: any[];
}

const shopState: ShopDataState = {
  settings: {
    shopName: "Fresh Chicken",
    tagline: "Fresh chicken, today's rate, at your door.",
    address: "Old Bus Stand Market, Kamareddy - 503111",
    phone: "+91 6302881596",
    whatsapp: "+91 6302881596",
    isOpen: true,
    openTime: "06:30 AM",
    closeTime: "09:00 PM",
    deliveryCharge: 30,
    freeDeliveryThreshold: 500,
    minimumOrderKg: 1.0,
    minimumOrderAmount: 150,
    serviceArea: "Kamareddy Municipal Limits Only",
    allowedLocalities: [
      "Old Bus Stand Market",
      "Gandhi Chowk",
      "Subhash Nagar",
      "Ashok Nagar",
      "Station Road / Railway Colony",
      "Vidyanagar",
      "Housing Board Colony",
      "Nizamabad Road",
      "Siricilla Road",
      "Collectorate Area",
      "Rameshwar Pally",
      "Kalyani Theater Area",
      "Devunipally",
      "Banswada Road Junction",
      "Adarsh Nagar",
      "Syed Nagar",
      "RTC Depot Road",
      "Kisan Nagar",
    ],
    upiId: "6302881596@ybl",
    backupWhatsAppPhone: "+91 6302881596",
    lastRateUpdated: "07:30 AM Today",
  },
  rates: [
    {
      id: "chicken-with-skin",
      name: "Chicken with Skin",
      ratePerKg: 220,
      yesterdayRatePerKg: 210,
    },
    {
      id: "chicken-skinless",
      name: "Chicken Skinless",
      ratePerKg: 260,
      yesterdayRatePerKg: 250,
    },
    {
      id: "chicken-boneless",
      name: "Boneless Chicken",
      ratePerKg: 340,
      yesterdayRatePerKg: 330,
    },
    {
      id: "country-chicken",
      name: "Country Chicken (Natu Kodi)",
      ratePerKg: 480,
      yesterdayRatePerKg: 470,
    },
  ],
  itemsStock: {
    "chicken-with-skin": true,
    "chicken-skinless": true,
    "chicken-boneless": true,
    "country-chicken": true,
  },
  orders: [
    {
      id: "FC-1041",
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      customerName: "Ramesh Reddy",
      customerPhone: "9848022341",
      deliveryType: "delivery",
      address: {
        fullName: "Ramesh Reddy",
        phone: "9848022341",
        locality: "Subhash Nagar",
        addressLine: "H.No 4-2-118, Near Hanuman Temple",
        landmark: "Opposite Water Tank",
        isKamareddy: true,
      },
      timeSlot: "Within 30-45 mins",
      items: [
        {
          productId: "chicken-skinless",
          name: "Chicken Skinless",
          weightKg: 2,
          ratePerKg: 260,
          total: 520,
        },
      ],
      totalWeightKg: 2,
      subtotal: 520,
      deliveryCharge: 0,
      grandTotal: 520,
      paymentMethod: "phonepe",
      paymentStatus: "paid",
      status: "Packing",
      notes: "Please make medium pieces for biryani",
    },
    {
      id: "FC-1040",
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      customerName: "Mohd Saleem",
      customerPhone: "9440192834",
      deliveryType: "delivery",
      address: {
        fullName: "Mohd Saleem",
        phone: "9440192834",
        locality: "Gandhi Chowk",
        addressLine: "Main Road, Near Royal Medicals",
        landmark: "Near Clock Tower",
        isKamareddy: true,
      },
      timeSlot: "Within 30-45 mins",
      items: [
        {
          productId: "chicken-with-skin",
          name: "Chicken with Skin",
          weightKg: 1,
          ratePerKg: 220,
          total: 220,
        },
        {
          productId: "chicken-boneless",
          name: "Boneless Chicken",
          weightKg: 1,
          ratePerKg: 340,
          total: 340,
        },
      ],
      totalWeightKg: 2,
      subtotal: 560,
      deliveryCharge: 0,
      grandTotal: 560,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "Delivered",
    },
  ],
};

let nextOrderSeq = 1042;
const activeOtps: Record<string, string> = {};

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    shop: shopState.settings.shopName,
    isOpen: shopState.settings.isOpen,
  });
});

// Shop Info & Status
app.get("/api/shop/info", (_req, res) => {
  res.json({
    settings: shopState.settings,
    rates: shopState.rates,
    itemsStock: shopState.itemsStock,
  });
});

// Update Daily Rates (Owner 10-second rate update)
app.post("/api/shop/rates", (req, res) => {
  const { rates } = req.body;
  if (Array.isArray(rates)) {
    shopState.rates = rates.map((r) => ({
      id: r.id,
      name: r.name,
      ratePerKg: Number(r.ratePerKg),
      yesterdayRatePerKg: Number(r.yesterdayRatePerKg || r.ratePerKg),
    }));
    shopState.settings.lastRateUpdated = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  res.json({
    success: true,
    rates: shopState.rates,
    lastRateUpdated: shopState.settings.lastRateUpdated,
  });
});

// Toggle Shop Open/Closed
app.post("/api/shop/toggle-open", (req, res) => {
  const { isOpen } = req.body;
  if (typeof isOpen === "boolean") {
    shopState.settings.isOpen = isOpen;
  } else {
    shopState.settings.isOpen = !shopState.settings.isOpen;
  }
  res.json({ success: true, isOpen: shopState.settings.isOpen });
});

// Toggle Item Stock
app.post("/api/shop/toggle-stock", (req, res) => {
  const { productId, inStock } = req.body;
  if (productId) {
    shopState.itemsStock[productId] = Boolean(inStock);
  }
  res.json({ success: true, itemsStock: shopState.itemsStock });
});

// Update Shop Settings
app.post("/api/shop/settings", (req, res) => {
  const {
    openTime,
    closeTime,
    deliveryCharge,
    freeDeliveryThreshold,
    minimumOrderAmount,
    phone,
    whatsapp,
    upiId,
  } = req.body;

  if (openTime) shopState.settings.openTime = openTime;
  if (closeTime) shopState.settings.closeTime = closeTime;
  if (deliveryCharge !== undefined) shopState.settings.deliveryCharge = Number(deliveryCharge);
  if (freeDeliveryThreshold !== undefined)
    shopState.settings.freeDeliveryThreshold = Number(freeDeliveryThreshold);
  if (minimumOrderAmount !== undefined)
    shopState.settings.minimumOrderAmount = Number(minimumOrderAmount);
  if (phone) shopState.settings.phone = phone;
  if (whatsapp) shopState.settings.whatsapp = whatsapp;
  if (upiId) shopState.settings.upiId = upiId;

  res.json({ success: true, settings: shopState.settings });
});

// Get Orders List
app.get("/api/orders", (_req, res) => {
  // Sort descending by created time
  const sorted = [...shopState.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

// Place Order
app.post("/api/orders", (req, res) => {
  const orderData = req.body;

  if (!shopState.settings.isOpen) {
    return res.status(400).json({
      error: "The shop is closed. Please try again during shop timings.",
    });
  }

  // Validate Kamareddy delivery area
  if (orderData.deliveryType === "delivery") {
    const isKamareddy =
      orderData.address?.isKamareddy !== false &&
      (Boolean(orderData.address?.locality) ||
        (orderData.address?.addressLine &&
          orderData.address.addressLine.toLowerCase().includes("kamareddy")));

    if (!isKamareddy) {
      return res.status(400).json({
        error:
          "Please add your delivery address in Kamareddy. We deliver only in Kamareddy.",
      });
    }
  }

  // Generate ID
  const orderId = `FC-${nextOrderSeq++}`;
  const newOrder = {
    ...orderData,
    id: orderId,
    createdAt: new Date().toISOString(),
    status: "Placed",
  };

  shopState.orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: `Order #${orderId} placed successfully!`,
  });
});

// Update Order Status (Owner actions: Accept, Packing, Out for delivery, Delivered, Reject)
app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, rejectReason } = req.body;

  const orderIndex = shopState.orders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  shopState.orders[orderIndex].status = status;
  if (rejectReason) {
    shopState.orders[orderIndex].rejectReason = rejectReason;
  }
  if (status === "Delivered" && shopState.orders[orderIndex].paymentMethod === "cod") {
    shopState.orders[orderIndex].paymentStatus = "paid";
  }

  res.json({
    success: true,
    order: shopState.orders[orderIndex],
  });
});

// Send OTP simulation
app.post("/api/auth/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Enter a valid 10-digit phone number." });
  }
  // Generate random 4-digit code (for demo/convenience we provide 1234 or code)
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps[phone] = code;

  res.json({
    success: true,
    phone,
    code, // returned so UI can autofill or show in toast easily
    message: `OTP sent to +91 ${phone}`,
  });
});

// Verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, code } = req.body;
  const validCode = activeOtps[phone] || "1234";

  if (code === validCode || code === "1234") {
    delete activeOtps[phone];
    return res.json({ success: true, verified: true });
  }

  res.status(400).json({ error: "Invalid OTP. Please check or use test code 1234." });
});


// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
