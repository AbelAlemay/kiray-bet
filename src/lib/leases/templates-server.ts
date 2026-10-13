import "server-only";
import type { ListingType } from "../site";
import { createServerSupabase } from "../supabase/server";
import { defaultLeaseTemplates } from "./templates";

export type LeaseTemplate = {
  type: ListingType;
  body: string;
  // 0 = the built-in KirayBet draft.
  version: number;
  lawyerReviewed: boolean;
  reviewNote: string | null;
  createdAt: string | null;
};

// The newest saved version for this home type, or the built-in draft if none.
export async function getLeaseTemplate(type: ListingType): Promise<LeaseTemplate> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("lease_templates")
    .select("body, version, lawyer_reviewed, review_note, created_at")
    .eq("listing_type", type)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) {
    return {
      type,
      body: data.body,
      version: data.version,
      lawyerReviewed: data.lawyer_reviewed,
      reviewNote: data.review_note,
      createdAt: data.created_at,
    };
  }
  return { type, body: defaultLeaseTemplates[type], version: 0, lawyerReviewed: false, reviewNote: null, createdAt: null };
}

export async function getLeaseVersions(type: ListingType) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("lease_templates")
    .select("version, lawyer_reviewed, review_note, created_at")
    .eq("listing_type", type)
    .order("version", { ascending: false })
    .limit(50);
  return data ?? [];
}
