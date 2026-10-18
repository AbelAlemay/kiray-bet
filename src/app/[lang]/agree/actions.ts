"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { termsVersion } from "@/lib/site";
import { createServerSupabase } from "@/lib/supabase/server";

// Records that the signed-in person agreed to the current Terms, then continues.
export async function agreeToTerms(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (formData.get("agree") !== "on") redirect(`/agree?next=${encodeURIComponent(next)}`);
  const supabase = await createServerSupabase();
  await supabase.rpc("accept_terms", { version: termsVersion });
  redirect(next);
}
