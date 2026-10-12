import Link from "next/link";
import { sortOptions, type ListingFilters } from "@/lib/listings";
import { site } from "@/lib/site";
import { fieldClass, labelClass } from "./form-styles";

const checkboxes = [
  { name: "pets", label: "Pets allowed" },
  { name: "parking", label: "Parking" },
  { name: "utilities", label: "Utilities included" },
] as const;

export function SearchFilters({ filters, view }: { filters: ListingFilters; view: "list" | "map" }) {
  return (
    <form
      action="/search"
      // Remount when filters change so the uncontrolled fields show the new values.
      key={JSON.stringify(filters)}
      className="space-y-4 rounded-2xl border border-border bg-surface p-4"
    >
      {view === "map" && <input type="hidden" name="view" value="map" />}
      <h2 className="font-semibold">
        Filters · <span className="text-muted">ማጣሪያ</span>
      </h2>
      <label className={labelClass}>
        <span>City</span>
        <select name="city" defaultValue={filters.city ?? ""} className={fieldClass}>
          <option value="">All cities</option>
          {site.cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>Home type</span>
        <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
          <option value="">Any type</option>
          {site.listingTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label} · {t.labelAm}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>Max rent ($/month)</span>
        <input
          name="maxPrice"
          type="number"
          min={0}
          step={50}
          defaultValue={filters.maxPrice}
          placeholder="No limit"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        <span>Bedrooms</span>
        <select name="minBedrooms" defaultValue={filters.minBedrooms ?? ""} className={fieldClass}>
          <option value="">Any</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>Available by</span>
        <input name="availableBy" type="date" defaultValue={filters.availableBy} className={fieldClass} />
      </label>
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">Must have</legend>
        {checkboxes.map((c) => (
          <label key={c.name} className="flex min-h-10 items-center gap-3 text-sm">
            <input type="checkbox" name={c.name} value="1" defaultChecked={!!filters[c.name]} className="h-5 w-5 accent-brand" />
            {c.label}
          </label>
        ))}
      </fieldset>
      <label className={labelClass}>
        <span>Sort by</span>
        <select name="sort" defaultValue={filters.sort} className={fieldClass}>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3 pt-1">
        <button className="flex-1 rounded-xl bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-strong">
          Apply · ፈልግ
        </button>
        <Link
          href="/search"
          className="rounded-xl border border-border px-4 py-2.5 font-semibold text-muted hover:bg-brand-soft hover:text-foreground"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
