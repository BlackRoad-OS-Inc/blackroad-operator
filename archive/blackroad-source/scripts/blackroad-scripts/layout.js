export const metadata = {
  title: 'BlackRoad OS App Store',
  description: 'Your own app store - zero gatekeepers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
        {children}
      </body>
    </html>
  )
}
