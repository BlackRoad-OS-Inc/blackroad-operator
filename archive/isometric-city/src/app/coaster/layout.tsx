import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://iso-coaster.com'),
  title: {
    default: 'ISOCOASTER — Theme Park Builder',
    template: 'ISOCOASTER — %s',
    absolute: 'ISOCOASTER — Theme Park Builder',
  },
  description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
  openGraph: {
    title: 'ISOCOASTER — Theme Park Builder',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    type: 'website',
    siteName: 'IsoCoaster',
    images: [
      {
        url: '/coaster/opengraph-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'IsoCoaster - Theme park builder game screenshot'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISOCOASTER — Theme Park Builder',
    description: 'Build the ultimate theme park with thrilling roller coasters, exciting rides, and happy guests!',
    images: ['/coaster/opengraph-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IsoCoaster',
  },
};

export default function CoasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
