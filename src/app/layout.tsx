import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DropTrend - Le cockpit IA pour e-commerçants",
    template: "%s | DropTrend",
  },
  description: "Analysez les tendances, trouvez des produits gagnants et prenez de meilleures décisions business avec l'IA.",
  keywords: ["dropshipping", "e-commerce", "produits gagnants", "shopify", "IA", "analyse produits"],
  authors: [{ name: "DropTrend" }],
  creator: "DropTrend",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DropTrend",
    title: "DropTrend - Le cockpit IA pour e-commerçants",
    description: "Analysez les tendances, trouvez des produits gagnants et prenez de meilleures décisions business.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DropTrend - Le cockpit IA pour e-commerçants",
    description: "Analysez les tendances, trouvez des produits gagnants.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-600/30 selection:text-blue-400`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
