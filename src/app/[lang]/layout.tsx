import type { Metadata, Viewport } from "next";
import { Geist, Menbere } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SavedProvider } from "@/components/SavedProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { Suspense } from "react";
import { LangProvider } from "@/components/LangProvider";
import { langs } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ethiopic = Menbere({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
  // Next.js has no fallback metrics for Menbere, so skip the generated fallback.
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: {
      default: t(site.seoTitle, site.seoTitleAm),
      template: `%s · ${site.nameLatin}`,
    },
    description: t(site.seoDescription, site.seoDescriptionAm),
    // Absolute links in share previews (the image is src/app/opengraph-image.tsx).
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: {
      siteName: `${site.name} · ${site.nameLatin}`,
      type: "website",
      locale: t("en_US", "am_ET"),
    },
    twitter: { card: "summary_large_image" },
    // Open to search engines since launch; NEXT_PUBLIC_ALLOW_INDEXING=off hides the site again.
    robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "off" ? undefined : { index: false, follow: false },
  };
}

// The site's name, other spellings and logo for search results (schema.org).
function structuredData() {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: site.nameLatin,
        alternateName: site.otherNames,
        url: `${url}/`,
        inLanguage: ["en", "am"],
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: site.nameLatin,
        alternateName: site.otherNames,
        url: `${url}/`,
        logo: `${url}/app-icons/512`,
        description: site.seoDescription,
        // Our social media accounts (add new ones in site.socials).
        sameAs: site.socials.map((s) => s.url),
      },
    ],
  };
}

// Colors the phone's browser bar to match the (always dark) site.
// viewportFit "cover" lets bottom bars pad for the iPhone home indicator.
export const viewport: Viewport = {
  themeColor: "#141311",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Every page is built in English and Amharic.
export function generateStaticParams() {
  return langs.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const t = await getT();
  return (
    <html
      lang={t.lang}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${ethiopic.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      {/* Pages with a fixed bottom bar on phones (data-bottom-bar) get room below the footer. */}
      <body className="min-h-full flex flex-col font-sans has-[[data-bottom-bar]]:pb-24 lg:has-[[data-bottom-bar]]:pb-0">
        <script
          type="application/ld+json"
          // Tells search engines the site's name (and other spellings) and logo.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
        <LangProvider lang={t.lang}>
          <SavedProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SavedProvider>
        </LangProvider>
        {/* Reads the current path, so it sits in its own Suspense boundary. */}
        <Suspense>
          <VisitTracker />
        </Suspense>
      </body>
    </html>
  );
}
