/**
 * BlackRoad Backgrounds Worker
 *
 * Proxies images from a Google Drive folder for use as UI backgrounds/sprites.
 *
 * Endpoints:
 *   GET  /backgrounds           — list available backgrounds from Google Drive folder
 *   GET  /backgrounds/:fileId   — proxy a single image (cached in KV)
 *   GET  /backgrounds/random    — redirect to a random background image
 *   GET  /backgrounds/config    — current background configuration
 *   POST /backgrounds/config    — update active background (requires auth header)
 *   GET  /backgrounds/status    — health check
 *
 * Env vars:
 *   GOOGLE_DRIVE_FOLDER_ID — Google Drive folder containing backgrounds
 *   GOOGLE_API_KEY         — API key with Drive API read-only access
 *
 * KV binding:
 *   BG_CACHE — caches image bytes + folder listing (TTL: 1 hour)
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const CACHE_TTL = 3600 // 1 hour

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

/** Fetch file list from a public Google Drive folder */
async function listDriveFolder(folderId, apiKey) {
  const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`)
  const fields = encodeURIComponent('files(id,name,mimeType,thumbnailLink,imageMediaMetadata,size,createdTime)')
  const url = `${DRIVE_API}/files?q=${query}&fields=${fields}&orderBy=name&pageSize=100&key=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Drive API ${res.status}: ${body}`)
  }
  return res.json()
}

/** Proxy a single image from Google Drive by file ID */
async function proxyImage(fileId, apiKey, env) {
  // Check KV cache first
  const cacheKey = `img:${fileId}`
  const cached = await env.BG_CACHE.getWithMetadata(cacheKey, { type: 'arrayBuffer' })
  if (cached.value) {
    return new Response(cached.value, {
      headers: {
        'Content-Type': cached.metadata?.contentType || 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'HIT',
        ...CORS,
      },
    })
  }

  // Fetch from Drive
  const url = `${DRIVE_API}/files/${fileId}?alt=media&key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) {
    return json({ error: 'Image not found', fileId }, res.status)
  }

  const contentType = res.headers.get('Content-Type') || 'image/png'
  const imageBytes = await res.arrayBuffer()

  // Cache in KV (max 25MB per value in KV)
  if (imageBytes.byteLength < 25 * 1024 * 1024) {
    await env.BG_CACHE.put(cacheKey, imageBytes, {
      expirationTtl: CACHE_TTL,
      metadata: { contentType },
    })
  }

  return new Response(imageBytes, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Cache': 'MISS',
      ...CORS,
    },
  })
}

/** Get the cached folder listing, or fetch fresh */
async function getCachedListing(folderId, apiKey, env) {
  const cacheKey = `listing:${folderId}`
  const cached = await env.BG_CACHE.get(cacheKey, { type: 'json' })
  if (cached) return cached

  const data = await listDriveFolder(folderId, apiKey)
  const listing = (data.files || []).map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    width: f.imageMediaMetadata?.width,
    height: f.imageMediaMetadata?.height,
    size: Number(f.size || 0),
    created: f.createdTime,
    thumbnail: f.thumbnailLink,
    url: `/backgrounds/${f.id}`,
  }))

  await env.BG_CACHE.put(cacheKey, JSON.stringify(listing), {
    expirationTtl: CACHE_TTL,
  })

  return listing
}

/** Get or set the active background config */
async function getConfig(env) {
  const raw = await env.BG_CACHE.get('config:active', { type: 'json' })
  return raw || { mode: 'none', fileId: null, opacity: 0.15, blur: 0, fit: 'cover' }
}

async function setConfig(env, config) {
  await env.BG_CACHE.put('config:active', JSON.stringify(config))
  return config
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '') || '/'
    const segments = path.split('/').filter(Boolean)

    // Health check
    if (path === '/backgrounds/status' || path === '/status') {
      const hasFolderId = !!env.GOOGLE_DRIVE_FOLDER_ID
      const hasApiKey = !!env.GOOGLE_API_KEY
      return json({
        service: 'blackroad-backgrounds',
        status: hasFolderId && hasApiKey ? 'ready' : 'needs-config',
        hasFolderId,
        hasApiKey,
        timestamp: new Date().toISOString(),
      })
    }

    const folderId = env.GOOGLE_DRIVE_FOLDER_ID
    const apiKey = env.GOOGLE_API_KEY

    if (!folderId || !apiKey) {
      return json(
        {
          error: 'Google Drive not configured',
          help: 'Set GOOGLE_DRIVE_FOLDER_ID and GOOGLE_API_KEY via wrangler secret put',
        },
        503
      )
    }

    try {
      // GET /backgrounds — list all backgrounds
      if ((path === '/backgrounds' || path === '/') && request.method === 'GET') {
        const listing = await getCachedListing(folderId, apiKey, env)
        const config = await getConfig(env)
        return json({ backgrounds: listing, active: config, count: listing.length })
      }

      // GET /backgrounds/config — get active config
      if (path === '/backgrounds/config' && request.method === 'GET') {
        const config = await getConfig(env)
        return json(config)
      }

      // POST /backgrounds/config — set active config
      if (path === '/backgrounds/config' && request.method === 'POST') {
        const body = await request.json()
        const current = await getConfig(env)
        const updated = await setConfig(env, {
          mode: body.mode ?? current.mode,
          fileId: body.fileId ?? current.fileId,
          opacity: body.opacity ?? current.opacity,
          blur: body.blur ?? current.blur,
          fit: body.fit ?? current.fit,
        })
        return json(updated)
      }

      // GET /backgrounds/random — redirect to random background
      if (path === '/backgrounds/random') {
        const listing = await getCachedListing(folderId, apiKey, env)
        if (listing.length === 0) return json({ error: 'No backgrounds available' }, 404)
        const pick = listing[Math.floor(Math.random() * listing.length)]
        return Response.redirect(new URL(`/backgrounds/${pick.id}`, url.origin).toString(), 302)
      }

      // GET /backgrounds/:fileId — proxy a single image
      if (segments.length === 2 && segments[0] === 'backgrounds') {
        return proxyImage(segments[1], apiKey, env)
      }

      return json({ error: 'Not found' }, 404)
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  },
}
