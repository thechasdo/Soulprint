import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yoursoulprint.com"),
  title: "Soulprint — Memories Live On",
  description: "Soulprint is a secure family legacy platform for preserving stories, photos, voices, documents, timelines, and memories.",
  icons: {
    icon: "/soulprint-logo.png",
    apple: "/soulprint-logo.png"
  },
  openGraph: {
    title: "Soulprint — Memories Live On",
    description: "A secure, beautiful home for the memories, voices, stories, and legacies that matter most.",
    url: "https://yoursoulprint.com",
    siteName: "Soulprint",
    images: [
      {
        url: "/soulprint-logo.png",
        width: 1200,
        height: 1200,
        alt: "Soulprint — Memories Live On Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soulprint — Memories Live On",
    description: "A secure, beautiful home for the memories, voices, stories, and legacies that matter most.",
    images: ["/soulprint-logo.png"],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
