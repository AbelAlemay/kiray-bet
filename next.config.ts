import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
