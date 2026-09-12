import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #fbf7ef 0%, #ffe1d6 55%, #ffd166 100%)",
        color: "#1f1a17",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: "#e8552e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 34, fontWeight: 800 }}>B</div>
        <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>{siteConfig.name}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <span style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{siteConfig.tagline}.</span>
        <span style={{ fontSize: 30, opacity: 0.75, maxWidth: 900 }}>Electronics, fashion, home, beauty and more — fast delivery across India, easy returns, secure payments.</span>
      </div>
    </div>,
    size,
  );
}
