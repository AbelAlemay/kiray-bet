import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-1 text-muted">ገጹ አልተገኘም። The home may have been rented or removed.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/search" className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-strong">
          Browse homes
        </Link>
        <Link href="/" className="rounded-xl border border-border px-5 py-2.5 font-semibold hover:bg-brand-soft">
          Home
        </Link>
      </div>
    </div>
  );
}
