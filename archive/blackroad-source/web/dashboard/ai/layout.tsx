import './globals.css'

export const metadata = {
  title: 'BlackRoad AI - Agent Network',
  description: '9 AI agents working together across distributed Raspberry Pi devices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{margin: 0, padding: 0, background: '#000', color: '#fff'}}>{children}</body>
    </html>
  )
}
