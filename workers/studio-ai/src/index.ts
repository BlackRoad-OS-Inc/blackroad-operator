// BlackRoad Studio AI Worker
// Handles image generation, script generation, and TTS for Studio

interface Env {
  AI: Ai
  RENDERS: R2Bucket
  CORS_ORIGIN: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      switch (url.pathname) {
        case '/health':
          return json({ status: 'ok', service: 'studio-ai', version: '1.0.0' }, corsHeaders)

        case '/generate-image':
          return handleImageGeneration(request, env, corsHeaders)

        case '/generate-script':
          return handleScriptGeneration(request, env, corsHeaders)

        case '/generate-background':
          return handleBackgroundGeneration(request, env, corsHeaders)

        case '/generate-tts':
          return handleTTS(request, env, corsHeaders)

        case '/render/upload':
          return handleRenderUpload(request, env, corsHeaders)

        case '/render/status':
          return handleRenderStatus(request, env, corsHeaders)

        default:
          return json({ error: 'Not found', endpoints: ['/health', '/generate-image', '/generate-script', '/generate-background', '/generate-tts', '/render/upload'] }, corsHeaders, 404)
      }
    } catch (err: any) {
      return json({ error: err.message || 'Internal error' }, corsHeaders, 500)
    }
  },
} satisfies ExportedHandler<Env>

// Image generation using Workers AI Stable Diffusion
async function handleImageGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)

  const body = await request.json() as { prompt: string; style?: string; width?: number; height?: number }
  const { prompt, style = 'cartoon', width = 1024, height = 576 } = body

  if (!prompt) return json({ error: 'prompt required' }, headers, 400)

  // Enhance the prompt for animation-style output
  const stylePrompts: Record<string, string> = {
    cartoon: 'colorful cartoon style, simple shapes, bold colors, kids animation, clean vector art',
    realistic: 'photorealistic, high detail, cinematic lighting',
    watercolor: 'watercolor painting style, soft edges, pastel colors, artistic',
    pixel: 'pixel art style, 16-bit, retro game aesthetic',
    anime: 'anime style, cel shaded, vibrant colors, Japanese animation',
    minimal: 'minimalist, flat design, geometric shapes, clean lines',
  }

  const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.cartoon}, no text, no watermark`

  const result = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
    prompt: enhancedPrompt,
    num_steps: 20,
  })

  // Store in R2 for persistence
  const imageId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const key = `generated/${imageId}.png`

  // result is a ReadableStream of the PNG
  const imageData = result as unknown as ReadableStream
  await env.RENDERS.put(key, imageData, {
    httpMetadata: { contentType: 'image/png' },
    customMetadata: { prompt, style, generatedAt: new Date().toISOString() },
  })

  return new Response(imageData, {
    headers: {
      ...headers,
      'Content-Type': 'image/png',
      'X-Image-Id': imageId,
      'X-Image-Key': key,
    },
  })
}

// Generate custom background parameters from a text description
async function handleBackgroundGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)

  const body = await request.json() as { description: string }
  const { description } = body

  if (!description) return json({ error: 'description required' }, headers, 400)

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You generate background configurations for an animated video scene. Return ONLY valid JSON with no markdown. Format:
{
  "id": "custom-[timestamp]",
  "name": "[short name]",
  "skyColor": "#hex",
  "groundColor": "#hex",
  "accentColor": "#hex",
  "elements": [
    {"type": "cloud|sun|moon|star|hill|building|tree|fence|flower", "x": 0-1920, "y": 0-400, "scale": 0.5-2, "color": "#hex"}
  ]
}
Valid element types: cloud, sun, moon, star, hill, building, tree, fence, flower.
Sky colors should be the upper part, ground colors the lower part. Make it visually appealing for animation.`,
      },
      { role: 'user', content: `Generate a background for: ${description}` },
    ],
    max_tokens: 500,
  })

  const text = (result as any).response || ''

  try {
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const bg = JSON.parse(jsonMatch[0])
      bg.id = `custom-${Date.now()}`
      return json({ background: bg }, headers)
    }
  } catch {}

  return json({ error: 'Failed to generate background', raw: text }, headers, 500)
}

