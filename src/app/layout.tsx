import type { Metadata, Viewport } from "next";
import { Fraunces, Gabarito } from "next/font/google";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/AuthProvider";
import "@/styles/globals.css";

/**
 * Gabarito does the heavy lifting — a warm geometric sans that stays friendly
 * at display weights, set tight. Fraunces appears only on emphasised words,
 * where the contrast between a bold sans and a soft serif carries the brand's
 * voice (see the `Emphasis` component).
 */
const gabarito = Gabarito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-gabarito",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "North Star — Find your way through care",
  description:
    "North Star helps families coordinate the care of someone they love, with calm and clarity.",
};

export const viewport: Viewport = {
  themeColor: "#f4f1e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh bg-bone-100 text-olive-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
