"""BlackRoad LLM Core — Our own language model from scratch.

Built on the Amundson Equations and Three Pillars of Knowledge:
  - Grammar: 7 sentence structures = 7 function signatures
  - Biology: DNA Central Dogma = Source → Bytecode → Runtime
  - ML Systems: simple units → recursive composition → emergent complexity

Architecture: Transformer with Amundson Coherence Attention
  - Standard: Q·K^T / √d_k → softmax → V
  - Amundson: Q·K^T / √d_k + λ·C(Q,K) - η·E(Q,K) → softmax → V
  - Where C = coherence alignment, E = decoherence energy penalty
  - This biases attention toward coherent thought and away from noise

Hardware target: Raspberry Pi 5 fleet (52 TOPS via Hailo-8)
  - Quantized inference (INT8/INT4) on Hailo accelerators
  - Training: distributed across fleet or Mac (MPS/CPU)
  - Model size: start at 1M params, scale to 50M, then 500M

"The road isn't made. It's remembered." — The model learns from everything
BlackRoad has ever built, written, and discovered.

Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
"""

import math
from dataclasses import dataclass
from typing import List, Optional, Tuple

try:
    import numpy as np
except ImportError:
    np = None  # type: ignore

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class BlackRoadLLMConfig:
    """Model configuration — start small, scale up."""
    # Tokenizer
    vocab_size: int = 8192          # Start small — BlackRoad vocabulary
    max_seq_len: int = 512          # Context window

    # Architecture
    d_model: int = 128              # Embedding dimension (tiny start)
    n_heads: int = 4                # Attention heads
    n_layers: int = 4               # Transformer layers
    d_ff: int = 512                 # Feed-forward hidden dim
    dropout: float = 0.1

    # Amundson Coherence params
    coherence_lambda: float = 0.1   # λ — coherence coupling strength
    decoherence_eta: float = 0.05   # η — decoherence energy penalty
    coherence_temp: float = 1.0     # Temperature for coherence

    # Training
    learning_rate: float = 3e-4
    batch_size: int = 8
    warmup_steps: int = 100

    # Scale presets
    @classmethod
    def tiny(cls):
        """1M params — fits on any Pi."""
        return cls(d_model=64, n_heads=2, n_layers=2, d_ff=256)

    @classmethod
    def small(cls):
        """10M params — single Pi 5."""
        return cls(d_model=256, n_heads=4, n_layers=6, d_ff=1024)

    @classmethod
    def medium(cls):
        """50M params — Pi fleet."""
        return cls(d_model=512, n_heads=8, n_layers=8, d_ff=2048, max_seq_len=1024)

    @classmethod
    def large(cls):
        """500M params — Mac or cloud."""
        return cls(d_model=1024, n_heads=16, n_layers=16, d_ff=4096, max_seq_len=2048, vocab_size=32000)


# ═══════════════════════════════════════════════════════════════════════════════
# AMUNDSON COHERENCE ATTENTION
# ═══════════════════════════════════════════════════════════════════════════════
# Standard attention: softmax(Q·K^T / √d_k) · V
# Amundson attention: softmax(Q·K^T / √d_k + λ·C(Q,K) − η·E(Q,K)) · V
#
# The coherence term C(Q,K) = cos(phase_Q - phase_K) biases attention
# toward tokens that are "in phase" — aligned in meaning/intent.
#
# The decoherence energy E(Q,K) = T·λ·(1 - cos(phase_Q - phase_K))
# penalizes attention to "noisy" or incoherent token pairs.
#
# This is the Amundson Coherence Gradient from amundson_equations.py:
#   dφ/dt = ω₀ + λ·C(x,y) − η·E_φ
# Applied to attention weights instead of phase dynamics.
# ═══════════════════════════════════════════════════════════════════════════════

