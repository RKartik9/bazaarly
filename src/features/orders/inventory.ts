import "server-only";
import { Order, Product, type OrderDoc } from "@/lib/db/models";
import { AppError } from "@/lib/errors";

type Line = { productId: string; sku: string; qty: number };

export const RESERVATION_TTL_MS = 30 * 60 * 1000;

async function recomputeTotalStock(productId: string) {
  await Product.updateOne({ _id: productId }, [{ $set: { totalStock: { $sum: "$variants.stock" } } }], { updatePipeline: true });
}

export async function reserveStock(lines: Line[]) {
  const reserved: Line[] = [];
  for (const line of lines) {
    const result = await Product.updateOne(
      {
        _id: line.productId,
        status: "active",
        "variants.sku": line.sku,
        $expr: {
          $anyElementTrue: {
            $map: {
              input: "$variants",
              as: "v",
              in: {
                $and: [
                  { $eq: ["$$v.sku", line.sku] },
                  { $gte: [{ $subtract: ["$$v.stock", { $ifNull: ["$$v.reserved", 0] }] }, line.qty] },
                ],
              },
            },
          },
        },
      },
      { $inc: { "variants.$.reserved": line.qty } },
    );
    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      throw new AppError(`Not enough stock for ${line.sku}. Please review your bag.`, 409);
    }
    reserved.push(line);
  }
}

export async function releaseStock(lines: Line[]) {
  await Promise.all(
    lines.map((line) =>
      Product.updateOne({ _id: line.productId, "variants.sku": line.sku }, { $inc: { "variants.$.reserved": -line.qty } }),
    ),
  );
  await Product.updateMany({ "variants.reserved": { $lt: 0 } }, { $set: { "variants.$[v].reserved": 0 } }, { arrayFilters: [{ "v.reserved": { $lt: 0 } }] });
}

export async function commitStock(lines: Line[]) {
  for (const line of lines) {
    await Product.updateOne(
      { _id: line.productId, "variants.sku": line.sku },
      { $inc: { "variants.$.stock": -line.qty, "variants.$.reserved": -line.qty, soldCount: line.qty } },
    );
    await recomputeTotalStock(line.productId);
  }
}

export async function restock(lines: Line[]) {
  for (const line of lines) {
    await Product.updateOne(
      { _id: line.productId, "variants.sku": line.sku },
      { $inc: { "variants.$.stock": line.qty, soldCount: -line.qty } },
    );
    await recomputeTotalStock(line.productId);
  }
}

export function orderLines(order: Pick<OrderDoc, "items">): Line[] {
  return order.items.map((i) => ({ productId: i.product.toString(), sku: i.sku, qty: i.qty }));
}

export async function expireStaleReservations(userId?: string) {
  const cutoff = new Date(Date.now() - RESERVATION_TTL_MS);
  const stale = await Order.find({
    status: "pending",
    "payment.method": "razorpay",
    "payment.status": "pending",
    stockReleased: false,
    createdAt: { $lt: cutoff },
    ...(userId ? { userId } : {}),
  }).limit(50);

  for (const order of stale) {
    await releaseStock(orderLines(order));
    order.status = "cancelled";
    order.stockReleased = true;
    order.cancelReason = "Payment not completed";
    order.timeline.push({ status: "cancelled", note: "Payment window expired", at: new Date() });
    await order.save();
  }
}
