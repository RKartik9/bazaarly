import "server-only";
import { User, type OrderDoc } from "@/lib/db/models";
import { formatDeliveryDate } from "@/lib/shipping";
import { emailConfigured, sendEmail } from "./client";
import { OrderConfirmationEmail, type OrderEmailData } from "./order-confirmation";

export async function sendOrderConfirmation(order: OrderDoc) {
  if (!emailConfigured) return;
  const user = await User.findById(order.userId, { email: 1, name: 1 }).lean();
  if (!user?.email) return;

  const data: OrderEmailData = {
    orderNumber: order.orderNumber,
    name: user.name || order.address.fullName,
    items: order.items.map((i) => ({ title: i.title, qty: i.qty, price: i.price, attributes: i.attributes ?? {} })),
    total: order.pricing.total,
    paymentMethod: order.payment.method as OrderEmailData["paymentMethod"],
    expectedDelivery: order.expectedDelivery ? formatDeliveryDate(order.expectedDelivery) : null,
    address: [
      order.address.fullName,
      ...[order.address.line1, order.address.line2, order.address.landmark].filter(Boolean),
      `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
      `Phone: ${order.address.phone}`,
    ],
  };

  try {
    await sendEmail({ to: user.email, subject: `Order #${order.orderNumber} confirmed`, body: OrderConfirmationEmail({ data }) });
  } catch (error) {
    console.error("[email:order-confirmation]", error);
  }
}
