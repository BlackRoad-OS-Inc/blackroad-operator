import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/dashboard-2', '/account', '/settings-page', '/admin-panel', '/checkout'],
      },
    ],
    sitemap: 'https://blackroad-os-web.pages.dev/sitemap.xml',
  }
}
