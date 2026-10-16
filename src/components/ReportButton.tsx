"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { fileReport, type ReportState } from "@/lib/report-actions";
import { reportCategories, type ReportTarget } from "@/lib/reports";
import { fieldClass, primaryButtonClass } from "./form-styles";
import { useT } from "./LangProvider";
import { PendingCorner } from "./Pending";

// "⚑ Report" link that opens a short form: what's wrong, plus optional details.
export function ReportButton({ targetType, targetId, label }: { targetType: ReportTarget; targetId: string; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ReportState, FormData>(fileReport, {});
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-danger hover:underline"
      >
        <span aria-hidden>⚑</span> {label ?? t("Report", "ሪፖርት ያድርጉ")}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-label={t("Report", "ሪፖርት")}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/70"
      >
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold">{label ?? t("Report", "ሪፖርት ያድርጉ")}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("Close", "ዝጋ")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-brand-soft"
            >
              ✕
            </button>
          </div>

          {state.sent ? (
            <div role="status" className="space-y-3">
              <p className="font-semibold">{t("Thank you. We'll look into it.", "እናመሰግናለን። እንመለከተዋለን።")}</p>
              <p className="text-sm text-muted">
                {t(
                  "A person reviews every report, usually within a day. The other person isn't told who reported them.",
                  "እያንዳንዱ ሪፖርት በሰው ይገመገማል፤ ብዙውን ጊዜ በአንድ ቀን ውስጥ። ሪፖርት የተደረገበት ሰው ማን እንደዘገበው አይነገረውም።",
                )}
              </p>
              <button type="button" onClick={() => setOpen(false)} className={primaryButtonClass}>
                {t("Done", "ተጠናቋል")}
              </button>
            </div>
          ) : state.signedOut ? (
            <div className="space-y-3">
              <p className="text-sm">{t("Please sign in to send a report.", "ሪፖርት ለመላክ እባክዎ ይግቡ።")}</p>
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={`${primaryButtonClass} block text-center`}>
                {t("Sign in", "ይግቡ")}
              </Link>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="targetType" value={targetType} />
              <input type="hidden" name="targetId" value={targetId} />
              <fieldset className="space-y-1">
                <legend className="mb-1 text-sm font-medium">{t("What's wrong?", "ችግሩ ምንድን ነው?")}</legend>
                {reportCategories.map((c) => (
                  <label key={c.value} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                    <input type="radio" name="category" value={c.value} required className="h-5 w-5 shrink-0 accent-brand" />
                    {t(c.label, c.labelAm)}
                  </label>
                ))}
              </fieldset>
              <label className="block space-y-1 text-sm font-medium">
                <span>{t("Details (optional)", "ዝርዝር (ካለ)")}</span>
                <textarea name="details" rows={3} maxLength={900} className={fieldClass} />
              </label>
              {state.error && (
                <p role="alert" className="text-sm text-danger">
                  {state.error}
                </p>
              )}
              <button disabled={pending} className={primaryButtonClass}>
                <PendingCorner pending={pending} />
                {pending ? t("Sending…", "በመላክ ላይ…") : t("Send report", "ሪፖርት ይላኩ")}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
