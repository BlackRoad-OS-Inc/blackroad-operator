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
  keywords: ["agent federation", "multi-agent systems", "agent network", "distributed agents", "agent collaboration", "agent orchestration", "federated AI"],
  authors: [{ name: "Blackroad Network Team" }],
  creator: "Blackroad Network",
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
    creator: "@blackroadnetwork",
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
            { label: "Vitals", href: "/agents" },
            { label: "Graph", href: "/agents?tab=graph" },
            { label: "Bootcamp", href: "https://lucidia.earth/bootcamp" },
            { label: "API", href: "https://blackroadai.com/agents" }
          ]}
        />
        <Analytics />
      </body>
    </html>
  );
}
