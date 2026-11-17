import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
// import { Navbar } from "@/components/layout/Navbar";
// import { AnnouncementBar } from "@/components/layout/AnnouncementBar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Duggu Arts - Handmade Pipe Cleaner Flowers",
    template: "%s | Duggu Arts",
  },
  description: "Beautiful handmade pipe-cleaner flowers crafted with love. Roses, tulips, daisies, and custom bouquets for every occasion.",
  keywords: ["handmade flowers", "pipe cleaner flowers", "custom bouquets", "gift flowers", "home decor"],
  authors: [{ name: "Duggu Arts" }],
  creator: "Duggu Arts",
  publisher: "Duggu Arts",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Duggu Arts",
    title: "Duggu Arts - Handmade Pipe Cleaner Flowers",
    description: "Beautiful handmade pipe-cleaner flowers crafted with love.",
    images: [
      {
        url: "/images/branding/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Duggu Arts - Handmade Flowers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duggu Arts - Handmade Pipe Cleaner Flowers",
    description: "Beautiful handmade pipe-cleaner flowers crafted with love.",
    images: ["/images/branding/og-image.svg"],
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#171519" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}