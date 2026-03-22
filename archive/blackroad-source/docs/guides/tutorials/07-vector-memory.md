# Tutorial 07: Vector Memory & Semantic Search

## Overview

Store knowledge as vector embeddings for semantic retrieval — not just keyword search.

## Why Vector Memory?

```
Keyword:  "deploy" → finds: deploy.sh, deploy.py, DEPLOY.md
Semantic: "how do I ship code?" → finds: deploy.sh, CI/CD guide, Railway tutorial
```

## Setup

```bash
pip install blackroad-sdk[vector]  # includes qdrant-client
```

```typescript
import { VectorMemory } from "@blackroad/sdk/memory";

const mem = new VectorMemory({
  collection: "blackroad-knowledge",
  vectorSize: 1536,              // OpenAI ada-002 / nomic-embed
  distance: "Cosine",
  persistPath: "~/.blackroad/vector-db",
});
await mem.init();
```

## Store Embeddings

```typescript
// Store document with metadata
await mem.upsert({
  id: "doc-001",
  text: "The BlackRoad Gateway is a tokenless proxy that routes agent requests to AI providers",
  metadata: {
    source: "architecture.md",
    tags: ["gateway", "architecture"],
    timestamp: new Date().toISOString(),
  },
});

// Batch ingest from directory
await mem.ingestDirectory("./docs", { extension: ".md" });
```

## Semantic Search

```typescript
// Returns top-k most relevant docs
const results = await mem.search("how does the gateway handle auth?", { topK: 5 });
results.forEach(r => {
  console.log(`Score: ${r.score.toFixed(3)} | ${r.metadata.source}`);
  console.log(r.text.slice(0, 200));
});
```

## RAG (Retrieval Augmented Generation)

```typescript
import { BlackRoadClient } from "@blackroad/sdk";

const client = new BlackRoadClient({ baseUrl: "http://localhost:8787" });

async function ragChat(question: string): Promise<string> {
  // 1. Retrieve relevant context
  const context = await mem.search(question, { topK: 3 });
  const ctxText = context.map(c => c.text).join("

");

  // 2. Augment prompt
  const augmented = `Context:
${ctxText}

Question: ${question}`;

  // 3. Generate with context
  const { content } = await client.chat({
    message: augmented,
    agent: "LUCIDIA",
    system: "Answer based on the provided context. If unsure, say so.",
  });
  return content;
}

const answer = await ragChat("What providers does the gateway support?");
```

## Memory Tiers

| Tier | Storage | TTL | Use Case |
|------|---------|-----|----------|
| Working | In-memory | Session | Active task context |
| Episodic | SQLite | 30 days | Conversation history |
| Semantic | Vector DB | Permanent | Knowledge base |
| Hash Chain | Files | Permanent | Audit trail |

## Next: [Tutorial 08 - Webhooks & Events](08-webhooks.md)
