import { site } from "@/lib/site";
import type { RegionId } from "@/lib/regions";
import { getT } from "@/lib/i18n-server";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-3 text-foreground outline-none focus:border-brand";

// Quick search on the home page, for the chosen area.
export async function SearchBar({ region, cities }: { region: RegionId; cities: string[] }) {
  const t = await getT();
  return (
    <form
      action="/search"
      className="grid gap-2 rounded-2xl bg-surface p-3 shadow-xl sm:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <input type="hidden" name="region" value={region} />
      <select name="city" className={fieldClass} defaultValue="" aria-label={t("City", "ከተማ")}>
        <option value="">{t("All cities", "ሁሉም ከተሞች")}</option>
        {cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
      <select name="type" className={fieldClass} defaultValue="" aria-label={t("Home type", "የቤት ዓይነት")}>
        <option value="">{t("Any type", "ማንኛውም ዓይነት")}</option>
        {site.listingTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {t.both(type.label, type.labelAm)}
          </option>
        ))}
      </select>
      <input
        name="maxPrice"
        type="number"
        min={0}
        step={50}
        placeholder={t("Max $/month", "ከፍተኛ $/በወር")}
        className={fieldClass}
        aria-label={t("Maximum monthly rent", "ከፍተኛ ወርሃዊ ኪራይ")}
      />
      <button className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong">
        {t.both("Search", "ፈልግ")}
      </button>
    </form>
  );
}
