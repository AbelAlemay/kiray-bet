"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { site, type ListingType } from "@/lib/site";
import { createServerSupabase } from "@/lib/supabase/server";

export type SaveLeaseState = { error?: string };

// Saves the edited template as a new version (old versions are kept).
export async function saveLeaseTemplate(_prev: SaveLeaseState, formData: FormData): Promise<SaveLeaseState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin" || !user.twoStepVerified) return { error: "Admins only (with two-step login)." };

  const type = site.listingTypes.find((t) => t.value === formData.get("type"))?.value as ListingType | undefined;
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  const reviewed = formData.get("lawyer_reviewed") === "on";
  const note = String(formData.get("review_note") ?? "").trim().slice(0, 300);
  if (!type) return { error: "Unknown lease type." };
  if (body.length < 100) return { error: "The agreement text looks too short." };
  if (reviewed && !note) return { error: "Add who reviewed it and when, e.g. “Reviewed by Jane Doe, Esq., Nov 2026”." };

  const supabase = await createServerSupabase();
  const { data: latest } = await supabase
    .from("lease_templates")
    .select("version")
    .eq("listing_type", type)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("lease_templates").insert({
    listing_type: type,
    version: (latest?.version ?? 0) + 1,
    body,
    lawyer_reviewed: reviewed,
    review_note: note || null,
    created_by: user.id,
  });
  if (error) return { error: `Couldn't save: ${error.message}` };
  redirect(`/admin/leases/${type}?saved=1`);
}
