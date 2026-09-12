export const siteConfig = {
  name: "Bazaarly",
  tagline: "Everything you love, delivered",
  description:
    "Shop electronics, fashion, home, beauty, sports and more with fast delivery across India, easy returns and secure payments.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  currency: "INR",
  locale: "en-IN",
  freeShippingThreshold: 999,
  standardShippingFee: 79,
  expressShippingFee: 149,
  codFee: 49,
  taxRate: 0,
  support: {
    email: "care@bazaarly.in",
    phone: "1800-123-4567",
  },
} as const;
