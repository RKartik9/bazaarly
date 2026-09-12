import "server-only";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/db/enums";
import { connectDb } from "@/lib/db/mongoose";
import { Order, User } from "@/lib/db/models";
import { toOrderDto } from "@/features/orders/queries";
import type { OrderDto } from "@/features/orders/types";
import { ORDER_PAGE_SIZE, type AdminOrderParams } from "./search-params";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  city: string;
  createdAt: string;
};

export type AdminOrderPage = { rows: AdminOrderRow[]; total: number; totalPages: number; page: number };

export async function listAdminOrders(params: AdminOrderParams): Promise<AdminOrderPage> {
  await connectDb();
  const filter: Record<string, unknown> = {};
  if (params.status !== "all") filter.status = params.status;
  if (params.payment !== "all") filter["payment.method"] = params.payment;
  if (params.q) {
    const q = params.q.trim();
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({ $or: [{ email: rx }, { name: rx }] }, { _id: 1 }).limit(50).lean();
    filter.$or = [{ orderNumber: rx }, { "address.fullName": rx }, { "address.phone": rx }, { userId: { $in: users.map((u) => u._id) } }];
  }

  const total = await Order.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / ORDER_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), totalPages);

  const docs = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * ORDER_PAGE_SIZE)
    .limit(ORDER_PAGE_SIZE)
    .populate<{ userId: { name: string; email: string } | null }>("userId", "name email")
    .lean();

  const rows = docs.map((d) => ({
    id: d._id.toString(),
    orderNumber: d.orderNumber,
    customer: { name: d.userId?.name || d.address.fullName, email: d.userId?.email ?? "" },
    itemCount: d.items.reduce((s, i) => s + i.qty, 0),
    total: d.pricing.total,
    status: d.status as OrderStatus,
    paymentMethod: d.payment.method as PaymentMethod,
    paymentStatus: d.payment.status as PaymentStatus,
    city: d.address.city,
    createdAt: d.createdAt.toISOString(),
  }));

  return { rows, total, totalPages, page };
}

export async function getOrderStatusCounts() {
  await connectDb();
  const rows = await Order.aggregate<{ _id: OrderStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const counts: Record<string, number> = { all: 0 };
  for (const r of rows) {
    counts[r._id] = r.count;
    counts.all += r.count;
  }
  return counts;
}

export type AdminOrderDetail = OrderDto & { customer: { id: string; name: string; email: string; phone: string } | null };

export async function getAdminOrder(orderNumber: string): Promise<AdminOrderDetail | null> {
  await connectDb();
  const doc = await Order.findOne({ orderNumber }).lean<Parameters<typeof toOrderDto>[0]>();
  if (!doc) return null;
  const user = await User.findById(doc.userId).lean();
  return {
    ...toOrderDto(doc),
    customer: user ? { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone } : null,
  };
}
