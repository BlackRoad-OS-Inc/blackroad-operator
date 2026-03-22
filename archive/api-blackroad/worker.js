/**
 * BlackRoad AI API — OpenAI-Compatible Endpoint
 * Proxies to Ollama on Cecilia via tunnel. Drop-in replacement for OpenAI SDK.
 *
 * Usage:
 *   curl https://api-ai.blackroad.io/v1/chat/completions \
 *     -H "Authorization: Bearer br-xxx" \
 *     -H "Content-Type: application/json" \
 *     -d '{"model":"llama3.2:3b","messages":[{"role":"user","content":"hello"}]}'
 *
 * BlackRoad OS, Inc. — Pave Tomorrow.
 */

const OLLAMA = 'https://ollama.blackroad.io';

// Map OpenAI model names to Ollama models
const MODEL_MAP = {
  'gpt-4': 'qwen3:8b',
  'gpt-4o': 'qwen3:8b',
  'gpt-4o-mini': 'llama3.2:3b',
  'gpt-3.5-turbo': 'llama3.2:3b',
  'gpt-3.5': 'tinyllama:latest',
  'codellama': 'codellama:7b',
  'deepseek-coder': 'deepseek-coder:1.3b',
  'qwen-coder': 'qwen2.5-coder:3b',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    try {
      // ── Models list (OpenAI format) ──
      if (path === '/v1/models' || path === '/v1/models/') {
        const res = await fetch(OLLAMA + '/api/tags');
        const data = await res.json();
        const models = data.models.map(m => ({
          id: m.name,
          object: 'model',
          created: Math.floor(new Date(m.modified_at).getTime() / 1000),
          owned_by: 'blackroad',
          permission: [],
        }));
        return Response.json({ object: 'list', data: models }, { headers: cors });
      }

      // ── Chat completions (OpenAI format) ──
      if (path === '/v1/chat/completions' && request.method === 'POST') {
        const body = await request.json();
        let model = body.model || 'llama3.2:3b';
        model = MODEL_MAP[model] || model; // Translate OpenAI names

        const messages = body.messages || [];
        const stream = body.stream || false;
        const maxTokens = body.max_tokens || 512;
        const temperature = body.temperature || 0.7;

        const ollamaBody = {
          model,
          messages,
          stream,
          options: {
            num_predict: maxTokens,
            temperature,
          },
        };

        const ollamaRes = await fetch(OLLAMA + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ollamaBody),
        });

        if (!ollamaRes.ok) {
          return Response.json({
            error: { message: 'Ollama error: ' + ollamaRes.status, type: 'api_error' },
          }, { status: 502, headers: cors });
        }

        // Non-streaming: collect full response
        if (!stream) {
          const reader = ollamaRes.body.getReader();
          const decoder = new TextDecoder();
          let content = '';
          let promptTokens = 0, completionTokens = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              if (!line.trim()) continue;
              try {
                const j = JSON.parse(line);
                if (j.message && j.message.content) content += j.message.content;
                if (j.prompt_eval_count) promptTokens = j.prompt_eval_count;
                if (j.eval_count) completionTokens = j.eval_count;
              } catch {}
            }
          }

          return Response.json({
            id: 'chatcmpl-' + crypto.randomUUID().slice(0, 8),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [{
              index: 0,
              message: { role: 'assistant', content },
              finish_reason: 'stop',
            }],
            usage: {
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: promptTokens + completionTokens,
            },
          }, { headers: cors });
        }

        // Streaming: SSE format
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        const completionId = 'chatcmpl-' + crypto.randomUUID().slice(0, 8);

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split('\n')) {
                if (!line.trim()) continue;
                try {
                  const j = JSON.parse(line);
                  if (j.message && j.message.content) {
                    const sseData = {
                      id: completionId,
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model,
                      choices: [{
                        index: 0,
                        delta: { content: j.message.content },
                        finish_reason: null,
                      }],
                    };
                    await writer.write(encoder.encode('data: ' + JSON.stringify(sseData) + '\n\n'));
                  }
                  if (j.done) {
                    const finalData = {
                      id: completionId,
                      object: 'chat.completion.chunk',
                      created: Math.floor(Date.now() / 1000),
                      model,
                      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
                    };
                    await writer.write(encoder.encode('data: ' + JSON.stringify(finalData) + '\n\n'));
                    await writer.write(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch {}
              }
            }
          } catch {} finally {
            await writer.close();
          }
        })();

        return new Response(readable, {
          headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        });
      }

      // ── Completions (legacy) ──
      if (path === '/v1/completions' && request.method === 'POST') {
        const body = await request.json();
        let model = body.model || 'llama3.2:3b';
        model = MODEL_MAP[model] || model;

        const res = await fetch(OLLAMA + '/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt: body.prompt || '', stream: false, options: { num_predict: body.max_tokens || 256 } }),
        });
        const data = await res.json();

        return Response.json({
          id: 'cmpl-' + crypto.randomUUID().slice(0, 8),
          object: 'text_completion',
          created: Math.floor(Date.now() / 1000),
          model,
          choices: [{ text: data.response || '', index: 0, finish_reason: 'stop' }],
          usage: { prompt_tokens: data.prompt_eval_count || 0, completion_tokens: data.eval_count || 0, total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0) },
        }, { headers: cors });
      }

      // ── Embeddings ──
      if (path === '/v1/embeddings' && request.method === 'POST') {
        const body = await request.json();
        const input = Array.isArray(body.input) ? body.input : [body.input];
        const embeddings = [];

        for (let i = 0; i < input.length; i++) {
          const res = await fetch(OLLAMA + '/api/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'nomic-embed-text:latest', prompt: input[i] }),
          });
          const data = await res.json();
          embeddings.push({ object: 'embedding', embedding: data.embedding || [], index: i });
        }

        return Response.json({
          object: 'list',
          data: embeddings,
          model: 'nomic-embed-text:latest',
          usage: { prompt_tokens: input.join(' ').split(' ').length, total_tokens: input.join(' ').split(' ').length },
        }, { headers: cors });
      }

      // ── Health ──
      if (path === '/health' || path === '/') {
        return Response.json({
          status: 'up',
          service: 'blackroad-ai-api',
          version: '1.0.0',
          endpoints: ['/v1/chat/completions', '/v1/completions', '/v1/models', '/v1/embeddings'],
          backend: 'Ollama (Cecilia Pi)',
          note: 'OpenAI-compatible. Use any OpenAI SDK with base_url=https://api-ai.blackroad.io/v1',
        }, { headers: cors });
      }

      return Response.json({ error: { message: 'Not found', type: 'invalid_request_error' } }, { status: 404, headers: cors });

    } catch (e) {
      return Response.json({ error: { message: e.message, type: 'api_error' } }, { status: 500, headers: cors });
    }
  },
};
