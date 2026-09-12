import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { Order, Product, User } from "@/lib/db/models";
import { toOrderSummary } from "@/features/orders/queries";

const LIVE_STATUSES = ["confirmed", "packed", "shipped", "delivered"];

export type DashboardKpis = {
  revenue30d: number;
  revenuePrev30d: number;
  orders30d: number;
  ordersPrev30d: number;
  aov30d: number;
  lowStockCount: number;
  customers: number;
  pendingFulfilment: number;
};

export type RevenuePoint = { date: string; revenue: number; orders: number };
export type TopProduct = { title: string; slug: string; image: string; qty: number; revenue: number };
export type LowStockRow = { productId: string; title: string; sku: string; stock: number };

async function periodStats(from: Date, to: Date) {
  const [row] = await Order.aggregate<{ revenue: number; orders: number }>([
    { $match: { status: { $in: LIVE_STATUSES }, createdAt: { $gte: from, $lt: to } } },
    { $group: { _id: null, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
  ]);
  return { revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  await connectDb();
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86_400_000);
  const d60 = new Date(now.getTime() - 60 * 86_400_000);

  const [current, previous, lowStockCount, customers, pendingFulfilment] = await Promise.all([
    periodStats(d30, now),
    periodStats(d60, d30),
    Product.countDocuments({ status: "active", variants: { $elemMatch: { stock: { $lte: 5 } } } }),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments({ status: { $in: ["confirmed", "packed"] } }),
  ]);

  return {
    revenue30d: current.revenue,
    revenuePrev30d: previous.revenue,
    orders30d: current.orders,
    ordersPrev30d: previous.orders,
    aov30d: current.orders ? Math.round(current.revenue / current.orders) : 0,
    lowStockCount,
    customers,
    pendingFulfilment,
  };
}

export async function getRevenueSeries(days = 30): Promise<RevenuePoint[]> {
  await connectDb();
  const from = new Date(Date.now() - (days - 1) * 86_400_000);
  from.setHours(0, 0, 0, 0);
  const rows = await Order.aggregate<{ _id: string; revenue: number; orders: number }>([
    { $match: { status: { $in: LIVE_STATUSES }, createdAt: { $gte: from } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } }, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(from.getTime() + i * 86_400_000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return { date: key, revenue: byDay.get(key)?.revenue ?? 0, orders: byDay.get(key)?.orders ?? 0 };
  });
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  await connectDb();
  return Order.aggregate<TopProduct>([
    { $match: { status: { $in: LIVE_STATUSES } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", title: { $first: "$items.title" }, slug: { $first: "$items.slug" }, image: { $first: "$items.image" }, qty: { $sum: "$items.qty" }, revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $project: { _id: 0 } },
  ]);
}

export async function getLowStock(limit = 8): Promise<LowStockRow[]> {
  await connectDb();
  return Product.aggregate<LowStockRow>([
    { $match: { status: "active" } },
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: 5 } } },
    { $sort: { "variants.stock": 1 } },
    { $limit: limit },
    { $project: { _id: 0, productId: { $toString: "$_id" }, title: 1, sku: "$variants.sku", stock: "$variants.stock" } },
  ]);
}

export async function getRecentOrders(limit = 6) {
  await connectDb();
  const docs = await Order.find({ status: { $ne: "pending" } }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((d) => toOrderSummary(d as Parameters<typeof toOrderSummary>[0]));
}
