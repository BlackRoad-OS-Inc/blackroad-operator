// ── BlackRoad Portal — Unified Search ──
// One search box. Everything BlackRoad. Code, images, services, web.

const SERVICES = [
  { name: 'index', url: 'https://index.blackroad.io', desc: 'Code search — repos and files indexed', tags: ['code','search','repos','gitea','github'], icon: '{}' },
  { name: 'images', url: 'https://images.blackroad.io', desc: 'AI image generation & gallery', tags: ['images','ai','generate','flux','dall-e','gallery'], icon: '[]' },
  { name: 'git', url: 'https://git.blackroad.io', desc: 'Gitea — self-hosted repos', tags: ['git','gitea','repos','code','source'], icon: '<>' },
  { name: 'chat', url: 'https://chat.blackroad.io', desc: 'AI chat interface', tags: ['chat','ai','llm','ollama'], icon: '>_' },
  { name: 'dashboard', url: 'https://dashboard.blackroad.io', desc: 'Fleet monitoring dashboard', tags: ['dashboard','monitoring','fleet','status'], icon: '##' },
  { name: 'api', url: 'https://api.blackroad.io', desc: 'BlackRoad API gateway', tags: ['api','gateway','rest'], icon: '//' },
  { name: 'docs', url: 'https://docs.blackroad.io', desc: 'Documentation', tags: ['docs','documentation','help','guide'], icon: '??' },
  { name: 'status', url: 'https://status.blackroad.io', desc: 'Service status page', tags: ['status','health','uptime'], icon: '!!' },
  { name: 'mcp', url: 'https://mcp.blackroad.io', desc: 'Model Context Protocol server', tags: ['mcp','ai','context','protocol'], icon: '@@' },
  { name: 'os', url: 'https://os.blackroad.io', desc: 'BlackRoad Operating System', tags: ['os','operating','system','core'], icon: 'OS' },
  { name: 'mesh', url: 'https://mesh.blackroad.io', desc: 'Mesh compute network', tags: ['mesh','compute','distributed','p2p'], icon: '**' },
  { name: 'ollama', url: 'https://ollama.blackroad.ai.blackroad.io', desc: 'Ollama LLM inference', tags: ['ollama','llm','inference','ai','models'], icon: 'AI' },
  { name: 'cece', url: 'https://cece.blackroad.io', desc: 'CECE AI assistant API', tags: ['cece','ai','assistant','agent'], icon: 'CE' },
  { name: 'fleet', url: 'https://fleet.blackroad.io', desc: 'Pi fleet management', tags: ['fleet','pi','raspberry','nodes','hardware'], icon: 'PI' },
  { name: 'minio', url: 'https://minio.blackroad.io', desc: 'MinIO object storage', tags: ['storage','minio','s3','files','objects'], icon: 'S3' },
  { name: 'qdrant', url: 'https://qdrant.blackroad.io', desc: 'Vector database', tags: ['vector','qdrant','embeddings','search','ai'], icon: 'QD' },
  { name: 'grafana', url: 'https://grafana.blackroad.ai.blackroad.io', desc: 'Grafana metrics', tags: ['grafana','metrics','monitoring','graphs'], icon: 'GR' },
  { name: 'brand', url: 'https://brand.blackroad.io', desc: 'Brand design system', tags: ['brand','design','templates','logo'], icon: 'BR' },
  { name: 'studio', url: 'https://studio.blackroad.io', desc: 'Creative studio', tags: ['studio','creative','design','build'], icon: 'ST' },
  { name: 'roadc', url: 'https://roadc.blackroad.io', desc: 'RoadC programming language', tags: ['roadc','language','programming','compiler'], icon: 'RC' },
  { name: 'cloud', url: 'https://cloud.blackroad.io', desc: 'Cloud services', tags: ['cloud','hosting','deploy'], icon: '~~' },
  { name: 'drive', url: 'https://drive.blackroad.io', desc: 'File storage & sync', tags: ['drive','files','storage','sync'], icon: 'DR' },
  { name: 'auth', url: 'https://auth.blackroad.io', desc: 'Authentication service', tags: ['auth','login','identity','sso'], icon: 'ID' },
  { name: 'stream', url: 'https://stream.blackroad.io', desc: 'Streaming platform', tags: ['stream','video','media','content'], icon: '|>' },
  { name: 'research', url: 'https://research.blackroad.io', desc: 'Research & experiments', tags: ['research','experiments','quantum','math'], icon: 'RX' },
];

function searchServices(query) {
  const q = query.toLowerCase();
  return SERVICES.filter(s =>
    s.name.includes(q) || s.desc.toLowerCase().includes(q) || s.tags.some(t => t.includes(q))
  ).slice(0, 8);
}

function escapeHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Request Handler ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── Unified search API ──
    if (path === '/api/search') {
      const q = url.searchParams.get('q') || '';
      if (!q) return Response.json({ services: SERVICES.slice(0, 12), code: [], images: [] }, { headers: cors });

      const services = searchServices(q);

      const [codeRes, imgRes] = await Promise.allSettled([
        fetch(`${env.INDEX_API}/api/search?q=${encodeURIComponent(q)}&limit=8`).then(r => r.json()),
        fetch(`${env.IMAGES_API}/api/search?q=${encodeURIComponent(q)}&limit=6`).then(r => r.json()),
      ]);

      const code = codeRes.status === 'fulfilled' ? { repos: (codeRes.value.repos||[]).slice(0,6), files: (codeRes.value.files||[]).slice(0,6) } : { repos: [], files: [] };
      const images = imgRes.status === 'fulfilled' ? (imgRes.value.results||[]).slice(0,6) : [];

      return Response.json({ services, code, images, query: q }, { headers: cors });
    }

    // ── Live stats API — aggregates from index + images ──
    if (path === '/api/pulse') {
      const [idxRes, imgRes] = await Promise.allSettled([
        fetch(`${env.INDEX_API}/api/stats`).then(r => r.json()),
        fetch(`${env.IMAGES_API}/api/stats`).then(r => r.json()),
      ]);
      const idx = idxRes.status === 'fulfilled' ? idxRes.value : null;
      const img = imgRes.status === 'fulfilled' ? imgRes.value : null;
      return Response.json({
        index: idx ? { repos: idx.total_repos, files: idx.total_files, languages: (idx.by_language||[]).length, sources: idx.by_source, recent: (idx.recent||[]).slice(0,5) } : null,
        images: img ? { total: img.total_images, size_mb: img.total_size_mb, providers: (img.by_provider||[]).length, agents: (img.agents||[]).length, recent: (img.recent||[]).slice(0,4) } : null,
        services: SERVICES.length,
        ts: Date.now(),
      }, { headers: cors });
    }

    // ── Health check — ping index + images ──
    if (path === '/api/health') {
      const checks = [
        `${env.INDEX_API}/api/stats`,
        `${env.IMAGES_API}/api/stats`,
        'https://git.blackroad.io',
        'https://chat.blackroad.io',
      ];
      const names = ['index', 'images', 'git', 'chat'];
      const results = await Promise.allSettled(checks.map(u => fetch(u, { signal: AbortSignal.timeout(3000) })));
      const health = {};
      results.forEach((r, i) => { health[names[i]] = r.status === 'fulfilled' && r.value.ok ? 'up' : 'down'; });
      return Response.json(health, { headers: cors });
    }

    // ── Services directory ──
    if (path === '/api/services') {
      return Response.json({ services: SERVICES }, { headers: cors });
    }

    // ── Portal UI ──
    if (path === '/' || path === '') {
      return new Response(renderPortal(), { headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors } });
    }

    return new Response('Not found', { status: 404 });
  },
};

