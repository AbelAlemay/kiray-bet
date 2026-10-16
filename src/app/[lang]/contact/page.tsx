import type { Metadata } from "next";
import { getT } from "@/lib/i18n-server";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Contact us", "ያግኙን") };
}

export default async function ContactPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">{t.both("Contact", "ያግኙን")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("Contact us", "ያግኙን")}</h1>
      <p className="mb-6 mt-2 text-muted">
        {t(
          "Questions, problems, or something that looks like a scam? Send us a message and we'll get back to you by email.",
          "ጥያቄ፣ ችግር ወይም ማጭበርበር የሚመስል ነገር አጋጥሞዎታል? መልዕክት ይላኩልን፤ በኢሜይል እንመልስልዎታለን።",
        )}
      </p>
      <ContactForm />
      <p className="mt-4 text-xs text-muted">
        {t(
          "To reach a host about a home, use the “Contact host” button on the listing instead.",
          "ስለ አንድ ቤት ባለቤቱን ለማግኘት በማስታወቂያው ላይ ያለውን “ባለቤቱን ያግኙ” የሚለውን ቁልፍ ይጠቀሙ።",
        )}
      </p>
    </div>
  );
}
