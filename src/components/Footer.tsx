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
        <p>© {site.nameLatin}</p>
      </div>
    </footer>
  );
}
