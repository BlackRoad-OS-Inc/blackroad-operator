import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RoadMap - Project Planning Platform',
  description: 'Advanced project planning and collaboration for teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
