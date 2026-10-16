"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteListing, setRented } from "../actions";
import { FormPending, LinkPending } from "@/components/Pending";

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

  // Delete asks for confirmation right here in the row.
  if (confirming) {
    return (
      <div role="alertdialog" aria-label="Confirm delete" className="space-y-2 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm">
        <p className="font-semibold">Delete this listing and its photos?</p>
        <p className="text-muted">This can&apos;t be undone.</p>
        <div className="flex gap-2">
          <form action={deleteListing}>
            <input type="hidden" name="listingId" value={id} />
            <button className="relative min-h-10 rounded-lg bg-danger px-3 font-semibold text-white hover:opacity-90">
              <FormPending />
              Yes, delete
            </button>
          </form>
          <button type="button" autoFocus onClick={() => setConfirming(false)} className={buttonClass}>
            Cancel
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
          View
        </Link>
      )}
      <Link href={`/listings/${id}/edit`} className={buttonClass}>
        <LinkPending />
        Edit
      </Link>
      {leaseAvailable && (
        <Link href={`/listings/${id}/lease`} className={buttonClass}>
          <LinkPending />
          📄 Lease
        </Link>
      )}
      {(status === "active" || status === "rented") && (
        <form action={setRented}>
          <input type="hidden" name="listingId" value={id} />
          <input type="hidden" name="rented" value={String(status === "active")} />
          <button className={buttonClass}>
            <FormPending />
            {status === "active" ? "Mark rented" : "Available again"}
          </button>
        </form>
      )}
      <button type="button" onClick={() => setConfirming(true)} className={`${buttonClass} text-danger`}>
        Delete
      </button>
    </div>
  );
}
