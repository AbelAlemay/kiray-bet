"use server";

import { after } from "next/server";
import { getCurrentUser } from "./auth";
import { getActionT } from "./i18n-server";
import { notifyAdmin } from "./notify";
import { reportCategories, type ReportCategory, type ReportTarget } from "./reports";
import { createServerSupabase } from "./supabase/server";

export type ReportState = { sent?: boolean; error?: string; signedOut?: boolean };

// Files a report as the signed-in user. The database decides what may be reported
// (a live listing, or the reporter's own conversation) and limits duplicates and volume.
export async function fileReport(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const t = await getActionT();
  const user = await getCurrentUser();
  if (!user) return { signedOut: true };

  const targetType = formData.get("targetType") as ReportTarget;
  const targetId = String(formData.get("targetId") ?? "");
  const category = reportCategories.find((c) => c.value === formData.get("category"))?.value as ReportCategory | undefined;
  const details = String(formData.get("details") ?? "").trim().slice(0, 900);
  if (!["listing", "conversation"].includes(targetType) || !/^[0-9a-f-]{36}$/i.test(targetId)) {
    return { error: t("Something went wrong. Please reload the page.", "ችግር ተፈጥሯል። እባክዎ ገጹን ያድሱ።") };
  }
  if (!category) return { error: t("Choose what's wrong.", "ችግሩ ምን እንደሆነ ይምረጡ።") };
  const label = reportCategories.find((c) => c.value === category)!.label;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reporter_id: user.id,
    category,
    reason: details.length >= 5 ? details : label,
  });
  if (error) {
    // Already reported and still open: tell them it's on its way rather than failing.
    if (error.code === "23505") return { sent: true };
    if (error.message.includes("Too many reports")) {
      return { error: t("You've sent many reports today. Please try again tomorrow.", "ዛሬ ብዙ ሪፖርቶችን ልከዋል። እባክዎ ነገ እንደገና ይሞክሩ።") };
    }
    return { error: t("Your report couldn't be sent. Please try again.", "ሪፖርትዎ መላክ አልቻለም። እባክዎ እንደገና ይሞክሩ።") };
  }

  after(() =>
    notifyAdmin({
      subject: `Report: ${label} (${targetType})`,
      lines: [details || "(no details)", `From: ${user.name ?? "a user"}`],
      link: "/admin?tab=reports",
    }),
  );
  return { sent: true };
}
