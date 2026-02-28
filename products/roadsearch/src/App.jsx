import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 13 5.2 3a1 1 0 0 0 1.5-.9V8.9a1 1 0 0 0-1.5-.86L16 11" />
    <rect width="14" height="12" x="2" y="6" rx="2" />
  </svg>
);

const NewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3Z" /><path d="M9 4v13" /><path d="M15 7v13" />
  </svg>
);

const ShopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

const ThumbUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

// ─── Data: Simulated Search Engine Data ──────────────────────────────────────

const TRENDING_SEARCHES = [
  'BlackRoad OS release', 'AI agent orchestration', 'quantum computing 2026',
  'Raspberry Pi 6', 'React 19 features', 'self-hosting LLMs', 'Cloudflare Workers AI',
  'vLLM performance', 'edge computing trends', 'Rust vs Go 2026'
];

const AUTOCOMPLETE_MAP = {
  'b': ['blackroad os', 'blackroad ai agents', 'bitcoin price today', 'best programming languages 2026', 'blazor vs react'],
  'bl': ['blackroad os', 'blackroad ai', 'blockchain development', 'blender 4.0 tutorial', 'blazor webassembly'],
  'bla': ['blackroad os', 'blackroad ai agents', 'blackroad operator', 'black holes explained', 'blazor components'],
  'a': ['ai agent orchestration', 'artificial intelligence 2026', 'apple vision pro 3', 'aws lambda pricing', 'angular vs react'],
  'ai': ['ai agent orchestration', 'ai models comparison 2026', 'ai code generation', 'ai search engines', 'ai hardware requirements'],
  'r': ['react 19 features', 'rust programming tutorial', 'raspberry pi projects', 'railway deployment', 'redis caching patterns'],
  're': ['react 19 features', 'react server components', 'redis vs memcached', 'remix framework', 'real-time web apps'],
  'p': ['python 3.14 release', 'programming languages ranking', 'prompt engineering guide', 'postgres vs mysql', 'pi-hole setup'],
  'py': ['python 3.14 release', 'pytorch distributed training', 'pydantic v3', 'python asyncio tutorial', 'pyproject.toml guide'],
  'c': ['cloudflare workers tutorial', 'chatgpt alternatives', 'claude ai features', 'css grid layout', 'containerization best practices'],
  'cl': ['cloudflare workers tutorial', 'claude ai features', 'cli tools development', 'cloud native architecture', 'click python cli'],
  'h': ['how to build a search engine', 'htmx tutorial', 'home server setup', 'hugging face models', 'http/3 explained'],
  'w': ['what is blackroad os', 'web development trends 2026', 'wasm performance', 'wrangler deploy', 'websocket tutorial'],
  'n': ['next.js 16 features', 'node.js 22 release', 'nvidia h100 benchmarks', 'nix package manager', 'network infrastructure'],
  'd': ['docker compose tutorial', 'deno 2.0 features', 'distributed systems design', 'deepseek r1 model', 'dns configuration'],
  'q': ['quantum computing explained', 'qwen model comparison', 'qdrant vector database', 'query optimization sql', 'quic protocol'],
  's': ['self-hosted ai models', 'svelte 5 features', 'sqlite performance tips', 'serverless architecture', 'ssh tunneling'],
  't': ['typescript 6.0 features', 'terraform best practices', 'tailscale mesh vpn', 'three.js 3d web', 'turborepo monorepo'],
  'm': ['machine learning deployment', 'mcp protocol explained', 'mongodb atlas', 'microservices patterns', 'meta llama 4'],
  'v': ['vite 6 configuration', 'vllm inference server', 'vector database comparison', 'vercel deployment', 'vim tutorial'],
};

