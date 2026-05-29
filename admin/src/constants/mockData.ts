// Realistic enterprise mock data
import type { Order } from "@/redux/slices/ordersSlice";
import type { AppUser } from "@/redux/slices/usersSlice";
import type { Item } from "@/redux/slices/itemsSlice";
import type { Category } from "@/redux/slices/categoriesSlice";
import type { NotificationItem } from "@/redux/slices/notificationsSlice";

const customers = [
  ["Olivia Bennett", "olivia.b@acme.io", "United States"],
  ["Lucas Müller", "l.muller@helix.de", "Germany"],
  ["Aarav Sharma", "aarav@northwind.in", "India"],
  ["Sofia Rossi", "sofia@vela.it", "Italy"],
  ["Yuki Tanaka", "yuki@kaisei.jp", "Japan"],
  ["Noah Carter", "noah@beacon.co", "Canada"],
  ["Amelia Khan", "amelia@summit.uk", "United Kingdom"],
  ["Mateo Diaz", "mateo@solara.mx", "Mexico"],
  ["Chloé Laurent", "chloe@maison.fr", "France"],
  ["Ethan Wright", "ethan@apex.us", "United States"],
];
const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;
const payments = ["Visa •• 4242", "Mastercard •• 8810", "Amex •• 1003", "ACH Transfer", "Apple Pay"];

export const mockOrders: Order[] = Array.from({ length: 42 }).map((_, i) => {
  const c = customers[i % customers.length];
  const d = new Date(); d.setDate(d.getDate() - i * 2 - 1);
  return {
    id: `ORD-${(10248 + i).toString()}`,
    customer: c[0],
    email: c[1],
    amount: Math.round((Math.random() * 9000 + 120) * 100) / 100,
    status: statuses[i % statuses.length],
    items: 1 + (i % 7),
    createdAt: d.toISOString(),
    paymentMethod: payments[i % payments.length],
    shippingAddress: `${100 + i} Market Street, Suite ${i + 4}, ${c[2]}`,
  };
});

export const mockUsers: AppUser[] = customers.flatMap((c, i) => [
  {
    id: `USR-${1000 + i * 2}`,
    name: c[0], email: c[1], country: c[2],
    role: (["Admin", "Manager", "Customer", "Support"] as const)[i % 4],
    status: (["active", "invited", "suspended"] as const)[i % 3],
    joined: new Date(Date.now() - i * 86400000 * 17).toISOString(),
    spend: Math.round(Math.random() * 28000),
  },
  {
    id: `USR-${1001 + i * 2}`,
    name: c[0].split(" ").reverse().join(" "), email: `team.${c[1]}`, country: c[2],
    role: (["Customer", "Manager", "Support", "Admin"] as const)[i % 4],
    status: "active",
    joined: new Date(Date.now() - i * 86400000 * 9).toISOString(),
    spend: Math.round(Math.random() * 14000),
  },
]);

const itemNames = [
  ["Zenvy Classic Crewneck Tee", "Classics", "Soft 100% combed cotton everyday crew."],
  ["Midnight Indigo Graphic Tee", "Graphic", "Hand-illustrated indigo print on midnight black."],
  ["Vintage Wash Pocket Tee", "Vintage", "Garment-dyed, lived-in feel with a chest pocket."],
  ["Heavyweight Boxy Fit Tee", "Oversized", "300gsm heavyweight cotton, relaxed boxy cut."],
  ["Zenvy Streetwear Oversized Tee", "Oversized", "Drop-shoulder oversized silhouette."],
  ["Pima Cotton Premium V-Neck", "Premium", "Buttery-soft Peruvian Pima v-neck."],
  ["Long Sleeve Henley Tee", "Long Sleeve", "3-button henley in midweight cotton."],
  ["Zenvy Athletic Performance Tee", "Performance", "Moisture-wicking quick-dry training tee."],
  ["Tie-Dye Festival Tee", "Graphic", "Hand-dyed limited drop, no two alike."],
  ["Organic Cotton Essential Tee", "Classics", "GOTS-certified organic cotton."],
  ["Striped Breton Tee", "Vintage", "Classic French sailor stripes."],
  ["Zenvy Logo Embroidered Tee", "Premium", "Tonal embroidered chest logo."],
];
export const mockItems: Item[] = itemNames.map((n, i) => ({
  id: `ITM-${(20100 + i).toString()}`,
  name: n[0], sku: `ZNV-${(60000 + i * 7).toString()}`, category: n[1],
  price: Math.round((Math.random() * 45 + 24) * 100) / 100,
  stock: Math.floor(Math.random() * 480),
  status: (["active", "draft", "archived"] as const)[i % 3],
  description: n[2],
  images: [],
}));

