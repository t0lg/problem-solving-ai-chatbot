import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResolveAI — Endüstriyel Problem Zekası",
  description:
    "Endüstriyel problem çözümü için yapay zeka destekli kök neden analizi platformu. Örüntüleri belirleyin, benzer olayları bulun ve sorunları daha hızlı çözün.",
  keywords: [
    "kök neden analizi",
    "endüstriyel problem çözme",
    "yapay zeka",
    "FMEA",
    "5 Neden",
    "olay yönetimi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
