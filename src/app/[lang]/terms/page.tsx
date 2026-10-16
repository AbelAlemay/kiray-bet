import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Terms of Service", "የአገልግሎት ውል") };
}

const link = "font-semibold text-brand hover:underline";
const name = site.nameLatin;

export default async function TermsPage() {
  const t = await getT();
  return (
    <LegalPage
      label={t.both("Terms of Service", "የአገልግሎት ውል")}
      title="Terms of Service"
      updated="October 15, 2026"
      showAmSummary={t.lang === "am"}
      amSummary={[
        "ኪራይ ቤትን ለመጠቀም 18 ዓመት ወይም ከዚያ በላይ መሆን አለብዎት።",
        "ኪራይ ቤት ቤቶችን የሚያገናኝ ድረ-ገጽ ብቻ ነው፤ የኪራይ ውሉ በባለቤቱና በተከራዩ መካከል ነው። እኛ ደላላ አይደለንም፤ ገንዘብም አንቀበልም።",
        "ባለቤቶች ትክክለኛ መረጃ መለጠፍ፣ ቤቱን የማከራየት መብት ሊኖራቸው፣ ማስታወቂያውም ለሁሉም ክፍት መሆን አለበት።",
        "ማጭበርበር፣ ስድብ፣ አድልዎና ሐሰተኛ ማስታወቂያዎች የተከለከሉ ናቸው፤ ማስታወቂያዎችን ልናስወግድና መለያዎችን ልናግድ እንችላለን።",
        "የኪራይ ውል ቅጾቻችን ናሙናዎች ብቻ ናቸው እንጂ የሕግ ምክር አይደሉም።",
      ]}
      sections={[
        {
          title: "1. Who we are",
          paras: [
            `${name} (“${site.name}”, “we”, “us”) is a website at kiraybet.org where people in our community list homes and rooms for rent and talk with each other. By using the site you agree to these terms. If you don't agree, please don't use it.`,
          ],
        },
        {
          title: "2. Who can use it",
          bullets: [
            "You must be 18 or older.",
            "Use your own email address and keep it secure. You're responsible for what happens in your account.",
            "One account per person. Don't create accounts to get around a ban.",
          ],
        },
        {
          title: `3. What ${name} is, and isn't`,
          bullets: [
            `${name} is a place to find and post rentals. We are not a landlord, real estate broker or property manager, and we are not a party to any lease or agreement between hosts and renters.`,
            "A person reviews every listing before it appears, but we can't verify ownership, condition, or everything a host or renter says. Visit the home and check before you sign or pay.",
            `${name} never handles rent, deposits or any other payments.`,
          ],
        },
        {
          title: "4. Rules for hosts",
          bullets: [
            "Only list a home you have the right to rent out (you own it, or the owner allows you to).",
            "Describe the home, price, deposit and availability honestly, and use photos of the actual home that you're allowed to use.",
            "Every listing must be open to everyone. You may not limit or prefer renters by race, color, national origin, religion, sex, disability, family status, source of income, or any other trait protected by federal, state or local fair housing law.",
            "Don't put phone numbers, emails, other apps or payment details in a listing. Renters contact you through messages on the site.",
            "Follow the laws that apply to renting, including local licensing, safety and security deposit rules.",
            "Keep your listing up to date, and mark it rented or delete it when it's no longer available.",
          ],
        },
        {
          title: "5. Rules for everyone",
          paras: ["Don't use the site to:"],
          bullets: [
            "scam anyone, or ask for money before a viewing and a signed lease;",
            "harass, threaten or insult people, or post hateful or sexual content;",
            "post fake, misleading or copied listings, or impersonate someone;",
            "collect other users' information, send spam, or advertise unrelated services;",
            "break the law, or try to break, overload or get around the site's security (including automated scraping).",
          ],
        },
        {
          title: "6. Your content",
          paras: [
            `You keep ownership of what you post (text and photos). You give ${name} permission to store, show and share it on the site (and in links people share from the site) so your listing and messages work. This permission ends when you delete the content, except for copies we must keep for safety, legal reasons or to handle a report.`,
          ],
        },
        {
          title: "7. Reviews, reports and removal",
          paras: [
            "We review listings before they go live and may reject, edit for safety (for example removing contact details), or take down any listing. We may read a conversation when someone reports it. We may suspend or ban accounts that break these terms or put others at risk, with or without notice.",
          ],
        },
        {
          title: "8. Lease templates",
          paras: [
            `${name} may offer lease templates to help hosts get started. They are samples only, not legal advice, and may not fit your situation or the law where the home is. Have a lawyer review any lease before you sign it.`,
          ],
        },
        {
          title: "9. No guarantees",
          paras: [
            `The site is provided “as is”. We do our best to keep it working and safe, but we don't promise it will always be available or error-free, and we don't guarantee any listing, host, renter or outcome. You're responsible for your own decisions about renting.`,
          ],
        },
        {
          title: "10. Limits on our responsibility",
          paras: [
            `To the extent the law allows, ${name} is not liable for losses that come from dealings between users (including scams, damage to property, or disputes over a lease or deposit), or for indirect or consequential losses. If we are found liable for anything, our total responsibility is limited to $100. Some places don't allow these limits, so they may not all apply to you.`,
            `If your actions on the site lead to a claim against ${name}, you agree to cover the costs that result, to the extent the law allows.`,
          ],
        },
        {
          title: "11. Ending your use",
          paras: [
            <>
              You can stop using the site at any time and delete your listings. To delete your account,{" "}
              <Link href="/contact" className={link}>
                contact us
              </Link>
              . These terms keep applying to anything that happened before.
            </>,
          ],
        },
        {
          title: "12. Changes",
          paras: [
            "We may update these terms. We'll change the date at the top, and for important changes we'll show a notice on the site. Using the site after a change means you accept the new terms.",
          ],
        },
        {
          title: "13. Law",
          paras: ["These terms are governed by the laws of the State of Colorado, USA, without regard to its conflict-of-law rules."],
        },
        {
          title: "14. Contact",
          paras: [
            <>
              Questions about these terms?{" "}
              <Link href="/contact" className={link}>
                Contact us
              </Link>
              .
            </>,
          ],
        },
      ]}
    />
  );
}
