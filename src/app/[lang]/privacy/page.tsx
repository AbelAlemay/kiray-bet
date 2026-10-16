import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Privacy Policy", "የግላዊነት ፖሊሲ") };
}

const link = "font-semibold text-brand hover:underline";
const name = site.nameLatin;

export default async function PrivacyPage() {
  const t = await getT();
  return (
    <LegalPage
      label={t.both("Privacy Policy", "የግላዊነት ፖሊሲ")}
      title="Privacy Policy"
      updated="October 15, 2026"
      showAmSummary={t.lang === "am"}
      amSummary={[
        "ስልክ ቁጥርዎን አንጠይቅም። ኢሜይልዎ ለሌሎች ተጠቃሚዎች በፍጹም አይታይም፤ የሚታየው የመጀመሪያ ስምዎ ብቻ ነው።",
        "የቤቱ ትክክለኛ አድራሻ በግል ይጠበቃል፤ የሚታየው ባለቤቱ ሲፈቅድ ብቻ ነው።",
        "ከፎቶዎች ውስጥ የተደበቀ የቦታ (GPS) መረጃን እናስወግዳለን።",
        "መልዕክቶችዎን የምናነበው አንድ ሰው ውይይቱን ሪፖርት ሲያደርግ ብቻ ነው።",
        "መረጃዎን አንሸጥም፤ የማስታወቂያ መከታተያዎችም አንጠቀምም።",
        "መለያዎንና መረጃዎን ለመሰረዝ በማንኛውም ጊዜ ሊያገኙን ይችላሉ።",
      ]}
      sections={[
        {
          title: "1. The short version",
          bullets: [
            "We never ask for your phone number, and other users never see your email. They see only your first name.",
            "A home's exact address stays private unless the host chooses to share it.",
            "We remove hidden location data (GPS) from photos before they're stored.",
            "We read messages only when someone reports a conversation.",
            "We don't sell your information and we don't use advertising trackers.",
          ],
        },
        {
          title: "2. What we collect",
          bullets: [
            "Account: your email address (to sign you in with a code), your first name, and your preferred language.",
            "Listings: what hosts post, including the street address, unit and ZIP code (kept private), a map point worked out from the address, and photos.",
            "Messages: what you write to other users, when it was sent and read, and requests to share an address.",
            "Saved homes and reports you send.",
            "Contact form: your name, email and message.",
            "A visit counter: a random ID in a cookie so we can count daily visitors. It's not linked to your account, and we skip it if your browser sends “Do Not Track” or Global Privacy Control.",
            "Basic technical logs kept by our hosting providers (such as IP address and browser type) to keep the site running and secure.",
          ],
        },
        {
          title: "3. Who can see what",
          bullets: [
            "Everyone: approved listings (title, description, price, photos, rooms, amenities), the host's first name, and an approximate location (a nearby intersection and a map area about 1 km wide). The exact address is shown publicly only if the host chooses to show it.",
            "The other person in a conversation: your first name and your messages. A renter sees the exact address only when the host shares it, and the host can stop sharing it.",
            `${name}'s administrator: what's needed to review listings, handle reports and keep the site safe. The administrator signs in with two-step verification and can read a conversation only after someone reports it.`,
            "Nobody else, except as described in section 4 or when the law requires it.",
          ],
        },
        {
          title: "4. Services we use",
          paras: ["These companies process some information for us, only to run the site:"],
          bullets: [
            "Supabase: stores accounts, listings, photos and messages.",
            "Vercel: hosts the website.",
            "Cloudflare Turnstile: checks that forms are filled in by a person, not a bot.",
            "U.S. Census Bureau geocoder: turns a listing's address into a map point when a host posts it.",
            "OpenStreetMap: shows map tiles, and finds the nearest intersection and neighborhood name from the approximate map point (never the exact address).",
            "Resend (email): sends sign-in codes, new-message notices (which never include the message itself; you can turn them off on your account page), and alerts to our administrator.",
            "Telegram: sends alerts to our administrator about new listings, reports and contact messages. Listing alerts contain no address or email.",
          ],
        },
        {
          title: "5. Cookies",
          bullets: [
            "Sign-in cookies, so you stay signed in.",
            "Your chosen language and area.",
            "The visit counter ID described above.",
            "We don't use advertising or social media cookies.",
          ],
        },
        {
          title: "6. How long we keep it",
          bullets: [
            "Your account and messages: while your account exists.",
            "Listings and photos: until the host deletes them. Deleting a listing deletes its photos.",
            "Reports: as long as needed to keep the site safe.",
            "Visit counts: as daily totals.",
          ],
        },
        {
          title: "7. Your choices",
          bullets: [
            "Edit your name and language on your account page, and edit, mark rented or delete your listings at any time.",
            <>
              To see, correct or delete your information, or to delete your account,{" "}
              <Link href="/contact" className={link}>
                contact us
              </Link>
              . We&apos;ll respond within 30 days.
            </>,
          ],
        },
        {
          title: "8. Security",
          paras: [
            "We use encrypted connections, private photo storage with short-lived links, strict database access rules, and two-step login for the administrator. No system is perfectly secure, so please don't share more than you need to in messages.",
          ],
        },
        {
          title: "9. Children",
          paras: [`${name} is for adults. We don't knowingly collect information from anyone under 18.`],
        },
        {
          title: "10. Changes",
          paras: ["If we change this policy we'll update the date at the top, and show a notice on the site for important changes."],
        },
        {
          title: "11. Contact",
          paras: [
            <>
              Questions about your privacy?{" "}
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