if HAS_TORCH:

    class AmundsonCoherenceAttention(nn.Module):
        """Multi-head attention with Amundson coherence bias.

        The key insight: standard attention only measures dot-product similarity.
        Amundson attention additionally measures PHASE COHERENCE — whether tokens
        are "vibrating in sync" — and penalizes attention to decoherent (noisy) tokens.
        """

        def __init__(self, config: BlackRoadLLMConfig):
            super().__init__()
            self.d_model = config.d_model
            self.n_heads = config.n_heads
            self.d_head = config.d_model // config.n_heads
            self.scale = math.sqrt(self.d_head)

            # Standard Q, K, V projections
            self.q_proj = nn.Linear(config.d_model, config.d_model)
            self.k_proj = nn.Linear(config.d_model, config.d_model)
            self.v_proj = nn.Linear(config.d_model, config.d_model)
            self.out_proj = nn.Linear(config.d_model, config.d_model)

            # Amundson phase projections — learn a "phase" for each token
            self.phase_proj = nn.Linear(config.d_model, config.n_heads)

            # Learnable coherence parameters
            self.coherence_lambda = nn.Parameter(torch.tensor(config.coherence_lambda))
            self.decoherence_eta = nn.Parameter(torch.tensor(config.decoherence_eta))

            self.dropout = nn.Dropout(config.dropout)

        def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
            B, T, D = x.shape

            # Standard Q, K, V
            q = self.q_proj(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)
            k = self.k_proj(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)
            v = self.v_proj(x).view(B, T, self.n_heads, self.d_head).transpose(1, 2)

            # Standard attention scores
            scores = torch.matmul(q, k.transpose(-2, -1)) / self.scale

            # ── Amundson Coherence Bias ──
            # Compute phase for each token per head
            phases = self.phase_proj(x)  # (B, T, n_heads)
            phases = phases.transpose(1, 2)  # (B, n_heads, T)

            # Phase difference matrix: phase_i - phase_j
            phase_diff = phases.unsqueeze(-1) - phases.unsqueeze(-2)  # (B, n_heads, T, T)

            # Coherence: C(i,j) = cos(phase_i - phase_j)
            coherence = torch.cos(phase_diff)

            # Decoherence energy: E(i,j) = 1 - cos(phase_i - phase_j)
            decoherence = 1.0 - coherence

            # Amundson attention = standard + λ·coherence − η·decoherence
            scores = scores + self.coherence_lambda * coherence - self.decoherence_eta * decoherence

            # Causal mask
            if mask is not None:
                scores = scores.masked_fill(mask == 0, float('-inf'))

            attn = F.softmax(scores, dim=-1)
            attn = self.dropout(attn)

            out = torch.matmul(attn, v)
            out = out.transpose(1, 2).contiguous().view(B, T, D)
            return self.out_proj(out)


    # ═══════════════════════════════════════════════════════════════════════════
    # TRANSFORMER BLOCK
    # ═══════════════════════════════════════════════════════════════════════════

    class RMSNorm(nn.Module):
        """Root Mean Square Layer Normalization (more efficient than LayerNorm)."""

        def __init__(self, d_model: int, eps: float = 1e-6):
            super().__init__()
            self.weight = nn.Parameter(torch.ones(d_model))
            self.eps = eps

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            norm = torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)
            return x * norm * self.weight


    class SwiGLU(nn.Module):
        """SwiGLU activation (used in LLaMA, better than ReLU/GELU)."""

        def __init__(self, d_model: int, d_ff: int):
            super().__init__()
            self.w1 = nn.Linear(d_model, d_ff, bias=False)
            self.w2 = nn.Linear(d_ff, d_model, bias=False)
            self.w3 = nn.Linear(d_model, d_ff, bias=False)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.w2(F.silu(self.w1(x)) * self.w3(x))


    class TransformerBlock(nn.Module):
        """Single transformer block with Amundson attention."""

        def __init__(self, config: BlackRoadLLMConfig):
            super().__init__()
            self.attn_norm = RMSNorm(config.d_model)
            self.attn = AmundsonCoherenceAttention(config)
            self.ff_norm = RMSNorm(config.d_model)
            self.ff = SwiGLU(config.d_model, config.d_ff)
            self.dropout = nn.Dropout(config.dropout)

        def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
            # Pre-norm residual connections (like LLaMA)
            x = x + self.dropout(self.attn(self.attn_norm(x), mask))
            x = x + self.dropout(self.ff(self.ff_norm(x)))
            return x


    # ═══════════════════════════════════════════════════════════════════════════
    # ROTARY POSITIONAL EMBEDDING (RoPE)
    # ═══════════════════════════════════════════════════════════════════════════

    def precompute_rope(dim: int, max_len: int, theta: float = 10000.0) -> Tuple[torch.Tensor, torch.Tensor]:
        """Precompute rotary positional embeddings."""
        freqs = 1.0 / (theta ** (torch.arange(0, dim, 2).float() / dim))
        t = torch.arange(max_len).float()
        freqs = torch.outer(t, freqs)
        return torch.cos(freqs), torch.sin(freqs)


    def apply_rope(x: torch.Tensor, cos: torch.Tensor, sin: torch.Tensor) -> torch.Tensor:
        """Apply rotary embeddings to input tensor."""
        d = x.shape[-1]
        x1, x2 = x[..., :d // 2], x[..., d // 2:]
        cos = cos[:x.shape[-2], :d // 2]
        sin = sin[:x.shape[-2], :d // 2]
        return torch.cat([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1)


    # ═══════════════════════════════════════════════════════════════════════════
    # THE BLACKROAD LLM
    # ═══════════════════════════════════════════════════════════════════════════

    class BlackRoadLLM(nn.Module):
        """BlackRoad's own language model.

        Architecture:
          - Token + positional embedding
          - N × TransformerBlock (Amundson coherence attention + SwiGLU FFN)
          - RMSNorm → linear head → logits

        Built from scratch. No dependencies on HuggingFace, OpenAI, or any
        external model framework. Pure PyTorch.
        """

        def __init__(self, config: BlackRoadLLMConfig):
            super().__init__()
            self.config = config

            # Embeddings
            self.token_emb = nn.Embedding(config.vocab_size, config.d_model)
            self.dropout = nn.Dropout(config.dropout)

            # Transformer blocks
            self.blocks = nn.ModuleList([
                TransformerBlock(config) for _ in range(config.n_layers)
            ])

            # Output
            self.norm = RMSNorm(config.d_model)
            self.head = nn.Linear(config.d_model, config.vocab_size, bias=False)

            # Weight tying (embedding = output projection)
            self.head.weight = self.token_emb.weight

            # RoPE
            cos, sin = precompute_rope(config.d_model // config.n_heads, config.max_seq_len)
            self.register_buffer('rope_cos', cos)
            self.register_buffer('rope_sin', sin)

            # Causal mask
            mask = torch.tril(torch.ones(config.max_seq_len, config.max_seq_len))
            self.register_buffer('causal_mask', mask)

            # Initialize weights
            self.apply(self._init_weights)

        def _init_weights(self, module):
            if isinstance(module, nn.Linear):
                torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
                if module.bias is not None:
                    torch.nn.init.zeros_(module.bias)
            elif isinstance(module, nn.Embedding):
                torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

        def forward(self, tokens: torch.Tensor) -> torch.Tensor:
            B, T = tokens.shape
            assert T <= self.config.max_seq_len, f"Sequence length {T} exceeds max {self.config.max_seq_len}"

            # Embed
            x = self.token_emb(tokens)
            x = self.dropout(x)

            # Causal mask for this sequence length
            mask = self.causal_mask[:T, :T].unsqueeze(0).unsqueeze(0)

            # Transformer blocks
            for block in self.blocks:
                x = block(x, mask)

            # Output logits
            x = self.norm(x)
            logits = self.head(x)
            return logits

        def count_params(self) -> int:
            return sum(p.numel() for p in self.parameters())

        def generate(self, tokens: torch.Tensor, max_new: int = 100, temperature: float = 0.8, top_k: int = 40) -> torch.Tensor:
            """Autoregressive generation."""
            self.eval()
            with torch.no_grad():
                for _ in range(max_new):
                    # Crop to max_seq_len
                    ctx = tokens[:, -self.config.max_seq_len:]
                    logits = self.forward(ctx)
                    logits = logits[:, -1, :] / temperature

                    # Top-k sampling
                    if top_k > 0:
                        values, _ = torch.topk(logits, top_k)
                        logits[logits < values[:, [-1]]] = float('-inf')

                    probs = F.softmax(logits, dim=-1)
                    next_token = torch.multinomial(probs, num_samples=1)
                    tokens = torch.cat([tokens, next_token], dim=1)

            return tokens


    # ═══════════════════════════════════════════════════════════════════════════
    # SIMPLE BPE TOKENIZER
    # ═══════════════════════════════════════════════════════════════════════════

    class SimpleTokenizer:
        """Byte-Pair Encoding tokenizer built from scratch."""

        def __init__(self, vocab_size: int = 8192):
            self.vocab_size = vocab_size
            self.merges = {}
            self.vocab = {i: bytes([i]) for i in range(256)}  # Start with byte-level
            self.encode_cache = {}

        def train(self, texts: List[str], target_vocab_size: Optional[int] = None):
            """Train BPE on a corpus."""
            target = target_vocab_size or self.vocab_size

            # Convert all text to bytes
            tokens_list = [list(text.encode('utf-8')) for text in texts]

            next_id = 256
            while next_id < target:
                # Count all adjacent pairs
                pair_counts = {}
                for tokens in tokens_list:
                    for i in range(len(tokens) - 1):
                        pair = (tokens[i], tokens[i + 1])
                        pair_counts[pair] = pair_counts.get(pair, 0) + 1

                if not pair_counts:
                    break

                # Most frequent pair
                best_pair = max(pair_counts, key=pair_counts.get)
                if pair_counts[best_pair] < 2:
                    break

                # Merge
                self.merges[best_pair] = next_id
                self.vocab[next_id] = self.vocab[best_pair[0]] + self.vocab[best_pair[1]]

                # Apply merge to all token lists
                new_tokens_list = []
                for tokens in tokens_list:
                    new_tokens = []
                    i = 0
                    while i < len(tokens):
                        if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
                            new_tokens.append(next_id)
                            i += 2
                        else:
                            new_tokens.append(tokens[i])
                            i += 1
                    new_tokens_list.append(new_tokens)
                tokens_list = new_tokens_list

                next_id += 1

                if next_id % 500 == 0:
                    print(f"  BPE: {next_id}/{target} merges")

            print(f"  BPE training complete: {next_id} tokens")

        def encode(self, text: str) -> List[int]:
            """Encode text to token IDs."""
            tokens = list(text.encode('utf-8'))

            while True:
                best_pair = None
                best_idx = None
                lowest_merge = float('inf')

                for i in range(len(tokens) - 1):
                    pair = (tokens[i], tokens[i + 1])
                    if pair in self.merges and self.merges[pair] < lowest_merge:
                        best_pair = pair
                        best_idx = i
                        lowest_merge = self.merges[pair]

                if best_pair is None:
                    break

                new_tokens = tokens[:best_idx] + [self.merges[best_pair]] + tokens[best_idx + 2:]
                tokens = new_tokens

            return tokens

        def decode(self, tokens: List[int]) -> str:
            """Decode token IDs to text."""
            byte_arr = b''.join(self.vocab.get(t, b'?') for t in tokens)
            return byte_arr.decode('utf-8', errors='replace')

        def save(self, path: str):
            """Save tokenizer to file."""
            import json
            data = {
                'merges': {f"{a},{b}": v for (a, b), v in self.merges.items()},
                'vocab_size': len(self.vocab),
            }
            with open(path, 'w') as f:
                json.dump(data, f)

        def load(self, path: str):
            """Load tokenizer from file."""
            import json
            with open(path) as f:
                data = json.load(f)
            self.merges = {(int(k.split(',')[0]), int(k.split(',')[1])): v
                           for k, v in data['merges'].items()}
            # Rebuild vocab from merges
            self.vocab = {i: bytes([i]) for i in range(256)}
            for (a, b), idx in sorted(self.merges.items(), key=lambda x: x[1]):
                self.vocab[idx] = self.vocab[a] + self.vocab[b]


    # ═══════════════════════════════════════════════════════════════════════════
    # TRAINING LOOP
    # ═══════════════════════════════════════════════════════════════════════════

    def train_model(
        model: BlackRoadLLM,
        train_data: torch.Tensor,
        config: BlackRoadLLMConfig,
        epochs: int = 10,
        device: str = 'cpu',
    ) -> List[float]:
        """Train the BlackRoad LLM.

        Args:
            model: The model to train
            train_data: Tokenized training data (1D tensor of token IDs)
            config: Model configuration
            epochs: Number of training epochs
            device: 'cpu', 'mps' (Mac), or 'cuda'

        Returns:
            List of loss values per step
        """
        model = model.to(device)
        model.train()

        optimizer = torch.optim.AdamW(
            model.parameters(),
            lr=config.learning_rate,
            weight_decay=0.01,
            betas=(0.9, 0.95),
        )

        # Create batches
        seq_len = config.max_seq_len
        n_tokens = len(train_data)
        losses = []

        for epoch in range(epochs):
            epoch_loss = 0
            n_batches = 0

            # Shuffle starting positions
            indices = torch.randperm(n_tokens - seq_len - 1)

            for i in range(0, len(indices), config.batch_size):
                batch_indices = indices[i:i + config.batch_size]
                if len(batch_indices) < config.batch_size:
                    continue

                # Build batch
                x = torch.stack([train_data[idx:idx + seq_len] for idx in batch_indices]).to(device)
                y = torch.stack([train_data[idx + 1:idx + seq_len + 1] for idx in batch_indices]).to(device)

                # Forward
                logits = model(x)
                loss = F.cross_entropy(logits.view(-1, config.vocab_size), y.view(-1))

                # Backward
                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()

                epoch_loss += loss.item()
                n_batches += 1
                losses.append(loss.item())

            avg_loss = epoch_loss / max(n_batches, 1)
            print(f"  Epoch {epoch + 1}/{epochs} — loss: {avg_loss:.4f} ({n_batches} batches)")

        return losses


# ═══════════════════════════════════════════════════════════════════════════════
# NUMPY-ONLY FALLBACK (for Pis without torch)
# ═══════════════════════════════════════════════════════════════════════════════

if not HAS_TORCH and np is not None:

    class BlackRoadLLMNumpy:
        """Minimal LLM implementation using only NumPy — for inference on any Pi."""

        def __init__(self, config: BlackRoadLLMConfig):
            self.config = config
            self.d = config.d_model
            self.h = config.n_heads
            self.dh = config.d_model // config.n_heads

            # Random init (will be loaded from trained weights)
            self.token_emb = np.random.randn(config.vocab_size, config.d_model).astype(np.float32) * 0.02
            self.layers = []
            for _ in range(config.n_layers):
                layer = {
                    'q': np.random.randn(config.d_model, config.d_model).astype(np.float32) * 0.02,
                    'k': np.random.randn(config.d_model, config.d_model).astype(np.float32) * 0.02,
                    'v': np.random.randn(config.d_model, config.d_model).astype(np.float32) * 0.02,
                    'o': np.random.randn(config.d_model, config.d_model).astype(np.float32) * 0.02,
                    'w1': np.random.randn(config.d_model, config.d_ff).astype(np.float32) * 0.02,
                    'w2': np.random.randn(config.d_ff, config.d_model).astype(np.float32) * 0.02,
                    'phase': np.random.randn(config.d_model, config.n_heads).astype(np.float32) * 0.02,
                }
                self.layers.append(layer)
            self.head = self.token_emb  # weight tying

        def forward(self, tokens: List[int]) -> np.ndarray:
            """Forward pass — returns logits."""
            x = self.token_emb[tokens]  # (T, D)
            T = len(tokens)

            for layer in self.layers:
                # Attention
                q = x @ layer['q']
                k = x @ layer['k']
                v = x @ layer['v']

                scores = (q @ k.T) / math.sqrt(self.dh)

                # Amundson coherence
                phases = x @ layer['phase']  # (T, n_heads)
                for h in range(self.h):
                    ph = phases[:, h]
                    diff = ph[:, None] - ph[None, :]
                    coherence = np.cos(diff)
                    scores += 0.1 * coherence

                # Causal mask
                mask = np.tril(np.ones((T, T)))
                scores = np.where(mask, scores, -1e9)

                # Softmax
                scores_max = scores.max(axis=-1, keepdims=True)
                exp_scores = np.exp(scores - scores_max)
                attn = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

                out = attn @ v
                x = x + out @ layer['o']

                # FFN (SwiGLU simplified)
                h1 = x @ layer['w1']
                h1 = h1 * (1 / (1 + np.exp(-h1)))  # SiLU
                x = x + h1 @ layer['w2']

            logits = x @ self.head.T
            return logits

        def generate(self, tokens: List[int], max_new: int = 50, temperature: float = 0.8) -> List[int]:
            """Autoregressive generation."""
            for _ in range(max_new):
                ctx = tokens[-self.config.max_seq_len:]
                logits = self.forward(ctx)[-1] / temperature

                # Softmax
                exp_logits = np.exp(logits - logits.max())
                probs = exp_logits / exp_logits.sum()

                # Sample
                next_token = np.random.choice(len(probs), p=probs)
                tokens.append(int(next_token))

            return tokens


# ═══════════════════════════════════════════════════════════════════════════════
# QUICK TEST
# ═══════════════════════════════════════════════════════════════════════════════

def test_architecture():
    """Quick smoke test of the architecture."""
    config = BlackRoadLLMConfig.tiny()
    print(f"Config: d_model={config.d_model}, heads={config.n_heads}, layers={config.n_layers}")

    if HAS_TORCH:
        model = BlackRoadLLM(config)
        params = model.count_params()
        print(f"BlackRoadLLM (torch): {params:,} parameters")

        # Test forward pass
        tokens = torch.randint(0, config.vocab_size, (1, 32))
        logits = model(tokens)
        print(f"Forward pass: input={tokens.shape} → logits={logits.shape}")

        # Test generation
        prompt = torch.randint(0, config.vocab_size, (1, 5))
        generated = model.generate(prompt, max_new=10)
        print(f"Generation: {prompt.shape} → {generated.shape}")

        print("PyTorch tests PASSED")

    elif np is not None:
        model = BlackRoadLLMNumpy(config)
        print(f"BlackRoadLLM (numpy): d_model={config.d_model}")

        tokens = list(range(32))
        logits = model.forward(tokens)
        print(f"Forward pass: input={len(tokens)} → logits={logits.shape}")

        generated = model.generate(list(range(5)), max_new=10)
        print(f"Generation: 5 → {len(generated)} tokens")

        print("NumPy tests PASSED")

    else:
        print("Neither torch nor numpy available — cannot test")

    return True


if __name__ == '__main__':
    test_architecture()
