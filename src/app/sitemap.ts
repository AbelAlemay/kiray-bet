import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { siteUrl } from "@/lib/auth";
import { createPublicClient } from "@/lib/supabase/public";

// Public pages and every live listing, for search engines (used once indexing is on).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  const base = siteUrl();
  const pages = ["", "/search", "/about", "/safety", "/contact", "/terms", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/search" ? ("daily" as const) : ("monthly" as const),
  }));
  const supabase = createPublicClient();
  const { data } = supabase
    ? await supabase.from("listings").select("id, updated_at").eq("status", "active").limit(5000)
    : { data: [] };
  return [
    ...pages,
    ...(data ?? []).map((l) => ({ url: `${base}/listings/${l.id}`, lastModified: l.updated_at, changeFrequency: "weekly" as const })),
  ];
}
