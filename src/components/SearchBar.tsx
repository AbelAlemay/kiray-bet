import { site } from "@/lib/site";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-3 text-foreground outline-none focus:border-brand";

export function SearchBar() {
  return (
    <form
      action="/search"
      className="grid gap-2 rounded-2xl bg-surface p-3 shadow-xl sm:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <select name="city" className={fieldClass} defaultValue="" aria-label="City">
        <option value="">All cities</option>
        {site.cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
      <select name="type" className={fieldClass} defaultValue="" aria-label="Home type">
        <option value="">Any type</option>
        {site.listingTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label} · {t.labelAm}
          </option>
        ))}
      </select>
      <input
        name="maxPrice"
        type="number"
        min={0}
        step={50}
        placeholder="Max $/month"
        className={fieldClass}
        aria-label="Maximum monthly rent"
      />
      <button className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong">
        Search · ፈልግ
      </button>
    </form>
  );
}
