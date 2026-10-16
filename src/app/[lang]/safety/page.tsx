import type { Metadata } from "next";
import Link from "next/link";
import { PaymentWarning } from "@/components/PaymentWarning";
import { Prose, type Section } from "@/components/Prose";
import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Safety tips", "የደህንነት ምክሮች"),
    description: t("How to spot rental scams and rent safely.", "የኪራይ ማጭበርበርን እንዴት ማወቅና በደህንነት መከራየት እንደሚቻል።"),
  };
}

const link = "font-semibold text-brand hover:underline";

export default async function SafetyPage() {
  const t = await getT();
  const sections: Section[] = [
    {
      title: t("1. Never pay before you've seen the home and signed a lease", "1. ቤቱን ሳያዩና ውል ሳይፈርሙ በፍጹም አይክፈሉ"),
      bullets: [
        t(
          "Don't send a deposit, “holding fee” or first month's rent by Zelle, Cash App, Venmo, wire transfer, gift cards or crypto before you've visited the home in person and signed a lease.",
          "ቤቱን በአካል ሳይጎበኙና ውል ሳይፈርሙ ቅድመ ክፍያ፣ “ቤቱን ለመያዝ” የሚጠየቅ ክፍያ ወይም የመጀመሪያ ወር ኪራይ በZelle፣ በCash App፣ በVenmo፣ በባንክ ዝውውር፣ በስጦታ ካርድ ወይም በክሪፕቶ አይላኩ።",
        ),
        t(
          "Money sent this way is almost impossible to get back. Pay in a way you can trace (for example a check), and always get a receipt.",
          "በዚህ መንገድ የተላከ ገንዘብ መመለስ በጣም ከባድ ነው። ሊከታተሉት በሚችሉት መንገድ ይክፈሉ (ለምሳሌ በቼክ)፤ ሁልጊዜም ደረሰኝ ይቀበሉ።",
        ),
        t(
          `${site.nameLatin} never handles money and will never ask you to pay anyone.`,
          `${site.name} ገንዘብ በፍጹም አይቀበልም፤ ለማንም እንዲከፍሉ በፍጹም አይጠይቅዎትም።`,
        ),
      ],
    },
    {
      title: t("2. Signs of a scam", "2. የማጭበርበር ምልክቶች"),
      bullets: [
        t("The rent is much lower than similar homes nearby.", "ኪራዩ በአቅራቢያ ካሉ ተመሳሳይ ቤቶች በጣም ያነሰ ነው።"),
        t(
          "The “owner” is out of the country or can't show you the home, and offers to mail the keys.",
          "“ባለቤቱ” ከአገር ውጪ ነው ወይም ቤቱን ሊያሳይዎት አይችልም፤ ቁልፉን በፖስታ እልካለሁ ይላል።",
        ),
        t(
          "You're rushed: “others want it, pay today to hold it”.",
          "ይቸኩልዎታል፦ “ሌሎችም ይፈልጉታል፤ ለመያዝ ዛሬ ይክፈሉ”።",
        ),
        t(
          "They ask to move the conversation to WhatsApp, Telegram or text right away.",
          "ውይይቱን ወዲያውኑ ወደ WhatsApp፣ Telegram ወይም የጽሑፍ መልዕክት ለማዛወር ይጠይቃሉ።",
        ),
        t(
          "They ask for your Social Security number, bank details or ID photos before you've even seen the home.",
          "ቤቱን ገና ሳያዩ የSocial Security ቁጥርዎን፣ የባንክ መረጃዎን ወይም የመታወቂያ ፎቶ ይጠይቃሉ።",
        ),
        t(
          "The same photos appear in other listings under a different name or address.",
          "ተመሳሳይ ፎቶዎች በሌላ ስም ወይም አድራሻ በሌሎች ማስታወቂያዎች ላይ ይታያሉ።",
        ),
      ],
    },
    {
      title: t("3. Visiting a home", "3. ቤቱን ሲጎበኙ"),
      bullets: [
        t("Visit in daylight, and bring a friend or family member.", "በቀን ብርሃን ይጎብኙ፤ ጓደኛ ወይም የቤተሰብ አባል ይዘው ይሂዱ።"),
        t("Tell someone where you're going and when you expect to be back.", "ወዴት እንደሚሄዱና መቼ እንደሚመለሱ ለአንድ ሰው ይንገሩ።"),
        t(
          "Make sure the person can actually let you in, and that the address matches the listing.",
          "ሰውየው በእርግጥ ሊያስገባዎት እንደሚችልና አድራሻው ከማስታወቂያው ጋር እንደሚዛመድ ያረጋግጡ።",
        ),
        t("Trust your feelings: if something seems wrong, leave.", "ስሜትዎን ይመኑ፦ የሆነ ነገር ትክክል ካልመሰለዎት ይውጡ።"),
      ],
    },
    {
      title: t("4. Before you sign", "4. ከመፈረምዎ በፊት"),
      bullets: [
        t(
          "Check who owns the home: most counties let you look up the owner's name online from the address. Ask the host to explain if it's different.",
          "የቤቱ ባለቤት ማን እንደሆነ ያረጋግጡ፦ አብዛኞቹ ካውንቲዎች በአድራሻው የባለቤቱን ስም በኦንላይን እንዲፈልጉ ይፈቅዳሉ። ስሙ የተለየ ከሆነ ባለቤቱ እንዲያስረዳ ይጠይቁ።",
        ),
        t(
          "Read the whole lease. Make sure the rent, deposit, move-in date and who pays utilities are written down.",
          "ሙሉውን ውል ያንብቡ። ኪራዩ፣ ቅድመ ክፍያው፣ የሚገቡበት ቀንና የመብራት፣ የውሃ ወዘተ ክፍያ ማን እንደሚከፍል በጽሑፍ መኖሩን ያረጋግጡ።",
        ),
        t(
          "Keep a copy of everything you sign, and take photos of the home's condition on move-in day.",
          "የፈረሙትን ሁሉ ቅጂ ይያዙ፤ በሚገቡበት ቀን የቤቱን ሁኔታ ፎቶ ያንሱ።",
        ),
      ],
    },
    {
      title: t(`5. Your privacy on ${site.nameLatin}`, `5. በ${site.name} ላይ ግላዊነትዎ`),
      bullets: [
        t("We never ask for your phone number, and your email is never shown to other users.", "ስልክ ቁጥርዎን በፍጹም አንጠይቅም፤ ኢሜይልዎም ለሌሎች ተጠቃሚዎች አይታይም።"),
        t(
          "Keep the conversation in KirayBet messages until you trust the other person. That way, if something goes wrong, there's a record and we can help.",
          "ሌላውን ሰው እስኪያምኑት ድረስ ውይይቱን በኪራይ ቤት መልዕክቶች ውስጥ ያድርጉ። እንደዚህ ከሆነ ችግር ቢፈጠር መዝገብ ይኖራል፤ እኛም ልንረዳ እንችላለን።",
        ),
        t(
          "Hosts: you decide who gets the exact address. Share it once you're comfortable, for example when you agree on a viewing.",
          "ባለቤቶች፦ ትክክለኛውን አድራሻ ማን እንደሚያገኝ እርስዎ ይወስናሉ። ሲመችዎ ያጋሩት፤ ለምሳሌ ቤቱን ለማሳየት ስትስማሙ።",
        ),
      ],
    },
    {
      title: t("6. Report problems", "6. ችግሮችን ሪፖርት ያድርጉ"),
      paras: [
        t(
          "Use “⚑ Report” on any listing or conversation. A person reviews every report, usually within a day, and the other person isn't told who reported them. Scammers are removed and banned.",
          "በማንኛውም ማስታወቂያ ወይም ውይይት ላይ “⚑ ሪፖርት ያድርጉ” የሚለውን ይጠቀሙ። እያንዳንዱ ሪፖርት በሰው ይገመገማል፤ ብዙውን ጊዜ በአንድ ቀን ውስጥ። ሪፖርት የተደረገበት ሰው ማን እንደዘገበው አይነገረውም። አጭበርባሪዎች ይወገዳሉ፣ ይታገዳሉ።",
        ),
        <>
          {t("If you already sent money to a scammer: call your bank or payment app right away, then report it to the FTC at", "ለአጭበርባሪ ገንዘብ ልከው ከሆነ፦ ወዲያውኑ ለባንክዎ ወይም ለክፍያ መተግበሪያዎ ይደውሉ፤ ከዚያም ለFTC በ")}{" "}
          <a href="https://reportfraud.ftc.gov" target="_blank" rel="noreferrer" className={link}>
            reportfraud.ftc.gov
          </a>{" "}
          {t("and to your local police. Then", "እና ለአካባቢዎ ፖሊስ ሪፖርት ያድርጉ። ከዚያም")}{" "}
          <Link href="/contact" className={link}>
            {t("contact us", "ያግኙን")}
          </Link>
          {t(".", "።")}
        </>,
      ],
    },
    {
      title: t("7. Fair housing", "7. ፍትሃዊ መኖሪያ ቤት"),
      paras: [
        t(
          "Every listing must be open to everyone. It's against the law to refuse to rent to someone because of race, color, national origin, religion, sex, disability or family status (for example children). If a host treats you this way, report it.",
          "እያንዳንዱ ማስታወቂያ ለሁሉም ክፍት መሆን አለበት። በዘር፣ በቀለም፣ በትውልድ አገር፣ በሃይማኖት፣ በጾታ፣ በአካል ጉዳት ወይም በቤተሰብ ሁኔታ (ለምሳሌ ልጆች) ምክንያት ለአንድ ሰው ለማከራየት እምቢ ማለት ሕገ-ወጥ ነው። ባለቤቱ እንደዚህ ቢያደርግብዎ ሪፖርት ያድርጉ።",
        ),
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">🔒 {t.both("Safety", "ደህንነት")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("Rent safely", "በደህንነት ይከራዩ")}</h1>
      <p className="mb-8 mt-3 text-lg text-muted">
        {t(
          "Rental scams are common in online groups. These simple steps protect you, whether you're renting or hosting.",
          "በኦንላይን ቡድኖች የኪራይ ማጭበርበር የተለመደ ነው። ተከራይም ሆኑ ባለቤት፣ እነዚህ ቀላል እርምጃዎች ይጠብቁዎታል።",
        )}
      </p>
      <div className="mb-8">
        <PaymentWarning />
      </div>
      <Prose sections={sections} />
    </div>
  );
}
