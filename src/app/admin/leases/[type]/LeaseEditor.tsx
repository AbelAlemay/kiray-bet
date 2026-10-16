"use client";

import { useActionState, useState } from "react";
import { fieldClass, primaryButtonClass } from "@/components/form-styles";
import { LeaseDocument } from "@/components/LeaseDocument";
import { leaseFields } from "@/lib/leases/fields";
import { fieldsUsed, renderLease } from "@/lib/leases/render";
import { saveLeaseTemplate } from "../actions";
import { PendingCorner } from "@/components/Pending";

// Sample values for the preview.
const sample = {
  landlord_name: "Dawit Bekele",
  landlord_notice_address: "123 Example St, Aurora, CO 80012",
  landlord_contact: "dawit@example.com",
  tenant_names: "Robel Haile",
  other_occupants: "None",
  property_address: "456 Sample Ave, Apt 2",
  city: "Aurora",
  zip: "80012",
  lease_start: "November 1, 2026",
  fixed_term: true,
  lease_end: "October 31, 2027",
  monthly_rent: "1,850",
  rent_due_day: "1st",
  payment_method: "check or bank transfer",
  security_deposit: "1,850",
  late_fee: "50",
  utilities_landlord: "water, trash",
  utilities_tenant: "electricity, gas, internet",
  parking: true,
  parking_details: "one driveway space",
  pets_allowed: true,
  pet_details: "one cat",
  pet_deposit: "300",
  pet_rent: "35",
  pre_1978: true,
  furnished: true,
  furnishings: "bed, desk, chair",
  shared_spaces: "kitchen, living room, laundry",
  house_rules: "quiet after 10 pm; clean the kitchen after use",
};

export function LeaseEditor({ type, body, reviewed, note }: { type: string; body: string; reviewed: boolean; note: string }) {
  const [state, action, pending] = useActionState(saveLeaseTemplate, {});
  // Controlled, so an error (e.g. a missing note) doesn't reset what was entered.
  const [text, setText] = useState(body);
  const [isReviewed, setIsReviewed] = useState(reviewed);
  const [reviewNote, setReviewNote] = useState(note);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const used = new Set(fieldsUsed(text));

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="body" value={text} />
      <div role="tablist" className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        {(["edit", "preview"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold ${view === v ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
          >
            {v === "edit" ? "✏️ Edit text" : "👁 Preview with sample details"}
          </button>
        ))}
      </div>

      {view === "edit" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={30}
          spellCheck
          aria-label="Agreement text"
          className={`${fieldClass} font-mono text-sm leading-relaxed`}
        />
      ) : (
        <article className="rounded-2xl bg-white p-6 text-[#1c1a17] sm:p-10">
          <LeaseDocument text={renderLease(text, sample)} />
        </article>
      )}

      <details className="rounded-2xl border border-border bg-surface p-4 text-sm">
        <summary className="cursor-pointer font-semibold">How the text works (fields you can use)</summary>
        <ul className="mt-2 space-y-1 text-muted">
          <li>
            <code>{"{{field}}"}</code> is filled in from the host&apos;s form. If left blank, it prints a line to fill by hand.
          </li>
          <li>
            <code>{"{{#if field}} … {{else}} … {{/if}}"}</code> shows text only when a field is on or filled in.
          </li>
          <li>
            <code>{"{{! note }}"}</code> is a private note for you or the attorney. It never appears in a lease.
          </li>
          <li>
            <code># Title</code>, <code>## Section</code>, <code>- list item</code> and <code>**bold**</code> format the document.
          </li>
        </ul>
        <p className="mt-3 font-semibold">Fields</p>
        <ul className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {Object.entries(leaseFields).map(([field, label]) => (
            <li key={field} className={used.has(field) ? "" : "text-muted"}>
              <code>{field}</code>: {label}
              {used.has(field) ? "" : " (not used)"}
            </li>
          ))}
        </ul>
      </details>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="lawyer_reviewed"
            checked={isReviewed}
            onChange={(e) => setIsReviewed(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-brand"
          />
          <span>
            <strong>This text has been reviewed and approved by a Colorado attorney.</strong> Leases made from it
            will no longer show the &ldquo;draft, not reviewed&rdquo; warning.
          </span>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Review note (shown in small print at the bottom of each lease)</span>
          <input
            name="review_note"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            maxLength={300}
            placeholder="Reviewed by Jane Doe, Esq., Nov 2026"
            className={fieldClass}
          />
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}
        <button disabled={pending} className={primaryButtonClass}>
          <PendingCorner pending={pending} />
          {pending ? "Saving…" : "Save as new version"}
        </button>
        <p className="text-xs text-muted">Earlier versions are kept. Leases already printed are not affected.</p>
      </div>
    </form>
  );
}
