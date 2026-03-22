import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@br/ui";
import { Analytics } from "./components/Analytics";
import { hero, siteConfig } from "./site-config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: hero.description,
  metadataBase: new URL(`https://${siteConfig.domain}`),
  keywords: ["creative studio", "AI courses", "agent development", "creative education", "online learning", "developer training", "AI tutorials"],
  authors: [{ name: "Lucidia Studio Team" }],
  creator: "Lucidia Studio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `https://${siteConfig.domain}`,
    title: siteConfig.name,
    description: hero.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${hero.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: hero.description,
    images: ["/og-image.png"],
    creator: "@lucidiastudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header title={siteConfig.name} navigation={siteConfig.navigation} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">{children}</main>
        <Footer
          links={[
            { label: "Docs", href: "/docs" },
            { label: "Status", href: "/status" },
            { label: "Privacy", href: "/privacy" }
          ]}
        />
        <Analytics />
      </body>
    </html>
  );
}
