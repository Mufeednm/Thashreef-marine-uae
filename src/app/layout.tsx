import type { Metadata } from "next";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/features/i18n/locale-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Marsa Edge Marine LLC", template: "%s | Marsa Edge Marine LLC" },
  description: "Marine spare parts and solutions from Marsa Edge Marine LLC.",
  icons: {
    apple: "/brand/marsa-edge-favicon.png",
    icon: "/brand/marsa-edge-favicon.png",
    shortcut: "/brand/marsa-edge-favicon.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
