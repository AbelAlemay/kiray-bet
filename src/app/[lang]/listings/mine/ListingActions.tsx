"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteListing, setRented } from "../actions";
import { FormPending, LinkPending } from "@/components/Pending";
import { useT } from "@/components/LangProvider";

const buttonClass = "relative inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-brand-soft";

export function ListingActions({
  id,
  status,
  leaseAvailable,
}: {
  id: string;
  status: "pending" | "active" | "rejected" | "rented";
  // Lease forms exist only for some states so far (Colorado).
  leaseAvailable: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const t = useT();

  // Delete asks for confirmation right here in the row.
  if (confirming) {
    return (
      <div role="alertdialog" aria-label={t("Confirm delete", "መሰረዙን ያረጋግጡ")} className="space-y-2 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm">
        <p className="font-semibold">{t("Delete this listing and its photos?", "ይህን ማስታወቂያና ፎቶዎቹን ይሰርዙ?")}</p>
        <p className="text-muted">{t("This can't be undone.", "ይህ ሊመለስ አይችልም።")}</p>
        <div className="flex gap-2">
          <form action={deleteListing}>
            <input type="hidden" name="listingId" value={id} />
            <button className="relative min-h-10 rounded-lg bg-danger px-3 font-semibold text-white hover:opacity-90">
              <FormPending />
              {t("Yes, delete", "አዎ፣ ሰርዝ")}
            </button>
          </form>
          <button type="button" autoFocus onClick={() => setConfirming(false)} className={buttonClass}>
            {t("Cancel", "ተው")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" && (
        <Link href={`/listings/${id}`} className={buttonClass}>
          <LinkPending />
          {t("View", "ይመልከቱ")}
        </Link>
      )}
      <Link href={`/listings/${id}/edit`} className={buttonClass}>
        <LinkPending />
        {t("Edit", "አስተካክል")}
      </Link>
      {leaseAvailable && (
        <Link href={`/listings/${id}/lease`} className={buttonClass}>
          <LinkPending />
          📄 {t("Lease", "የኪራይ ውል")}
        </Link>
      )}
      {(status === "active" || status === "rented") && (
        <form action={setRented}>
          <input type="hidden" name="listingId" value={id} />
          <input type="hidden" name="rented" value={String(status === "active")} />
          <button className={buttonClass}>
            <FormPending />
            {status === "active" ? t("Mark rented", "ተከራይቷል በል") : t("Available again", "እንደገና ይገኛል")}
          </button>
        </form>
      )}
      <button type="button" onClick={() => setConfirming(true)} className={`${buttonClass} text-danger`}>
        {t("Delete", "ሰርዝ")}
      </button>
    </div>
  );
}
