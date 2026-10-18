import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";

export async function Footer() {
  const t = await getT();
  return (
    <footer className="mt-16 print:hidden border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm text-muted">
        <p className="font-semibold text-foreground">
          {site.name} · {site.nameLatin}
        </p>
        <p>
          <strong>{t("Your privacy comes first.", "የእርስዎ ግላዊነት ይቀድማል።")}</strong>{" "}
          {t(
            "We never ask for your phone number, your email is never shown to other users, and exact addresses are shared only with the host's approval.",
            "ስልክ ቁጥርዎን በፍጹም አንጠይቅም፣ ኢሜይልዎ ለሌሎች ተጠቃሚዎች አይታይም፣ ትክክለኛው አድራሻም የሚሰጠው ባለቤቱ ሲፈቅድ ብቻ ነው።",
          )}
        </p>
        <p>
          <strong>{t("Equal Housing Opportunity.", "እኩል የመኖሪያ ቤት ዕድል።")}</strong>{" "}
          {t(
            `All listings on ${site.nameLatin} are open to everyone. Hosts may not state a preference based on race, color, national origin, religion, sex, familial status, disability, or any other class protected under the Fair Housing Act and state and local fair housing laws.`,
            `በ${site.name} ላይ ያሉ ማስታወቂያዎች ሁሉ ለሁሉም ሰው ክፍት ናቸው። ባለቤቶች በዘር፣ በቀለም፣ በትውልድ አገር፣ በሃይማኖት፣ በጾታ፣ በቤተሰብ ሁኔታ፣ በአካል ጉዳት ወይም በፌዴራል፣ በክልልና በአካባቢ የፍትሃዊ መኖሪያ ቤት ሕጎች በተጠበቀ በማንኛውም ሌላ መለያ ምርጫ ማሳየት አይችሉም።`,
          )}
        </p>
        <nav aria-label={t("Site information", "የድረ-ገጹ መረጃ")} className="flex flex-wrap gap-x-5 gap-y-1">
          {[
            ["/safety", t("Safety tips", "የደህንነት ምክሮች")],
            ["/terms", t("Terms of Service", "የአገልግሎት ውል")],
            ["/privacy", t("Privacy Policy", "የግላዊነት ፖሊሲ")],
            ["/contact", t("Contact", "ያግኙን")],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-block py-2 font-semibold text-foreground hover:text-brand hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {site.socials.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 py-2 font-semibold text-foreground hover:text-brand"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              {s.name} <span className="font-normal text-muted">{s.handle}</span>
            </a>
          ))}
        </div>
        <p>© {site.nameLatin}</p>
      </div>
    </footer>
  );
}
