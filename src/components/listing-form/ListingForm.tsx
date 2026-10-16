"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { site, utilityOptions } from "@/lib/site";
import { BotCheckFailed, Turnstile, useBotCheck } from "@/components/Turnstile";
import type { ListingFormState } from "@/app/listings/actions";
import { PhotoPicker, type Photo } from "./PhotoPicker";

// What the form starts with when editing an existing listing.
export type ListingFormValues = {
  title: string;
  description: string;
  type: string;
  price: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  city: string;

  availableFrom: string;
  utilities: string[];
  addressVisibility: "private" | "public";
  parking: boolean;
  petsAllowed: boolean;
  street: string;
  unit: string;
  zip: string;
};

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className={`${labelClass} ${pairedFieldClass}`}>
      <span className="self-end">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs font-normal text-muted">{hint}</span>}
      {error && <span role="alert" className="block text-xs font-normal text-danger">{error}</span>}
    </label>
  );
}

// Two fields side by side, laid out as shared rows (label, box, hint) so the boxes
// line up even when one label wraps or only one field has a hint.
const pairClass = "grid grid-cols-2 gap-x-4";
// Inside a pair each Field spans the pair's three rows; elsewhere this is inert.
const pairedFieldClass = "[.grid-cols-2>&]:row-span-3 [.grid-cols-2>&]:grid [.grid-cols-2>&]:grid-rows-subgrid [.grid-cols-2>&]:space-y-0 [.grid-cols-2>&]:gap-y-1";

function Section({ title, titleAm, children }: { title: string; titleAm: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-bold">
        {title} · <span className="text-muted">{titleAm}</span>
      </h2>
      {children}
    </section>
  );
}

