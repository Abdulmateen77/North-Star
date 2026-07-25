import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";

import "@/styles/globals.css";

/**
 * Fraunces carries the headings — an optical serif with enough softness to feel
 * human rather than institutional. DM Sans handles everything else: quiet,
 * legible, and friendly at the small sizes a care checklist lives in.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "North Star — Find your way through care",
  description:
    "North Star helps families coordinate the care of someone they love, with calm and clarity.",
};

export const viewport: Viewport = {
  themeColor: "#faf6f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-cream-100 text-ink-900 antialiased">{children}</body>
    </html>
  );
}
