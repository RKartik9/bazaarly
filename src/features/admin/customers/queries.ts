import "server-only";
import type { UserRole } from "@/lib/db/enums";
import { connectDb } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models";
import { CUSTOMER_PAGE_SIZE, type AdminCustomerParams } from "./search-params";

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  phone: string;
  role: UserRole;
  orders: number;
  spend: number;
  lastOrderAt: string | null;
  joinedAt: string;
};

export type AdminCustomerPage = { rows: AdminCustomerRow[]; total: number; totalPages: number; page: number };

const SORT: Record<AdminCustomerParams["sort"], Record<string, 1 | -1>> = {
  recent: { createdAt: -1 },
  spend: { spend: -1, createdAt: -1 },
  orders: { orders: -1, createdAt: -1 },
};

export async function listAdminCustomers(params: AdminCustomerParams): Promise<AdminCustomerPage> {
  await connectDb();
  const match: Record<string, unknown> = {};
  if (params.q) {
    const rx = new RegExp(params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [{ email: rx }, { name: rx }, { phone: rx }];
  }

  const total = await User.countDocuments(match);
  const totalPages = Math.max(1, Math.ceil(total / CUSTOMER_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), totalPages);

  type Row = Omit<AdminCustomerRow, "id" | "lastOrderAt" | "joinedAt"> & { _id: { toString(): string }; lastOrderAt: Date | null; createdAt: Date };

  const rows = await User.aggregate<Row>([
    { $match: match },
    {
      $lookup: {
        from: "orders",
        let: { uid: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$uid"] }, status: { $in: ["confirmed", "packed", "shipped", "delivered"] } } },
          { $group: { _id: null, orders: { $sum: 1 }, spend: { $sum: "$pricing.total" }, lastOrderAt: { $max: "$createdAt" } } },
        ],
        as: "stats",
      },
    },
    { $unwind: { path: "$stats", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        email: 1,
        imageUrl: 1,
        phone: 1,
        role: 1,
        createdAt: 1,
        orders: { $ifNull: ["$stats.orders", 0] },
        spend: { $ifNull: ["$stats.spend", 0] },
        lastOrderAt: { $ifNull: ["$stats.lastOrderAt", null] },
      },
    },
    { $sort: SORT[params.sort] },
    { $skip: (page - 1) * CUSTOMER_PAGE_SIZE },
    { $limit: CUSTOMER_PAGE_SIZE },
  ]);

  return {
    rows: rows.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      email: r.email,
      imageUrl: r.imageUrl,
      phone: r.phone,
      role: r.role,
      orders: r.orders,
      spend: r.spend,
      lastOrderAt: r.lastOrderAt ? r.lastOrderAt.toISOString() : null,
      joinedAt: r.createdAt.toISOString(),
    })),
    total,
    totalPages,
    page,
  };
}