function renderPortal() {
  const SVC_CATEGORIES = {
    'AI & Compute': ['chat','ollama','cece','mcp','mesh'],
    'Code & Dev': ['index','git','api','docs','roadc'],
    'Media & Storage': ['images','minio','drive','stream','brand','studio'],
    'Infrastructure': ['dashboard','fleet','status','cloud','auth','os'],
    'Research': ['qdrant','grafana','research'],
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BlackRoad</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --grad: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body { background: #000; color: #fff; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }

  /* ── Canvas (constellation) ── */
  #constellation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

  /* ── Shared Nav ── */
  .topnav {
    display: flex; align-items: center; justify-content: space-between; padding: 12px 24px;
    border-bottom: 1px solid #111; position: sticky; top: 0; background: rgba(0,0,0,0.92);
    backdrop-filter: blur(12px); z-index: 100;
  }
  .topnav-brand { font-family: 'Space Grotesk'; font-weight: 700; font-size: 0.85rem; color: #fff; text-decoration: none; }
  .topnav-brand span { color: #f5f5f5; }
  .topnav-links { display: flex; gap: 4px; align-items: center; }
  .topnav-links a {
    padding: 5px 12px; border-radius: 6px; font-size: 0.72rem; font-family: 'JetBrains Mono';
    color: #555; text-decoration: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .topnav-links a:hover { color: #fff; border-color: #333; background: #111; }
  .topnav-links a.active { color: #f5f5f5; border-color: #FF225533; background: #FF225508; border-bottom: 2px solid #FF2255; }
  .topnav-sep { width: 1px; height: 14px; background: #222; margin: 0 4px; }
  .topnav-kbd { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #333; margin-left: 8px; padding: 2px 6px; border: 1px solid #222; border-radius: 3px; }

  /* ── Layout ── */
  .portal { display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 20px; position: relative; z-index: 1; }
  .portal-top { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding-top: 8vh; padding-bottom: 16px; transition: all 0.4s; }
  .portal-top.compact { padding-top: 2vh; }
  .portal-top.compact .logo { font-size: 2.2rem; }
  .portal-top.compact .tagline { display: none; }
  .portal-bottom { flex: 1; width: 100%; max-width: 900px; }

  /* ── Logo ── */
  .logo {
    font-family: 'Space Grotesk'; font-size: 4rem; font-weight: 700;
    color: #f5f5f5;
    margin-bottom: 4px; user-select: none; cursor: default;
    transition: all 0.4s;
  }
  .logo:hover { letter-spacing: 4px; }
  @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  .tagline { font-family: 'Space Grotesk'; color: #555; font-size: 0.9rem; letter-spacing: 0.5px; margin-bottom: 20px; transition: all 0.3s; }

  /* ── Search ── */
  .search-wrap { width: 100%; max-width: 640px; position: relative; }
  .search-box {
    display: flex; border: 1px solid #1a1a1a; border-radius: 24px; overflow: hidden;
    background: #0a0a0a; transition: all 0.3s;
  }
  .search-box:focus-within { border-color: #FF2255; box-shadow: 0 0 30px rgba(255,34,85,0.12), 0 0 60px rgba(136,68,255,0.06); }
  .search-box input {
    flex: 1; padding: 18px 24px; background: transparent; color: #fff; border: none; outline: none;
    font-size: 1.05rem; font-family: 'Space Grotesk';
  }
  .search-box input::placeholder { color: #333; }
  .search-box button {
    padding: 18px 32px; background: var(--grad); background-size: 200% 100%; animation: gradShift 4s ease infinite;
    color: #fff; border: none; cursor: pointer; font-weight: 600; font-size: 0.9rem; font-family: 'Space Grotesk';
    transition: opacity 0.2s;
  }
  .search-box button:hover { opacity: 0.85; }
  .kbd { position: absolute; right: 120px; top: 50%; transform: translateY(-50%); color: #1a1a1a; font-size: 0.7rem; font-family: 'JetBrains Mono'; pointer-events: none; }

  /* ── Filter tabs ── */
  .filter-tabs { display: none; gap: 4px; margin-top: 10px; justify-content: center; }
  .filter-tabs.show { display: flex; }
  .ftab {
    padding: 5px 14px; border: 1px solid #1a1a1a; border-radius: 16px; background: #060606;
    color: #444; font-size: 0.7rem; font-family: 'JetBrains Mono'; cursor: pointer; transition: all 0.2s;
  }
  .ftab:hover { border-color: #333; color: #888; }
  .ftab.active { border-color: #FF225555; color: #f5f5f5; background: #FF225508; }
  .ftab .fc { font-size: 0.6rem; color: #333; margin-left: 3px; }

  /* ── Quick links ── */
  .quick-links { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; justify-content: center; }
  .qlink {
    padding: 6px 14px; border: 1px solid #1a1a1a; border-radius: 20px; background: #060606;
    color: #666; font-size: 0.75rem; font-family: 'JetBrains Mono'; text-decoration: none;
    transition: all 0.2s; cursor: pointer;
  }
  .qlink:hover { border-color: #444; color: #fff; transform: translateY(-1px); }
  .qlink .qi { margin-right: 4px; color: #444; }

  /* ── Results ── */
  #results { width: 100%; margin-top: 16px; min-height: 100px; }
  .result-section { margin-bottom: 20px; }
  .section-title {
    font-family: 'Space Grotesk'; font-size: 0.78rem; color: #444; text-transform: uppercase;
    letter-spacing: 1.5px; margin-bottom: 10px; padding-left: 4px;
    display: flex; align-items: center; gap: 8px;
  }
  .section-title .count { color: #999; }
  .section-line { flex: 1; height: 1px; background: #1a1a1a; }
  .section-deeplink {
    font-family: 'JetBrains Mono'; font-size: 0.65rem; color: #999; text-decoration: none;
    margin-left: 8px; opacity: 0.6; transition: opacity 0.2s;
  }
  .section-deeplink:hover { opacity: 1; color: #f5f5f5; }

  /* ── Service cards ── */
  .svc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
  .svc-card {
    border: 1px solid #1a1a1a; border-radius: 10px; padding: 14px 16px;
    background: #060606; text-decoration: none; color: #fff; transition: all 0.25s;
    position: relative; overflow: hidden; cursor: pointer;
    animation: fadeUp 0.3s ease both;
  }
  .svc-card::before {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
    background: var(--grad); opacity: 0; transition: opacity 0.3s;
  }
  .svc-card:hover { border-color: #333; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .svc-card:hover::before { opacity: 1; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .svc-icon {
    font-family: 'JetBrains Mono'; font-size: 0.8rem; color: #999; font-weight: 600;
    background: #8844FF11; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; border-left: 3px solid #8844FF;
  }
  .svc-name { font-family: 'Space Grotesk'; font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; }
  .svc-desc { font-size: 0.72rem; color: #666; line-height: 1.4; }
  .svc-url { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #333; margin-top: 6px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .svc-health { position: absolute; top: 12px; right: 12px; width: 6px; height: 6px; border-radius: 50%; background: #222; }
  .svc-health.up { background: #00D4FF; box-shadow: 0 0 6px rgba(0,212,255,0.4); }
  .svc-health.down { background: #FF2255; }
  .cat-title {
    font-family: 'Space Grotesk'; font-size: 0.68rem; color: #333; text-transform: uppercase;
    letter-spacing: 1.5px; margin: 18px 0 8px; padding-left: 2px;
  }

  /* ── Code results ── */
  .code-result {
    border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px 14px; margin-bottom: 8px;
    background: #060606; transition: all 0.25s; cursor: pointer; animation: fadeUp 0.3s ease both;
  }
  .code-result:hover { border-color: #333; transform: translateX(3px); }
  .code-result .cr-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; overflow: hidden; }
  .cr-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  .cr-source { padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; font-family: 'JetBrains Mono'; }
  .cr-source.github { border: 1px solid #444; color: #888; }
  .cr-source.gitea { border: 1px solid #609926; color: #00D4FF; }
  .cr-name { font-family: 'JetBrains Mono'; color: #f5f5f5; font-size: 0.82rem; font-weight: 600; text-decoration: none; }
  .cr-name:hover { color: #fff; }
  .cr-desc { color: #666; font-size: 0.75rem; }
  .cr-lang { padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; border: 1px solid #222; color: #555; font-family: 'JetBrains Mono'; }
  .cr-snippet {
    background: #0a0a0a; padding: 10px; border-radius: 6px; font-size: 0.72rem; font-family: 'JetBrains Mono';
    color: #999; margin-top: 6px; overflow-x: auto; border: 1px solid #141414;
    max-height: 80px; transition: max-height 0.3s; cursor: pointer;
  }
  .cr-snippet.expanded { max-height: 400px; }
  .cr-snippet mark { background: rgba(255,34,85,0.15); color: #f5f5f5; padding: 1px 2px; border-radius: 2px; border-bottom: 1px solid #FF2255; }
  .cr-backlinks, .blacklinks {
    display: flex; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #111; flex-wrap: wrap; align-items: center;
  }
  .blacklinks-label {
    font-family: 'JetBrains Mono'; font-size: 0.55rem; color: #222; text-transform: uppercase; letter-spacing: 1px; margin-right: 2px;
  }
  .cr-backlinks a, .blacklinks a, .bl {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #444; text-decoration: none;
    padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s; cursor: pointer;
  }
  .cr-backlinks a:hover, .blacklinks a:hover, .bl:hover { color: #f5f5f5; border-color: #4488FF33; background: #4488FF08; }
  .bl.bl-portal { border-color: #FF225518; color: #999; border-left: 3px solid #FF2255; }
  .bl.bl-portal:hover { background: #FF225508; border-color: #FF225533; color: #f5f5f5; }
  .bl.bl-index { border-color: #4488FF18; color: #999; border-left: 3px solid #4488FF; }
  .bl.bl-index:hover { background: #4488FF08; border-color: #4488FF33; color: #f5f5f5; }
  .bl.bl-images { border-color: #CC00AA18; color: #999; border-left: 3px solid #CC00AA; }
  .bl.bl-images:hover { background: #CC00AA08; border-color: #CC00AA33; color: #f5f5f5; }
  .bl.bl-git { border-color: #00D4FF18; color: #00D4FF; }
  .bl.bl-git:hover { background: #00D4FF08; border-color: #00D4FF33; }
  .bl.bl-lang { border-color: #8844FF18; color: #999; border-left: 3px solid #8844FF; }
  .bl.bl-lang:hover { background: #8844FF08; border-color: #8844FF33; color: #f5f5f5; }
  .bl.bl-ext { border-color: #00D4FF18; color: #999; border-left: 3px solid #00D4FF; }
  .bl.bl-ext:hover { background: #00D4FF08; border-color: #00D4FF33; color: #f5f5f5; }
  .bl.bl-owner { border-color: #FF6B2B18; color: #999; border-left: 3px solid #FF6B2B; }
  .bl.bl-owner:hover { background: #FF6B2B08; border-color: #FF6B2B33; color: #f5f5f5; }
  .bl-sep { width: 1px; height: 10px; background: #1a1a1a; }

  /* ── Image results ── */
  .img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .img-card {
    border: 1px solid #1a1a1a; border-radius: 8px; overflow: hidden; transition: all 0.3s;
    animation: fadeUp 0.3s ease both; cursor: pointer;
  }
  .img-card:hover { border-color: #FF2255; transform: scale(1.03); box-shadow: 0 4px 20px rgba(255,34,85,0.1); }
  .img-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #111; }
  .img-card-wrap { animation: fadeUp 0.3s ease both; }
  .img-backlinks, .img-blacklinks { display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap; align-items: center; }
  .img-backlinks a, .img-blacklinks a {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #444; text-decoration: none;
    padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s;
  }
  .img-backlinks a:hover, .img-blacklinks a:hover { color: #f5f5f5; border-color: #4488FF33; background: #4488FF08; }
  .img-prov {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #333; padding: 2px 8px;
    border: 1px solid #1a1a1a; border-radius: 4px;
  }
  .img-kw {
    font-family: 'JetBrains Mono'; font-size: 0.55rem; color: #999; text-decoration: none;
    padding: 1px 6px; border: 1px solid #CC00AA18; border-radius: 3px; transition: all 0.2s; cursor: pointer; border-left: 2px solid #CC00AA;
  }
  .img-kw:hover { background: #CC00AA08; border-color: #CC00AA33; color: #f5f5f5; }

  /* ── Lightbox ── */
  .lightbox {
    position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 200;
    display: none; align-items: center; justify-content: center; cursor: pointer;
  }
  .lightbox.open { display: flex; }
  .lightbox img { max-width: 90vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 0 60px rgba(0,0,0,0.8); }
  .lightbox .lb-info {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #111; border: 1px solid #333; border-radius: 8px; padding: 10px 16px;
    font-size: 0.75rem; color: #888; font-family: 'JetBrains Mono'; max-width: 500px; text-align: center;
  }
  .lb-close { position: absolute; top: 20px; right: 24px; color: #555; font-size: 1.5rem; cursor: pointer; background: none; border: none; }
  .lb-close:hover { color: #fff; }

  /* ── Command palette ── */
  .cmd-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 300;
    display: none; align-items: flex-start; justify-content: center; padding-top: 20vh;
    backdrop-filter: blur(8px);
  }
  .cmd-overlay.open { display: flex; }
  .cmd-box {
    width: 100%; max-width: 560px; background: #0a0a0a; border: 1px solid #1a1a1a;
    border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .cmd-input {
    width: 100%; padding: 18px 22px; background: transparent; color: #fff; border: none;
    outline: none; font-size: 1rem; font-family: 'JetBrains Mono'; border-bottom: 1px solid #1a1a1a;
  }
  .cmd-input::placeholder { color: #333; }
  .cmd-results { max-height: 320px; overflow-y: auto; }
  .cmd-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 22px; cursor: pointer;
    transition: all 0.15s; border-bottom: 1px solid #0a0a0a; text-decoration: none; color: #fff;
  }
  .cmd-item:hover, .cmd-item.selected { background: #111; }
  .cmd-item.selected { border-left: 2px solid #FF2255; }
  .cmd-item-icon {
    font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #999; font-weight: 600;
    min-width: 28px; text-align: center;
  }
  .cmd-item-name { font-family: 'Space Grotesk'; font-weight: 600; font-size: 0.85rem; }
  .cmd-item-desc { font-size: 0.68rem; color: #555; margin-left: auto; font-family: 'JetBrains Mono'; }
  .cmd-item-url { font-size: 0.6rem; color: #333; font-family: 'JetBrains Mono'; }
  .cmd-hint {
    padding: 8px 22px; font-size: 0.6rem; color: #333; font-family: 'JetBrains Mono';
    border-top: 1px solid #1a1a1a; display: flex; gap: 16px;
  }

  /* ── Loading ── */
  .loading { display: none; text-align: center; padding: 30px; }
  .loading.active { display: block; }
  .loading .dots { font-family: 'JetBrains Mono'; color: #333; font-size: 0.8rem; }
  .loading .bar { height: 2px; max-width: 200px; margin: 10px auto; background: var(--grad); border-radius: 2px; animation: loadBar 1.2s ease infinite; }
  @keyframes loadBar { 0% { width: 0; } 50% { width: 100%; } 100% { width: 100%; opacity: 0; } }

  /* ── Toast ── */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 400; display: flex; flex-direction: column; gap: 8px; }
  .toast {
    padding: 10px 18px; border-radius: 8px; background: #111; border: 1px solid #1a1a1a;
    font-family: 'JetBrains Mono'; font-size: 0.72rem; color: #888;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards;
    display: flex; align-items: center; gap: 8px; max-width: 320px;
  }
  .toast.success { border-color: #00D4FF33; color: #ccc; border-left: 3px solid #00D4FF; }
  .toast.error { border-color: #FF225533; color: #ccc; border-left: 3px solid #FF2255; }
  .toast-icon { font-size: 0.8rem; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { to { opacity: 0; transform: translateX(20px); } }

  /* ── Scroll to top ── */
  .scroll-top {
    position: fixed; bottom: 24px; left: 24px; z-index: 100;
    width: 36px; height: 36px; border-radius: 50%; background: #111; border: 1px solid #1a1a1a;
    color: #555; font-size: 1rem; cursor: pointer; display: none; align-items: center; justify-content: center;
    transition: all 0.3s; font-family: 'JetBrains Mono';
  }
  .scroll-top.show { display: flex; }
  .scroll-top:hover { border-color: #FF2255; color: #f5f5f5; background: #FF225508; transform: translateY(-2px); }

  /* ── Autocomplete ── */
  .autocomplete {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 50;
    background: #0a0a0a; border: 1px solid #1a1a1a; border-top: none; border-radius: 0 0 14px 14px;
    overflow: hidden; display: none; max-height: 280px; overflow-y: auto;
  }
  .autocomplete.open { display: block; }
  .ac-section { padding: 6px 16px; font-family: 'JetBrains Mono'; font-size: 0.58rem; color: #333; text-transform: uppercase; letter-spacing: 1px; }
  .ac-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 20px; cursor: pointer;
    transition: all 0.15s; border-bottom: 1px solid #0a0a0a;
  }
  .ac-item:hover, .ac-item.selected { background: #111; }
  .ac-item.selected { border-left: 2px solid #FF2255; }
  .ac-icon { font-family: 'JetBrains Mono'; font-size: 0.7rem; color: #444; min-width: 20px; }
  .ac-text { font-family: 'Space Grotesk'; font-size: 0.82rem; color: #999; flex: 1; }
  .ac-hint { font-family: 'JetBrains Mono'; font-size: 0.58rem; color: #333; }
  .ac-remove { color: #333; cursor: pointer; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; transition: all 0.2s; }
  .ac-remove:hover { color: #f5f5f5; background: #FF225508; }

  /* ── Search history chips ── */
  .history-chips { display: none; gap: 6px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
  .history-chips.show { display: flex; }
  .hchip {
    padding: 4px 12px; border: 1px solid #1a1a1a; border-radius: 14px; background: #060606;
    color: #444; font-size: 0.68rem; font-family: 'JetBrains Mono'; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 4px;
  }
  .hchip:hover { border-color: #333; color: #888; }
  .hchip .hx { color: #333; margin-left: 4px; font-size: 0.6rem; }
  .hchip .hx:hover { color: #f5f5f5; }

  /* ── Keyboard nav highlight ── */
  .code-result.kb-active, .svc-card.kb-active, .img-card-wrap.kb-active { border-color: #FF2255 !important; box-shadow: 0 0 20px rgba(255,34,85,0.1); }
  .svc-card.kb-active { border-color: #FF2255 !important; }

  /* ── Typing cursor ── */
  .tagline .cursor { display: inline-block; width: 2px; height: 1em; background: #555; margin-left: 2px; animation: blink 0.8s step-end infinite; vertical-align: text-bottom; }
  @keyframes blink { 50% { opacity: 0; } }

  /* ── Sparkline ── */
  .sparkline { display: inline-block; vertical-align: middle; margin-left: 4px; }

  /* ── Pulse Stats ── */
  .pulse-bar {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; padding: 12px 0;
    border-bottom: 1px solid #111; margin-bottom: 14px;
  }
  .pulse-stat {
    display: flex; align-items: center; gap: 5px; padding: 5px 12px;
    border: 1px solid #1a1a1a; border-radius: 8px; background: #060606;
    font-family: 'JetBrains Mono'; font-size: 0.68rem; color: #555; transition: all 0.2s; cursor: default;
  }
  .pulse-stat:hover { border-color: #333; color: #888; }
  .pulse-stat .pn { color: #f5f5f5; font-weight: 600; }
  .pulse-stat .pl { color: #444; }
  .pulse-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
  .pulse-dot.up { background: #00D4FF; animation: pulse 2s ease infinite; }
  .pulse-dot.down { background: #FF2255; }
  .pulse-dot.pending { background: #333; }
  @keyframes pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,255,0.4); } 50% { opacity: 0.6; box-shadow: 0 0 0 8px rgba(0,212,255,0); } }

  /* ── Feed ── */
  .feed { margin-top: 14px; }
  .feed-section { margin-bottom: 18px; }
  .feed-title {
    font-family: 'Space Grotesk'; font-size: 0.68rem; color: #333; text-transform: uppercase;
    letter-spacing: 1.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
  .feed-title a {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #999; text-decoration: none;
    opacity: 0.6; transition: opacity 0.2s;
  }
  .feed-title a:hover { opacity: 1; color: #f5f5f5; }
  .feed-item {
    display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 3px;
    border: 1px solid #111; border-radius: 8px; background: #060606; transition: all 0.2s;
    animation: fadeUp 0.3s ease both; text-decoration: none; color: #fff;
  }
  .feed-item:hover { border-color: #1a1a1a; transform: translateX(3px); }
  .feed-icon {
    font-family: 'JetBrains Mono'; font-size: 0.65rem; color: #999; font-weight: 600;
    padding: 3px 6px; background: #8844FF11; border-radius: 4px; min-width: 26px; text-align: center; border-left: 2px solid #8844FF;
  }
  .feed-name { font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #f5f5f5; flex: 1; }
  .feed-meta { font-size: 0.58rem; color: #333; font-family: 'JetBrains Mono'; }
  .feed-badge { padding: 2px 6px; border-radius: 4px; font-size: 0.55rem; font-family: 'JetBrains Mono'; border: 1px solid #222; color: #555; }
  .feed-images { display: flex; gap: 8px; flex-wrap: wrap; }
  .feed-img {
    width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #1a1a1a;
    transition: all 0.3s; animation: fadeUp 0.3s ease both; cursor: pointer;
  }
  .feed-img:hover { border-color: #FF2255; transform: scale(1.05); }
  .feed-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* ── Health ── */
  .health-row { display: flex; gap: 6px; justify-content: center; margin-bottom: 10px; flex-wrap: wrap; }
  .health-chip {
    display: flex; align-items: center; gap: 4px; padding: 3px 10px; border: 1px solid #111;
    border-radius: 6px; font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #333;
    text-decoration: none; transition: all 0.2s;
  }
  .health-chip:hover { border-color: #333; color: #666; }
  .health-chip.up { border-color: #00D4FF22; color: #ccc; border-left: 3px solid #00D4FF; }
  .health-chip.down { border-color: #FF225522; color: #ccc; border-left: 3px solid #FF2255; }

  /* ── Footer ── */
  .footer {
    text-align: center; padding: 32px 0 16px; margin-top: auto;
    font-family: 'Space Grotesk'; width: 100%;
  }
  .footer .l1 { font-size: 0.78rem; color: #333; }
  .footer .l2 { font-size: 0.6rem; color: #222; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
  .footer .links { margin-top: 10px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .footer .links a { color: #333; font-size: 0.68rem; text-decoration: none; font-family: 'JetBrains Mono'; transition: color 0.2s; }
  .footer .links a:hover { color: #888; }

  @media (max-width: 768px) {
    .topnav { padding: 10px 16px; }
    .topnav-links { gap: 2px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .topnav-links a { font-size: 0.65rem; padding: 4px 8px; white-space: nowrap; }
    .topnav-sep { display: none; }
    .topnav-kbd { display: none; }
    .portal { padding: 12px; }
    .portal-top { padding-top: 4vh; }
    .logo { font-size: 2.4rem; }
    .tagline { font-size: 0.75rem; }
    .search-wrap { max-width: 100%; }
    .search-box input { padding: 14px 16px; font-size: 0.9rem; }
    .search-box button { padding: 14px 20px; font-size: 0.8rem; }
    .kbd { display: none; }
    .svc-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .svc-card { padding: 12px; }
    .svc-name { font-size: 0.82rem; }
    .svc-desc { font-size: 0.68rem; }
    .img-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .code-result { padding: 10px 12px; }
    .cr-name { word-break: break-all; }
    .cr-snippet { font-size: 0.65rem; }
    .quick-links { gap: 6px; }
    .qlink { font-size: 0.65rem; padding: 5px 10px; }
    .filter-tabs .ftab { font-size: 0.65rem; padding: 4px 10px; }
    .cmd-box { margin: 0 12px; max-width: calc(100vw - 24px); }
    .cmd-input { font-size: 0.85rem; padding: 14px 16px; }
    .lightbox img { max-width: 95vw; max-height: 80vh; }
    .footer .links { gap: 10px; }
    .portal-bottom { max-width: 100%; }
    .section-label { font-size: 0.55rem; }
    .pulse-bar { flex-wrap: wrap; gap: 6px; }
    .feed-item { flex-direction: column; }
    .feed-img { width: 100%; height: 120px; }
  }
  @media (max-width: 420px) {
    .topnav-links a { font-size: 0.6rem; padding: 3px 6px; }
    .logo { font-size: 2rem; }
    .svc-grid { grid-template-columns: 1fr; }
    .img-grid { grid-template-columns: repeat(2, 1fr); }
    .search-box { flex-direction: column; border-radius: 16px; }
    .search-box input { border-radius: 16px 16px 0 0; }
    .search-box button { border-radius: 0 0 16px 16px; width: 100%; }
  }
</style>
</head>
<body>
<canvas id="constellation"></canvas>

<nav class="topnav">
  <a href="/" class="topnav-brand"><span>BlackRoad</span></a>
  <div class="topnav-links">
    <a href="/" class="active">portal</a>
    <div class="topnav-sep"></div>
    <a href="https://index.blackroad.io">index</a>
    <a href="https://images.blackroad.io">images</a>
    <div class="topnav-sep"></div>
    <a href="https://git.blackroad.io">git</a>
    <a href="https://chat.blackroad.io">chat</a>
    <a href="https://docs.blackroad.io">docs</a>
    <a href="https://api.blackroad.io">api</a>
    <span class="topnav-kbd">Cmd+K</span>
  </div>
</nav>

<div class="portal">
  <div class="portal-top" id="portalTop">
    <div class="logo" id="logo">BlackRoad</div>
    <div class="tagline" id="tagline"><span id="typeTarget"></span><span class="cursor"></span></div>
    <div class="search-wrap">
      <div class="search-box">
        <input type="text" id="q" placeholder="Search code, images, services..." autofocus autocomplete="off">
        <button id="searchBtn">Search</button>
      </div>
      <span class="kbd" id="kbd">/</span>
      <div class="autocomplete" id="autocomplete"></div>
    </div>
    <div class="filter-tabs" id="filterTabs">
      <span class="ftab active" data-filter="all">All</span>
      <span class="ftab" data-filter="services">Services<span class="fc" id="fcSvc"></span></span>
      <span class="ftab" data-filter="repos">Repos<span class="fc" id="fcRepo"></span></span>
      <span class="ftab" data-filter="code">Code<span class="fc" id="fcCode"></span></span>
      <span class="ftab" data-filter="images">Images<span class="fc" id="fcImg"></span></span>
    </div>
    <div class="quick-links" id="quickLinks">
      <a class="qlink" data-q="ollama"><span class="qi">{}</span>ollama</a>
      <a class="qlink" data-q="dashboard"><span class="qi">{}</span>dashboard</a>
      <a class="qlink" data-q="python"><span class="qi">{}</span>python</a>
      <a class="qlink" data-q="api"><span class="qi">{}</span>api</a>
      <a class="qlink" data-q="agent"><span class="qi">{}</span>agents</a>
      <a class="qlink" data-q="fleet"><span class="qi">{}</span>fleet</a>
      <a class="qlink" href="https://index.blackroad.io" target="_blank"><span class="qi">&lt;&gt;</span>code</a>
      <a class="qlink" href="https://images.blackroad.io" target="_blank"><span class="qi">[]</span>images</a>
    </div>
    <div class="history-chips" id="historyChips"></div>
  </div>

  <div class="portal-bottom">
    <div class="loading" id="loading"><div class="dots">searching blackroad...</div><div class="bar"></div></div>
    <div id="results"></div>
  </div>

  <div class="footer">
    <div class="l1">Remember the Road. Pave Tomorrow.</div>
    <div class="l2">The Prompt Legend of All Time</div>
    <div class="links">
      <a href="https://index.blackroad.io">index</a>
      <a href="https://images.blackroad.io">images</a>
      <a href="https://git.blackroad.io">git</a>
      <a href="https://chat.blackroad.io">chat</a>
      <a href="https://api.blackroad.io">api</a>
      <a href="https://docs.blackroad.io">docs</a>
      <a href="https://status.blackroad.io">status</a>
      <a href="https://github.com/blackboxprogramming">github</a>
    </div>
    <div class="links" style="margin-top:6px">
      <a href="https://fleet.blackroad.io">fleet</a>
      <a href="https://mesh.blackroad.io">mesh</a>
      <a href="https://mcp.blackroad.io">mcp</a>
      <a href="https://cece.blackroad.io">cece</a>
      <a href="https://brand.blackroad.io">brand</a>
      <a href="https://roadc.blackroad.io">roadc</a>
      <a href="https://os.blackroad.io">os</a>
    </div>
  </div>
</div>

<!-- Toast container -->
<div class="toast-container" id="toasts"></div>

<!-- Scroll to top -->
<button class="scroll-top" id="scrollTop" title="Back to top">&#8593;</button>

<!-- Lightbox -->
<div class="lightbox" id="lightbox">
  <button class="lb-close">&times;</button>
  <img id="lbImg" src="" alt="">
  <div class="lb-info" id="lbInfo"></div>
</div>

<!-- Command Palette -->
<div class="cmd-overlay" id="cmdOverlay">
  <div class="cmd-box">
    <input class="cmd-input" id="cmdInput" placeholder="Jump to service..." autocomplete="off">
    <div class="cmd-results" id="cmdResults"></div>
    <div class="cmd-hint"><span>&#8593;&#8595; navigate</span><span>&#9166; open</span><span>esc close</span></div>
  </div>
</div>

<script>
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const input=$('#q'), results=$('#results'), loading=$('#loading'), kbd=$('#kbd');
const lb=$('#lightbox'), lbImg=$('#lbImg'), lbInfo=$('#lbInfo');
const cmdOverlay=$('#cmdOverlay'), cmdInput=$('#cmdInput'), cmdResults=$('#cmdResults');
const ac=$('#autocomplete'), toasts=$('#toasts'), scrollTopBtn=$('#scrollTop');
let timer, activeFilter='all', lastData=null, cmdIdx=-1, acIdx=-1, kbIdx=-1;

const SL = ${JSON.stringify(SERVICES)};
const SC = ${SERVICES.length};
const CATS = ${JSON.stringify(SVC_CATEGORIES)};

// ── Toast notifications ──
function toast(msg, type='info') {
  const t=document.createElement('div');
  t.className='toast '+(type||'');
  t.innerHTML='<span class="toast-icon">'+(type==='success'?'\\u2713':type==='error'?'\\u2717':'\\u2022')+'</span>'+msg;
  toasts.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

// ── Search history (localStorage) ──
function getHistory() { try { return JSON.parse(localStorage.getItem('br_history')||'[]'); } catch(e) { return []; } }
function addHistory(q) {
  if(!q||q.length<2) return;
  let h=getHistory().filter(x=>x!==q);
  h.unshift(q);
  if(h.length>12) h=h.slice(0,12);
  localStorage.setItem('br_history',JSON.stringify(h));
}
function removeHistory(q) {
  let h=getHistory().filter(x=>x!==q);
  localStorage.setItem('br_history',JSON.stringify(h));
  renderHistoryChips();
}
function renderHistoryChips() {
  const h=getHistory();
  const el=$('#historyChips');
  if(!h.length){el.classList.remove('show');return;}
  el.classList.add('show');
  el.innerHTML=h.slice(0,8).map(q=>'<span class="hchip" data-q="'+q.replace(/"/g,'&quot;')+'">'+q.replace(/</g,'&lt;')+'<span class="hx" data-rm="'+q.replace(/"/g,'&quot;')+'">&times;</span></span>').join('');
  el.querySelectorAll('.hchip').forEach(c=>{
    c.addEventListener('click',e=>{
      if(e.target.classList.contains('hx')){e.stopPropagation();removeHistory(e.target.dataset.rm);return;}
      input.value=c.dataset.q;search(c.dataset.q);
    });
  });
}

// ── Scroll to top ──
window.addEventListener('scroll',()=>{
  scrollTopBtn.classList.toggle('show',window.scrollY>300);
});
scrollTopBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// ── Typing animation ──
(function(){
  const phrases=['Ride the BlackRoad.','Search everything.','Code. Images. Services.','52 TOPS of edge AI.','Repos indexed live.','Your sovereign cloud.'];
  let pi=0,ci=0,del=false;
  const el=$('#typeTarget');
  function tick(){
    const phrase=phrases[pi];
    if(!del){
      ci++;el.textContent=phrase.slice(0,ci);
      if(ci>=phrase.length){setTimeout(()=>{del=true;tick();},2000);return;}
    } else {
      ci--;el.textContent=phrase.slice(0,ci);
      if(ci<=0){del=false;pi=(pi+1)%phrases.length;setTimeout(tick,400);return;}
    }
    setTimeout(tick,del?30:60);
  }
  tick();
})();

// ── Constellation background (mouse-reactive) ──
(function(){
  const c=document.getElementById('constellation'), ctx=c.getContext('2d');
  let W,H,pts=[],mx=-1,my=-1;
  function resize(){W=c.width=innerWidth;H=c.height=innerHeight;pts=[];for(let i=0;i<70;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,r:Math.random()*1.5+0.5});}
  resize(); addEventListener('resize',resize);
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  document.addEventListener('mouseleave',()=>{mx=-1;my=-1;});
  const colors=['#FF6B2B','#FF2255','#CC00AA','#8844FF','#4488FF','#00D4FF'];
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach((p,i)=>{
      // mouse attraction
      if(mx>0&&my>0){
        const dx=mx-p.x,dy=my-p.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<250&&d>10){p.vx+=dx/d*0.015;p.vy+=dy/d*0.015;}
      }
      // damping
      p.vx*=0.998;p.vy*=0.998;
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=colors[i%colors.length];ctx.globalAlpha=0.18;ctx.fill();
      // connect nearby
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[j].x-p.x,dy=pts[j].y-p.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<150){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=colors[i%colors.length];ctx.globalAlpha=0.05*(1-d/150);ctx.stroke();}
      }
      // mouse glow connection
      if(mx>0&&my>0){
        const dx=mx-p.x,dy=my-p.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<200){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.strokeStyle='#FF2255';ctx.globalAlpha=0.06*(1-d/200);ctx.stroke();}
      }
    });
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Search ──
async function search(q) {
  if (!q || q.length < 2) { history.replaceState(null,'','/'); showHome(); return; }
  history.replaceState(null,'','/?q='+encodeURIComponent(q));
  loading.classList.add('active');
  results.innerHTML = '';
  kbIdx=-1;
  ac.classList.remove('open');
  $('#portalTop').classList.add('compact');
  $('#filterTabs').classList.add('show');
  $('#quickLinks').style.display='none';
  $('#historyChips').classList.remove('show');
  const t0=performance.now();
  try {
    const res = await fetch('/api/search?q=' + encodeURIComponent(q));
    lastData = await res.json();
    loading.classList.remove('active');
    const ms=Math.round(performance.now()-t0);
    const total=(lastData.services?.length||0)+(lastData.code?.repos?.length||0)+(lastData.code?.files?.length||0)+(lastData.images?.length||0);
    toast(total+' results in '+ms+'ms','success');
    addHistory(q);
    updateFilterCounts(lastData);
    renderResults(lastData);
  } catch(e) {
    loading.classList.remove('active');
    toast('Search failed','error');
    results.innerHTML = '<div style="text-align:center;color:#333;padding:40px">Search failed</div>';
  }
}

function updateFilterCounts(d) {
  $('#fcSvc').textContent = d.services?.length ? ' '+d.services.length : '';
  $('#fcRepo').textContent = d.code?.repos?.length ? ' '+d.code.repos.length : '';
  $('#fcCode').textContent = d.code?.files?.length ? ' '+d.code.files.length : '';
  $('#fcImg').textContent = d.images?.length ? ' '+d.images.length : '';
}

// ── Blacklink helpers ──
function bl(url,label,cls){return '<a href="'+url+'" target="_blank" class="bl '+cls+'">'+label+'</a>';}
function blSearch(domain,q,label,cls){return bl(domain+'/?q='+encodeURIComponent(q),label,cls);}
function pathEnd(p){return (p||'').split('/').pop()||p;}
function pathExt(p){const m=(p||'').match(/\\.([a-z0-9]+)$/i);return m?m[1]:'';}
function pathDir(p){const parts=(p||'').split('/');return parts.length>1?parts.slice(0,-1).join('/'):'.';}
function owner(fullName){return (fullName||'').split('/')[0]||'';}
function repoName(fullName){return (fullName||'').split('/')[1]||fullName;}
function kwSplit(text){return (text||'').split(/[\\s,._-]+/).filter(w=>w.length>2).slice(0,6);}

function renderResults(data) {
  let html = '';
  const f = activeFilter;
  const q = data.query||'';

  if ((f==='all'||f==='services') && data.services?.length) {
    html += '<div class="result-section"><div class="section-title">Services <span class="count">'+data.services.length+'</span><span class="section-line"></span></div>';
    html += '<div class="svc-grid">';
    data.services.forEach((s,i) => {
      const host=s.url.replace('https://','');
      const sub=host.split('.')[0];
      html += '<a href="'+s.url+'" target="_blank" class="svc-card" style="animation-delay:'+(i*0.04)+'s">'
        +'<div class="svc-icon">'+s.icon+'</div>'
        +'<div class="svc-name">'+s.name+'</div>'
        +'<div class="svc-desc">'+s.desc+'</div>'
        +'<span class="svc-url">'+host+'</span>'
        +'<div class="blacklinks" style="margin-top:6px;border:none;padding:0">'
        +blSearch('https://index.blackroad.io',sub,'code','bl-index')
        +blSearch('https://images.blackroad.io',sub,'images','bl-images')
        +'</div>'
        +'</a>';
    });
    html += '</div></div>';
  }
  if ((f==='all'||f==='repos') && data.code?.repos?.length) {
    html += '<div class="result-section"><div class="section-title">Repos <span class="count">'+data.code.repos.length+'</span>'
      +'<a href="https://index.blackroad.io/?q='+encodeURIComponent(q)+'" class="section-deeplink" target="_blank">all on index &rarr;</a>'
      +'<span class="section-line"></span></div>';
    data.code.repos.forEach((r,i) => {
      const own=owner(r.full_name), repo=repoName(r.full_name);
      html += '<div class="code-result" style="animation-delay:'+(i*0.04)+'s">'
        +'<div class="cr-header">'
        +'<span class="cr-source '+r.source+'">'+r.source+'</span>'
        +'<a href="'+r.html_url+'" target="_blank" class="cr-name">'+r.full_name+'</a>'
        +(r.language?'<span class="cr-lang">'+r.language+'</span>':'')
        +'</div>'
        +'<div class="cr-desc">'+(r.description||'')+'</div>'
        +'<div class="blacklinks"><span class="blacklinks-label">blacklinks</span>'
        +blSearch('https://index.blackroad.io',r.full_name,'index/'+repo,'bl-index')
        +bl(r.html_url,r.source,'bl-'+(r.source==='gitea'?'git':'owner'))
        +(r.source==='gitea'?bl('https://git.blackroad.io/'+r.full_name,'gitea/'+repo,'bl-git'):'')
        +blSearch('https://images.blackroad.io',repo,'images/'+repo,'bl-images')
        +'<span class="bl-sep"></span>'
        +blSearch('https://portal.blackroad.io',own,'@'+own,'bl-owner')
        +(r.language?blSearch('https://index.blackroad.io',r.language,'lang:'+r.language,'bl-lang'):'')
        +blSearch('https://index.blackroad.io',repo+'&type=code','code/'+repo,'bl-ext')
        +'</div></div>';
    });
    html += '</div>';
  }
  if ((f==='all'||f==='code') && data.code?.files?.length) {
    html += '<div class="result-section"><div class="section-title">Code <span class="count">'+data.code.files.length+'</span>'
      +'<a href="https://index.blackroad.io/?q='+encodeURIComponent(q)+'&type=code" class="section-deeplink" target="_blank">all code &rarr;</a>'
      +'<span class="section-line"></span></div>';
    data.code.files.forEach((fi,i) => {
      const fn=pathEnd(fi.path), ext=pathExt(fi.path), dir=pathDir(fi.path);
      const own=owner(fi.full_name), repo=repoName(fi.full_name);
      html += '<div class="code-result" style="animation-delay:'+(i*0.04)+'s">'
        +'<div class="cr-header">'
        +'<span class="cr-source '+fi.source+'">'+fi.source+'</span>'
        +'<span class="cr-name">'+fi.full_name+'/'+fi.path+'</span>'
        +'<span class="cr-lang">'+fi.language+'</span>'
        +'</div>'
        +(fi.snippet?'<div class="cr-snippet" onclick="this.classList.toggle(\\'expanded\\')">'+fi.snippet+'</div>':'')
        +'<div class="blacklinks"><span class="blacklinks-label">blacklinks</span>'
        +blSearch('https://index.blackroad.io',fi.full_name,'repo/'+repo,'bl-index')
        +blSearch('https://portal.blackroad.io',repo,'portal/'+repo,'bl-portal')
        +blSearch('https://index.blackroad.io',fn+'&type=code','file/'+fn,'bl-ext')
        +(ext?blSearch('https://index.blackroad.io','*.'+ext+'&type=code','*.'+ext,'bl-lang'):'')
        +'<span class="bl-sep"></span>'
        +blSearch('https://index.blackroad.io',dir+'&type=code','dir/'+dir.split('/').pop(),'bl-ext')
        +blSearch('https://portal.blackroad.io',own,'@'+own,'bl-owner')
        +(fi.source==='gitea'?bl('https://git.blackroad.io/'+fi.full_name+'/src/branch/main/'+fi.path,'raw','bl-git'):'')
        +'</div></div>';
    });
    html += '</div>';
  }
  if ((f==='all'||f==='images') && data.images?.length) {
    html += '<div class="result-section"><div class="section-title">Images <span class="count">'+data.images.length+'</span>'
      +'<a href="https://images.blackroad.io/?q='+encodeURIComponent(q)+'" class="section-deeplink" target="_blank">gallery &rarr;</a>'
      +'<span class="section-line"></span></div>';
    html += '<div class="img-grid">';
    data.images.forEach((img,i) => {
      const src='https://images.blackroad.io/img/'+img.id+'.'+(img.format||'png');
      const prompt=(img.prompt||'');
      const kws=kwSplit(prompt);
      html += '<div class="img-card-wrap" style="animation-delay:'+(i*0.05)+'s">'
        +'<div class="img-card" data-src="'+src+'" data-prompt="'+prompt.replace(/"/g,'&quot;').slice(0,100)+'">'
        +'<img src="'+src+'" loading="lazy">'
        +'</div>'
        +'<div class="img-blacklinks">'
        +'<a href="https://images.blackroad.io/?q='+encodeURIComponent(prompt)+'" target="_blank" class="bl bl-images">gallery</a>'
        +(img.provider?'<span class="img-prov">'+img.provider+'</span>':'')
        +blSearch('https://portal.blackroad.io',prompt.split(' ')[0]||'','portal','bl-portal')
        +blSearch('https://index.blackroad.io',prompt.split(' ')[0]||'','index','bl-index')
        +'</div>'
        +(kws.length?'<div class="img-blacklinks" style="border:none;padding:0;margin-top:2px">'+kws.map(w=>'<a class="img-kw" href="/?q='+encodeURIComponent(w)+'" onclick="event.preventDefault();document.getElementById(\\'q\\').value=\\''+w.replace(/'/g,"\\\\'")+'\\';search(\\''+w.replace(/'/g,"\\\\'")+'\\')">'+w+'</a>').join('')+'</div>':'')
        +'</div>';
    });
    html += '</div></div>';
  }
  if (!html) html = '<div style="text-align:center;color:#333;padding:60px;font-family:Space Grotesk"><div style="font-size:1.1rem;margin-bottom:8px">No results</div><div style="font-size:0.8rem">Try different keywords</div></div>';
  results.innerHTML = html;
  // Bind lightbox to images
  results.querySelectorAll('.img-card[data-src]').forEach(c=>{
    c.addEventListener('click',()=>{openLightbox(c.dataset.src,c.dataset.prompt||'');});
  });
}

// ── Filter tabs ──
$$('.ftab').forEach(t=>{
  t.addEventListener('click',()=>{
    $$('.ftab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    activeFilter=t.dataset.filter;
    if(lastData) renderResults(lastData);
  });
});

// ── Home ──
function showHome() {
  $('#portalTop').classList.remove('compact');
  $('#filterTabs').classList.remove('show');
  $('#quickLinks').style.display='';
  $('#historyChips').classList.remove('show');
  activeFilter='all'; lastData=null; kbIdx=-1;
  $$('.ftab').forEach(t=>t.classList.toggle('active',t.dataset.filter==='all'));
  renderHistoryChips();

  let html = '';
  html += '<div class="health-row" id="healthRow">';
  ['index','images','git','chat'].forEach(n=>{
    const u={index:'https://index.blackroad.io',images:'https://images.blackroad.io',git:'https://git.blackroad.io',chat:'https://chat.blackroad.io'};
    html += '<a href="'+u[n]+'" target="_blank" class="health-chip" id="health-'+n+'"><span class="pulse-dot pending"></span>'+n+'</a>';
  });
  html += '</div>';
  html += '<div class="pulse-bar" id="pulseBar"><div class="pulse-stat"><span class="pl">loading pulse...</span></div></div>';
  html += '<div class="feed" id="feedArea"></div>';

  // Categorized services
  Object.entries(CATS).forEach(([cat,names])=>{
    html += '<div class="cat-title">'+cat+'</div><div class="svc-grid">';
    names.forEach((n,i)=>{
      const s=SL.find(x=>x.name===n);
      if(!s) return;
      html += '<a href="'+s.url+'" target="_blank" class="svc-card" style="animation-delay:'+(i*0.03)+'s">'
        +'<div class="svc-health" id="sh-'+s.name+'"></div>'
        +'<div class="svc-icon">'+s.icon+'</div>'
        +'<div class="svc-name">'+s.name+'</div>'
        +'<div class="svc-desc">'+s.desc+'</div>'
        +'</a>';
    });
    html += '</div>';
  });

  results.innerHTML = html;

  // Pulse
  fetch('/api/pulse').then(r=>r.json()).then(p=>{
    let bar='';
    if(p.index){bar+='<div class="pulse-stat"><span class="pulse-dot up"></span><span class="pn">'+p.index.repos+'</span><span class="pl">repos</span></div><div class="pulse-stat"><span class="pn">'+p.index.files+'</span><span class="pl">files</span></div><div class="pulse-stat"><span class="pn">'+p.index.languages+'</span><span class="pl">languages</span></div>';}
    if(p.images){bar+='<div class="pulse-stat"><span class="pulse-dot up"></span><span class="pn">'+p.images.total+'</span><span class="pl">images</span></div><div class="pulse-stat"><span class="pn">'+p.images.size_mb+'</span><span class="pl">MB</span></div><div class="pulse-stat"><span class="pn">'+p.images.agents+'</span><span class="pl">agents</span></div>';}
    bar+='<div class="pulse-stat"><span class="pn">'+p.services+'</span><span class="pl">services</span></div>';
    $('#pulseBar').innerHTML=bar;
    let feed='';
    if(p.index?.recent?.length){
      feed+='<div class="feed-section"><div class="feed-title">Recent Repos <a href="https://index.blackroad.io" target="_blank">all &rarr;</a><span class="section-line"></span></div>';
      p.index.recent.forEach((r,i)=>{
        const url=r.source==='gitea'?'https://git.blackroad.io/'+r.full_name:'https://github.com/'+r.full_name;
        feed+='<a href="'+url+'" target="_blank" class="feed-item" style="animation-delay:'+(i*0.04)+'s"><span class="feed-icon">'+(r.source==='gitea'?'<>':'GH')+'</span><span class="feed-name">'+r.full_name+'</span>'+(r.language?'<span class="feed-badge">'+r.language+'</span>':'')+'<span class="feed-meta">'+(r.updated_at||'').split('T')[0]+'</span></a>';
      });
      feed+='</div>';
    }
    if(p.images?.recent?.length){
      feed+='<div class="feed-section"><div class="feed-title">Recent Images <a href="https://images.blackroad.io" target="_blank">gallery &rarr;</a><span class="section-line"></span></div><div class="feed-images">';
      p.images.recent.forEach((img,i)=>{
        const src='https://images.blackroad.io/img/'+img.id+'.'+(img.format||'png');
        feed+='<div class="feed-img" style="animation-delay:'+(i*0.06)+'s" data-src="'+src+'" data-prompt="'+(img.prompt||'').replace(/"/g,'&quot;').slice(0,80)+'"><img src="'+src+'" loading="lazy"></div>';
      });
      feed+='</div></div>';
    }
    $('#feedArea').innerHTML=feed;
    // Lightbox on feed images
    $$('.feed-img[data-src]').forEach(el=>{
      el.addEventListener('click',()=>{openLightbox(el.dataset.src,el.dataset.prompt||'');});
    });
  }).catch(()=>{$('#pulseBar').innerHTML='<div class="pulse-stat"><span class="pl">pulse unavailable</span></div>';});

  // Health
  fetch('/api/health').then(r=>r.json()).then(h=>{
    Object.entries(h).forEach(([n,s])=>{
      const el=$('#health-'+n);
      if(el){el.classList.add(s);el.querySelector('.pulse-dot').className='pulse-dot '+s;}
      const sh=$('#sh-'+n);
      if(sh) sh.classList.add(s);
    });
  }).catch(()=>{});
}

// ── Lightbox with blacklinks ──
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-close'))lb.classList.remove('open');});
// Override lightbox openers to include blacklinks
function openLightbox(src,prompt){
  lbImg.src=src;
  const kws=prompt.split(/[\\s,._-]+/).filter(w=>w.length>2).slice(0,8);
  lbInfo.innerHTML='<div style="margin-bottom:8px">'+prompt.replace(/</g,'&lt;').slice(0,120)+'</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">'
    +'<a href="https://images.blackroad.io/?q='+encodeURIComponent(prompt)+'" target="_blank" class="bl bl-images">gallery</a>'
    +'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(prompt.split(' ')[0]||'')+'" target="_blank" class="bl bl-portal">portal</a>'
    +'<a href="https://index.blackroad.io/?q='+encodeURIComponent(prompt.split(' ')[0]||'')+'" target="_blank" class="bl bl-index">index</a>'
    +'<span class="bl-sep" style="height:12px"></span>'
    +kws.map(w=>'<a class="img-kw" href="/?q='+encodeURIComponent(w)+'" onclick="event.preventDefault();lb.classList.remove(\\'open\\');document.getElementById(\\'q\\').value=\\''+w.replace(/'/g,"\\\\'")+'\\';search(\\''+w.replace(/'/g,"\\\\'")+'\\')">'+w+'</a>').join('')
    +'</div>';
  lb.classList.add('open');
}

// ── Command Palette ──
function openCmd(){cmdOverlay.classList.add('open');cmdInput.value='';cmdIdx=-1;renderCmd('');cmdInput.focus();}
function closeCmd(){cmdOverlay.classList.remove('open');}
function renderCmd(q){
  const filtered=q?SL.filter(s=>s.name.includes(q.toLowerCase())||s.desc.toLowerCase().includes(q.toLowerCase())||s.tags.some(t=>t.includes(q.toLowerCase()))):SL;
  cmdResults.innerHTML=filtered.map((s,i)=>'<a href="'+s.url+'" target="_blank" class="cmd-item'+(i===cmdIdx?' selected':'')+'" data-i="'+i+'"><span class="cmd-item-icon">'+s.icon+'</span><span class="cmd-item-name">'+s.name+'</span><span class="cmd-item-desc">'+s.desc+'</span></a>').join('');
}
cmdInput.addEventListener('input',()=>{cmdIdx=-1;renderCmd(cmdInput.value);});
cmdInput.addEventListener('keydown',e=>{
  const items=cmdResults.querySelectorAll('.cmd-item');
  if(e.key==='ArrowDown'){e.preventDefault();cmdIdx=Math.min(cmdIdx+1,items.length-1);items.forEach((el,i)=>el.classList.toggle('selected',i===cmdIdx));if(items[cmdIdx])items[cmdIdx].scrollIntoView({block:'nearest'});}
  if(e.key==='ArrowUp'){e.preventDefault();cmdIdx=Math.max(cmdIdx-1,0);items.forEach((el,i)=>el.classList.toggle('selected',i===cmdIdx));}
  if(e.key==='Enter'&&items[cmdIdx]){e.preventDefault();window.open(items[cmdIdx].href,'_blank');closeCmd();}
  if(e.key==='Escape'){closeCmd();}
});
cmdOverlay.addEventListener('click',e=>{if(e.target===cmdOverlay)closeCmd();});

// ── Autocomplete ──
function renderAutocomplete(q) {
  if(!q||q.length<1){ac.classList.remove('open');acIdx=-1;return;}
  let items=[];
  // history matches
  const hist=getHistory().filter(h=>h.toLowerCase().includes(q.toLowerCase())&&h!==q).slice(0,3);
  // service matches
  const svcs=SL.filter(s=>s.name.includes(q.toLowerCase())||s.tags.some(t=>t.includes(q.toLowerCase()))).slice(0,4);
  // quick suggestions
  const suggest=['python','javascript','api','agent','docker','ollama','fleet','mesh'].filter(s=>s.includes(q.toLowerCase())&&!hist.includes(s)).slice(0,3);

  let html='';
  if(hist.length){
    html+='<div class="ac-section">recent</div>';
    hist.forEach((h,i)=>{html+='<div class="ac-item" data-type="search" data-val="'+h.replace(/"/g,'&quot;')+'" data-idx="'+items.length+'"><span class="ac-icon">&#8634;</span><span class="ac-text">'+h.replace(/</g,'&lt;')+'</span><span class="ac-remove" data-rm="'+h.replace(/"/g,'&quot;')+'">&times;</span></div>';items.push({type:'search',val:h});});
  }
  if(svcs.length){
    html+='<div class="ac-section">services</div>';
    svcs.forEach(s=>{html+='<div class="ac-item" data-type="service" data-val="'+s.url+'" data-idx="'+items.length+'"><span class="ac-icon">'+s.icon+'</span><span class="ac-text">'+s.name+'</span><span class="ac-hint">'+s.url.replace('https://','')+'</span></div>';items.push({type:'service',val:s.url,name:s.name});});
  }
  if(suggest.length){
    html+='<div class="ac-section">suggestions</div>';
    suggest.forEach(s=>{html+='<div class="ac-item" data-type="search" data-val="'+s+'" data-idx="'+items.length+'"><span class="ac-icon">&#8594;</span><span class="ac-text">'+s+'</span></div>';items.push({type:'search',val:s});});
  }
  if(!html){ac.classList.remove('open');acIdx=-1;return;}
  ac.innerHTML=html;ac.classList.add('open');acIdx=-1;
  ac._items=items;
  ac.querySelectorAll('.ac-item').forEach(el=>{
    el.addEventListener('click',e=>{
      if(e.target.classList.contains('ac-remove')){e.stopPropagation();removeHistory(e.target.dataset.rm);renderAutocomplete(input.value.trim());return;}
      const idx=parseInt(el.dataset.idx);
      const item=ac._items[idx];
      if(item.type==='service'){window.open(item.val,'_blank');ac.classList.remove('open');}
      else{input.value=item.val;ac.classList.remove('open');search(item.val);}
    });
    el.addEventListener('mouseenter',()=>{
      acIdx=parseInt(el.dataset.idx);
      ac.querySelectorAll('.ac-item').forEach((x,i)=>x.classList.toggle('selected',parseInt(x.dataset.idx)===acIdx));
    });
  });
}

// ── Keyboard navigation through results ──
function getResultEls(){return results.querySelectorAll('.code-result, .svc-card, .img-card-wrap');}
function highlightResult(idx){
  const els=getResultEls();
  els.forEach(el=>el.classList.remove('kb-active'));
  if(idx>=0&&idx<els.length){els[idx].classList.add('kb-active');els[idx].scrollIntoView({block:'nearest',behavior:'smooth'});}
}
function openResult(idx){
  const els=getResultEls();
  if(idx<0||idx>=els.length)return;
  const el=els[idx];
  const link=el.querySelector('a[href]')||el.closest('a[href]');
  if(link)window.open(link.href,'_blank');
  else if(el.querySelector('.img-card[data-src]')){const ic=el.querySelector('.img-card');lbImg.src=ic.dataset.src;lbInfo.textContent=ic.dataset.prompt;lb.classList.add('open');}
}

// ── Keyboard ──
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openCmd();return;}
  if(e.key==='Escape'){ac.classList.remove('open');lb.classList.remove('open');if(cmdOverlay.classList.contains('open')){closeCmd();return;}input.blur();input.value='';showHome();return;}
  if(e.key==='/'&&document.activeElement!==input&&!cmdOverlay.classList.contains('open')){e.preventDefault();input.focus();input.select();return;}
  // tab number shortcuts for filters when results showing
  if(lastData&&!cmdOverlay.classList.contains('open')&&document.activeElement!==input){
    const filterMap={'1':'all','2':'services','3':'repos','4':'code','5':'images'};
    if(filterMap[e.key]){
      e.preventDefault();
      $$('.ftab').forEach(t=>t.classList.toggle('active',t.dataset.filter===filterMap[e.key]));
      activeFilter=filterMap[e.key];kbIdx=-1;highlightResult(-1);
      if(lastData) renderResults(lastData);
      toast('Filter: '+filterMap[e.key]);return;
    }
    // j/k to nav results
    if(e.key==='j'){e.preventDefault();kbIdx=Math.min(kbIdx+1,getResultEls().length-1);highlightResult(kbIdx);return;}
    if(e.key==='k'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();kbIdx=Math.max(kbIdx-1,0);highlightResult(kbIdx);return;}
    if(e.key==='o'&&kbIdx>=0){e.preventDefault();openResult(kbIdx);return;}
  }
});

// ── Search events ──
input.addEventListener('input',()=>{
  kbd.style.display='none';
  clearTimeout(timer);
  const q=input.value.trim();
  renderAutocomplete(q);
  timer=setTimeout(()=>search(q),350);
});
input.addEventListener('keydown',e=>{
  // autocomplete nav
  if(ac.classList.contains('open')&&ac._items){
    if(e.key==='ArrowDown'){e.preventDefault();acIdx=Math.min(acIdx+1,ac._items.length-1);ac.querySelectorAll('.ac-item').forEach((x,i)=>x.classList.toggle('selected',parseInt(x.dataset.idx)===acIdx));return;}
    if(e.key==='ArrowUp'){e.preventDefault();acIdx=Math.max(acIdx-1,-1);ac.querySelectorAll('.ac-item').forEach((x,i)=>x.classList.toggle('selected',parseInt(x.dataset.idx)===acIdx));return;}
    if(e.key==='Enter'&&acIdx>=0){e.preventDefault();const item=ac._items[acIdx];if(item.type==='service'){window.open(item.val,'_blank');}else{input.value=item.val;search(item.val);}ac.classList.remove('open');return;}
    if(e.key==='Tab'){e.preventDefault();if(acIdx>=0&&ac._items[acIdx]?.type==='search'){input.value=ac._items[acIdx].val;renderAutocomplete(input.value);}return;}
  }
  if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);ac.classList.remove('open');search(input.value.trim());}
  if(e.key==='Escape'){ac.classList.remove('open');}
});
$('#searchBtn').addEventListener('click',()=>{ac.classList.remove('open');search(input.value.trim());});
input.addEventListener('focus',()=>{kbd.style.display='none';if(input.value.trim())renderAutocomplete(input.value.trim());});
input.addEventListener('blur',()=>{if(!input.value)kbd.style.display='';setTimeout(()=>ac.classList.remove('open'),200);});
$$('.qlink[data-q]').forEach(el=>{el.addEventListener('click',e=>{e.preventDefault();input.value=el.dataset.q;search(el.dataset.q);});});

// ── Sparkline helper ──
function sparkline(data,w=50,h=14){
  if(!data||!data.length)return'';
  const max=Math.max(...data),min=Math.min(...data),range=max-min||1;
  const step=w/(data.length-1);
  let d='M0,'+(h-((data[0]-min)/range)*h);
  for(let i=1;i<data.length;i++) d+=' L'+(i*step)+','+(h-((data[i]-min)/range)*h);
  return '<svg class="sparkline" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><path d="'+d+'" fill="none" stroke="url(#sparkGrad)" stroke-width="1.5"/><defs><linearGradient id="sparkGrad"><stop offset="0%" stop-color="#FF6B2B"/><stop offset="50%" stop-color="#FF2255"/><stop offset="100%" stop-color="#00D4FF"/></linearGradient></defs></svg>';
}

// ── Init ──
const urlQ=new URLSearchParams(location.search).get('q');
if(urlQ){input.value=urlQ;search(urlQ);}else{showHome();renderHistoryChips();}
</script>
</body>
</html>`;
}
