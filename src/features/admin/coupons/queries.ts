import "server-only";
import type { CouponType } from "@/lib/db/enums";
import { connectDb } from "@/lib/db/mongoose";
import { Coupon } from "@/lib/db/models";

export type AdminCouponRow = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  state: "active" | "scheduled" | "expired" | "exhausted" | "paused";
};

function stateOf(c: { isActive: boolean; startsAt?: Date | null; expiresAt?: Date | null; usageLimit?: number | null; usedCount: number }): AdminCouponRow["state"] {
  const now = Date.now();
  if (!c.isActive) return "paused";
  if (c.expiresAt && c.expiresAt.getTime() < now) return "expired";
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return "exhausted";
  if (c.startsAt && c.startsAt.getTime() > now) return "scheduled";
  return "active";
}

export async function listAdminCoupons(): Promise<AdminCouponRow[]> {
  await connectDb();
  const docs = await Coupon.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: d._id.toString(),
    code: d.code,
    description: d.description,
    type: d.type as CouponType,
    value: d.value,
    minOrder: d.minOrder,
    maxDiscount: d.maxDiscount ?? null,
    usageLimit: d.usageLimit ?? null,
    perUserLimit: d.perUserLimit,
    usedCount: d.usedCount,
    startsAt: d.startsAt ? d.startsAt.toISOString() : "",
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : "",
    isActive: d.isActive,
    state: stateOf(d),
  }));
}
