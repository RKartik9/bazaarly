const isDev = process.env.NODE_ENV !== "production";

const clerkHosts = "https://*.clerk.accounts.dev https://*.clerk.com https://clerk.com";
const razorpayHosts = "https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${clerkHosts} ${razorpayHosts} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://img.clerk.com https://*.razorpay.com",
  `connect-src 'self' ${clerkHosts} ${razorpayHosts} https://lumberjack.razorpay.com https://api.cloudinary.com https://clerk-telemetry.com${isDev ? " ws: wss:" : ""}`,
  `frame-src ${razorpayHosts} https://challenges.cloudflare.com ${clerkHosts}`,
  "worker-src 'self' blob:",
  "form-action 'self' https://*.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];
