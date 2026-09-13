import { siteConfig } from "@/lib/site";
import { CONTACT_TOPIC_LABEL } from "./content";
import type { ContactInput } from "./schemas";

const font = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function ContactNotificationEmail({ data, ticketId }: { data: ContactInput; ticketId: string }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fbf7ef", fontFamily: font, color: "#1f1a17", padding: 24 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: 20, padding: 28 }}>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#e8552e", fontWeight: 700 }}>{siteConfig.name} support</p>
          <h1 style={{ margin: "8px 0 16px", fontSize: 22 }}>{CONTACT_TOPIC_LABEL[data.topic]}</h1>
          <p style={{ margin: "0 0 6px" }}>
            <strong>{data.name}</strong> · <a href={`mailto:${data.email}`}>{data.email}</a>
          </p>
          {data.orderNumber && <p style={{ margin: "0 0 6px" }}>Order: {data.orderNumber}</p>}
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "#7a716b" }}>Ticket {ticketId}</p>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{data.message}</p>
        </div>
      </body>
    </html>
  );
}
