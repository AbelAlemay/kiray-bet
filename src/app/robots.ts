import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/auth";

// Open to search engines since launch (Oct 17, 2026). NEXT_PUBLIC_ALLOW_INDEXING=off
// closes the whole site to them again.
// Private pages are never indexed.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === "off") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/messages", "/saved", "/listings/mine", "/listings/new", "/login", "/agree", "/auth"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
