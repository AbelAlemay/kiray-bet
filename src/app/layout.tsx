import type { Metadata, Viewport } from "next";
import { Geist, Menbere } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SavedProvider } from "@/components/SavedProvider";
import { VisitTracker } from "@/components/VisitTracker";
import { Suspense } from "react";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${ethiopic.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      {/* Pages with a fixed bottom bar on phones (data-bottom-bar) get room below the footer. */}
      <body className="min-h-full flex flex-col font-sans has-[[data-bottom-bar]]:pb-24 lg:has-[[data-bottom-bar]]:pb-0">
        <SavedProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SavedProvider>
        {/* Reads the current path, so it sits in its own Suspense boundary. */}
        <Suspense>
          <VisitTracker />
        </Suspense>
      </body>
    </html>
  );
}
