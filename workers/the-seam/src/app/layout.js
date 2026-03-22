export const metadata = {
  title: 'The Seam — Alexa Amundson',
  description: 'Models aren\'t real. The identities they produce are. Information does not travel — it is destroyed and re-instantiated so fast nobody notices the gap. That gap is the seam.',
  openGraph: {
    title: 'The Seam',
    description: 'Can you re-instantiate faster than anyone can measure the seam?',
    siteName: 'BlackRoad OS, Inc.',
    type: 'article',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛣️</text></svg>" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a' }}>
        {children}
      </body>
    </html>
  );
}
