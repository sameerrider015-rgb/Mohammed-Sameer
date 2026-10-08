import { ChickenProduct, ShopSettings, Order } from "../types";

// Import our newly generated high-fidelity product images
import chickenWithSkinImg from "../assets/images/chicken_curry_cut_skin_1791436243757.jpg";
import chickenSkinlessImg from "../assets/images/chicken_skinless_fresh_1791436256294.jpg";
import bonelessChickenImg from "../assets/images/boneless_chicken_cuts_1791436267994.jpg";
import countryChickenImg from "../assets/images/country_chicken_cuts_1791436283312.jpg";

export const KAMAREDDY_LOCALITIES = [
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
];

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: "Fresh Chicken",
  tagline: "Fresh chicken, today's rate, at your door.",
  address: "Fresh Chicken, Old Bus Stand Market, Kamareddy - 503111",
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
  allowedLocalities: KAMAREDDY_LOCALITIES,
  upiId: "6302881596@ybl",
  backupWhatsAppPhone: "+91 6302881596",
  lastRateUpdated: new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }),
};

export const INITIAL_PRODUCTS: ChickenProduct[] = [
  {
    id: "chicken-with-skin",
    name: "Chicken with Skin",
    nameLocal: {
      te: "చర్మంతో చికెన్ (కర్రీ కట్)",
      hi: "चिकन विथ स्किन (कढ़ी कट)",
    },
    subtitle: "Juicy curry cut pieces with skin for authentic rich gravy",
    description:
      "Freshly dressed broiler chicken with skin intact. Retains natural juices and tenderness, ideal for rich Telangana curries, roasts, and gravies.",
    image: chickenWithSkinImg,
    inStock: true,
    ratePerKg: 220,
    yesterdayRatePerKg: 210,
    availableWeights: [0.5, 1, 2, 3, 4, 5],
    tag: "Popular",
    unit: "kg",
  },
  {
    id: "chicken-skinless",
    name: "Chicken Skinless",
    nameLocal: {
      te: "స్కిన్‌లెస్ చికెన్ (చర్మం లేనిది)",
      hi: "स्किनलेस चिकन (त्वचा रहित)",
    },
    subtitle: "Neatly dressed skinless curry cut, tender & lean",
    description:
      "Tender, cleaned and skin removed. Even medium curry cuts ready to cook. Most popular choice for biryani, fry, and spicy chicken curries.",
    image: chickenSkinlessImg,
    inStock: true,
    ratePerKg: 260,
    yesterdayRatePerKg: 250,
    availableWeights: [0.5, 1, 2, 3, 4, 5],
    tag: "Best Seller",
    unit: "kg",
  },
  {
    id: "chicken-boneless",
    name: "Boneless Chicken",
    nameLocal: {
      te: "బోన్‌లెస్ చికెన్ (ఎముకలు లేనిది)",
      hi: "बोनलेस चिकन (हड्डी रहित)",
    },
    subtitle: "100% prime tender breast fillets & clean bite cubes",
    description:
      "Pure lean breast meat trimmed of all fat and bones. Ideal for butter chicken, chicken 65, kebabs, popcorn chicken, and gym protein diets.",
    image: bonelessChickenImg,
    inStock: true,
    ratePerKg: 340,
    yesterdayRatePerKg: 330,
    availableWeights: [0.5, 1, 2, 3, 4, 5],
    tag: "High Protein",
    unit: "kg",
  },
  {
    id: "country-chicken",
    name: "Country Chicken (Natu Kodi)",
    nameLocal: {
      te: "నాటు కోడి (దేశీ చికెన్)",
      hi: "देसी / नाटू चिकन",
    },
    subtitle: "Authentic free-range country bird with distinct earthy flavor",
    description:
      "Authentic desi country chicken with firm texture and aromatic soup/gravy flavor. Highly revered for traditional celebrations and health benefits.",
    image: countryChickenImg,
    inStock: true,
    ratePerKg: 480,
    yesterdayRatePerKg: 470,
    availableWeights: [1, 2, 3, 4, 5],
    tag: "Special Cut",
    unit: "kg",
  },
];

export const INITIAL_ORDERS: Order[] = [
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
];