// Script generation — turn an idea into scenes with dialogue
async function handleScriptGeneration(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)

  const body = await request.json() as {
    idea: string
    contentType: string
    tone: string
    audience: string
    length: string
    characters: string[]
    numScenes: number
  }

  const { idea, contentType = 'story', tone = 'funny', audience = 'everyone', characters = [], numScenes = 5 } = body

  if (!idea) return json({ error: 'idea required' }, headers, 400)

  const charList = characters.length > 0
    ? characters.join(', ')
    : 'Miss Sunshine (cheerful, yellow), Mr. Cool (relaxed, blue), Miss Curious (inquisitive, teal)'

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You write scripts for animated videos. Return ONLY valid JSON array, no markdown.
Each scene is: {"type":"dialogue"|"narration","narration":"text or null","dialogue":[{"character":"name","text":"line"}],"background":"neighborhood|sunny-park|school|living-room|playground|beach|starry-night|outer-space"}
First scene should be type "title" with narration as the title. Last scene should be type "end".
Characters available: ${charList}
Tone: ${tone}. Audience: ${audience}. Content type: ${contentType}.
Generate exactly ${numScenes} scenes. Keep dialogue natural and fun. Each dialogue line should be 1-2 sentences.`,
      },
      { role: 'user', content: `Write a ${numScenes}-scene script for: ${idea}` },
    ],
    max_tokens: 2000,
  })

  const text = (result as any).response || ''

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const scenes = JSON.parse(jsonMatch[0])
      return json({ scenes, raw: null }, headers)
    }
  } catch {}

  return json({ scenes: null, raw: text, error: 'Could not parse script — try again' }, headers, 500)
}

// TTS generation using Workers AI
async function handleTTS(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)

  const body = await request.json() as { text: string; voiceId?: string; lineId?: string }
  const { text, voiceId = 'default', lineId } = body

  if (!text) return json({ error: 'text required' }, headers, 400)

  // Use Kokoro TTS model
  const result = await env.AI.run('@cf/myshell-ai/melotts-v2' as any, {
    text,
    language: 'EN',
  })

  // Store audio in R2
  const audioId = lineId || `tts-${Date.now()}`
  const key = `audio/${audioId}.wav`
  const audioData = result as unknown as ReadableStream
  await env.RENDERS.put(key, audioData, {
    httpMetadata: { contentType: 'audio/wav' },
    customMetadata: { text: text.slice(0, 200), voiceId, generatedAt: new Date().toISOString() },
  })

  return new Response(audioData, {
    headers: {
      ...headers,
      'Content-Type': 'audio/wav',
      'X-Audio-Id': audioId,
      'X-Audio-Key': key,
    },
  })
}

// Upload rendered video chunks to R2
async function handleRenderUpload(request: Request, env: Env, headers: Record<string, string>) {
  if (request.method !== 'POST') return json({ error: 'POST required' }, headers, 405)

  const contentType = request.headers.get('content-type') || 'video/webm'
  const projectId = new URL(request.url).searchParams.get('projectId') || 'unknown'
  const key = `renders/${projectId}/${Date.now()}.webm`

  await env.RENDERS.put(key, request.body!, {
    httpMetadata: { contentType },
    customMetadata: { projectId, renderedAt: new Date().toISOString() },
  })

  // Generate public URL
  return json({
    key,
    url: `https://pub-renders.blackroad.io/${key}`,
    size: request.headers.get('content-length'),
  }, headers)
}

async function handleRenderStatus(request: Request, env: Env, headers: Record<string, string>) {
  const projectId = new URL(request.url).searchParams.get('projectId')
  if (!projectId) return json({ error: 'projectId required' }, headers, 400)

  const list = await env.RENDERS.list({ prefix: `renders/${projectId}/` })
  const renders = list.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
  }))

  return json({ projectId, renders }, headers)
}

function json(data: any, headers: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
