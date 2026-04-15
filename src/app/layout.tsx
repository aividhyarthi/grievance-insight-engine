import type { Metadata } from "next";
import "./globals.css";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import Analytics from "@/components/Analytics";

const siteUrl = "https://www.hermidlife.org";
const siteTitle =
  "HerMidlife — Finally, a place where women are heard and not judged";
const siteDescription =
  "Doctor-led, personalised care for perimenopause, menopause and beyond. The first fully integrated platform for midlife care — combining medical expertise, emotional understanding, and continuous support. Built for Australian women.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s — HerMidlife",
  },
  description: siteDescription,
  keywords: [
    "perimenopause",
    "menopause",
    "midlife health",
    "women's health",
    "telehealth",
    "Australia",
    "menopause care",
    "HRT",
    "hormone therapy",
    "midlife care platform",
    "workplace wellness",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteUrl,
    siteName: "HerMidlife",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <ScrollRevealProvider>{children}</ScrollRevealProvider>
        <Analytics />
      </body>
    </html>
  );
}