export const mockCategories: Category[] = [
  ["Classics", "Everyday essential tees"],
  ["Graphic", "Statement prints and artist drops"],
  ["Vintage", "Garment-dyed, washed and retro fits"],
  ["Oversized", "Drop-shoulder, boxy and relaxed cuts"],
  ["Premium", "Pima, supima and elevated fabrics"],
  ["Long Sleeve", "Long sleeve tees and henleys"],
  ["Performance", "Athletic and moisture-wicking"],
  ["Limited", "Capsule drops and collabs"],
].map(([name, description], i) => ({
  id: `CAT-${(300 + i).toString()}`, name, description,
  itemCount: 6 + Math.floor(Math.random() * 40),
}));

export const mockNotifications: NotificationItem[] = [
  { id: "NTF-91001", title: "Q4 Holiday Promo", message: "Save up to 40% across premium categories.", channel: "email", audience: "All Customers", status: "sent", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "NTF-91002", title: "Order Shipped Update", message: "Your Order {{id}} has shipped via DHL Express.", channel: "whatsapp", audience: "Active Orders", status: "scheduled", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "NTF-91003", title: "Win-back Campaign", message: "We've missed you — here's 15% off.", channel: "email", audience: "Dormant 90d+", status: "draft", createdAt: new Date().toISOString() },
];

// Charts
export const revenueSeries = [
  { name: "Jan", revenue: 184_000, orders: 1240 },
  { name: "Feb", revenue: 212_400, orders: 1410 },
  { name: "Mar", revenue: 268_900, orders: 1620 },
  { name: "Apr", revenue: 241_800, orders: 1505 },
  { name: "May", revenue: 304_500, orders: 1780 },
  { name: "Jun", revenue: 358_900, orders: 2010 },
  { name: "Jul", revenue: 392_400, orders: 2225 },
  { name: "Aug", revenue: 421_800, orders: 2390 },
  { name: "Sep", revenue: 468_300, orders: 2580 },
  { name: "Oct", revenue: 502_100, orders: 2740 },
  { name: "Nov", revenue: 548_900, orders: 2910 },
  { name: "Dec", revenue: 612_700, orders: 3145 },
];

export const userGrowthSeries = revenueSeries.map((d, i) => ({
  name: d.name,
  active: 4_200 + i * 380 + Math.round(Math.random() * 200),
  new: 280 + i * 22 + Math.round(Math.random() * 60),
}));

export const channelSplit = [
  { name: "Direct", value: 38 },
  { name: "Organic", value: 27 },
  { name: "Referral", value: 18 },
  { name: "Paid", value: 12 },
  { name: "Email", value: 5 },
];

export const conversionFunnel = [
  { name: "Impressions", value: 100 },
  { name: "Clicks", value: 38 },
  { name: "Visits", value: 24 },
  { name: "Leads", value: 11 },
  { name: "Customers", value: 4.6 },
];

// ---------- Marketing dashboard data ----------
export const marketingTrend = revenueSeries.map((d, i) => ({
  name: d.name,
  spend: Math.round(8_000 + i * 1_400 + Math.random() * 1200),
  revenue: Math.round(24_000 + i * 5_200 + Math.random() * 3800),
}));

export const channelPerformance = [
  { channel: "Google Ads", spend: 18400, revenue: 92100, roas: 5.0 },
  { channel: "Meta Ads", spend: 14200, revenue: 58300, roas: 4.1 },
  { channel: "LinkedIn", spend: 9600, revenue: 31200, roas: 3.25 },
  { channel: "TikTok", spend: 7800, revenue: 28900, roas: 3.7 },
  { channel: "Email", spend: 1900, revenue: 41200, roas: 21.7 },
  { channel: "SEO / Organic", spend: 4200, revenue: 78400, roas: 18.7 },
];

export const audienceGrowth = revenueSeries.map((d, i) => ({
  name: d.name,
  followers: 12_000 + i * 1_800 + Math.round(Math.random() * 500),
  subscribers: 4_200 + i * 720 + Math.round(Math.random() * 280),
}));

export const topCampaigns = [
  { id: "C-1041", name: "Spring Launch — Search", channel: "Google Ads", impressions: 482_100, ctr: 4.8, conv: 6.2, roas: 5.4, status: "active" },
  { id: "C-1042", name: "Brand Awareness Reels", channel: "Meta Ads", impressions: 1_204_800, ctr: 2.1, conv: 1.4, roas: 2.8, status: "active" },
  { id: "C-1043", name: "Webinar Funnel — Leads", channel: "LinkedIn", impressions: 96_400, ctr: 3.4, conv: 8.1, roas: 4.6, status: "active" },
  { id: "C-1044", name: "Retargeting — Cart 7d", channel: "Meta Ads", impressions: 218_900, ctr: 6.7, conv: 11.2, roas: 7.1, status: "active" },
  { id: "C-1045", name: "Newsletter — Weekly Drop", channel: "Email", impressions: 84_300, ctr: 12.4, conv: 4.8, roas: 19.2, status: "paused" },
  { id: "C-1046", name: "TikTok Creator Push", channel: "TikTok", impressions: 612_800, ctr: 3.9, conv: 2.6, roas: 3.7, status: "active" },
];

