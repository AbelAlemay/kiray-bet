"use client";

import { useState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { LeaseDocument } from "@/components/LeaseDocument";
import { leaseFields, type LeaseField } from "@/lib/leases/fields";
import { fieldsUsed, renderLease, type LeaseValues } from "@/lib/leases/render";

type Group = { title: string; fields: LeaseField[] };

const groups: Group[] = [
  { title: "People", fields: ["landlord_name", "landlord_notice_address", "landlord_contact", "landlord_email", "tenant_names", "other_occupants"] },
  { title: "The home", fields: ["property_address", "city", "zip", "furnished", "furnishings", "shared_spaces", "house_rules", "radon_info", "pre_1978", "lead_info"] },
  { title: "Dates and money", fields: ["lease_start", "fixed_term", "lease_end", "monthly_rent", "rent_due_day", "payment_method", "security_deposit", "late_fee"] },
  { title: "Utilities, parking and pets", fields: ["utilities_landlord", "utilities_tenant", "parking", "parking_details", "pets_allowed", "pet_details", "pet_deposit", "pet_rent"] },
];

const booleanFields = new Set<LeaseField>(["fixed_term", "parking", "pets_allowed", "pre_1978", "furnished"]);
const dateFields = new Set<LeaseField>(["lease_start", "lease_end"]);
const longFields = new Set<LeaseField>(["house_rules", "shared_spaces", "furnishings", "radon_info", "lead_info"]);
// Only shown when the related switch is on.
const dependsOn: Partial<Record<LeaseField, LeaseField>> = {
  lease_end: "fixed_term",
  parking_details: "parking",
  pet_details: "pets_allowed",
  pet_deposit: "pets_allowed",
  pet_rent: "pets_allowed",
  furnishings: "furnished",
  lead_info: "pre_1978",
};

// "2026-11-01" -> "November 1, 2026" for the printed lease.
function longDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function LeaseBuilder({
  template,
  initial,
  title,
  versionLabel,
}: {
  template: string;
  initial: LeaseValues;
  title: string;
  versionLabel: string;
}) {
  const [values, setValues] = useState<LeaseValues>(initial);
  const [step, setStep] = useState<"fill" | "review">("fill");
  // The host accepts that KirayBet only supplies the form before seeing the lease.
  const [agreed, setAgreed] = useState(false);
  const used = new Set(fieldsUsed(template));

  const set = (field: LeaseField, value: string | boolean) => setValues((v) => ({ ...v, [field]: value }));
  const forDocument: LeaseValues = { ...values };
  for (const field of dateFields) {
    const v = values[field];
    if (typeof v === "string") forDocument[field] = longDate(v);
  }
  const text = renderLease(template, forDocument);

  return (
    <div>
      <div role="tablist" aria-label="Lease steps" className="mb-5 flex gap-1 rounded-xl border border-border bg-surface p-1 print:hidden">
        {(["fill", "review"] as const).map((s, i) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={step === s}
            disabled={s === "review" && !agreed}
            onClick={() => setStep(s)}
            className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-semibold disabled:opacity-50 ${step === s ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
          >
            {i + 1}. {s === "fill" ? "Fill in" : "Review & print"}
          </button>
        ))}
      </div>

      {step === "fill" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("review");
            window.scrollTo({ top: 0 });
          }}
          className="space-y-6 print:hidden"
        >
          <p className="rounded-xl bg-brand-soft p-3 text-sm">
            🔒 What you type here stays on this device. KirayBet does not save the lease or the
            tenant&apos;s details. Leave anything blank to fill it in by hand after printing.
          </p>
          {groups.map((group) => {
            const fields = group.fields.filter((f) => used.has(f) && (!dependsOn[f] || values[dependsOn[f]!]));
            if (fields.length === 0) return null;
            return (
              <fieldset key={group.title} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
                <legend className="px-1 text-lg font-bold">{group.title}</legend>
                {fields.map((field) =>
                  booleanFields.has(field) ? (
                    <label key={field} className="flex min-h-10 items-center gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={!!values[field]}
                        onChange={(e) => set(field, e.target.checked)}
                        className="h-5 w-5 accent-brand"
                      />
                      {leaseFields[field]}
                    </label>
                  ) : (
                    <label key={field} className={labelClass}>
                      <span>{leaseFields[field]}</span>
                      {longFields.has(field) ? (
                        <textarea
                          rows={3}
                          value={String(values[field] ?? "")}
                          onChange={(e) => set(field, e.target.value)}
                          className={fieldClass}
                        />
                      ) : (
                        <input
                          type={dateFields.has(field) ? "date" : "text"}
                          value={String(values[field] ?? "")}
                          onChange={(e) => set(field, e.target.value)}
                          className={fieldClass}
                        />
                      )}
                    </label>
                  ),
                )}
              </fieldset>
            );
          })}
          <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
            />
            <span>
              I understand this is a free sample form. KirayBet is not a party to my lease, does not give legal
              advice, and is not responsible for how I use this form. I&apos;m responsible for making sure my lease
              is right for my home and follows the law, and I can have a lawyer review it.
            </span>
          </label>
          <button className={primaryButtonClass}>Review the lease →</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => window.print()} className="min-h-11 flex-1 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-strong">
              🖨 Print or save as PDF
            </button>
            <button type="button" onClick={() => setStep("fill")} className="min-h-11 rounded-xl border border-border px-5 font-semibold hover:bg-brand-soft">
              ← Edit details
            </button>
          </div>
          <p className="text-xs text-muted print:hidden">
            On a phone, choose &ldquo;Print&rdquo; then &ldquo;Save as PDF&rdquo; (or Share → Save to Files) to keep a copy you can send.
          </p>
          <article aria-label={title} className="rounded-2xl bg-white p-6 text-[#1c1a17] shadow sm:p-10 print:rounded-none print:p-0 print:shadow-none">
            <LeaseDocument text={text} />
            <p className="mt-8 border-t border-[#ccc] pt-2 text-[11px] text-[#666]">{versionLabel}</p>
          </article>
        </div>
      )}
    </div>
  );
}
