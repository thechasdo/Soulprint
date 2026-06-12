import type { Metadata } from "next";
import { Cormorant_Garamond, Fraunces, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-soul-display",
});

const story = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-soul-story",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-soul-sans",
});

const script = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-soul-script",
});

export const metadata: Metadata = {
  title: "Soulprint - Memories Live On",
  description: "A warm digital home for stories, photos, voices, family records, and remembrance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${story.variable} ${sans.variable} ${script.variable}`}>
        {children}
      </body>
    </html>
  );
}
