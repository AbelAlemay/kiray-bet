"use client";

import Link from "next/link";
import { deleteListing, setRented } from "../actions";

const buttonClass = "rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-brand-soft";

export function ListingActions({ id, status }: { id: string; status: "pending" | "active" | "rejected" | "rented" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" && (
        <Link href={`/listings/${id}`} className={buttonClass}>
          View
        </Link>
      )}
      <Link href={`/listings/${id}/edit`} className={buttonClass}>
        Edit
      </Link>
      {(status === "active" || status === "rented") && (
        <form action={setRented}>
          <input type="hidden" name="listingId" value={id} />
          <input type="hidden" name="rented" value={String(status === "active")} />
          <button className={buttonClass}>{status === "active" ? "Mark rented" : "Available again"}</button>
        </form>
      )}
      <form
        action={deleteListing}
        onSubmit={(e) => {
          if (!confirm("Delete this listing and its photos? This can't be undone.")) e.preventDefault();
        }}
      >
        <input type="hidden" name="listingId" value={id} />
        <button className={`${buttonClass} text-danger`}>Delete</button>
      </form>
    </div>
  );
}
