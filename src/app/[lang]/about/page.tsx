import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { regions } from "@/lib/regions";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("About", "ስለ እኛ"),
    description: t(
      `${site.nameLatin}: homes for rent from our community, in ${regions.length} U.S. metro areas.`,
      `${site.name}፦ ከማህበረሰባችን የሚከራዩ ቤቶች፣ በ${regions.length} የአሜሪካ አካባቢዎች።`,
    ),
  };
}

export default async function AboutPage() {
  const t = await getT();
  const points = [
    {
      title: t("Made for our community", "ለማህበረሰባችን የተሠራ"),
      text: t(
        `Rooms, basements, apartments and houses in ${regions.length} U.S. metro areas: ${regions.map((r) => r.name).join(", ")}. In English and Amharic.`,
        `ክፍሎች፣ ቤዝመንቶች፣ አፓርትመንቶችና ሙሉ ቤቶች በ${regions.length} የአሜሪካ አካባቢዎች፦ ${regions.map((r) => r.nameAm).join("፣ ")}። በእንግሊዝኛና በአማርኛ።`,
      ),
    },
    {
      title: t("Safe and private", "ደህንነቱና ግላዊነቱ የተጠበቀ"),
      text: t(
        "We never ask for your phone number, your email is never shown to other users, and the exact address is shared only when the host agrees.",
        "ስልክ ቁጥርዎን በፍጹም አንጠይቅም፣ ኢሜይልዎ ለሌሎች ተጠቃሚዎች አይታይም፣ ትክክለኛው አድራሻም የሚሰጠው ባለቤቱ ሲስማማ ብቻ ነው።",
      ),
    },
    {
      title: t("Checked by a person", "በሰው የሚመረመር"),
      text: t(
        "Every listing is reviewed before it appears, so fake and copied listings don't go live.",
        "እያንዳንዱ ማስታወቂያ ከመታየቱ በፊት ይገመገማል፤ ስለዚህ ሐሰተኛና የተቀዱ ማስታወቂያዎች አይወጡም።",
      ),
    },
    {
      title: t("Free, and no money through the site", "ነጻ ነው፤ በድረ-ገጹ በኩል ገንዘብ አይተላለፍም"),
      text: t(
        "Posting and searching are free. We never handle rent or deposits, and we warn renters never to pay before seeing the home and signing a lease.",
        "ማስተዋወቅም ሆነ መፈለግ ነጻ ነው። ኪራይም ሆነ ቅድመ ክፍያ በፍጹም አንቀበልም፤ ተከራዮች ቤቱን ሳያዩና ውል ሳይፈርሙ ገንዘብ እንዳይከፍሉም እናሳስባለን።",
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">{t.both("About", "ስለ እኛ")}</p>
      <h1 className="mt-1 text-3xl font-bold">{site.taglineAm}</h1>
      <p className="mt-3 text-lg text-muted">
        {t(
          `${site.nameLatin} (${site.name}, “house for rent”) helps people in our community find a place to live and helps hosts find good renters, without passing personal details to strangers in group chats.`,
          `${site.name} የማህበረሰባችን አባላት የሚኖሩበት ቤት እንዲያገኙ፣ ባለቤቶችም ጥሩ ተከራይ እንዲያገኙ ይረዳል፤ የግል መረጃን በቡድን ቻቶች ለማያውቁት ሰው ማጋራት ሳያስፈልግ።`,
        )}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p.title} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl bg-brand-soft p-6">
        <h2 className="font-semibold">{t("Open to everyone", "ለሁሉም ክፍት")}</h2>
        <p className="mt-1 text-sm">
          {t(
            `${site.nameLatin} is built by and for the Habesha community, and every listing is open to everyone, as Fair Housing law requires.`,
            `${site.name} በሐበሻ ማህበረሰብ ለሐበሻ ማህበረሰብ የተሠራ ነው፤ የፍትሃዊ መኖሪያ ቤት ሕግ እንደሚያዝዘውም እያንዳንዱ ማስታወቂያ ለሁሉም ሰው ክፍት ነው።`,
          )}
        </p>
      </div>

      <p className="mt-8 text-sm text-muted">
        {t("Questions or ideas?", "ጥያቄ ወይም ሐሳብ አለዎት?")}{" "}
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          {t("Contact us", "ያግኙን")}
        </Link>
        {t(".", "።")}
      </p>
    </div>
  );
}
