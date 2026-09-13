"use server";

import { after } from "next/server";
import { ContactMessage } from "@/lib/db/models";
import { sendEmail } from "@/lib/email/client";
import { actionClient } from "@/lib/safe-action";
import { siteConfig } from "@/lib/site";
import { ContactNotificationEmail } from "./contact-email";
import { contactSchema } from "./schemas";

export const contactAction = actionClient
  .metadata({ name: "help.contact", limit: "contact" })
  .inputSchema(contactSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.website) return { ticketId: "ok" };

    const { website: _honeypot, ...data } = parsedInput;
    const ticket = await ContactMessage.create({
      ...data,
      orderNumber: data.orderNumber || null,
      userId: ctx.user?.id ?? null,
    });
    const ticketId = ticket._id.toString().slice(-8).toUpperCase();

    after(async () => {
      try {
        await sendEmail({
          to: siteConfig.support.email,
          subject: `[${ticketId}] ${data.name}: ${data.topic}${data.orderNumber ? ` · ${data.orderNumber}` : ""}`,
          body: ContactNotificationEmail({ data: parsedInput, ticketId }),
        });
      } catch (error) {
        console.error("[help.contact] notification failed", error);
      }
    });

    return { ticketId };
  });
