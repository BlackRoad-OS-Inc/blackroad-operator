// ── Image Generation Agents ──
// Each agent wraps an external API provider

const AGENTS = {
  openai: {
    name: 'openai',
    models: ['dall-e-3', 'dall-e-2'],
    async generate(prompt, opts, env) {
      const key = env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY not set');
      const model = opts.model || 'dall-e-3';
      const size = opts.size || '1024x1024';
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, prompt, n: 1, size, response_format: 'url' }),
      });
      if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const url = data.data[0].url;
      const revised = data.data[0].revised_prompt || prompt;
      const imgRes = await fetch(url);
      const blob = await imgRes.arrayBuffer();
      const [w, h] = size.split('x').map(Number);
      return { buffer: blob, format: 'png', width: w, height: h, revised_prompt: revised, model };
    },
  },

  replicate: {
    name: 'replicate',
    models: ['flux-1.1-pro', 'flux-schnell', 'sdxl'],
    async generate(prompt, opts, env) {
      const key = env.REPLICATE_API_KEY;
      if (!key) throw new Error('REPLICATE_API_KEY not set');

      const modelMap = {
        'flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',
        'flux-schnell': 'black-forest-labs/flux-schnell',
        'sdxl': 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
      };
      const model = modelMap[opts.model] || modelMap['flux-schnell'];
      const width = opts.width || 1024;
      const height = opts.height || 1024;

      // Create prediction
      const createRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          ...(model.includes(':') ? { version: model.split(':')[1] } : { model }),
          input: {
            prompt,
            ...(opts.negative_prompt ? { negative_prompt: opts.negative_prompt } : {}),
            width, height,
            num_outputs: 1,
          },
        }),
      });
      if (!createRes.ok) throw new Error(`Replicate create: ${createRes.status} ${await createRes.text()}`);
      let prediction = await createRes.json();

      // Poll for completion (max 60s)
      for (let i = 0; i < 30; i++) {
        if (prediction.status === 'succeeded') break;
        if (prediction.status === 'failed' || prediction.status === 'canceled') {
          throw new Error(`Replicate ${prediction.status}: ${prediction.error || 'unknown'}`);
        }
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(prediction.urls.get, {
          headers: { Authorization: `Bearer ${key}` },
        });
        prediction = await pollRes.json();
      }

      if (prediction.status !== 'succeeded') throw new Error('Replicate timeout');

      const output = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      const imgRes = await fetch(output);
      const blob = await imgRes.arrayBuffer();
      const format = output.includes('.webp') ? 'webp' : output.includes('.jpg') ? 'jpg' : 'png';
      return { buffer: blob, format, width, height, model: opts.model || 'flux-schnell' };
    },
  },

  together: {
    name: 'together',
    models: ['flux-1.1-pro', 'flux-schnell', 'sdxl'],
    async generate(prompt, opts, env) {
      const key = env.TOGETHER_API_KEY;
      if (!key) throw new Error('TOGETHER_API_KEY not set');

      const modelMap = {
        'flux-1.1-pro': 'black-forest-labs/FLUX.1.1-pro',
        'flux-schnell': 'black-forest-labs/FLUX.1-schnell-Free',
        'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
      };
      const model = modelMap[opts.model] || modelMap['flux-schnell'];
      const width = opts.width || 1024;
      const height = opts.height || 1024;

      const res = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model, prompt, width, height, n: 1, response_format: 'b64_json',
          ...(opts.negative_prompt ? { negative_prompt: opts.negative_prompt } : {}),
        }),
      });
      if (!res.ok) throw new Error(`Together: ${res.status} ${await res.text()}`);
      const data = await res.json();
      const b64 = data.data[0].b64_json;
      const buffer = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
      return { buffer, format: 'png', width, height, model: opts.model || 'flux-schnell' };
    },
  },

  fal: {
    name: 'fal',
    models: ['flux-pro', 'flux-dev', 'flux-schnell'],
    async generate(prompt, opts, env) {
      const key = env.FAL_API_KEY;
      if (!key) throw new Error('FAL_API_KEY not set');

      const modelMap = {
        'flux-pro': 'fal-ai/flux-pro/v1.1',
        'flux-dev': 'fal-ai/flux/dev',
        'flux-schnell': 'fal-ai/flux/schnell',
      };
      const model = modelMap[opts.model] || modelMap['flux-schnell'];
      const width = opts.width || 1024;
      const height = opts.height || 1024;

      // Submit
      const submitRes = await fetch(`https://queue.fal.run/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Key ${key}` },
        body: JSON.stringify({
          prompt, image_size: { width, height }, num_images: 1,
        }),
      });
      if (!submitRes.ok) throw new Error(`Fal submit: ${submitRes.status} ${await submitRes.text()}`);
      const submit = await submitRes.json();

      // If synchronous response with images
      if (submit.images) {
        const imgRes = await fetch(submit.images[0].url);
        const blob = await imgRes.arrayBuffer();
        return { buffer: blob, format: 'png', width, height, model: opts.model || 'flux-schnell' };
      }

      // Poll
      const requestId = submit.request_id;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
          headers: { Authorization: `Key ${key}` },
        });
        const status = await statusRes.json();
        if (status.status === 'COMPLETED') {
          const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
            headers: { Authorization: `Key ${key}` },
          });
          const result = await resultRes.json();
          const imgRes = await fetch(result.images[0].url);
          const blob = await imgRes.arrayBuffer();
          return { buffer: blob, format: 'png', width, height, model: opts.model || 'flux-schnell' };
        }
        if (status.status === 'FAILED') throw new Error(`Fal failed: ${JSON.stringify(status)}`);
      }
      throw new Error('Fal timeout');
    },
  },
};

