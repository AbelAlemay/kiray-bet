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

export const metadata: Metadata = {
  title: {
    default: `${site.name} · ${site.nameLatin}`,
    template: `%s · ${site.nameLatin}`,
  },
  description: site.tagline,
  // Absolute links in share previews (the image is src/app/opengraph-image.tsx).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: `${site.name} · ${site.nameLatin}`,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  // Kept out of search engines until public launch (set NEXT_PUBLIC_ALLOW_INDEXING=on).
  robots: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "on" ? undefined : { index: false, follow: false },
};

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
