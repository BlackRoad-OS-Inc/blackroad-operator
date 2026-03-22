import type { Metadata } from 'next'
import Script from 'next/script'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlackRoad Studio — Animated Video Generator',
  description: 'Create animated videos with Higgly Town Heroes-style characters. Pick templates, write scripts, choose voiceovers, render up to 40-minute videos.',
  icons: {
    icon: 'https://images.blackroad.io/brand/favicon.ico',
    apple: 'https://images.blackroad.io/brand/apple-touch-icon.png',
  },
  openGraph: {
    title: 'BlackRoad Studio',
    description: 'BlackRoad OS — Pave Tomorrow.',
    images: ['https://images.blackroad.io/brand/blackroad-icon-512.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
        <Script src="https://blackroad-mesh.amundsonalexa.workers.dev/mesh.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
