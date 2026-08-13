import type { Metadata } from "next";
import { IBM_Plex_Sans, Syne } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://comingsoonest.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coming Soonest — Watch what’s next",
    template: "%s · Coming Soonest",
  },
  description:
    "Launch intelligence for products, services, places and experiences. We find it before it launches. We track it until it drops.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Coming Soonest",
    title: "Coming Soonest — Watch what’s next",
    description:
      "Launch intelligence for products, services, places and experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coming Soonest — Watch what’s next",
    description:
      "Launch intelligence for products, services, places and experiences.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
