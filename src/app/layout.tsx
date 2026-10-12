import type { Metadata } from "next";
import { Geist, Menbere } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${ethiopic.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
