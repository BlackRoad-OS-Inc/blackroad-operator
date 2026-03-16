import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "BlackRoad OS",
  description: "BlackRoad OS — Pave Tomorrow.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "BlackRoad OS",
    description: "BlackRoad OS — Pave Tomorrow.",
    images: ["https://images.blackroad.io/brand/blackroad-icon-512.png"],
  },
  twitter: {
    card: "summary",
    images: ["https://images.blackroad.io/brand/blackroad-icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script src="https://blackroad-mesh.amundsonalexa.workers.dev/mesh.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
