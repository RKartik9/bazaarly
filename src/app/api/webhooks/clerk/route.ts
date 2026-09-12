import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse, type NextRequest } from "next/server";
import { connectDb } from "@/lib/db/mongoose";
import { User, WebhookEvent } from "@/lib/db/models";
import { adminEmails } from "@/lib/env";

export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDb();

  const eventId = req.headers.get("svix-id") ?? `${event.type}:${event.data.id}`;
  try {
    await WebhookEvent.create({ provider: "clerk", eventId, type: event.type });
  } catch {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const data = event.data;
    const email =
      data.email_addresses.find((e) => e.id === data.primary_email_address_id)?.email_address ??
      data.email_addresses[0]?.email_address ??
      "";
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        $set: { email, name, imageUrl: data.image_url ?? "", ...(isAdminEmail ? { role: "admin" } : {}) },
        $setOnInsert: { clerkId: data.id, role: isAdminEmail ? "admin" : "customer" },
      },
      { upsert: true },
    );
  }

  if (event.type === "user.deleted" && event.data.id) {
    await User.deleteOne({ clerkId: event.data.id });
  }

  return NextResponse.json({ ok: true });
}