function generateWebResults(query) {
  const q = query.toLowerCase();
  const timestamp = () => {
    const days = Math.floor(Math.random() * 30) + 1;
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  const baseResults = [
    {
      favicon: 'W', url: 'https://en.wikipedia.org', site: 'Wikipedia', breadcrumb: 'en.wikipedia.org',
      title: `${query} - Wikipedia`,
      snippet: `<em>${query}</em> is a widely recognized concept in modern technology. This article covers the history, development, and current state of <em>${query}</em>, including notable implementations and future directions.`,
      date: 'Updated Feb 2026', sitelinks: ['History', 'Applications', 'See also']
    },
    {
      favicon: 'G', url: 'https://github.com', site: 'GitHub', breadcrumb: 'github.com',
      title: `${query} - GitHub Repository`,
      snippet: `Open source repository for <em>${query}</em>. Contains documentation, source code, and community contributions. Stars: 12.4k. Latest release: v3.2.1. Active development with 847 contributors.`,
      date: timestamp()
    },
    {
      favicon: 'D', url: 'https://dev.to', site: 'DEV Community', breadcrumb: 'dev.to',
      title: `A Complete Guide to ${query} in 2026`,
      snippet: `Learn everything you need to know about <em>${query}</em>. This comprehensive guide covers setup, configuration, best practices, and advanced techniques for production deployments.`,
      date: 'Feb 15, 2026'
    },
    {
      favicon: 'S', url: 'https://stackoverflow.com', site: 'Stack Overflow', breadcrumb: 'stackoverflow.com',
      title: `How to implement ${query} properly? - Stack Overflow`,
      snippet: `42 answers. Best answer (Score: 187): The recommended approach for <em>${query}</em> involves configuring the base setup first, then applying optimizations based on your specific use case...`,
      date: timestamp()
    },
    {
      favicon: 'M', url: 'https://medium.com', site: 'Medium', breadcrumb: 'medium.com',
      title: `Why ${query} Changes Everything - Medium`,
      snippet: `In this deep dive, we explore how <em>${query}</em> is transforming the industry. From startups to enterprise, the impact of <em>${query}</em> cannot be overstated. Read the full analysis.`,
      date: 'Jan 28, 2026'
    },
    {
      favicon: 'R', url: 'https://reddit.com', site: 'Reddit', breadcrumb: 'reddit.com/r/technology',
      title: `r/technology - ${query} discussion thread`,
      snippet: `2.3K upvotes, 456 comments. "Has anyone tried <em>${query}</em> in production? We switched last month and the results are incredible. Performance improved by 40% and..." [continues]`,
      date: timestamp()
    },
    {
      favicon: 'Y', url: 'https://youtube.com', site: 'YouTube', breadcrumb: 'youtube.com',
      title: `${query} Tutorial - Complete Walkthrough (2026)`,
      snippet: `Watch this comprehensive video tutorial on <em>${query}</em>. 45 minutes. Covers beginner to advanced topics with hands-on examples. 234K views.`,
      date: '2 weeks ago'
    },
    {
      favicon: 'H', url: 'https://hackernews.com', site: 'Hacker News', breadcrumb: 'news.ycombinator.com',
      title: `Show HN: ${query} - A New Approach`,
      snippet: `523 points | 198 comments | Launched today. "We built this because existing solutions for <em>${query}</em> were either too complex or too limited. Our approach focuses on..."`,
      date: timestamp()
    },
  ];

  if (q.includes('blackroad')) {
    return [
      {
        favicon: 'B', url: 'https://blackroad.io', site: 'BlackRoad OS', breadcrumb: 'blackroad.io',
        title: 'BlackRoad OS - Your AI. Your Hardware. Your Rules.',
        snippet: `<em>BlackRoad OS</em> is a comprehensive AI agent orchestration platform and enterprise infrastructure. Manage 30,000+ AI agents across 17 GitHub organizations with 1,825+ repositories.`,
        date: 'Official Site', sitelinks: ['Documentation', 'Agents', 'Download', 'Pricing']
      },
      {
        favicon: 'B', url: 'https://docs.blackroad.io', site: 'BlackRoad Docs', breadcrumb: 'docs.blackroad.io',
        title: 'BlackRoad OS Documentation - Getting Started',
        snippet: `Complete documentation for <em>BlackRoad OS</em>. Learn about the CLI tools, agent system, memory architecture, and multi-cloud deployment. Quick start guide for new developers.`,
        date: 'Updated Feb 2026'
      },
      {
        favicon: 'G', url: 'https://github.com/BlackRoad-OS', site: 'GitHub', breadcrumb: 'github.com/BlackRoad-OS',
        title: 'BlackRoad-OS - GitHub Organization',
        snippet: `1,332+ repositories. Core platform for <em>BlackRoad OS</em> including agents, web interface, documentation, infrastructure, and deployment tools. Active development.`,
        date: '1 day ago'
      },
      ...baseResults.slice(2)
    ];
  }

  if (q.includes('react') || q.includes('javascript') || q.includes('web')) {
    baseResults[0] = {
      favicon: 'R', url: 'https://react.dev', site: 'React', breadcrumb: 'react.dev',
      title: `React - The library for web and native user interfaces`,
      snippet: `React 19 introduces server components, actions, and new hooks. Build user interfaces with <em>${query}</em> using component-based architecture. Official documentation and tutorials.`,
      date: 'Official Site', sitelinks: ['Quick Start', 'API Reference', 'Tutorial', 'Blog']
    };
  }

  if (q.includes('python') || q.includes('ai') || q.includes('ml')) {
    baseResults[0] = {
      favicon: 'P', url: 'https://python.org', site: 'Python', breadcrumb: 'python.org',
      title: `Python - Official Documentation`,
      snippet: `Python 3.14 is the latest stable release. Learn about <em>${query}</em> with official tutorials, library reference, and language specification. Download Python for all platforms.`,
      date: 'Official Site', sitelinks: ['Downloads', 'Documentation', 'PyPI', 'Community']
    };
  }

  return baseResults;
}

function generateImageResults(query) {
  const colors = ['#1a1a2e', '#16213e', '#0f3460', '#1a0a2e', '#2d1b69', '#0a1628', '#1e1e1e', '#2a0845', '#0d1117', '#1c1c3a', '#0e2439', '#1a0533'];
  const emojis = ['🔍', '💡', '🚀', '🌐', '🤖', '📊', '🧠', '⚡', '🔮', '🛡️', '📐', '🌀'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    bg: colors[i % colors.length],
    title: `${query} - Image ${i + 1}`,
    source: ['Unsplash', 'Pexels', 'Flickr', 'Pinterest', 'Shutterstock', 'Getty'][i % 6],
    size: `${800 + i * 100}x${600 + i * 50}`
  }));
}

function generateVideoResults(query) {
  return [
    { title: `${query} Explained - Full Tutorial 2026`, channel: 'TechPrime', views: '1.2M views', date: '3 weeks ago', duration: '24:15', desc: `A comprehensive tutorial covering everything you need to know about ${query}. Perfect for beginners and intermediate developers.` },
    { title: `Building with ${query}: From Zero to Production`, channel: 'CodeCraft', views: '845K views', date: '1 month ago', duration: '1:12:30', desc: `Follow along as we build a complete production application using ${query}. Includes deployment and monitoring setup.` },
    { title: `${query} vs Alternatives - Honest Comparison`, channel: 'DevInsider', views: '567K views', date: '2 weeks ago', duration: '18:42', desc: `An unbiased comparison of ${query} against its top competitors. We test performance, developer experience, and scalability.` },
    { title: `10 ${query} Tips You Need to Know`, channel: 'QuickByte', views: '2.1M views', date: '5 days ago', duration: '12:08', desc: `Level up your ${query} skills with these essential tips and tricks that most developers don't know about.` },
    { title: `The Future of ${query} - Conference Talk`, channel: 'DevConf 2026', views: '324K views', date: '1 week ago', duration: '45:30', desc: `Keynote presentation on the future direction of ${query}, including upcoming features and community roadmap.` },
  ];
}

