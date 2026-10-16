import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/auth";

// Search engines stay out until launch (NEXT_PUBLIC_ALLOW_INDEXING=on in Vercel).
// Private pages are never indexed.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "on") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/messages", "/saved", "/listings/mine", "/listings/new", "/login", "/auth"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
