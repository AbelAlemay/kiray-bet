import Link from "next/link";

// Search box for the current admin tab (a plain GET form, works without JavaScript).
export function AdminSearch({ tab, q, placeholder }: { tab: string; q: string; placeholder: string }) {
  return (
    <form action="/admin" className="flex gap-2" role="search">
      <input type="hidden" name="tab" value={tab} />
      <input
        name="q"
        type="search"
        defaultValue={q}
        placeholder={placeholder}
        aria-label="Search"
        className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
      />
      <button className="rounded-xl bg-brand px-4 font-semibold text-white hover:bg-brand-strong">Search</button>
      {q && (
        <Link
          href={`/admin?tab=${tab}`}
          className="inline-flex items-center rounded-xl border border-border px-4 font-semibold text-muted hover:text-foreground"
        >
          Clear
        </Link>
      )}
    </form>
  );
}
