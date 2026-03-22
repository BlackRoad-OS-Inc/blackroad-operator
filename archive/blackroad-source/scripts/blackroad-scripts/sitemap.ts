import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blackroad-os-web.pages.dev'

  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/platform', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/alice-qi', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/lucidia', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/prism-console', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/roadchain', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pricing-2', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/docs/getting-started', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/docs/integrations', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/multi-agent', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/docs/security', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/api-docs', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/case-studies', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/careers', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/changelog', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/roadmap', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/integrations', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/security', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/resources', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/comparison-table', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/team', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/press-kit', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/portfolio', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/legal-pages', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/status-page', priority: 0.5, changeFrequency: 'daily' as const },
    { path: '/style-guide', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/signup', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
