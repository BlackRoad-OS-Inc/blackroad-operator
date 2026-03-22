// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Gateway client — all AI inference calls route through blackroad-core.
// Agents NEVER hold provider API keys. Trust boundary is the gateway.

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  id: string
  model: string
  content: string
  provider?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface HealthResponse {
  status: string
  version: string
  uptime: number
}

export interface ModelsResponse {
  models: Array<{ id: string; provider: string }>
}

export interface GatewayErrorBody {
  code: string
  message: string
  status: number
}

export class GatewayClient {
  private readonly baseUrl: string
  private readonly agentId: string

  constructor(agentId: string, gatewayUrl?: string) {
    this.agentId = agentId
    this.baseUrl = (gatewayUrl ?? process.env["BLACKROAD_GATEWAY_URL"] ?? "http://127.0.0.1:8787").replace(/\/$/, "")
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.agentId}`,
        "X-Agent-Id": this.agentId,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: request.stream ?? false,
      }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as Partial<GatewayErrorBody>
      throw new Error(
        `Gateway error ${res.status}: ${err.message ?? res.statusText}`
      )
    }

    return res.json() as Promise<ChatResponse>
  }

  async health(): Promise<HealthResponse> {
    const res = await fetch(`${this.baseUrl}/v1/health`)
    if (!res.ok) throw new Error(`Gateway unreachable: ${res.status}`)
    return res.json() as Promise<HealthResponse>
  }

  async isReady(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/health/ready`)
      return res.ok
    } catch {
      return false
    }
  }

  async listModels(): Promise<ModelsResponse> {
    const res = await fetch(`${this.baseUrl}/v1/models`, {
      headers: {
        "Authorization": `Bearer ${this.agentId}`,
        "X-Agent-Id": this.agentId,
      },
    })
    if (!res.ok) throw new Error(`Failed to list models: ${res.status}`)
    return res.json() as Promise<ModelsResponse>
  }
}

/** Convenience factory — reads BLACKROAD_GATEWAY_URL from env */
export function createGatewayClient(agentId: string): GatewayClient {
  return new GatewayClient(agentId)
}
