import Link from "next/link";
import { sortOptions, type ListingFilters } from "@/lib/listings";
import { site } from "@/lib/site";
import { getT } from "@/lib/i18n-server";
import { fieldClass, labelClass } from "./form-styles";

const checkboxes = [
  { name: "pets", label: "Pets allowed", labelAm: "የቤት እንስሳ ይፈቀዳል" },
  { name: "parking", label: "Parking", labelAm: "መኪና ማቆሚያ" },
] as const;

export async function SearchFilters({
  filters,
  view,
  cities,
}: {
  filters: ListingFilters;
  view: "list" | "map";
  cities: string[];
}) {
  const t = await getT();
  return (
    <form
      action="/search"
      // Remount when filters change so the uncontrolled fields show the new values.
      key={JSON.stringify(filters)}
      className="space-y-4 rounded-2xl border border-border bg-surface p-4"
    >
      <input type="hidden" name="region" value={filters.region} />
      {view !== "list" && <input type="hidden" name="view" value={view} />}
      <h2 className="font-semibold">
        {t.both("Filters", "ማጣሪያ")}
      </h2>
      <label className={labelClass}>
        <span>{t("City", "ከተማ")}</span>
        <select name="city" defaultValue={filters.city ?? ""} className={fieldClass}>
          <option value="">{t("All cities", "ሁሉም ከተሞች")}</option>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>{t("Home type", "የቤት ዓይነት")}</span>
        <select name="type" defaultValue={filters.type ?? ""} className={fieldClass}>
          <option value="">{t("Any type", "ማንኛውም ዓይነት")}</option>
          {site.listingTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {t.both(type.label, type.labelAm)}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>{t("Max rent ($/month)", "ከፍተኛ ኪራይ ($/በወር)")}</span>
        <input
          name="maxPrice"
          type="number"
          min={0}
          step={50}
          defaultValue={filters.maxPrice}
          placeholder={t("No limit", "ገደብ የለም")}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        <span>{t("Bedrooms", "መኝታ ክፍሎች")}</span>
        <select name="minBedrooms" defaultValue={filters.minBedrooms ?? ""} className={fieldClass}>
          <option value="">{t("Any", "ማንኛውም")}</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>{t("Available by", "እስከዚህ ቀን የሚገኝ")}</span>
        <input name="availableBy" type="date" defaultValue={filters.availableBy} className={fieldClass} />
      </label>
      <fieldset className="space-y-1">
        <legend className="text-sm font-medium">{t("Must have", "ሊኖረው የሚገባ")}</legend>
        {checkboxes.map((c) => (
          <label key={c.name} className="flex min-h-10 items-center gap-3 text-sm">
            <input type="checkbox" name={c.name} value="1" defaultChecked={!!filters[c.name]} className="h-5 w-5 accent-brand" />
            {t(c.label, c.labelAm)}
          </label>
        ))}
      </fieldset>
      <label className={labelClass}>
        <span>{t("Sort by", "ቅደም ተከተል")}</span>
        <select name="sort" defaultValue={filters.sort} className={fieldClass}>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label, o.labelAm)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3 pt-1">
        <button className="flex-1 rounded-xl bg-brand px-4 py-2.5 font-semibold text-white hover:bg-brand-strong">
          {t.both("Apply", "ፈልግ")}
        </button>
        <Link
          href="/search"
          className="rounded-xl border border-border px-4 py-2.5 font-semibold text-muted hover:bg-brand-soft hover:text-foreground"
        >
          {t("Clear", "አጽዳ")}
        </Link>
      </div>
    </form>
  );
}
