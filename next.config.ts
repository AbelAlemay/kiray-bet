import type { NextConfig } from "next";

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : "";
const dev = process.env.NODE_ENV !== "production";

// What browsers may load on our pages: our own files plus the three outside services
// (Supabase for data, photos and live chat; Cloudflare's bot check; OpenStreetMap
// tiles). Anything else, e.g. a script injected through a bug, is blocked.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://tile.openstreetmap.org https://${supabase}`,
  "font-src 'self' data:",
  `connect-src 'self' https://${supabase} wss://${supabase} https://challenges.cloudflare.com${dev ? " ws:" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' https://${supabase} https://accounts.google.com`,
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // No other site may show our pages inside a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only "kiraybet.org", never the page or its search filters.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /* config options here */
  cacheComponents: true,
  // Development only: let phones on the home Wi-Fi (http://10.0.0.x:3000) load the dev
  // server's scripts. Without this, buttons that need JavaScript do nothing on the phone.
  allowedDevOrigins: ["10.0.0.*"],
  images: {
    // Listing photos: signed links from the private Supabase bucket. `search` is left
    // open because each link carries its access token as ?token=...
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/sign/listing-photos/**",
          },
        ]
      : [],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
