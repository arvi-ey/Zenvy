// Sample dummy data powering the dashboard demo. Swap with real API later.

export const revenueSeries = [
  { name: "Jan", revenue: 12400, orders: 240 },
  { name: "Feb", revenue: 15600, orders: 310 },
  { name: "Mar", revenue: 18900, orders: 360 },
  { name: "Apr", revenue: 17200, orders: 340 },
  { name: "May", revenue: 22300, orders: 410 },
  { name: "Jun", revenue: 26800, orders: 480 },
  { name: "Jul", revenue: 31200, orders: 540 },
  { name: "Aug", revenue: 29400, orders: 520 },
  { name: "Sep", revenue: 34800, orders: 610 },
  { name: "Oct", revenue: 38600, orders: 670 },
  { name: "Nov", revenue: 42100, orders: 720 },
  { name: "Dec", revenue: 47900, orders: 810 },
];

export const categoryShare = [
  { name: "Apparel", value: 38 },
  { name: "Tech", value: 28 },
  { name: "Home", value: 18 },
  { name: "Beauty", value: 16 },
];

export const recentOrders = [
  { id: "ORD-10293", customer: "Amelia Park", total: 248.0, status: "Paid", date: "2025-05-09" },
  { id: "ORD-10292", customer: "Noah Bennett", total: 89.5, status: "Pending", date: "2025-05-09" },
  { id: "ORD-10291", customer: "Sofia Reyes", total: 412.75, status: "Paid", date: "2025-05-08" },
  { id: "ORD-10290", customer: "Liam Carter", total: 156.0, status: "Refunded", date: "2025-05-08" },
  { id: "ORD-10289", customer: "Mia Tanaka", total: 1320.0, status: "Paid", date: "2025-05-07" },
  { id: "ORD-10288", customer: "Ethan Wright", total: 64.99, status: "Pending", date: "2025-05-07" },
];

export const products = Array.from({ length: 28 }).map((_, i) => ({
  id: `PRD-${1000 + i}`,
  name: [
    "Aurora Linen Shirt", "Nimbus Wireless Buds", "Halcyon Wool Throw", "Velvet Matte Lipstick",
    "Cirrus Sneakers", "Obsidian Smartwatch", "Lumen Desk Lamp", "Mira Silk Scarf",
  ][i % 8],
  category: ["Apparel", "Tech", "Home", "Beauty"][i % 4],
  price: 29 + ((i * 13) % 400),
  stock: 5 + ((i * 7) % 90),
  status: i % 5 === 0 ? "Draft" : "Active",
  sold: 20 + ((i * 11) % 500),
}));

export const orders = Array.from({ length: 36 }).map((_, i) => ({
  id: `ORD-${10250 + i}`,
  customer: ["Amelia Park", "Noah Bennett", "Sofia Reyes", "Liam Carter", "Mia Tanaka", "Ethan Wright"][i % 6],
  email: "customer@luxe.com",
  total: 40 + ((i * 37) % 1500),
  payment: i % 4 === 0 ? "Pending" : "Paid",
  status: ["Processing", "Shipped", "Delivered", "Cancelled"][i % 4],
  date: `2025-05-${String(((i * 3) % 28) + 1).padStart(2, "0")}`,
}));

export const deliveries = Array.from({ length: 24 }).map((_, i) => ({
  id: `DLV-${5000 + i}`,
  order: `ORD-${10250 + i}`,
  driver: ["Marcus T.", "Helena V.", "Diego R.", "Yuki S."][i % 4],
  destination: ["New York, US", "Berlin, DE", "Tokyo, JP", "Lagos, NG", "São Paulo, BR"][i % 5],
  eta: `${1 + (i % 6)}d`,
  status: ["Delivered", "In Transit", "Pending", "Cancelled"][i % 4],
}));

export const users = Array.from({ length: 30 }).map((_, i) => ({
  id: `USR-${800 + i}`,
  name: ["Amelia Park", "Noah Bennett", "Sofia Reyes", "Liam Carter", "Mia Tanaka", "Ethan Wright"][i % 6],
  email: `user${i}@luxe.com`,
  role: i % 7 === 0 ? "Admin" : i % 3 === 0 ? "Editor" : "Customer",
  status: i % 9 === 0 ? "Banned" : "Active",
  joined: `2024-${String(((i * 2) % 12) + 1).padStart(2, "0")}-12`,
  orders: (i * 5) % 60,
}));

export const notifications = Array.from({ length: 18 }).map((_, i) => ({
  id: `NTF-${300 + i}`,
  title: ["Flash Sale Live", "New Order Received", "Inventory Low", "Refund Processed", "Welcome Email"][i % 5],
  channel: ["Push", "Email", "In-app"][i % 3],
  audience: ["All users", "Customers", "Admins"][i % 3],
  status: ["Sent", "Scheduled", "Draft"][i % 3],
  date: `2025-05-${String(((i * 2) % 28) + 1).padStart(2, "0")}`,
}));