function generateNewsResults(query) {
  return [
    { source: 'TechCrunch', time: '2 hours ago', title: `${query} Reaches Major Milestone as Adoption Surges`, snippet: `Industry analysts report unprecedented growth in ${query} adoption, with enterprise usage increasing 340% year-over-year.`, emoji: '📰' },
    { source: 'The Verge', time: '5 hours ago', title: `New Update Brings Revolutionary Changes to ${query}`, snippet: `The latest release introduces several groundbreaking features that developers have been requesting for years.`, emoji: '🗞️' },
    { source: 'Ars Technica', time: '8 hours ago', title: `How ${query} Is Reshaping the Technology Landscape`, snippet: `A deep dive into how ${query} is changing the way organizations approach their technology stack and infrastructure.`, emoji: '📡' },
    { source: 'Wired', time: '1 day ago', title: `Inside the Team Building the Next Generation of ${query}`, snippet: `Exclusive interview with the core team behind ${query}, revealing their vision for the next five years of development.`, emoji: '📱' },
    { source: 'Bloomberg', time: '1 day ago', title: `Investors Pour $2.5B Into ${query} Ecosystem`, snippet: `Record funding round signals strong confidence in ${query}'s potential to become a dominant platform in enterprise technology.`, emoji: '💰' },
  ];
}

function generateShoppingResults(query) {
  return [
    { title: `${query} Pro - Premium Edition`, price: '$299.99', store: 'Amazon', rating: '4.8', reviews: '2,341', emoji: '📦' },
    { title: `${query} Complete Guide (Hardcover)`, price: '$49.99', store: 'Barnes & Noble', rating: '4.6', reviews: '892', emoji: '📚' },
    { title: `${query} Toolkit - Developer Bundle`, price: '$149.00', store: 'DevStore', rating: '4.9', reviews: '567', emoji: '🛠️' },
    { title: `Learn ${query} Online Course`, price: '$19.99', store: 'Udemy', rating: '4.7', reviews: '15,230', emoji: '🎓' },
    { title: `${query} Certification Exam Prep`, price: '$89.00', store: 'Certification Hub', rating: '4.5', reviews: '1,103', emoji: '🏆' },
    { title: `${query} Starter Kit`, price: '$39.99', store: 'TechShop', rating: '4.4', reviews: '334', emoji: '🎁' },
  ];
}

function generateKnowledgePanel(query) {
  const q = query.toLowerCase();

  if (q.includes('blackroad')) {
    return {
      title: 'BlackRoad OS',
      subtitle: 'AI Agent Orchestration Platform',
      emoji: '🖥️',
      description: 'BlackRoad OS is a comprehensive developer CLI system, AI agent orchestration platform, and enterprise infrastructure for AI-first companies. Core philosophy: "Your AI. Your Hardware. Your Rules."',
      facts: [
        { label: 'Founded', value: '2024' },
        { label: 'Type', value: 'AI Infrastructure Platform' },
        { label: 'Agents', value: '30,000+' },
        { label: 'Repositories', value: '1,825+' },
        { label: 'Organizations', value: '17 GitHub orgs' },
        { label: 'Infrastructure', value: 'Multi-cloud (Railway, Vercel, Cloudflare, DigitalOcean)' },
        { label: 'Core Agents', value: 'Octavia, Lucidia, Alice, Aria, Shellfish' },
      ],
      links: ['Website', 'GitHub', 'Documentation', 'API'],
      source: 'blackroad.io'
    };
  }

  if (q.includes('react')) {
    return {
      title: 'React',
      subtitle: 'JavaScript Library',
      emoji: '⚛️',
      description: 'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies.',
      facts: [
        { label: 'Developer', value: 'Meta (Facebook)' },
        { label: 'Initial Release', value: 'May 29, 2013' },
        { label: 'Latest Version', value: '19.0 (2026)' },
        { label: 'Written In', value: 'JavaScript' },
        { label: 'License', value: 'MIT License' },
        { label: 'Repository', value: 'github.com/facebook/react' },
      ],
      links: ['Official Site', 'GitHub', 'NPM', 'Tutorial'],
      source: 'react.dev'
    };
  }

  if (q.includes('python')) {
    return {
      title: 'Python',
      subtitle: 'Programming Language',
      emoji: '🐍',
      description: 'Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.',
      facts: [
        { label: 'Designer', value: 'Guido van Rossum' },
        { label: 'First Released', value: 'February 20, 1991' },
        { label: 'Latest Version', value: '3.14 (2026)' },
        { label: 'Typing', value: 'Duck, dynamic, strong' },
        { label: 'License', value: 'Python Software Foundation License' },
        { label: 'File Extensions', value: '.py, .pyi, .pyc, .pyd' },
      ],
      links: ['python.org', 'PyPI', 'Documentation', 'PEPs'],
      source: 'python.org'
    };
  }

  if (q.includes('rust')) {
    return {
      title: 'Rust',
      subtitle: 'Programming Language',
      emoji: '🦀',
      description: 'Rust is a multi-paradigm, general-purpose programming language that emphasizes performance, type safety, and concurrency. It enforces memory safety without a garbage collector.',
      facts: [
        { label: 'Developer', value: 'Rust Foundation' },
        { label: 'First Released', value: 'July 7, 2010' },
        { label: 'Latest Version', value: '1.85 (2026)' },
        { label: 'Typing', value: 'Static, strong, inferred' },
        { label: 'License', value: 'MIT / Apache 2.0' },
      ],
      links: ['rust-lang.org', 'crates.io', 'Docs', 'Playground'],
      source: 'rust-lang.org'
    };
  }

  if (q.includes('ai') || q.includes('artificial intelligence')) {
    return {
      title: 'Artificial Intelligence',
      subtitle: 'Field of Computer Science',
      emoji: '🤖',
      description: 'Artificial intelligence (AI) is the capability of computer systems to perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and language understanding.',
      facts: [
        { label: 'Field', value: 'Computer Science' },
        { label: 'Key Subfields', value: 'ML, NLP, Computer Vision, Robotics' },
        { label: 'Founded', value: '1956 (Dartmouth Conference)' },
        { label: 'Notable Models', value: 'GPT, Claude, Gemini, Llama' },
        { label: 'Market Size', value: '$500B+ (2026 est.)' },
      ],
      links: ['Wikipedia', 'Research Papers', 'Courses', 'News'],
      source: 'Various sources'
    };
  }

  // No knowledge panel for generic queries
  return null;
}

function generateAIAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('blackroad')) {
    return {
      content: `**BlackRoad OS** is an AI agent orchestration platform and enterprise infrastructure system designed for AI-first companies. It manages over **30,000 AI agents** across **17 GitHub organizations** with **1,825+ repositories**.\n\nKey features include a tokenless gateway architecture, five specialized agents (Octavia, Lucidia, Alice, Aria, Shellfish), a portable AI identity system called CECE, and multi-cloud deployment across Railway, Vercel, Cloudflare, and DigitalOcean. The core philosophy is "Your AI. Your Hardware. Your Rules."`,
      sources: ['blackroad.io', 'docs.blackroad.io', 'github.com/BlackRoad-OS']
    };
  }

  if (q.includes('react')) {
    return {
      content: `**React** is a JavaScript library for building user interfaces, maintained by Meta. React 19 (the latest major version) introduces several key features:\n\n- **Server Components** for rendering on the server\n- **Actions** for handling form submissions and data mutations\n- **New hooks**: useFormStatus, useFormState, useOptimistic\n- **Document metadata** support\n- **Asset loading** improvements\n\nReact uses a component-based architecture and a virtual DOM for efficient updates.`,
      sources: ['react.dev', 'github.com/facebook/react', 'developer.mozilla.org']
    };
  }

  if (q.includes('how') || q.includes('what') || q.includes('why') || q.includes('when')) {
    return {
      content: `Based on multiple sources, here is a comprehensive answer about **${query}**:\n\nThis is a frequently asked question in the technology community. The key points to understand are:\n\n- The concept has evolved significantly over recent years\n- Modern implementations focus on performance and developer experience\n- Best practices recommend starting with the official documentation\n- Community resources and tutorials provide hands-on learning paths\n\nFor the most up-to-date information, consult the official documentation and community forums.`,
      sources: ['stackoverflow.com', 'developer.mozilla.org', 'github.com']
    };
  }

  return {
    content: `Here is an overview of **${query}**:\n\n${query} is a topic of significant interest in the technology sector. Current developments include improved tooling, better documentation, and growing community adoption. Industry experts recommend staying updated with the latest releases and following best practices from official guides.\n\nKey resources for learning more include official documentation, community forums, and video tutorials from recognized experts in the field.`,
    sources: ['wikipedia.org', 'github.com', 'stackoverflow.com']
  };
}

