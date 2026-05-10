import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResolveAI — Industrial Problem Intelligence",
  description:
    "AI-powered root cause analysis platform for industrial problem solving. Identify patterns, find similar incidents, and resolve issues faster.",
  keywords: [
    "root cause analysis",
    "industrial problem solving",
    "AI",
    "FMEA",
    "5 Whys",
    "incident management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
