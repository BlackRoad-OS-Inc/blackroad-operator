import { NextRequest, NextResponse } from 'next/server'

const OLLAMA_NODES = [
  { name: 'cecilia', url: 'http://192.168.4.96:11434' },
  { name: 'lucidia', url: 'http://192.168.4.38:11434' },
  { name: 'octavia', url: 'http://192.168.4.100:11434' },
  { name: 'alice', url: 'http://192.168.4.49:11434' },
]

async function findAliveNode(): Promise<{ name: string; url: string } | null> {
  for (const node of OLLAMA_NODES) {
    try {
      const res = await fetch(`${node.url}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) return node
    } catch {
      continue
    }
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { message, model, agent } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const node = await findAliveNode()
    if (!node) {
      return NextResponse.json(
        { error: 'No Ollama nodes available', nodes: OLLAMA_NODES.map((n) => n.name) },
        { status: 503 }
      )
    }

    const ollamaRes = await fetch(`${node.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3.2',
        prompt: agent
          ? `You are ${agent}, a BlackRoad AI agent. Respond helpfully.\n\nUser: ${message}`
          : message,
        stream: false,
      }),
    })

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text()
      return NextResponse.json(
        { error: `Ollama error: ${ollamaRes.status}`, detail: text, node: node.name },
        { status: 502 }
      )
    }

    const data = await ollamaRes.json()
    return NextResponse.json({
      response: data.response,
      node: node.name,
      model: data.model,
      duration: data.total_duration,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal error', detail: String(err) },
      { status: 500 }
    )
  }
}