// ── Helpers ──
function generateId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' };

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Store image to R2 + D1 ──
async function storeImage(env, buffer, meta) {
  const id = meta.id || generateId();
  const ext = meta.format || 'png';
  const key = meta.r2_key_override || `${id}.${ext}`;

  await env.IMAGES.put(key, buffer, {
    httpMetadata: { contentType: MIME[ext] || 'image/png' },
    customMetadata: {
      prompt: (meta.prompt || '').slice(0, 500),
      provider: meta.provider || '',
      model: meta.model || '',
      source_node: meta.source_node || '',
    },
  });

  await env.DB.prepare(`
    INSERT INTO images (id, filename, prompt, negative_prompt, provider, model, width, height, size, format, tags, metadata, source_node, source_agent, r2_key, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      prompt=excluded.prompt, tags=excluded.tags, metadata=excluded.metadata
  `).bind(
    id, meta.filename || key, meta.prompt || '', meta.negative_prompt || '',
    meta.provider || '', meta.model || '',
    meta.width || 0, meta.height || 0, buffer.byteLength, ext,
    JSON.stringify(meta.tags || []), JSON.stringify(meta.extra || {}),
    meta.source_node || '', meta.source_agent || '', key,
    new Date().toISOString(),
  ).run();

  return { id, key, size: buffer.byteLength };
}

