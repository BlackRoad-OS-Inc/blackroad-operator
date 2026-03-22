// BlackRoad Studio AI API client
const API_BASE = 'https://studio-ai.amundsonalexa.workers.dev'

export async function generateImage(prompt: string, style: string = 'cartoon'): Promise<{ blob: Blob; imageId: string }> {
  const res = await fetch(`${API_BASE}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Image generation failed' }))
    throw new Error((err as any).error || 'Image generation failed')
  }

  const blob = await res.blob()
  const imageId = res.headers.get('X-Image-Id') || `img-${Date.now()}`
  return { blob, imageId }
}

export async function generateBackground(description: string) {
  const res = await fetch(`${API_BASE}/generate-background`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })

  if (!res.ok) throw new Error('Background generation failed')
  const data = await res.json() as { background: any; error?: string }
  if (data.error) throw new Error(data.error)
  return data.background
}

export interface GeneratedScene {
  type: 'title' | 'dialogue' | 'narration' | 'end'
  narration: string | null
  dialogue: { character: string; text: string }[]
  background: string
}

export async function generateScript(params: {
  idea: string
  contentType: string
  tone: string
  audience: string
  characters: string[]
  numScenes: number
}): Promise<GeneratedScene[]> {
  const res = await fetch(`${API_BASE}/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!res.ok) throw new Error('Script generation failed')
  const data = await res.json() as { scenes: GeneratedScene[] | null; error?: string }
  if (!data.scenes) throw new Error(data.error || 'No scenes generated')
  return data.scenes
}

export async function generateTTS(text: string, voiceId: string, lineId: string): Promise<{ blob: Blob; audioId: string }> {
  const res = await fetch(`${API_BASE}/generate-tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId, lineId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'TTS failed' }))
    throw new Error((err as any).error || 'TTS generation failed')
  }

  const blob = await res.blob()
  const audioId = res.headers.get('X-Audio-Id') || lineId
  return { blob, audioId }
}

export async function uploadRender(projectId: string, videoBlob: Blob): Promise<{ key: string; url: string }> {
  const res = await fetch(`${API_BASE}/render/upload?projectId=${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'video/webm' },
    body: videoBlob,
  })

  if (!res.ok) throw new Error('Upload failed')
  return await res.json() as { key: string; url: string }
}
