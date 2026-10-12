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

// Every admin action returns to the tab it came from.
function back(formData: FormData, done: string): never {
  const tab = String(formData.get("tab") ?? "review");
  redirect(`/admin?tab=${encodeURIComponent(tab)}&done=${done}`);
}

function note(formData: FormData) {
  return String(formData.get("note") ?? "").trim().slice(0, 500);
}

// Approve a pending listing, or put a rejected one live.
export async function approveListing(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  await supabase
    .from("listings")
    .update({ status: "active", review_note: null })
    .eq("id", String(formData.get("listingId")))
    .in("status", ["pending", "rejected"]);
  updateTag("listings");
  back(formData, "approved");
}

// Reject a pending listing, or take down a live/rented one. The host sees the note.
export async function rejectListing(formData: FormData) {
  await requireAdmin();
  const reason = note(formData);
  if (!reason) back(formData, "note-missing");
  const supabase = await createServerSupabase();
  await supabase
    .from("listings")
    .update({ status: "rejected", review_note: reason })
    .eq("id", String(formData.get("listingId")));
  updateTag("listings");
  back(formData, "rejected");
}

export async function deleteListingAsAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("listingId"));
  const supabase = await createServerSupabase();
  const { data: photos } = await supabase.from("listing_photos").select("path").eq("listing_id", id);
  if (photos?.length) await supabase.storage.from("listing-photos").remove(photos.map((p) => p.path));
  await supabase.from("listings").delete().eq("id", id);
  updateTag("listings");
  back(formData, "deleted");
}

// Banning blocks posting and messaging, and takes the user's listings down.
export async function setBanned(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId"));
  const banned = formData.get("banned") === "true";
  if (userId === admin.id) back(formData, "self");

  const supabase = await createServerSupabase();
  await supabase.from("private_profiles").update({ banned }).eq("user_id", userId);
  if (banned) {
    await supabase
      .from("listings")
      .update({ status: "rejected", review_note: note(formData) || "Account suspended." })
      .eq("host_id", userId)
      .in("status", ["pending", "active", "rented"]);
    updateTag("listings");
  }
  back(formData, banned ? "banned" : "unbanned");
}
