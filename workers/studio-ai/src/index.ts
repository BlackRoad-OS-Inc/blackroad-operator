// BlackRoad Studio AI v2.0.0
// Image generation, TTS, chat, code gen, translate, gallery

interface Env {
  AI: Ai
  RENDERS: R2Bucket
  CORS_ORIGIN: string
}

const LLAMA_MODEL = '@cf/meta/llama-3.1-8b-instruct'
const SDXL_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const cors = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })

    try {
      const path = url.pathname

      if (path === '/health') {
        let assetCount = 0
        try { const list = await env.RENDERS.list({ limit: 1 }); assetCount = list.objects.length > 0 ? -1 : 0 } catch {}
        return json({ status: 'ok', service: 'studio-ai', version: '2.0.0', models: { image: SDXL_MODEL, text: LLAMA_MODEL, tts: '@cf/myshell-ai/melotts-v2' } }, cors)
      }

      // Gallery — list generated images
      if (path === '/gallery') {
        const cursor = url.searchParams.get('cursor') || undefined
        const list = await env.RENDERS.list({ prefix: 'generated/', limit: 50, cursor })
        const items = list.objects.map(o => ({
          key: o.key, size: o.size, uploaded: o.uploaded,
          id: o.key.replace('generated/', '').replace('.png', ''),
        }))
        return json({ images: items, truncated: list.truncated, cursor: list.truncated ? list.cursor : null }, cors)
      }

      // Renders gallery
      if (path === '/renders') {
        const cursor = url.searchParams.get('cursor') || undefined
        const list = await env.RENDERS.list({ prefix: 'renders/', limit: 50, cursor })
        return json({ renders: list.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded })), truncated: list.truncated }, cors)
      }

      // Delete asset
      if (path.startsWith('/asset/') && request.method === 'DELETE') {
        const key = decodeURIComponent(path.slice(7))
        const obj = await env.RENDERS.head(key)
        if (!obj) return json({ error: 'Not found' }, cors, 404)
        await env.RENDERS.delete(key)
        return json({ ok: true, deleted: key }, cors)
      }

      // Chat / completion
      if (path === '/chat' && request.method === 'POST') {
        const body = await request.json() as { messages: Array<{role: string, content: string}>, max_tokens?: number }
        if (!body.messages?.length) return json({ error: 'messages required' }, cors, 400)
        const result = await env.AI.run(LLAMA_MODEL as any, { messages: body.messages, max_tokens: body.max_tokens || 1000 })
        return json({ response: (result as any).response }, cors)
      }

      // Summarize
      if (path === '/summarize' && request.method === 'POST') {
        const body = await request.json() as { text: string, max_length?: number }
        if (!body.text) return json({ error: 'text required' }, cors, 400)
        const result = await env.AI.run(LLAMA_MODEL as any, {
          messages: [
            { role: 'system', content: `Summarize the following text concisely${body.max_length ? ` in under ${body.max_length} words` : ''}.` },
            { role: 'user', content: body.text }
          ], max_tokens: body.max_length || 300,
        })
        return json({ summary: (result as any).response }, cors)
      }

      // Code generation
      if (path === '/generate-code' && request.method === 'POST') {
        const body = await request.json() as { prompt: string, language?: string }
        if (!body.prompt) return json({ error: 'prompt required' }, cors, 400)
        const result = await env.AI.run(LLAMA_MODEL as any, {
          messages: [
            { role: 'system', content: `You are a code generator. Write ${body.language || 'JavaScript'} code for the user's request. Return the code first, then a brief explanation. Use code blocks.` },
            { role: 'user', content: body.prompt }
          ], max_tokens: 1500,
        })
        return json({ code: (result as any).response, language: body.language || 'javascript' }, cors)
      }

      // Translation
      if (path === '/translate' && request.method === 'POST') {
        const body = await request.json() as { text: string, from?: string, to: string }
        if (!body.text || !body.to) return json({ error: 'text and to required' }, cors, 400)
        const result = await env.AI.run(LLAMA_MODEL as any, {
          messages: [
            { role: 'system', content: `Translate the following text${body.from ? ` from ${body.from}` : ''} to ${body.to}. Return ONLY the translation, nothing else.` },
            { role: 'user', content: body.text }
          ], max_tokens: 500,
        })
        return json({ translation: (result as any).response, from: body.from || 'auto', to: body.to }, cors)
      }

      // Image generation
      if (path === '/generate-image') return handleImageGeneration(request, env, cors)
      if (path === '/generate-variation') return handleImageGeneration(request, env, cors)
      if (path === '/generate-script') return handleScriptGeneration(request, env, cors)
      if (path === '/generate-background') return handleBackgroundGeneration(request, env, cors)
      if (path === '/generate-tts') return handleTTS(request, env, cors)
      if (path === '/render/upload') return handleRenderUpload(request, env, cors)
      if (path === '/render/status') return handleRenderStatus(request, env, cors)

      return json({
        service: 'BlackRoad Studio AI', version: '2.0.0',
        endpoints: ['/health', '/gallery', '/renders', '/chat', '/summarize', '/generate-code', '/translate',
          '/generate-image', '/generate-variation', '/generate-script', '/generate-background', '/generate-tts',
          '/render/upload', '/render/status', 'DELETE /asset/:key'],
      }, cors)
    } catch (err: any) {
      return json({ error: err.message || 'Internal error' }, cors, 500)
    }
  },
} satisfies ExportedHandler<Env>

