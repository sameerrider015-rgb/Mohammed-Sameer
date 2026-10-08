export type Language = "en" | "te" | "hi";

export interface ChickenProduct {
  id: string;
  name: string;
  nameLocal?: {
    te?: string;
    hi?: string;
  };
  subtitle: string;
  description: string;
  image: string;
  inStock: boolean;
  ratePerKg: number;
  yesterdayRatePerKg: number;
  availableWeights: number[]; // e.g. [0.5, 1, 2, 3, 4, 5]
  tag?: string;
  unit: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  weightKg: number;
  ratePerKg: number;
  itemTotal: number;
  image: string;
}

export type OrderStatus =
  | "Placed"
  | "Accepted"
  | "Packing"
  | "Out for delivery"
  | "Delivered"
  | "Rejected";

export type PaymentMethod =
  | "phonepe"
  | "gpay"
  | "paytm"
  | "upi"
  | "card"
  | "cod";

export interface CustomerAddress {
  fullName: string;
  phone: string;
  locality: string;
  addressLine: string;
  landmark?: string;
  isKamareddy: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup";
  address: CustomerAddress;
  timeSlot: string;
  items: {
    productId: string;
    name: string;
    weightKg: number;
    ratePerKg: number;
    total: number;
  }[];
  totalWeightKg: number;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "paid" | "pending";
  paymentReference?: string;
  status: OrderStatus;
  rejectReason?: string;
  notes?: string;
}

export interface ShopSettings {
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
}

export interface DailyRateItem {
  id: string;
  name: string;
  ratePerKg: number;
  yesterdayRatePerKg: number;
  difference: number;
}

