// Cloudflare Pages Functions middleware — SSR for search engine crawlers
// Hostname-aware: serves per-domain meta, JSON-LD, OpenGraph, sitemap, robots.txt

import { getDomainConfig } from './config/domains.js';

const CRAWLER_UA_PATTERNS = [
  'googlebot', 'bingbot', 'baiduspider', 'yandex', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'slackbot', 'whatsapp', 'discordbot',
  'telegrambot', 'applebot',
];

const POSTS = {
  '52-tops-on-400-dollars': {
    title: '52 TOPS on $400: Running AI Inference at the Edge',
    description: 'How we built a distributed AI inference cluster with two Hailo-8 accelerators, five Raspberry Pis, and a custom mesh network.',
    date: '2026-03-10',
    author: 'Alexa Louise Amundson',
    tags: ['edge-ai', 'hailo-8', 'raspberry-pi', 'inference', 'mesh-network'],
    readTime: '14 min read',
  },
  'roadnet-carrier-grade-mesh': {
    title: 'Building a Carrier-Grade Mesh Network on Raspberry Pis',
    description: 'RoadNet: 5 access points, 5 subnets, WireGuard failover, Pi-hole DNS — a real carrier network running on $35 boards.',
    date: '2026-03-08',
    author: 'Alexa Louise Amundson',
    tags: ['mesh-network', 'wireguard', 'raspberry-pi', 'networking'],
    readTime: '11 min read',
  },
  'self-healing-infrastructure': {
    title: 'Self-Healing Infrastructure: When Your Servers Fix Themselves',
    description: 'Autonomy scripts, heartbeat monitors, and automatic service recovery — how we eliminated 3am pages.',
    date: '2026-03-06',
    author: 'Alexa Louise Amundson',
    tags: ['infrastructure', 'self-healing', 'automation', 'devops'],
    readTime: '9 min read',
  },
  'roadc-language-for-agents': {
    title: 'Designing a Programming Language for AI Agents',
    description: 'Why existing languages fail for agent orchestration, and how RoadC solves it with Python-style indentation and first-class concurrency.',
    date: '2026-03-04',
    author: 'Alexa Louise Amundson',
    tags: ['programming-languages', 'roadc', 'ai-agents', 'language-design'],
    readTime: '16 min read',
  },
  'sovereign-computing-manifesto': {
    title: 'The Sovereign Computing Manifesto',
    description: 'Your infrastructure should answer to you. Not a cloud provider. Not a vendor. You.',
    date: '2026-03-02',
    author: 'Alexa Louise Amundson',
    tags: ['sovereign-computing', 'philosophy', 'self-hosted', 'independence'],
    readTime: '7 min read',
  },
};

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_PATTERNS.some((p) => ua.includes(p));
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function renderHomepage(config) {
  const { name, tagline, description, seo } = config;
  const url = seo.canonical;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': seo.jsonLdType,
    name,
    url,
    description,
    founder: { '@type': 'Person', name: 'Alexa Louise Amundson', url: 'https://alexa.blackroad.io' },
    sameAs: ['https://github.com/blackboxprogramming', 'https://blackroad.company', 'https://blackroadai.com'],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)} — ${escapeHtml(tagline)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}/">
  <meta property="og:type" content="${seo.ogType}">
  <meta property="og:title" content="${escapeHtml(name)} — ${escapeHtml(tagline)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}/">
  <meta property="og:site_name" content="${escapeHtml(name)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(name)} — ${escapeHtml(tagline)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${escapeHtml(name)}</h1>
  <p>${escapeHtml(description)}</p>
  <nav><a href="${url}/blog">Blog</a> <a href="${url}/docs">Docs</a> <a href="${url}/about">About</a></nav>
  <noscript><p>This page requires JavaScript for the full experience. <a href="${url}">Visit ${escapeHtml(name)}</a>.</p></noscript>
</body>
</html>`;
}

function renderBlogPost(slug, post, config) {
  const { name, seo } = config;
  const url = `${seo.canonical}/blog/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name, url: seo.canonical },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.tags.join(', '),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} — ${escapeHtml(name)}</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <meta name="author" content="${escapeHtml(post.author)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${escapeHtml(name)}">
  <meta property="article:published_time" content="${post.date}">
${post.tags.map((t) => `  <meta property="article:tag" content="${escapeHtml(t)}">`).join('\n')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <article>
    <h1>${escapeHtml(post.title)}</h1>
    <p><time datetime="${post.date}">${post.date}</time> · ${escapeHtml(post.readTime)} · By ${escapeHtml(post.author)}</p>
    <p>${escapeHtml(post.description)}</p>
  </article>
</body>
</html>`;
}

function renderBlogListing(config) {
  const { name, seo } = config;
  const url = `${seo.canonical}/blog`;
  const sorted = Object.entries(POSTS).sort(([, a], [, b]) => new Date(b.date) - new Date(a.date));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${name} Blog`,
    url,
    publisher: { '@type': 'Organization', name, url: seo.canonical },
    blogPost: sorted.map(([slug, post]) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@type': 'Person', name: post.author },
      url: `${seo.canonical}/blog/${slug}`,
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog — ${escapeHtml(name)}</title>
  <meta name="description" content="Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Blog — ${escapeHtml(name)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${escapeHtml(name)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Blog — ${escapeHtml(name)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${escapeHtml(name)} Blog</h1>
  <ul>
${sorted.map(([slug, post]) => `    <li><a href="${seo.canonical}/blog/${slug}">${escapeHtml(post.title)}</a><p>${escapeHtml(post.description)}</p></li>`).join('\n')}
  </ul>
</body>
</html>`;
}

function renderSitemap(config) {
  const { seo, routes } = config;
  const base = seo.canonical;
  const paths = routes === 'all'
    ? ['/', '/dashboard', '/os', '/status', '/chat', '/terminal', '/explorer', '/chain', '/docs', '/about', '/leadership', '/auth', '/settings', '/roadmap', '/brand', '/pricing', '/blog', '/analytics']
    : routes;

  const urls = paths.map(p => `  <url><loc>${base}${p === '/' ? '' : p}</loc></url>`).join('\n');

  // Add blog post URLs if blog is included
  let blogUrls = '';
  if (routes === 'all' || routes.includes('/blog')) {
    blogUrls = Object.keys(POSTS).map(slug => `  <url><loc>${base}/blog/${slug}</loc></url>`).join('\n');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
${blogUrls}
</urlset>`;
}

function renderRobots(config) {
  return `User-agent: *
Allow: /

Sitemap: ${config.seo.canonical}/sitemap.xml`;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const config = getDomainConfig(url.hostname);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Dynamic sitemap and robots for all requests (not just crawlers)
  if (path === '/sitemap.xml') {
    return new Response(renderSitemap(config), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  }
  if (path === '/robots.txt') {
    return new Response(renderRobots(config), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  // Only SSR for crawlers
  const userAgent = request.headers.get('user-agent') || '';
  if (!isCrawler(userAgent)) {
    return context.next();
  }

  // Homepage
  if (path === '/' || path === '') {
    return new Response(renderHomepage(config), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Blog listing (only if domain allows it)
  if (path === '/blog' && (config.routes === 'all' || config.routes.includes('/blog'))) {
    return new Response(renderBlogListing(config), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Blog post
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch && (config.routes === 'all' || config.routes.includes('/blog'))) {
    const post = POSTS[blogMatch[1]];
    if (post) {
      return new Response(renderBlogPost(blogMatch[1], post, config), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // All other paths — pass through to SPA
  return context.next();
}
