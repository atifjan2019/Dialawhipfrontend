import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Dialawhip — Fresh Newcastle catering, delivered",
    template: "%s · Dialawhip",
  },
  description:
    "Hand-prepared catering from the heart of Newcastle upon Tyne — office lunches, family gatherings and events, delivered the same day.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
