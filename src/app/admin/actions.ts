"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

// Admin actions. The database checks again that the user is an admin who confirmed
// this session with an authenticator app; these checks just fail early and clearly.

async function requireAdmin({ twoStep = true } = {}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin" || (twoStep && !user.twoStepVerified)) redirect("/admin");
  return user;
}

export type TwoStepState =
  | { step: "start"; error?: string }
  | { step: "scan"; factorId: string; qr: string; secret: string; error?: string }
  | { step: "verify"; factorId: string; error?: string };

// Setting up and using two-step login (authenticator app, e.g. Google Authenticator).
export async function twoStep(prev: TwoStepState, formData: FormData): Promise<TwoStepState> {
  await requireAdmin({ twoStep: false });
  const supabase = await createServerSupabase();

  if (formData.get("intent") === "enroll") {
    // Clear any half-finished setup first.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) {
      if (f.factor_type === "totp" && f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "KirayBet admin" });
    if (error) return { step: "start", error: "Couldn't start setup. Please try again." };
    return { step: "scan", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
  }

  if (prev.step === "start") return prev;
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ...prev, error: "Enter the 6-digit code from your app." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: prev.factorId, code });
  if (error) return { ...prev, error: "That code didn't work. Codes change every 30 seconds; try the current one." };
  redirect("/admin");
}

export async function approveListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("listingId") ?? "");
  const supabase = await createServerSupabase();
  await supabase.from("listings").update({ status: "active", review_note: null }).eq("id", id).eq("status", "pending");
  updateTag("listings");
  redirect("/admin?done=approved");
}

export async function rejectListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("listingId") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!note) redirect(`/admin?error=note#${id}`);
  const supabase = await createServerSupabase();
  await supabase.from("listings").update({ status: "rejected", review_note: note }).eq("id", id).eq("status", "pending");
  updateTag("listings");
  redirect("/admin?done=rejected");
}