async function handleImageGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)
  const body = await request.json() as { prompt: string; style?: string }
  const { prompt, style = 'cartoon' } = body
  if (!prompt) return json({ error: 'prompt required' }, headers, 400)
  const styles: Record<string, string> = {
    cartoon: 'colorful cartoon style, simple shapes, bold colors, clean vector art',
    realistic: 'photorealistic, high detail, cinematic lighting',
    watercolor: 'watercolor painting style, soft edges, pastel colors',
    pixel: 'pixel art style, 16-bit, retro game aesthetic',
    anime: 'anime style, cel shaded, vibrant colors',
    minimal: 'minimalist, flat design, geometric shapes, clean lines',
  }
  const enhanced = `${prompt}, ${styles[style] || styles.cartoon}, no text, no watermark`
  const result = await env.AI.run(SDXL_MODEL as any, { prompt: enhanced, num_steps: 20 })
  const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const key = `generated/${imageId}.png`
  const imageData = result as unknown as ReadableStream
  await env.RENDERS.put(key, imageData, { httpMetadata: { contentType: 'image/png' }, customMetadata: { prompt, style, generatedAt: new Date().toISOString() } })
  return new Response(imageData, { headers: { ...headers, 'Content-Type': 'image/png', 'X-Image-Id': imageId, 'X-Image-Key': key } })
}

async function handleBackgroundGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)
  const body = await request.json() as { description: string }
  if (!body.description) return json({ error: 'description required' }, headers, 400)
  const result = await env.AI.run(LLAMA_MODEL as any, {
    messages: [
      { role: 'system', content: 'You generate background configurations. Return ONLY valid JSON: {"id":"custom-[ts]","name":"[name]","skyColor":"#hex","groundColor":"#hex","accentColor":"#hex","elements":[{"type":"cloud|sun|moon|star|hill|building|tree","x":0-1920,"y":0-400,"scale":0.5-2,"color":"#hex"}]}' },
      { role: 'user', content: `Generate a background for: ${body.description}` },
    ], max_tokens: 500,
  })
  const text = (result as any).response || ''
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { const bg = JSON.parse(match[0]); bg.id = `custom-${Date.now()}`; return json({ background: bg }, headers) }
  } catch {}
  return json({ error: 'Failed to generate background', raw: text }, headers, 500)
}

async function handleScriptGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)
  const body = await request.json() as { idea: string; contentType?: string; tone?: string; audience?: string; characters?: string[]; numScenes?: number }
  const { idea, contentType = 'story', tone = 'funny', audience = 'everyone', characters = [], numScenes = 5 } = body
  if (!idea) return json({ error: 'idea required' }, headers, 400)
  const charList = characters.length > 0 ? characters.join(', ') : 'Miss Sunshine (cheerful), Mr. Cool (relaxed), Miss Curious (inquisitive)'
  const result = await env.AI.run(LLAMA_MODEL as any, {
    messages: [
      { role: 'system', content: `Write scripts for animated videos. Return ONLY valid JSON array. Each scene: {"type":"dialogue"|"narration","narration":"text","dialogue":[{"character":"name","text":"line"}],"background":"neighborhood|sunny-park|school"}. Characters: ${charList}. Tone: ${tone}. Audience: ${audience}. Generate ${numScenes} scenes.` },
      { role: 'user', content: `Write a ${numScenes}-scene script for: ${idea}` },
    ], max_tokens: 2000,
  })
  const text = (result as any).response || ''
  try { const match = text.match(/\[[\s\S]*\]/); if (match) return json({ scenes: JSON.parse(match[0]) }, headers) } catch {}
  return json({ scenes: null, raw: text, error: 'Could not parse — try again' }, headers, 500)
}

async function handleTTS(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)
  const body = await request.json() as { text: string; voiceId?: string; lineId?: string }
  if (!body.text) return json({ error: 'text required' }, headers, 400)
  const result = await env.AI.run('@cf/myshell-ai/melotts-v2' as any, { text: body.text, language: 'EN' })
  const audioId = body.lineId || `tts-${Date.now()}`
  const key = `audio/${audioId}.wav`
  const audioData = result as unknown as ReadableStream
  await env.RENDERS.put(key, audioData, { httpMetadata: { contentType: 'audio/wav' }, customMetadata: { text: body.text.slice(0, 200), generatedAt: new Date().toISOString() } })
  return new Response(audioData, { headers: { ...headers, 'Content-Type': 'audio/wav', 'X-Audio-Id': audioId } })
}

async function handleRenderUpload(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)
  const projectId = new URL(request.url).searchParams.get('projectId') || 'unknown'
  const key = `renders/${projectId}/${Date.now()}.webm`
  await env.RENDERS.put(key, request.body!, { httpMetadata: { contentType: request.headers.get('content-type') || 'video/webm' } })
  return json({ key, size: request.headers.get('content-length') }, headers)
}

async function handleRenderStatus(request: Request, env: Env, headers: Record<string, string>) {
  const projectId = new URL(request.url).searchParams.get('projectId')
  if (!projectId) return json({ error: 'projectId required' }, headers, 400)
  const list = await env.RENDERS.list({ prefix: `renders/${projectId}/` })
  return json({ projectId, renders: list.objects.map(o => ({ key: o.key, size: o.size, uploaded: o.uploaded })) }, headers)
}

function json(data: any, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
}
