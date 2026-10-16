import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold">{t("We couldn't find that page", "ገጹ አልተገኘም")}</h1>
      <p className="mt-1 text-muted">
        {t("ገጹ አልተገኘም። The home may have been rented or removed.", "ቤቱ ተከራይቶ ወይም ተወግዶ ሊሆን ይችላል።")}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/search" className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-strong">
          {t("Browse homes", "ቤቶችን ይመልከቱ")}
        </Link>
        <Link href="/" className="rounded-xl border border-border px-5 py-2.5 font-semibold hover:bg-brand-soft">
          {t("Home", "መነሻ")}
        </Link>
      </div>
    </div>
  );
}
