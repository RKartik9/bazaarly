import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/lib/site";

export type OrderEmailData = {
  orderNumber: string;
  name: string;
  items: { title: string; qty: number; price: number; attributes: Record<string, string> }[];
  total: number;
  paymentMethod: "cod" | "razorpay";
  expectedDelivery: string | null;
  address: string[];
};

const font = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function OrderConfirmationEmail({ data }: { data: OrderEmailData }) {
  const orderUrl = `${siteConfig.url}/account/orders/${data.orderNumber}`;

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fbf7ef", fontFamily: font, color: "#1f1a17" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: "32px 12px" }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="560" cellPadding={0} cellSpacing={0} style={{ background: "#ffffff", borderRadius: 24, overflow: "hidden" }}>
                  <tbody>
                    <tr>
                      <td style={{ background: "#e8552e", color: "#fff", padding: "28px 32px", fontSize: 22, fontWeight: 800 }}>{siteConfig.name}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "32px 32px 8px" }}>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Thanks, {data.name.split(" ")[0] || "there"}! Your order is confirmed.</h1>
                        <p style={{ margin: "10px 0 0", color: "#6b625c", fontSize: 15 }}>
                          Order <strong>#{data.orderNumber}</strong>
                          {data.expectedDelivery && <> · arriving by <strong>{data.expectedDelivery}</strong></>}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "16px 32px" }}>
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderTop: "1px solid #eee" }}>
                          <tbody>
                            {data.items.map((item, i) => (
                              <tr key={i}>
                                <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: 14 }}>
                                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                                  <div style={{ color: "#6b625c", fontSize: 12 }}>
                                    {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                                    {Object.keys(item.attributes).length > 0 && " · "}Qty {item.qty}
                                  </div>
                                </td>
                                <td align="right" style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: 14, fontWeight: 600 }}>
                                  {formatPrice(item.price * item.qty)}
                                </td>
                              </tr>
                            ))}
                            <tr>
                              <td style={{ padding: "14px 0", fontSize: 16, fontWeight: 800 }}>Total {data.paymentMethod === "cod" ? "(pay on delivery)" : "(paid)"}</td>
                              <td align="right" style={{ padding: "14px 0", fontSize: 16, fontWeight: 800 }}>{formatPrice(data.total)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0 32px 24px", fontSize: 14, color: "#6b625c" }}>
                        <div style={{ fontWeight: 700, color: "#1f1a17", marginBottom: 4 }}>Delivering to</div>
                        {data.address.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0 32px 36px" }}>
                        <a href={orderUrl} style={{ display: "inline-block", background: "#1f1a17", color: "#fff", padding: "12px 22px", borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                          Track your order
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ color: "#9a918b", fontSize: 12, marginTop: 20 }}>
                  Questions? Reply to this email or reach us at {siteConfig.support.email}.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
