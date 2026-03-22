// Cloudflare Pages Functions middleware — SSR for search engine crawlers
// Intercepts bot requests and returns pre-rendered HTML with meta tags,
// OpenGraph, Twitter cards, and JSON-LD structured data.

const SITE_URL = 'https://blackroad.io';
const SITE_NAME = 'BlackRoad';
const SITE_DESCRIPTION = 'Sovereign computing infrastructure. Edge AI, mesh networking, and self-healing systems built on Raspberry Pis.';

const CRAWLER_UA_PATTERNS = [
  'googlebot',
  'bingbot',
  'baiduspider',
  'yandex',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'whatsapp',
  'discordbot',
  'telegrambot',
  'applebot',
];

const POSTS = {
  '52-tops-on-400-dollars': {
    title: '52 TOPS on $400: Running AI Inference at the Edge',
    description: 'How we built a distributed AI inference cluster with two Hailo-8 accelerators, five Raspberry Pis, and a custom mesh network — delivering 52 trillion operations per second for under $400 in hardware.',
    date: '2026-03-10',
    author: 'Alexa Amundson',
    tags: ['edge-ai', 'hailo-8', 'raspberry-pi', 'inference', 'mesh-network'],
    readTime: '14 min read',
  },
  'roadnet-carrier-grade-mesh': {
    title: 'Building a Carrier-Grade Mesh Network on Raspberry Pis',
    description: 'RoadNet: 5 access points, 5 subnets, WireGuard failover, Pi-hole DNS — a real carrier network running on $35 boards.',
    date: '2026-03-08',
    author: 'Alexa Amundson',
    tags: ['mesh-network', 'wireguard', 'raspberry-pi', 'networking'],
    readTime: '11 min read',
  },
  'self-healing-infrastructure': {
    title: 'Self-Healing Infrastructure: When Your Servers Fix Themselves',
    description: 'Autonomy scripts, heartbeat monitors, and automatic service recovery — how we eliminated 3am pages.',
    date: '2026-03-06',
    author: 'Alexa Amundson',
    tags: ['infrastructure', 'self-healing', 'automation', 'devops'],
    readTime: '9 min read',
  },
  'roadc-language-for-agents': {
    title: 'Designing a Programming Language for AI Agents',
    description: 'Why existing languages fail for agent orchestration, and how RoadC solves it with Python-style indentation and first-class concurrency.',
    date: '2026-03-04',
    author: 'Alexa Amundson',
    tags: ['programming-languages', 'roadc', 'ai-agents', 'language-design'],
    readTime: '16 min read',
  },
  'sovereign-computing-manifesto': {
    title: 'The Sovereign Computing Manifesto',
    description: 'Your infrastructure should answer to you. Not a cloud provider. Not a vendor. You.',
    date: '2026-03-02',
    author: 'Alexa Amundson',
    tags: ['sovereign-computing', 'philosophy', 'self-hosted', 'independence'],
    readTime: '7 min read',
  },
};

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderBlogPost(slug, post) {
  const url = `${SITE_URL}/blog/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags.join(', '),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} — ${SITE_NAME}</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <meta name="keywords" content="${escapeHtml(post.tags.join(', '))}">
  <meta name="author" content="${escapeHtml(post.author)}">
  <link rel="canonical" href="${url}">

  <!-- OpenGraph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="article:published_time" content="${post.date}">
  <meta property="article:author" content="${escapeHtml(post.author)}">
${post.tags.map((t) => `  <meta property="article:tag" content="${escapeHtml(t)}">`).join('\n')}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description)}">

  <!-- JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <article>
    <h1>${escapeHtml(post.title)}</h1>
    <p><time datetime="${post.date}">${post.date}</time> &middot; ${escapeHtml(post.readTime)} &middot; By ${escapeHtml(post.author)}</p>
    <p>${escapeHtml(post.description)}</p>
    <p>Tags: ${post.tags.map((t) => escapeHtml(t)).join(', ')}</p>
  </article>
  <noscript>
    <p>This page requires JavaScript for the full experience. <a href="${url}">Read this article on BlackRoad</a>.</p>
  </noscript>
</body>
</html>`;
}

function renderBlogListing() {
  const url = `${SITE_URL}/blog`;
  const sortedPosts = Object.entries(POSTS).sort(
    ([, a], [, b]) => new Date(b.date) - new Date(a.date)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Blog`,
    description: 'Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.',
    url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    blogPost: sortedPosts.map(([slug, post]) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: { '@type': 'Person', name: post.author },
      url: `${SITE_URL}/blog/${slug}`,
    })),
  };

  const postListHtml = sortedPosts
    .map(
      ([slug, post]) =>
        `    <li>
      <a href="${SITE_URL}/blog/${slug}">${escapeHtml(post.title)}</a>
      <p>${escapeHtml(post.description)}</p>
      <p><time datetime="${post.date}">${post.date}</time> &middot; ${escapeHtml(post.readTime)}</p>
    </li>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog — ${SITE_NAME}</title>
  <meta name="description" content="Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.">
  <meta name="keywords" content="edge-ai, mesh-network, sovereign-computing, infrastructure, raspberry-pi">
  <link rel="canonical" href="${url}">

  <!-- OpenGraph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Blog — ${SITE_NAME}">
  <meta property="og:description" content="Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="${SITE_NAME}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Blog — ${SITE_NAME}">
  <meta name="twitter:description" content="Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.">

  <!-- JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${SITE_NAME} Blog</h1>
  <p>Engineering articles on sovereign computing, edge AI, mesh networking, and infrastructure automation.</p>
  <ul>
${postListHtml}
  </ul>
  <noscript>
    <p>This page requires JavaScript for the full experience. <a href="${url}">Visit the BlackRoad blog</a>.</p>
  </noscript>
</body>
</html>`;
}

function renderHomepage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    founder: {
      '@type': 'Person',
      name: 'Alexa Amundson',
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${SITE_NAME} — Sovereign Computing Infrastructure</title>
  <meta name="description" content="${escapeHtml(SITE_DESCRIPTION)}">
  <meta name="keywords" content="sovereign computing, edge ai, mesh network, self-hosted, infrastructure, raspberry pi">
  <link rel="canonical" href="${SITE_URL}/">

  <!-- OpenGraph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${SITE_NAME} — Sovereign Computing Infrastructure">
  <meta property="og:description" content="${escapeHtml(SITE_DESCRIPTION)}">
  <meta property="og:url" content="${SITE_URL}/">
  <meta property="og:site_name" content="${SITE_NAME}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${SITE_NAME} — Sovereign Computing Infrastructure">
  <meta name="twitter:description" content="${escapeHtml(SITE_DESCRIPTION)}">

  <!-- JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <h1>${SITE_NAME}</h1>
  <p>${escapeHtml(SITE_DESCRIPTION)}</p>
  <nav>
    <a href="${SITE_URL}/blog">Blog</a>
  </nav>
  <noscript>
    <p>This page requires JavaScript for the full experience. <a href="${SITE_URL}">Visit BlackRoad</a>.</p>
  </noscript>
</body>
</html>`;
}

export async function onRequest(context) {
  const { request } = context;
  const userAgent = request.headers.get('user-agent') || '';

  if (!isCrawler(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Homepage
  if (path === '/' || path === '') {
    return new Response(renderHomepage(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Blog listing
  if (path === '/blog') {
    return new Response(renderBlogListing(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Blog post
  const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = POSTS[slug];
    if (post) {
      return new Response(renderBlogPost(slug, post), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // All other paths — pass through to SPA
  return context.next();
}
