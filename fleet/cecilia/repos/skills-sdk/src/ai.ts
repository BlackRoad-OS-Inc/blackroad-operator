import { BlackRoadClient } from './client';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  usage: { tokens: number };
}

export interface SimilarityResult {
  score: number;
  index: number;
  content?: string;
  metadata?: Record<string, any>;
}

export interface ChunkResult {
  chunks: string[];
  total_tokens: number;
  chunk_count: number;
}

export interface RAGContext {
  documents: Array<{
    content: string;
    score: number;
    source?: string;
    metadata?: Record<string, any>;
  }>;
  query: string;
  total_results: number;
}

export interface InferenceResult {
  response: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}

export class AITools {
  constructor(private client: BlackRoadClient) {}

  /**
   * Generate embeddings for text
   */
  async embed(
    text: string | string[],
    options?: { model?: string }
  ): Promise<EmbeddingResult | EmbeddingResult[]> {
    return this.client.fetch('/tools/ai/embed', {
      method: 'POST',
      body: JSON.stringify({
        text,
        model: options?.model || 'default'
      })
    });
  }

  /**
   * Find similar items using cosine similarity
   */
  async findSimilar(
    query: number[],
    candidates: number[][],
    options?: { top_k?: number; threshold?: number }
  ): Promise<{ results: SimilarityResult[] }> {
    return this.client.fetch('/tools/ai/similar', {
      method: 'POST',
      body: JSON.stringify({
        query,
        candidates,
        top_k: options?.top_k || 5,
        threshold: options?.threshold || 0.0
      })
    });
  }

  /**
   * Chunk text for RAG processing
   */
  async chunk(
    text: string,
    options?: {
      chunk_size?: number;
      overlap?: number;
      method?: 'fixed' | 'semantic' | 'sentence';
    }
  ): Promise<ChunkResult> {
    return this.client.fetch('/tools/ai/chunk', {
      method: 'POST',
      body: JSON.stringify({
        text,
        chunk_size: options?.chunk_size || 512,
        overlap: options?.overlap || 50,
        method: options?.method || 'semantic'
      })
    });
  }

  /**
   * Retrieve relevant context for RAG
   */
  async retrieveContext(
    query: string,
    options?: {
      collection?: string;
      top_k?: number;
      rerank?: boolean;
      filters?: Record<string, any>;
    }
  ): Promise<RAGContext> {
    return this.client.fetch('/tools/ai/retrieve', {
      method: 'POST',
      body: JSON.stringify({
        query,
        collection: options?.collection || 'default',
        top_k: options?.top_k || 5,
        rerank: options?.rerank || false,
        filters: options?.filters
      })
    });
  }

  /**
   * Generate completion with LLM
   */
  async generate(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      system?: string;
      context?: string[];
    }
  ): Promise<InferenceResult> {
    return this.client.fetch('/tools/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        model: options?.model || 'default',
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1024,
        system: options?.system,
        context: options?.context
      })
    });
  }

  /**
   * Classify text into categories
   */
  async classify(
    text: string,
    categories: string[],
    options?: { multi_label?: boolean }
  ): Promise<{
    predictions: Array<{ category: string; confidence: number }>;
    multi_label: boolean;
  }> {
    return this.client.fetch('/tools/ai/classify', {
      method: 'POST',
      body: JSON.stringify({
        text,
        categories,
        multi_label: options?.multi_label || false
      })
    });
  }

  /**
   * Extract named entities from text
   */
  async extractEntities(
    text: string,
    options?: { entity_types?: string[] }
  ): Promise<{
    entities: Array<{
      text: string;
      type: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  }> {
    return this.client.fetch('/tools/ai/entities', {
      method: 'POST',
      body: JSON.stringify({
        text,
        entity_types: options?.entity_types
      })
    });
  }

  /**
   * Summarize text
   */
  async summarize(
    text: string,
    options?: {
      max_length?: number;
      style?: 'bullet' | 'paragraph' | 'tldr';
    }
  ): Promise<{ summary: string; original_length: number; summary_length: number }> {
    return this.client.fetch('/tools/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({
        text,
        max_length: options?.max_length || 200,
        style: options?.style || 'paragraph'
      })
    });
  }

  /**
   * Analyze sentiment
   */
  async sentiment(
    text: string
  ): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    scores: { positive: number; negative: number; neutral: number };
  }> {
    return this.client.fetch('/tools/ai/sentiment', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  /**
   * Translate text
   */
  async translate(
    text: string,
    target: string,
    options?: { source?: string }
  ): Promise<{ translation: string; source_language: string; target_language: string }> {
    return this.client.fetch('/tools/ai/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target,
        source: options?.source || 'auto'
      })
    });
  }
}