// Used for both posting (no `initial`) and editing a listing.
export function ListingForm({
  userId,
  listingId,
  today,
  initial,
  initialPhotos = [],
  saveAction,
}: {
  userId: string;
  listingId: string;
  today: string;
  initial?: ListingFormValues;
  initialPhotos?: Photo[];
  saveAction: (prev: ListingFormState, formData: FormData) => Promise<ListingFormState>;
}) {
  const [state, action, pending] = useActionState(saveAction, {});
  const editing = !!initial;
  const bot = useBotCheck();
  const botWaiting = !editing && bot.waiting;
  const [uploading, setUploading] = useState(false);
  const errors = state.errors ?? {};

  return (
    <form
      noValidate
      // Submitted by hand (not `action=`) so the form keeps what the host typed if
      // the server sends back an error.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => action(formData));
      }}
      className="space-y-6"
    >
      <input type="hidden" name="listingId" value={listingId} />

      <Section title="The home" titleAm="ቤቱ">
        <Field label="Type of home" error={errors.type}>
          <select name="type" required defaultValue={initial?.type ?? ""} className={fieldClass}>
            <option value="" disabled>
              Choose…
            </option>
            {site.listingTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} · {t.labelAm}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title" error={errors.title} hint="For example: Bright 2-bed apartment near light rail">
          <input name="title" required minLength={5} maxLength={300} defaultValue={initial?.title} className={fieldClass} />
        </Field>
        <div className={pairClass}>
          <Field label="Bedrooms · መኝታ" error={errors.bedrooms}>
            <input name="bedrooms" type="number" min={0} max={20} required defaultValue={initial?.bedrooms} className={fieldClass} />
          </Field>
          <Field label="Bathrooms · መታጠቢያ" error={errors.bathrooms}>
            <input name="bathrooms" type="number" min={0} max={20} step={0.5} required defaultValue={initial?.bathrooms} className={fieldClass} />
          </Field>
        </div>
        <Field
          label="Description · መግለጫ"
          error={errors.description}
          hint="What's included, what's nearby, house rules. No phone numbers or payment details."
        >
          <textarea name="description" required minLength={20} maxLength={20000} rows={8} defaultValue={initial?.description} className={fieldClass} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Utilities included in the rent · የተካተቱ</legend>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
            {utilityOptions.map((u) => (
              <label key={u.value} className="flex min-h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="utilities"
                  value={u.value}
                  defaultChecked={initial?.utilities.includes(u.value)}
                  className="h-5 w-5 accent-brand"
                />
                {u.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted">Leave all unticked if the renter pays every utility.</p>
        </fieldset>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="parking" defaultChecked={initial?.parking} className="h-4 w-4 accent-brand" /> Parking
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="petsAllowed" defaultChecked={initial?.petsAllowed} className="h-4 w-4 accent-brand" /> Pets allowed
          </label>
        </div>
      </Section>

      <Section title="Rent and dates" titleAm="ኪራይና ቀን">
        <div className={pairClass}>
          <Field label="Rent ($/month)" error={errors.price}>
            <input name="price" type="number" min={1} step={1} required inputMode="numeric" defaultValue={initial?.price} className={fieldClass} />
          </Field>
          <Field label="Deposit ($)" error={errors.deposit}>
            <input name="deposit" type="number" min={0} step={1} defaultValue={initial?.deposit ?? 0} inputMode="numeric" className={fieldClass} />
          </Field>
        </div>
        <Field label="Available from" error={errors.availableFrom}>
          <input name="availableFrom" type="date" required defaultValue={initial?.availableFrom ?? today} className={fieldClass} />
        </Field>
      </Section>

      <Section title="Photos" titleAm="ፎቶዎች">
        <PhotoPicker
          userId={userId}
          listingId={listingId}
          initialPhotos={initialPhotos}
          error={errors.photos}
          onBusyChange={setUploading}
        />
      </Section>

      <Section title="Location" titleAm="አድራሻ">
        <Field label="City" error={errors.city}>
          <select name="city" required defaultValue={initial?.city ?? ""} className={fieldClass}>
            <option value="" disabled>
              Choose…
            </option>
            {site.cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="space-y-4">
          <p className="text-sm text-muted">
            We use the address to place your home on the map and find the nearest major
            intersection (for example &ldquo;Near Havana &amp; Iliff&rdquo;).
          </p>
          <Field label="Street address" error={errors.street}>
            <input name="street" required maxLength={100} autoComplete="street-address" defaultValue={initial?.street} className={fieldClass} />
          </Field>
          <div className={pairClass}>
            <Field label="Unit (optional)" error={errors.unit}>
              <input name="unit" maxLength={20} placeholder="Apt 4, Basement…" defaultValue={initial?.unit} className={fieldClass} />
            </Field>
            <Field label="ZIP code" error={errors.zip}>
              <input name="zip" required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" defaultValue={initial?.zip} className={fieldClass} />
            </Field>
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Who can see the exact address? · አድራሻ</legend>
          {[
            {
              value: "private",
              title: "🔒 Keep it private",
              text: "Your listing shows only the nearest major intersection and an area on the map. You share the exact address in messages with renters you choose.",
            },
            {
              value: "public",
              title: "📍 Show the exact address",
              text: "Anyone can see the full address on your listing, so renters can drive by without asking first.",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-xl border border-border bg-surface p-4 has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
            >
              <input
                type="radio"
                name="addressVisibility"
                value={option.value}
                defaultChecked={initial?.addressVisibility === option.value}
                className="mt-1 h-5 w-5 shrink-0 accent-brand"
              />
              <span>
                <span className="block font-semibold">{option.title}</span>
                <span className="block text-sm text-muted">{option.text}</span>
              </span>
            </label>
          ))}
          {errors.addressVisibility && (
            <p role="alert" className="text-xs text-danger">
              {errors.addressVisibility}
            </p>
          )}
        </fieldset>
      </Section>

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 text-sm sm:p-6">
        <p>
          <strong>Fair Housing:</strong> listings must be open to everyone. You can&apos;t limit who
          can rent based on national origin, race, religion, sex, disability, family status or
          source of income (such as Section 8).
        </p>
        <p className="text-muted">
          {editing
            ? "Changing anything other than the available date sends the listing back for a quick review; it's hidden until approved."
            : "Every listing is checked by a person before it appears, usually within a day."}
          {` ${site.nameLatin}`} never handles money; don&apos;t ask renters to pay before they see the
          home and sign a lease.
        </p>
        {!editing && <Turnstile resetKey={state} onToken={bot.onToken} onError={bot.onError} onInteractive={bot.onInteractive} />}
        {errors.form && (
          <p role="alert" className="text-danger">
            {errors.form}
          </p>
        )}
        {Object.keys(errors).length > 0 && !errors.form && (
          <p role="alert" className="text-danger">
            Please fix the highlighted fields above.
          </p>
        )}
        {!editing && bot.failed && <BotCheckFailed />}
        <button disabled={pending || uploading || botWaiting} className={primaryButtonClass}>
          {pending
            ? "Saving…"
            : uploading
              ? "Waiting for photos…"
              : botWaiting
                ? bot.waitingLabel
              : editing
                ? "Save changes · ለውጦችን ያስቀምጡ"
                : "Submit for review · ለግምገማ ይላኩ"}
        </button>
      </div>
    </form>
  );
}
