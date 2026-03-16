import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "BlackRoad Docs",
  description: "BlackRoad OS — Pave Tomorrow.",
  icons: {
    icon: "https://images.blackroad.io/brand/favicon.ico",
    apple: "https://images.blackroad.io/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "BlackRoad Docs",
    images: ["https://images.blackroad.io/brand/blackroad-icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://blackroad-mesh.amundsonalexa.workers.dev/mesh.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