// ── Search ──
async function searchImages(db, query, opts = {}) {
  const { provider = '', model = '', page = 1, limit = 24 } = opts;
  const offset = (page - 1) * limit;

  if (!query || query === '*') {
    let sql = 'SELECT * FROM images WHERE 1=1';
    const params = [];
    if (provider) { sql += ' AND provider = ?'; params.push(provider); }
    if (model) { sql += ' AND model = ?'; params.push(model); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const res = await db.prepare(sql).bind(...params).all();
    return res.results || [];
  }

  const ftsQuery = query.replace(/[^\w\s\-_.]/g, '').split(/\s+/).filter(Boolean).map((w) => `"${w}"`).join(' OR ');
  if (!ftsQuery) return [];

  let sql = `
    SELECT i.* FROM images_fts
    JOIN images i ON i.rowid = images_fts.rowid
    WHERE images_fts MATCH ?
  `;
  const params = [ftsQuery];
  if (provider) { sql += ' AND i.provider = ?'; params.push(provider); }
  if (model) { sql += ' AND i.model = ?'; params.push(model); }
  sql += ' ORDER BY images_fts.rank LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const res = await db.prepare(sql).bind(...params).all();
  return res.results || [];
}

// ── Stats ──
async function getStats(db) {
  const total = await db.prepare('SELECT COUNT(*) as c, SUM(size) as s FROM images').first();
  const byProvider = await db.prepare('SELECT provider, COUNT(*) as c FROM images WHERE provider != "" GROUP BY provider ORDER BY c DESC').all();
  const byModel = await db.prepare('SELECT model, COUNT(*) as c FROM images WHERE model != "" GROUP BY model ORDER BY c DESC').all();
  const byNode = await db.prepare('SELECT source_node, COUNT(*) as c FROM images WHERE source_node != "" GROUP BY source_node ORDER BY c DESC').all();
  const recent = await db.prepare('SELECT id, filename, prompt, provider, model, width, height, format, created_at FROM images ORDER BY created_at DESC LIMIT 12').all();

  // Available agents
  const agents = Object.entries(AGENTS).map(([k, v]) => ({
    name: k, models: v.models,
  }));

  return {
    total_images: total?.c || 0,
    total_size: total?.s || 0,
    total_size_mb: ((total?.s || 0) / 1048576).toFixed(1),
    by_provider: byProvider?.results || [],
    by_model: byModel?.results || [],
    by_node: byNode?.results || [],
    recent: recent?.results || [],
    agents,
  };
}

// ── Gallery HTML ──
function renderGallery(stats, images = null, query = '') {
  const agentsHTML = stats.agents.map((a) => `
    <div class="agent-card">
      <div class="agent-name">${a.name}</div>
      <div class="agent-models">${a.models.join(' / ')}</div>
    </div>
  `).join('');

  const imageGrid = (images || stats.recent || []).map((img) => `
    <a href="/img/${img.id}.${img.format || 'png'}" target="_blank" class="image-card" data-provider="${escapeHtml(img.provider || '')}" data-prompt="${escapeHtml((img.prompt || '').slice(0, 120))}">
      <img src="/img/${img.id}.${img.format || 'png'}" alt="${escapeHtml(img.prompt)}" loading="lazy">
      <div class="image-meta">
        <span class="image-prompt">${escapeHtml((img.prompt || '').slice(0, 80))}</span>
        <div class="image-tags">
          ${img.provider ? `<span class="provider-tag">${escapeHtml(img.provider)}</span>` : ''}
          ${img.model ? `<span class="model-tag">${escapeHtml(img.model)}</span>` : ''}
          ${img.width ? `<span class="size-tag">${img.width}x${img.height}</span>` : ''}
        </div>
      </div>
      <div class="blacklinks" style="padding:4px 8px 6px;border:none">
        <a href="https://portal.blackroad.io/?q=${encodeURIComponent((img.prompt || '').split(' ')[0] || '')}" target="_blank" class="bl bl-portal" style="font-size:0.5rem;padding:1px 5px" onclick="event.stopPropagation()">portal</a>
        <a href="https://index.blackroad.io/?q=${encodeURIComponent((img.prompt || '').split(' ')[0] || '')}" target="_blank" class="bl bl-index" style="font-size:0.5rem;padding:1px 5px" onclick="event.stopPropagation()">index</a>
      </div>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>images.blackroad.io</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --grad: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; color: #fff; font-family: 'Space Grotesk', -apple-system, sans-serif; min-height: 100vh; }
  .container { max-width: 1200px; margin: 0 auto; padding: 20px; }

  .header { text-align: center; padding: 36px 0 16px; }
  .header h1 {
    font-family: 'Space Grotesk'; font-size: 2.4rem; font-weight: 700;
    color: #f5f5f5;
  }
  @keyframes gradShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  .tagline { font-family: 'Space Grotesk'; font-size: 0.9rem; color:rgba(255,255,255,0.5); margin: 4px 0; }
  .pulse { display: inline-block; width: 6px; height: 6px; background: #00D4FF; border-radius: 50%; animation: pulse 2s ease infinite; margin-right: 4px; vertical-align: middle; }
  @keyframes pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,255,0.4); } 50% { opacity: 0.6; box-shadow: 0 0 0 8px rgba(0,212,255,0); } }

  .stats-bar {
    display: flex; gap: 24px; justify-content: center; padding: 12px 0;
    color:rgba(255,255,255,0.4); font-size: 0.78rem; border-bottom: 1px solid #222; margin-bottom: 16px;
    font-family: 'JetBrains Mono';
  }
  .stat-num { color: #fff; font-weight: 600; }

  .agents-row { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; justify-content: center; }
  .agent-card {
    border: 1px solid #1a1a1a; border-radius: 10px; padding: 10px 16px;
    background: #0a0a0a; text-align: center; min-width: 130px;
    transition: all 0.25s; cursor: default; position: relative; overflow: hidden;
  }
  .agent-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
    background: var(--grad); opacity: 0; transition: opacity 0.3s;
  }
  .agent-card:hover { border-color:rgba(255,255,255,0.3); transform: translateY(-2px); }
  .agent-card:hover::after { opacity: 1; }
  .agent-name { font-family: 'JetBrains Mono'; color: #fff; font-size: 0.85rem; font-weight: 600; }
  .agent-models { font-size: 0.63rem; color:rgba(255,255,255,0.35); margin-top: 3px; }
  .agent-status { width: 5px; height: 5px; background: #00D4FF; border-radius: 50%; display: inline-block; margin-right: 4px; }

  /* ── Generate Form ── */
  .gen-form {
    border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 16px 0;
    background: #060606; transition: border-color 0.3s;
  }
  .gen-form:focus-within { border-color: #FF225544; }
  .gen-form h3 {
    font-family: 'Space Grotesk'; color:rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .gen-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  .gen-row input, .gen-row select {
    flex: 1; min-width: 120px; padding: 12px 14px; background: #111; color: #fff;
    border: 1px solid #1a1a1a; border-radius: 8px; font-size: 0.85rem;
    font-family: 'JetBrains Mono'; transition: border-color 0.2s; outline: none;
  }
  .gen-row input:focus { border-color: #FF2255; }
  .gen-row input[name="prompt"] { flex: 3; }
  .btn {
    padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer;
    font-weight: 600; font-size: 0.85rem; color: #fff; font-family: 'Space Grotesk';
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.2s; }
  .btn:hover::after { opacity: 1; }
  .btn:active { transform: scale(0.97); }
  .btn-generate { background: var(--grad); background-size: 200% 100%; animation: gradShift 4s ease infinite; }
  .btn-search { background: linear-gradient(90deg, #8844FF, #4488FF); }
  .btn:disabled { opacity: 0.5; cursor: wait; }
  .gen-progress { display: none; margin-top: 10px; }
  .gen-progress.active { display: block; }
  .gen-progress .bar { height: 3px; background: var(--grad); border-radius: 3px; animation: loadBar 2s ease infinite; background-size: 200% 100%; }
  @keyframes loadBar { 0% { width: 0; } 50% { width: 80%; } 100% { width: 100%; opacity: 0.5; } }
  .gen-status { text-align: center; color:rgba(255,255,255,0.35); font-size: 0.75rem; font-family: 'JetBrains Mono'; margin-top: 6px; }

  /* ── Search ── */
  .search-wrap { display: flex; gap: 10px; margin: 16px 0; }
  .search-wrap input {
    flex: 1; padding: 12px 16px; background: #0a0a0a; color: #fff;
    border: 1px solid #1a1a1a; border-radius: 8px; font-size: 0.9rem;
    font-family: 'JetBrains Mono'; outline: none; transition: border-color 0.2s;
  }
  .search-wrap input:focus { border-color: #8844FF; box-shadow: 0 0 15px rgba(136,68,255,0.1); }

  /* ── Upload ── */
  .upload-zone {
    border: 2px dashed #1a1a1a; border-radius: 12px; padding: 32px; text-align: center;
    color:rgba(255,255,255,0.3); cursor: pointer; margin: 16px 0; transition: all 0.3s; position: relative;
  }
  .upload-zone:hover { border-color: #FF2255; color:rgba(255,255,255,0.5); background: #FF225508; }
  .upload-zone.dragover { border-color: #00D4FF; background: #00D4FF08; color:rgba(255,255,255,0.7); transform: scale(1.01); }
  .upload-zone input { display: none; }
  .upload-zone .icon { font-size: 1.5rem; margin-bottom: 6px; opacity: 0.4; }
  .upload-progress { display: none; margin-top: 8px; }
  .upload-progress.active { display: block; }

  /* ── Grid ── */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; margin: 20px 0; }
  .image-card {
    border: 1px solid #1a1a1a; border-radius: 10px; overflow: hidden;
    background: #0a0a0a; text-decoration: none; transition: all 0.3s; cursor: pointer;
    animation: fadeIn 0.4s ease both;
  }
  .image-card:hover { border-color: #FF2255; transform: translateY(-4px); box-shadow: 0 8px 30px rgba(255,34,85,0.1); }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .image-card img {
    width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #111;
    transition: transform 0.4s;
  }
  .image-card:hover img { transform: scale(1.03); }
  .image-meta { padding: 12px; }
  .image-prompt { font-size: 0.73rem; color:rgba(255,255,255,0.5); display: block; line-height: 1.4; margin-bottom: 6px; }
  .image-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .provider-tag, .model-tag, .size-tag {
    padding: 3px 8px; border-radius: 5px; font-size: 0.63rem; font-family: 'JetBrains Mono';
  }
  .provider-tag { border: 1px solid #609926; color: #7bc43c; }
  .model-tag { border: 1px solid #8844FF; color:rgba(255,255,255,0.6); }
  .size-tag { border: 1px solid #1a1a1a; color:rgba(255,255,255,0.4); }

  /* ── Lightbox ── */
  .lightbox {
    position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000;
    display: none; align-items: center; justify-content: center; cursor: pointer;
    animation: lbIn 0.2s ease;
  }
  .lightbox.open { display: flex; }
  @keyframes lbIn { from { opacity: 0; } to { opacity: 1; } }
  .lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 0 60px rgba(0,0,0,0.8); }
  .lightbox .lb-info {
    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #111; border: 1px solid #333; border-radius: 10px; padding: 12px 20px;
    font-size: 0.8rem; color:rgba(255,255,255,0.6); max-width: 600px; text-align: center;
    font-family: 'JetBrains Mono';
  }
  .lightbox .lb-close {
    position: absolute; top: 20px; right: 24px; color:rgba(255,255,255,0.35); font-size: 1.5rem;
    cursor: pointer; transition: color 0.2s; background: none; border: none;
  }
  .lightbox .lb-close:hover { color: #fff; }

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
    color:rgba(255,255,255,0.35); text-decoration: none; transition: all 0.2s; border: 1px solid transparent;
  }
  .topnav-links a:hover { color: #fff; border-color: #333; background: #111; }
  .topnav-links a.active { color: #fff; border-color: #FF225533; background: #FF225508; }
  .topnav-sep { width: 1px; height: 14px; background: #222; margin: 0 4px; }

  /* ── Blacklinks ── */
  .blacklinks {
    display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; align-items: center;
  }
  .blacklinks-label {
    font-family: 'JetBrains Mono'; font-size: 0.55rem; color: #222; text-transform: uppercase; letter-spacing: 1px; margin-right: 2px;
  }
  .bl {
    font-family: 'JetBrains Mono'; font-size: 0.6rem; color:rgba(255,255,255,0.3); text-decoration: none;
    padding: 2px 8px; border: 1px solid #1a1a1a; border-radius: 4px; transition: all 0.2s;
  }
  .bl:hover { color: #fff; border-color: #4488FF33; background: #4488FF08; }
  .bl-portal { border-color: #FF225518 !important; color:rgba(255,255,255,0.7) !important; }
  .bl-portal:hover { background: #FF225508 !important; border-color: #FF225533 !important; }
  .bl-index { border-color: #4488FF18 !important; color:rgba(255,255,255,0.7) !important; }
  .bl-index:hover { background: #4488FF08 !important; border-color: #4488FF33 !important; }
  .bl-images { border-color: #CC00AA18 !important; color:rgba(255,255,255,0.7) !important; }
  .bl-images:hover { background: #CC00AA08 !important; border-color: #CC00AA33 !important; }
  .bl-git { border-color: #7bc43c18 !important; color: #7bc43c !important; }
  .bl-git:hover { background: #7bc43c08 !important; border-color: #7bc43c33 !important; }
  .bl-kw { border-color: #8844FF18 !important; color:rgba(255,255,255,0.6) !important; font-size: 0.55rem !important; }
  .bl-kw:hover { background: #8844FF08 !important; border-color: #8844FF33 !important; }
  .bl-sep { display: inline-block; width: 1px; height: 10px; background: #1a1a1a; }

  .empty { text-align: center; padding: 60px 20px; }
  .empty h2 { font-family: 'Space Grotesk'; color: #333; margin-bottom: 8px; }
  .empty p { color: #333; font-size: 0.85rem; }

  .api-toggle {
    background: none; border: 1px solid #1a1a1a; color:rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 8px;
    font-size: 0.72rem; cursor: pointer; font-family: 'JetBrains Mono'; transition: all 0.2s;
    display: block; margin: 24px auto 0;
  }
  .api-toggle:hover { border-color:rgba(255,255,255,0.3); color:rgba(255,255,255,0.5); }
  .api-panel { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; margin-top: 8px; }
  .api-panel.open { max-height: 250px; }
  .api-panel-inner { padding: 16px; color:rgba(255,255,255,0.3); font-size: 0.72rem; border: 1px solid #1a1a1a; border-radius: 8px; }
  .api-panel code { background: #111; padding: 3px 8px; border-radius: 4px; color: #777; font-family: 'JetBrains Mono'; }

  .footer {
    text-align: center; margin-top: 36px; padding: 24px 0; border-top: 1px solid #1a1a1a;
    font-family: 'Space Grotesk'; line-height: 1.9;
  }
  .footer .l1 { font-size: 0.82rem; color:rgba(255,255,255,0.3); }
  .footer .l2 { font-size: 0.65rem; color: #333; letter-spacing: 2px; text-transform: uppercase; }

  @media (max-width: 600px) { .header h1 { font-size: 1.7rem; } .grid { grid-template-columns: 1fr 1fr; gap: 10px; } }
</style>
</head>
<body>
<nav class="topnav">
  <a href="https://portal.blackroad.io" class="topnav-brand"><span>BlackRoad</span></a>
  <div class="topnav-links">
    <a href="https://portal.blackroad.io">portal</a>
    <div class="topnav-sep"></div>
    <a href="https://index.blackroad.io">index</a>
    <a href="/" class="active">images</a>
    <div class="topnav-sep"></div>
    <a href="https://git.blackroad.io">git</a>
    <a href="https://chat.blackroad.io">chat</a>
    <a href="https://docs.blackroad.io">docs</a>
    <a href="https://api.blackroad.io">api</a>
  </div>
</nav>
<div class="container">
  <div class="header">
    <h1>images.blackroad.io</h1>
    <div class="tagline">Ride the BlackRoad.</div>
  </div>

  <div class="stats-bar">
    <span><span class="stat-num">${stats.total_images}</span> images</span>
    <span><span class="stat-num">${stats.total_size_mb}</span> MB</span>
    <span><span class="stat-num">${stats.by_provider.length}</span> providers</span>
    <span><span class="pulse"></span><span class="stat-num">${stats.agents.length}</span> agents</span>
  </div>

  <div class="agents-row">${agentsHTML}</div>

  <div class="gen-form">
    <h3>Generate</h3>
    <form id="genForm">
      <div class="gen-row">
        <input type="text" name="prompt" placeholder="Describe the image..." required autocomplete="off">
        <select name="provider">
          <option value="together">Together (free)</option>
          <option value="fal">Fal</option>
          <option value="replicate">Replicate</option>
          <option value="openai">OpenAI</option>
        </select>
        <select name="model">
          <option value="flux-schnell">Flux Schnell</option>
          <option value="flux-1.1-pro">Flux 1.1 Pro</option>
          <option value="sdxl">SDXL</option>
          <option value="dall-e-3">DALL-E 3</option>
        </select>
        <button type="submit" class="btn btn-generate" id="genBtn">Generate</button>
      </div>
      <div class="gen-row">
        <input type="text" name="negative_prompt" placeholder="Negative prompt (optional)">
        <select name="size">
          <option value="1024x1024">1024x1024</option>
          <option value="1024x768">1024x768</option>
          <option value="768x1024">768x1024</option>
          <option value="1280x720">1280x720</option>
          <option value="512x512">512x512</option>
        </select>
      </div>
    </form>
    <div class="gen-progress" id="genProgress"><div class="bar"></div></div>
    <div class="gen-status" id="genStatus"></div>
  </div>

  <div class="search-wrap">
    <input type="text" id="searchInput" value="${escapeHtml(query)}" placeholder="Search images..." autocomplete="off">
    <button class="btn btn-search" id="searchBtn">Search</button>
  </div>

  <div class="upload-zone" id="uploadZone">
    <input type="file" id="fileInput" accept="image/*" multiple>
    <div class="icon">+</div>
    Drop images here or click to upload
    <div class="upload-progress" id="uploadProgress"><div class="bar" style="height:2px;background:var(--grad);border-radius:2px;animation:loadBar 1s ease infinite;"></div></div>
  </div>

  <div class="grid" id="gallery">
    ${imageGrid}
  </div>

  ${!(images || stats.recent || []).length ? '<div class="empty"><h2>No images yet</h2><p>Generate one above or upload from your fleet</p></div>' : ''}

  <button class="api-toggle" id="apiToggle">API Reference</button>
  <div class="api-panel" id="apiPanel">
    <div class="api-panel-inner">
      <code>POST /api/generate</code> {prompt, provider, model, size}<br><br>
      <code>POST /api/upload</code> multipart (file + prompt + source_node)<br><br>
      <code>PUT /name.png</code> binary upload to clean path<br><br>
      <code>GET /api/search?q=query</code> &middot; <code>GET /api/stats</code> &middot; <code>GET /api/agents</code>
    </div>
  </div>

  <div class="footer">
    <div class="l1">Remember the Road. Pave Tomorrow.</div>
    <div class="l2">The Prompt Legend of All Time</div>
    <div class="blacklinks" style="justify-content:center;border:none;padding:0;margin-top:12px">
      <a href="https://portal.blackroad.io" class="bl bl-portal">portal</a>
      <a href="https://index.blackroad.io" class="bl bl-index">index</a>
      <a href="https://git.blackroad.io" class="bl bl-git">git</a>
      <a href="https://chat.blackroad.io" class="bl">chat</a>
      <a href="https://docs.blackroad.io" class="bl">docs</a>
      <a href="https://github.com/blackboxprogramming" class="bl">github</a>
    </div>
    <div class="blacklinks" style="justify-content:center;border:none;padding:0;margin-top:6px">
      <a href="https://fleet.blackroad.io" class="bl" style="color:#333;border-color:#111">fleet</a>
      <a href="https://mesh.blackroad.io" class="bl" style="color:#333;border-color:#111">mesh</a>
      <a href="https://mcp.blackroad.io" class="bl" style="color:#333;border-color:#111">mcp</a>
      <a href="https://brand.blackroad.io" class="bl" style="color:#333;border-color:#111">brand</a>
      <a href="https://os.blackroad.io" class="bl" style="color:#333;border-color:#111">os</a>
    </div>
  </div>
</div>

<!-- Lightbox -->
<div class="lightbox" id="lightbox">
  <button class="lb-close">&times;</button>
  <img id="lbImg" src="" alt="">
  <div class="lb-info" id="lbInfo"></div>
</div>

<script>
const $=s=>document.querySelector(s);

// ── Lightbox with blacklinks ──
const lb=$('#lightbox'), lbImg=$('#lbImg'), lbInfo=$('#lbInfo');
function kwSplit(text){return (text||'').split(/[\\s,._-]+/).filter(w=>w.length>2&&!['the','and','for','with','that','this','from'].includes(w.toLowerCase())).slice(0,8);}
document.querySelectorAll('.image-card').forEach(card=>{
  card.addEventListener('click',e=>{
    e.preventDefault();
    lbImg.src=card.querySelector('img').src;
    const prompt=card.querySelector('.image-prompt')?.textContent||'';
    const kws=kwSplit(prompt);
    const provider=card.dataset.provider||'';
    lbInfo.innerHTML='<div style="margin-bottom:8px">'+prompt+'</div>'
      +'<div class="blacklinks" style="justify-content:center;border:none;padding:0">'
      +'<span class="blacklinks-label">blacklinks</span>'
      +'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(prompt)+'" target="_blank" class="bl bl-portal">portal</a>'
      +'<a href="https://index.blackroad.io/?q='+encodeURIComponent(prompt.split(' ')[0]||'')+'" target="_blank" class="bl bl-index">index/'+prompt.split(' ')[0]+'</a>'
      +'<a href="/?q='+encodeURIComponent(prompt)+'" class="bl bl-images">similar</a>'
      +(provider?'<a href="/?q='+encodeURIComponent(provider)+'" class="bl">'+provider+'</a>':'')
      +'</div>'
      +(kws.length?'<div class="blacklinks" style="justify-content:center;border:none;padding:0;margin-top:4px">'+kws.map(w=>'<a href="/?q='+encodeURIComponent(w)+'" class="bl bl-kw">'+w+'</a>').join('')
      +'<span class="bl-sep"></span>'
      +kws.slice(0,3).map(w=>'<a href="https://portal.blackroad.io/?q='+encodeURIComponent(w)+'" target="_blank" class="bl bl-kw" style="color:rgba(255,255,255,0.7) !important;border-color:#FF225518 !important">'+w+' @portal</a>').join('')
      +'</div>':'');
    lb.classList.add('open');
  });
});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lb-close'))lb.classList.remove('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open');});

// ── Upload with drag & drop ──
const zone=$('#uploadZone'), fileInput=$('#fileInput'), uploadProg=$('#uploadProgress');
zone.addEventListener('click',()=>fileInput.click());
zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragover');});
zone.addEventListener('dragleave',()=>zone.classList.remove('dragover'));
zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragover');handleUpload(e.dataTransfer.files);});
fileInput.addEventListener('change',()=>handleUpload(fileInput.files));

async function handleUpload(files){
  uploadProg.classList.add('active');
  zone.querySelector('.icon').textContent='...';
  let count=0;
  for(const file of files){
    const form=new FormData();
    form.append('file',file);
    form.append('filename',file.name);
    form.append('source_node','browser');
    try{
      const res=await fetch('/api/upload',{method:'POST',body:form});
      const data=await res.json();
      if(data.ok){
        count++;
        // Add to grid without reload
        const ext=file.name.split('.').pop();
        const card=document.createElement('a');
        card.href='/img/'+data.id+'.'+ext;
        card.className='image-card';
        card.innerHTML='<img src="'+data.url+'" loading="lazy"><div class="image-meta"><span class="image-prompt">'+file.name+'</span><div class="image-tags"><span class="provider-tag">upload</span><span class="size-tag">'+(data.size/1024).toFixed(0)+'KB</span></div></div>';
        card.addEventListener('click',e=>{e.preventDefault();lbImg.src=data.url;lbInfo.textContent=file.name;lb.classList.add('open');});
        $('#gallery').prepend(card);
      }
    }catch(err){console.error(err);}
  }
  uploadProg.classList.remove('active');
  zone.querySelector('.icon').textContent=count?count+' uploaded':'+';
  setTimeout(()=>{zone.querySelector('.icon').textContent='+';},2000);
}

// ── Generate ──
$('#genForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=$('#genBtn'), prog=$('#genProgress'), stat=$('#genStatus');
  const form=new FormData(e.target);
  const body=Object.fromEntries(form);
  btn.disabled=true; btn.textContent='Generating...';
  prog.classList.add('active');
  stat.textContent='Sending to '+body.provider+'...';
  try{
    const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.ok){
      stat.textContent='Done! '+(data.size/1024).toFixed(0)+'KB';
      const card=document.createElement('a');
      card.href=data.url;
      card.className='image-card';
      card.innerHTML='<img src="'+data.url+'" loading="lazy"><div class="image-meta"><span class="image-prompt">'+body.prompt.slice(0,80)+'</span><div class="image-tags"><span class="provider-tag">'+data.provider+'</span><span class="model-tag">'+data.model+'</span></div></div>';
      card.addEventListener('click',ev=>{ev.preventDefault();lbImg.src=data.url;lbInfo.textContent=body.prompt;lb.classList.add('open');});
      $('#gallery').prepend(card);
    } else {
      stat.textContent='Error: '+(data.error||'unknown');
    }
  }catch(err){stat.textContent='Error: '+err.message;}
  finally{btn.disabled=false;btn.textContent='Generate';prog.classList.remove('active');}
});

// ── Live Search ──
let searchTimer;
$('#searchInput').addEventListener('input',e=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{
    const q=e.target.value.trim();
    if(q.length<2){return;}
    fetch('/api/search?q='+encodeURIComponent(q)).then(r=>r.json()).then(data=>{
      const gallery=$('#gallery');
      gallery.innerHTML='';
      (data.results||[]).forEach((img,i)=>{
        const card=document.createElement('a');
        card.href='/img/'+img.id+'.'+(img.format||'png');
        card.className='image-card';
        card.style.animationDelay=(i*0.05)+'s';
        card.innerHTML='<img src="/img/'+img.id+'.'+(img.format||'png')+'" loading="lazy"><div class="image-meta"><span class="image-prompt">'+(img.prompt||'').slice(0,80)+'</span><div class="image-tags">'+(img.provider?'<span class="provider-tag">'+img.provider+'</span>':'')+(img.model?'<span class="model-tag">'+img.model+'</span>':'')+'</div></div>';
        card.addEventListener('click',ev=>{ev.preventDefault();lbImg.src=card.querySelector('img').src;lbInfo.textContent=img.prompt||'';lb.classList.add('open');});
        gallery.appendChild(card);
      });
      if(!data.results?.length) gallery.innerHTML='<div class="empty"><h2>No results</h2></div>';
    });
  },300);
});
$('#searchBtn').addEventListener('click',()=>{$('#searchInput').dispatchEvent(new Event('input'));});

// ── API toggle ──
$('#apiToggle').addEventListener('click',()=>$('#apiPanel').classList.toggle('open'));

// ── Keyboard shortcuts ──
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('#searchInput').focus();}
  if(e.key==='g'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();$('input[name="prompt"]').focus();}
});
</script>
</body>
</html>`;
}

// ── Request Handler ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
      // ── Clean path image routes ──
      // PUT /image.png → upload, GET /image.png → serve
      if (path.match(/^\/[^\/]+\.(png|jpg|jpeg|webp|gif|svg)$/i) || path.startsWith('/img/') || path.startsWith('/pixel-art/') || path.startsWith('/brand/') || path.startsWith('/worlds/') || path.startsWith('/hq/') || path.startsWith('/mesh/') || path.startsWith('/metrocity/') || path.startsWith('/maps/') || path.startsWith('/city/') || path.startsWith('/pixel-city/') || path.startsWith('/characters/')) {

        // PUT: Upload to a specific clean path
        if (request.method === 'PUT') {
        const filename = path.slice(1);
        const ext = filename.split('.').pop().toLowerCase();
        const buffer = await request.arrayBuffer();
        const id = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

        // Store with the clean filename as the R2 key
        await env.IMAGES.put(filename, buffer, {
          httpMetadata: { contentType: MIME[ext] || 'image/png' },
          customMetadata: {
            prompt: request.headers.get('x-prompt') || '',
            provider: request.headers.get('x-provider') || 'upload',
            source_node: request.headers.get('x-source-node') || '',
          },
        });

        await env.DB.prepare(`
          INSERT INTO images (id, filename, prompt, provider, model, format, size, r2_key, source_node, source_agent, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET size=excluded.size, r2_key=excluded.r2_key
        `).bind(
          id, filename,
          request.headers.get('x-prompt') || '',
          request.headers.get('x-provider') || 'upload',
          request.headers.get('x-model') || '',
          ext, buffer.byteLength, filename,
          request.headers.get('x-source-node') || '',
          request.headers.get('x-source-agent') || '',
          new Date().toISOString(),
        ).run();

        return Response.json({ ok: true, url: `/${filename}`, size: buffer.byteLength }, { headers: cors });
        }

        // GET: Serve image
        const key = path.startsWith('/img/') ? path.slice(5) : path.slice(1);
        let obj = await env.IMAGES.get(key);
        if (!obj) {
          const row = await env.DB.prepare('SELECT r2_key FROM images WHERE filename = ? OR id = ? LIMIT 1')
            .bind(key, key.replace(/\.[^.]+$/, '')).first();
          if (row) obj = await env.IMAGES.get(row.r2_key);
        }
        if (!obj) return new Response('Not found', { status: 404 });
        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(obj.body, { headers });
      }

      // ── API: Generate image ──
      if (path === '/api/generate' && request.method === 'POST') {
        const body = await request.json();
        const { prompt, provider = 'together', model, negative_prompt, size = '1024x1024' } = body;
        if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400, headers: cors });

        const agent = AGENTS[provider];
        if (!agent) return Response.json({ error: `Unknown provider: ${provider}. Available: ${Object.keys(AGENTS).join(', ')}` }, { status: 400, headers: cors });

        const [w, h] = size.split('x').map(Number);
        const result = await agent.generate(prompt, {
          model: model || agent.models[0],
          width: w, height: h, negative_prompt,
        }, env);

        const stored = await storeImage(env, result.buffer, {
          prompt, negative_prompt,
          provider, model: result.model,
          width: result.width, height: result.height,
          format: result.format,
          source_node: body.source_node || 'api',
          source_agent: provider,
          tags: body.tags || [],
        });

        return Response.json({
          ok: true, id: stored.id,
          url: `/img/${stored.key}`,
          size: stored.size,
          provider, model: result.model,
          revised_prompt: result.revised_prompt,
        }, { headers: cors });
      }

      // ── API: Upload image ──
      if (path === '/api/upload' && request.method === 'POST') {
        const contentType = request.headers.get('content-type') || '';

        let buffer, meta = {};
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file) return Response.json({ error: 'No file' }, { status: 400, headers: cors });
          buffer = await file.arrayBuffer();
          const ext = (file.name || 'upload.png').split('.').pop().toLowerCase();
          meta = {
            filename: formData.get('filename') || file.name,
            prompt: formData.get('prompt') || '',
            provider: formData.get('provider') || 'upload',
            model: formData.get('model') || '',
            source_node: formData.get('source_node') || '',
            source_agent: formData.get('source_agent') || '',
            format: ext,
            tags: formData.get('tags') ? JSON.parse(formData.get('tags')) : [],
          };
        } else {
          // Raw binary upload with headers for metadata
          buffer = await request.arrayBuffer();
          meta = {
            filename: request.headers.get('x-filename') || 'upload.png',
            prompt: request.headers.get('x-prompt') || '',
            provider: request.headers.get('x-provider') || 'upload',
            model: request.headers.get('x-model') || '',
            source_node: request.headers.get('x-source-node') || '',
            source_agent: request.headers.get('x-source-agent') || '',
            format: (request.headers.get('x-filename') || 'upload.png').split('.').pop(),
            tags: [],
          };
        }

        // If a custom path/name is specified, use it as the R2 key for clean URLs
        const customPath = (contentType.includes('multipart') ? formData.get('path') : request.headers.get('x-path')) || '';
        if (customPath) {
          meta.id = customPath.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
          meta.filename = customPath;
        }

        const stored = await storeImage(env, buffer, {
          ...meta,
          ...(customPath ? { r2_key_override: customPath } : {}),
        });
        const url = customPath ? `/${customPath}` : `/img/${stored.key}`;
        return Response.json({ ok: true, id: stored.id, url, size: stored.size }, { headers: cors });
      }

      // ── API: Search ──
      if (path === '/api/search') {
        const q = url.searchParams.get('q') || '*';
        const provider = url.searchParams.get('provider') || '';
        const model = url.searchParams.get('model') || '';
        const page = parseInt(url.searchParams.get('page') || '1');
        const results = await searchImages(env.DB, q, { provider, model, page });
        return Response.json({ results, query: q }, { headers: cors });
      }

      // ── API: Health ──
      if (path === '/api/health') {
        return Response.json({ status: 'up', service: 'images-blackroad', version: '1.0.0' }, { headers: cors });
      }

      // ── API: Stats ──
      if (path === '/api/stats') {
        const stats = await getStats(env.DB);
        return Response.json(stats, { headers: cors });
      }

      // ── API: Available agents ──
      if (path === '/api/agents') {
        const agents = Object.entries(AGENTS).map(([k, v]) => ({
          name: k, models: v.models,
          status: 'online',
        }));
        return Response.json({ agents }, { headers: cors });
      }

      // ── Gallery UI ──
      if (path === '/' || path === '') {
        const stats = await getStats(env.DB);
        const q = url.searchParams.get('q') || '';
        let images = null;
        if (q) {
          const provider = url.searchParams.get('provider') || '';
          const model = url.searchParams.get('model') || '';
          images = await searchImages(env.DB, q, { provider, model });
        }
        return new Response(renderGallery(stats, images, q), {
          headers: { 'Content-Type': 'text/html;charset=utf-8', ...cors },
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return Response.json({ error: err.message, stack: err.stack }, { status: 500, headers: cors });
    }
  },
};