const ROADAI_RESPONSES = [
  "That's a great question! Based on my analysis, I'd recommend starting with the official documentation for the most accurate information.",
  "I've analyzed your query across multiple knowledge sources. Here's what I found...",
  "Let me help you with that. BlackRoad's AI agents have processed similar queries before, and the consensus is...",
  "Interesting question! From a technical perspective, there are several approaches you could take.",
  "I can help with that. Let me break it down into the key points you need to understand.",
  "Based on the latest data available in our knowledge base, here is what you should know.",
];

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  // Core state
  const [view, setView] = useState('home'); // home | results | settings
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('roadsearch-history') || '[]');
    } catch { return []; }
  });

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);

  // Advanced search
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFields, setAdvancedFields] = useState({
    exactPhrase: '', excludeWords: '', site: '', fileType: '',
    dateRange: 'any', region: 'any'
  });

  // RoadAI chat
  const [showRoadAI, setShowRoadAI] = useState(false);
  const [roadAIMessages, setRoadAIMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m RoadAI, your intelligent search assistant powered by BlackRoad OS. Ask me anything, and I\'ll do my best to help you find what you\'re looking for.' }
  ]);
  const [roadAIInput, setRoadAIInput] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    safeSearch: true,
    region: 'us',
    language: 'en',
    darkMode: true,
    showAIAnswers: true,
    openInNewTab: false,
    searchHistory: true,
  });

  // Refs
  const searchInputRef = useRef(null);
  const resultsSearchRef = useRef(null);
  const autocompleteRef = useRef(null);
  const roadAIMessagesRef = useRef(null);

  // ── Persist History ──
  useEffect(() => {
    localStorage.setItem('roadsearch-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // ── Close autocomplete on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Scroll RoadAI to bottom ──
  useEffect(() => {
    if (roadAIMessagesRef.current) {
      roadAIMessagesRef.current.scrollTop = roadAIMessagesRef.current.scrollHeight;
    }
  }, [roadAIMessages]);

  // ── Autocomplete Logic ──
  const updateAutocomplete = useCallback((value) => {
    if (!value.trim()) {
      setAutocompleteItems([]);
      setShowAutocomplete(false);
      return;
    }
    const key = value.toLowerCase().slice(0, 3);
    let matches = [];
    for (let i = key.length; i >= 1; i--) {
      const k = key.slice(0, i);
      if (AUTOCOMPLETE_MAP[k]) {
        matches = AUTOCOMPLETE_MAP[k].filter(s => s.toLowerCase().includes(value.toLowerCase()));
        break;
      }
    }
    if (matches.length === 0) {
      matches = [
        `${value}`,
        `${value} tutorial`,
        `${value} documentation`,
        `${value} examples`,
        `${value} vs alternatives`,
      ];
    }
    setAutocompleteItems(matches.slice(0, 8));
    setShowAutocomplete(true);
    setAutocompleteIndex(-1);
  }, []);

  // ── Execute Search ──
  const executeSearch = useCallback((q, filter = 'all') => {
    const trimmed = (q || '').trim();
    if (!trimmed) return;

    setSearchQuery(trimmed);
    setQuery(trimmed);
    setActiveFilter(filter);
    setShowAutocomplete(false);
    setLoading(true);
    setView('results');

    // Add to history
    if (settings.searchHistory) {
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h !== trimmed);
        return [trimmed, ...filtered].slice(0, 20);
      });
    }

    // Simulate loading
    setTimeout(() => setLoading(false), 400 + Math.random() * 400);
  }, [settings.searchHistory]);

  // ── Handle Search Key Events ──
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (autocompleteIndex >= 0 && autocompleteItems[autocompleteIndex]) {
        executeSearch(autocompleteItems[autocompleteIndex]);
      } else {
        executeSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutocompleteIndex(prev => Math.min(prev + 1, autocompleteItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutocompleteIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  }, [query, autocompleteIndex, autocompleteItems, executeSearch]);

  // ── RoadAI Send ──
  const sendRoadAI = useCallback(() => {
    const text = roadAIInput.trim();
    if (!text) return;
    setRoadAIMessages(prev => [...prev, { role: 'user', text }]);
    setRoadAIInput('');
    setTimeout(() => {
      const response = ROADAI_RESPONSES[Math.floor(Math.random() * ROADAI_RESPONSES.length)];
      setRoadAIMessages(prev => [...prev, { role: 'ai', text: `${response}\n\nRegarding "${text}" - I'd recommend checking the latest resources and documentation. Would you like me to search for more specific information?` }]);
    }, 600 + Math.random() * 800);
  }, [roadAIInput]);

  // ── Generate Results ──
  const webResults = useMemo(() => searchQuery ? generateWebResults(searchQuery) : [], [searchQuery]);
  const imageResults = useMemo(() => searchQuery ? generateImageResults(searchQuery) : [], [searchQuery]);
  const videoResults = useMemo(() => searchQuery ? generateVideoResults(searchQuery) : [], [searchQuery]);
  const newsResults = useMemo(() => searchQuery ? generateNewsResults(searchQuery) : [], [searchQuery]);
  const shoppingResults = useMemo(() => searchQuery ? generateShoppingResults(searchQuery) : [], [searchQuery]);
  const knowledgePanel = useMemo(() => searchQuery ? generateKnowledgePanel(searchQuery) : null, [searchQuery]);
  const aiAnswer = useMemo(() => searchQuery ? generateAIAnswer(searchQuery) : null, [searchQuery]);

  // ── Feeling Lucky ──
  const handleLucky = () => {
    const q = query.trim() || TRENDING_SEARCHES[Math.floor(Math.random() * TRENDING_SEARCHES.length)];
    executeSearch(q);
  };

  const removeHistoryItem = (item, e) => {
    e.stopPropagation();
    setSearchHistory(prev => prev.filter(h => h !== item));
  };

  // ── Search Bar Component (reusable) ──
  const SearchBar = ({ isResults = false }) => (
    <div className="search-wrapper" ref={autocompleteRef}>
      <div className={`search-bar ${isResults ? 'results-mode' : ''}`}>
        <div className="search-icon"><SearchIcon /></div>
        <input
          ref={isResults ? resultsSearchRef : searchInputRef}
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            updateAutocomplete(e.target.value);
          }}
          onFocus={() => query.trim() && updateAutocomplete(query)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search RoadSearch or type a URL"
          autoComplete="off"
        />
        {query && (
          <button className="search-clear" onClick={() => { setQuery(''); setShowAutocomplete(false); }}>
            <XIcon />
          </button>
        )}
        {!isResults && (
          <button className="search-voice" title="Voice search">
            <MicIcon />
          </button>
        )}
        {isResults && (
          <button className="search-voice" title="Search by image" onClick={() => {}}>
            <CameraIcon />
          </button>
        )}
      </div>

      {showAutocomplete && autocompleteItems.length > 0 && (
        <div className="autocomplete-dropdown">
          {autocompleteItems.map((item, i) => (
            <div
              key={i}
              className={`autocomplete-item ${i === autocompleteIndex ? 'active' : ''}`}
              onClick={() => executeSearch(item)}
              onMouseEnter={() => setAutocompleteIndex(i)}
            >
              <SearchIcon />
              <span>
                <span className="highlight">{item}</span>
              </span>
            </div>
          ))}
          {searchHistory.length > 0 && (
            <>
              <div className="autocomplete-section">Recent Searches</div>
              {searchHistory.slice(0, 3).map((item, i) => (
                <div
                  key={`h-${i}`}
                  className="autocomplete-item"
                  onClick={() => executeSearch(item)}
                >
                  <ClockIcon />
                  <span className="muted">{item}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );

  // ── Filter Tabs ──
  const FILTERS = [
    { id: 'all', label: 'All', icon: <SearchIcon /> },
    { id: 'images', label: 'Images', icon: <ImageIcon /> },
    { id: 'videos', label: 'Videos', icon: <VideoIcon /> },
    { id: 'news', label: 'News', icon: <NewsIcon /> },
    { id: 'maps', label: 'Maps', icon: <MapIcon /> },
    { id: 'shopping', label: 'Shopping', icon: <ShopIcon /> },
  ];

  // ── Render: Loading Skeleton ──
  const renderSkeleton = () => (
    <div className="fade-in">
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ marginBottom: 32 }}>
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: '90%' }} />
          <div className="skeleton skeleton-text" style={{ width: '75%' }} />
        </div>
      ))}
    </div>
  );

  // ── Render: AI Answer ──
  const renderAIAnswer = () => {
    if (!aiAnswer || !settings.showAIAnswers) return null;
    return (
      <div className="ai-answer-box fade-in">
        <div className="ai-answer-header">
          <span className="ai-answer-badge">
            <SparkleIcon /> RoadAI Overview
          </span>
        </div>
        <div className="ai-answer-content" dangerouslySetInnerHTML={{
          __html: aiAnswer.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
        }} />
        <div className="ai-answer-sources">
          {aiAnswer.sources.map((src, i) => (
            <span key={i} className="ai-source-chip">{src}</span>
          ))}
        </div>
        <div className="ai-answer-footer">
          <button className="ai-feedback-btn"><ThumbUpIcon /> Helpful</button>
          <button className="ai-feedback-btn"><ThumbDownIcon /> Not helpful</button>
        </div>
      </div>
    );
  };

  // ── Render: Web Results ──
  const renderWebResults = () => (
    <div>
      {renderAIAnswer()}
      {webResults.map((r, i) => (
        <div key={i} className="web-result">
          <div className="web-result-url">
            <div className="web-result-favicon">{r.favicon}</div>
            <span className="web-result-site">{r.site}</span>
            <span className="web-result-breadcrumb"> &rsaquo; {r.breadcrumb}</span>
          </div>
          <div className="web-result-title">{r.title}</div>
          <div className="web-result-snippet">
            {r.date && <span className="web-result-date">{r.date} &mdash; </span>}
            <span dangerouslySetInnerHTML={{ __html: r.snippet }} />
          </div>
          {r.sitelinks && (
            <div className="web-result-extras">
              {r.sitelinks.map((link, j) => (
                <span key={j} className="web-result-sitelink">{link}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Render: Image Results ──
  const renderImageResults = () => (
    <div>
      <div className="image-results-grid">
        {imageResults.map((img) => (
          <div key={img.id} className="image-result-card">
            <div className="image-result-thumb">
              <div className="img-placeholder" style={{ background: img.bg }}>
                <span style={{ fontSize: 48 }}>{img.emoji}</span>
              </div>
            </div>
            <div className="image-result-info">
              <div className="image-result-title">{img.title}</div>
              <div className="image-result-source">{img.source} &middot; {img.size}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <button
          className="search-btn search-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          title="Reverse image search coming soon"
        >
          <CameraIcon /> Search by Image
        </button>
        <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 8 }}>
          Reverse image search -- coming soon
        </p>
      </div>
    </div>
  );

  // ── Render: Video Results ──
  const renderVideoResults = () => (
    <div>
      {videoResults.map((v, i) => (
        <div key={i} className="video-result">
          <div className="video-thumb" style={{ background: `hsl(${i * 60}, 30%, 15%)` }}>
            <div className="video-play-icon"><PlayIcon /></div>
            <div className="video-duration">{v.duration}</div>
          </div>
          <div className="video-info">
            <div className="video-title">{v.title}</div>
            <div className="video-channel">{v.channel}</div>
            <div className="video-meta">{v.views} &middot; {v.date}</div>
            <div className="video-desc">{v.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Render: News Results ──
  const renderNewsResults = () => (
    <div>
      {newsResults.map((n, i) => (
        <div key={i} className="news-result">
          <div className="news-content">
            <div className="news-source">
              {n.source} <span className="news-source-dot" /> {n.time}
            </div>
            <div className="news-title">{n.title}</div>
            <div className="news-snippet">{n.snippet}</div>
          </div>
          <div className="news-thumb">{n.emoji}</div>
        </div>
      ))}
    </div>
  );

  // ── Render: Maps ──
  const renderMaps = () => (
    <div className="maps-placeholder">
      <div className="maps-frame">
        <div className="maps-icon">🗺️</div>
        <div className="maps-text">RoadMaps for "{searchQuery}"</div>
        <div className="maps-subtext">Interactive maps powered by BlackRoad OS -- coming soon</div>
      </div>
    </div>
  );

  // ── Render: Shopping ──
  const renderShopping = () => (
    <div className="shopping-grid">
      {shoppingResults.map((s, i) => (
        <div key={i} className="shopping-card">
          <div className="shopping-img">{s.emoji}</div>
          <div className="shopping-title">{s.title}</div>
          <div className="shopping-price">{s.price}</div>
          <div className="shopping-store">{s.store}</div>
          <div className="shopping-rating">{'★'.repeat(Math.floor(parseFloat(s.rating)))} {s.rating} ({s.reviews})</div>
        </div>
      ))}
    </div>
  );

  // ── Render: Knowledge Panel ──
  const renderKnowledgePanel = () => {
    if (!knowledgePanel) return null;
    return (
      <div className="results-sidebar">
        <div className="knowledge-panel fade-in">
          <div className="kp-header-img">
            <span>{knowledgePanel.emoji}</span>
          </div>
          <div className="kp-body">
            <div className="kp-title">{knowledgePanel.title}</div>
            <div className="kp-subtitle">{knowledgePanel.subtitle}</div>
            <div className="kp-description">{knowledgePanel.description}</div>
            <div className="kp-facts">
              {knowledgePanel.facts.map((f, i) => (
                <div key={i} className="kp-fact">
                  <span className="kp-fact-label">{f.label}</span>
                  <span className="kp-fact-value">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="kp-links">
              {knowledgePanel.links.map((link, i) => (
                <span key={i} className="kp-link">{link}</span>
              ))}
            </div>
            <div className="kp-source">Source: {knowledgePanel.source}</div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Active Filter Content ──
  const renderFilterContent = () => {
    if (loading) return renderSkeleton();
    switch (activeFilter) {
      case 'images': return renderImageResults();
      case 'videos': return renderVideoResults();
      case 'news': return renderNewsResults();
      case 'maps': return renderMaps();
      case 'shopping': return renderShopping();
      default: return renderWebResults();
    }
  };

  // ── Render: Pagination ──
  const renderPagination = () => (
    <div className="pagination">
      <button className="page-btn nav" disabled>Previous</button>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
        <button key={n} className={`page-btn ${n === 1 ? 'active' : ''}`}>{n}</button>
      ))}
      <button className="page-btn nav">Next</button>
    </div>
  );

  // ── Advanced Search Modal ──
  const renderAdvancedSearch = () => {
    if (!showAdvanced) return null;
    return (
      <div className="advanced-search-overlay" onClick={() => setShowAdvanced(false)}>
        <div className="advanced-search-modal" onClick={(e) => e.stopPropagation()}>
          <div className="advanced-search-title">Advanced Search</div>

          <div className="advanced-field">
            <label className="advanced-label">Exact Phrase</label>
            <input
              className="advanced-input"
              placeholder='"exact words"'
              value={advancedFields.exactPhrase}
              onChange={(e) => setAdvancedFields(p => ({ ...p, exactPhrase: e.target.value }))}
            />
          </div>

          <div className="advanced-field">
            <label className="advanced-label">Exclude Words</label>
            <input
              className="advanced-input"
              placeholder="words to exclude"
              value={advancedFields.excludeWords}
              onChange={(e) => setAdvancedFields(p => ({ ...p, excludeWords: e.target.value }))}
            />
          </div>

          <div className="advanced-row">
            <div className="advanced-field">
              <label className="advanced-label">Site/Domain</label>
              <input
                className="advanced-input"
                placeholder="site:example.com"
                value={advancedFields.site}
                onChange={(e) => setAdvancedFields(p => ({ ...p, site: e.target.value }))}
              />
            </div>
            <div className="advanced-field">
              <label className="advanced-label">File Type</label>
              <select
                className="advanced-select"
                value={advancedFields.fileType}
                onChange={(e) => setAdvancedFields(p => ({ ...p, fileType: e.target.value }))}
              >
                <option value="">Any format</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
                <option value="xls">XLS</option>
                <option value="ppt">PPT</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div className="advanced-row">
            <div className="advanced-field">
              <label className="advanced-label">Date Range</label>
              <select
                className="advanced-select"
                value={advancedFields.dateRange}
                onChange={(e) => setAdvancedFields(p => ({ ...p, dateRange: e.target.value }))}
              >
                <option value="any">Any time</option>
                <option value="hour">Past hour</option>
                <option value="day">Past 24 hours</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
                <option value="year">Past year</option>
              </select>
            </div>
            <div className="advanced-field">
              <label className="advanced-label">Region</label>
              <select
                className="advanced-select"
                value={advancedFields.region}
                onChange={(e) => setAdvancedFields(p => ({ ...p, region: e.target.value }))}
              >
                <option value="any">All regions</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="jp">Japan</option>
                <option value="au">Australia</option>
                <option value="ca">Canada</option>
              </select>
            </div>
          </div>

          <div className="advanced-actions">
            <button className="advanced-cancel" onClick={() => setShowAdvanced(false)}>Cancel</button>
            <button className="advanced-apply" onClick={() => {
              let q = query;
              if (advancedFields.exactPhrase) q += ` "${advancedFields.exactPhrase}"`;
              if (advancedFields.excludeWords) q += ` -${advancedFields.excludeWords}`;
              if (advancedFields.site) q += ` site:${advancedFields.site}`;
              if (advancedFields.fileType) q += ` filetype:${advancedFields.fileType}`;
              setShowAdvanced(false);
              executeSearch(q);
            }}>
              Apply Search
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── RoadAI Chat Panel ──
  const renderRoadAI = () => (
    <>
      <button
        className="roadai-toggle"
        onClick={() => setShowRoadAI(!showRoadAI)}
        title="RoadAI Assistant"
      >
        {showRoadAI ? <XIcon /> : <SparkleIcon />}
      </button>

      {showRoadAI && (
        <div className="roadai-panel">
          <div className="roadai-header">
            <div className="roadai-title">
              <SparkleIcon />
              <span className="gradient-text">RoadAI</span>
            </div>
            <button className="roadai-close" onClick={() => setShowRoadAI(false)}>
              <XIcon />
            </button>
          </div>
          <div className="roadai-messages" ref={roadAIMessagesRef}>
            {roadAIMessages.map((msg, i) => (
              <div key={i} className={`roadai-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="roadai-input-area">
            <input
              className="roadai-input"
              placeholder="Ask RoadAI anything..."
              value={roadAIInput}
              onChange={(e) => setRoadAIInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRoadAI()}
            />
            <button className="roadai-send" onClick={sendRoadAI}>
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );

  // ── Settings Page ──
  const renderSettings = () => (
    <div className="settings-page fade-in">
      <button
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--electric-blue)', fontSize: 14, marginBottom: 24 }}
        onClick={() => setView('home')}
      >
        <ArrowLeftIcon /> Back to RoadSearch
      </button>

      <div className="settings-title">Settings</div>

      <div className="settings-section">
        <div className="settings-section-title">Search Preferences</div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">SafeSearch</div>
            <div className="settings-option-desc">Filter explicit content from search results</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.safeSearch}
              onChange={(e) => setSettings(p => ({ ...p, safeSearch: e.target.checked }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">AI Answers</div>
            <div className="settings-option-desc">Show RoadAI-generated answers at the top of results</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showAIAnswers}
              onChange={(e) => setSettings(p => ({ ...p, showAIAnswers: e.target.checked }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">Search History</div>
            <div className="settings-option-desc">Save your search queries for autocomplete suggestions</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.searchHistory}
              onChange={(e) => setSettings(p => ({ ...p, searchHistory: e.target.checked }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">Open Links in New Tab</div>
            <div className="settings-option-desc">Open search result links in a new browser tab</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.openInNewTab}
              onChange={(e) => setSettings(p => ({ ...p, openInNewTab: e.target.checked }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Region & Language</div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">Search Region</div>
            <div className="settings-option-desc">Prioritize results from a specific region</div>
          </div>
          <select
            className="settings-select"
            value={settings.region}
            onChange={(e) => setSettings(p => ({ ...p, region: e.target.value }))}
          >
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
            <option value="jp">Japan</option>
            <option value="au">Australia</option>
            <option value="ca">Canada</option>
            <option value="in">India</option>
            <option value="br">Brazil</option>
          </select>
        </div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">Language</div>
            <div className="settings-option-desc">Preferred language for search results</div>
          </div>
          <select
            className="settings-select"
            value={settings.language}
            onChange={(e) => setSettings(p => ({ ...p, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
            <option value="pt">Portuguese</option>
            <option value="ko">Korean</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Data & Privacy</div>

        <div className="settings-option">
          <div className="settings-option-info">
            <div className="settings-option-label">Clear Search History</div>
            <div className="settings-option-desc">Remove all saved search queries ({searchHistory.length} items)</div>
          </div>
          <button
            className="advanced-cancel"
            style={{ minWidth: 'auto' }}
            onClick={() => {
              setSearchHistory([]);
              localStorage.removeItem('roadsearch-history');
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--gray-700)' }}>
        RoadSearch by BlackRoad OS, Inc. All rights reserved.
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Settings View ──
  if (view === 'settings') {
    return (
      <>
        {renderSettings()}
        {renderRoadAI()}
      </>
    );
  }

  // ── Results View ──
  if (view === 'results') {
    return (
      <>
        <div className="results-page">
          {/* Header */}
          <div className="results-header">
            <div className="results-header-inner">
              <div className="results-logo" onClick={() => { setView('home'); setSearchQuery(''); setQuery(''); }}>
                RoadSearch
              </div>
              <div className="results-search-wrap">
                <SearchBar isResults />
              </div>
              <div className="header-actions">
                <button className="header-btn" title="Advanced Search" onClick={() => setShowAdvanced(true)}>
                  <FilterIcon />
                </button>
                <button className="header-btn" title="Settings" onClick={() => setView('settings')}>
                  <SettingsIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-tab ${activeFilter === f.id ? 'active' : ''}`}
                onClick={() => { setActiveFilter(f.id); setLoading(true); setTimeout(() => setLoading(false), 300); }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Results Body */}
          <div className={`results-body ${!knowledgePanel || activeFilter !== 'all' ? 'no-panel' : ''}`}>
            <div className="results-main">
              <div className="results-meta">
                About {(Math.floor(Math.random() * 900) + 100).toLocaleString()},{(Math.floor(Math.random() * 900) + 100).toLocaleString()},000 results ({(Math.random() * 0.5 + 0.1).toFixed(2)} seconds)
              </div>
              {renderFilterContent()}
              {!loading && renderPagination()}
            </div>
            {activeFilter === 'all' && renderKnowledgePanel()}
          </div>
        </div>

        {renderAdvancedSearch()}
        {renderRoadAI()}
      </>
    );
  }

  // ── Home View ──
  return (
    <>
      <div className="home-container">
        <div className="home-bg-grid" />
        <div className="home-bg-glow" />

        <div className="home-content fade-in">
          <div className="logo-section">
            <div className="logo-main">RoadSearch</div>
            <div className="logo-tagline">Powered by BlackRoad OS</div>
          </div>

          <SearchBar />

          <div className="search-buttons">
            <button className="search-btn search-btn-primary" onClick={() => executeSearch(query)}>
              RoadSearch
            </button>
            <button className="search-btn search-btn-lucky" onClick={handleLucky}>
              I'm Feeling Lucky
            </button>
          </div>

          {/* Trending */}
          <div className="trending-section">
            <div className="trending-title">Trending</div>
            <div className="trending-chips">
              {TRENDING_SEARCHES.map((t, i) => (
                <button key={i} className="trending-chip" onClick={() => executeSearch(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="history-section">
              <div className="history-title">Recent</div>
              <div className="history-list">
                {searchHistory.slice(0, 5).map((item, i) => (
                  <div key={i} className="history-item" onClick={() => executeSearch(item)}>
                    <span className="history-item-text">
                      <ClockIcon /> {item}
                    </span>
                    <button className="history-item-remove" onClick={(e) => removeHistoryItem(item, e)}>
                      remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="home-footer">
          <span>BlackRoad OS, Inc.</span>
          <div className="footer-links">
            <span className="footer-link" onClick={() => setView('settings')}>Settings</span>
            <span className="footer-link">Privacy</span>
            <span className="footer-link">Terms</span>
            <span className="footer-link">About</span>
          </div>
        </div>
      </div>

      {renderRoadAI()}
    </>
  );
}
