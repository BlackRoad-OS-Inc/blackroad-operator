#!/usr/bin/env python3
"""
BlackRoad LLM v4 — Train 8M param transformer on corpus v4 (5.8MB)
Uses word-level tokenizer (fast) + MPS acceleration on Mac
"""
import torch
import torch.nn as nn
import torch.optim as optim
import time
import os
import math
from collections import Counter

CORPUS_PATH = os.path.expanduser("~/.blackroad/training-corpus-v4.txt")
MODEL_PATH = os.path.expanduser("~/.blackroad/blackroad-llm-8m.pt")
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

# Model config — ~8M params
VOCAB_SIZE = 16000
DIM = 256
NUM_LAYERS = 6
NUM_HEADS = 8
SEQ_LEN = 128
BATCH_SIZE = 16
EPOCHS = 3
LR = 3e-4

print(f"BlackRoad LLM v4 Training")
print(f"Device: {DEVICE} | Params: ~8M | Corpus: v4")
print(f"Config: dim={DIM}, layers={NUM_LAYERS}, heads={NUM_HEADS}, vocab={VOCAB_SIZE}")
print("=" * 60)

# ============================================================================
# WORD-LEVEL TOKENIZER (fast — no BPE bottleneck)
# ============================================================================

print("Loading corpus...")
with open(CORPUS_PATH, 'r', encoding='utf-8') as f:
    text = f.read()
print(f"  Corpus: {len(text):,} chars, {len(text.split()):,} words")

# Build vocabulary from word frequencies
words = text.lower().split()
word_counts = Counter(words)
vocab_words = [w for w, _ in word_counts.most_common(VOCAB_SIZE - 3)]

word2id = {"<PAD>": 0, "<UNK>": 1, "<EOS>": 2}
for i, w in enumerate(vocab_words, start=3):
    word2id[w] = i
id2word = {v: k for k, v in word2id.items()}
actual_vocab = len(word2id)
print(f"  Vocabulary: {actual_vocab:,} tokens")

# Encode entire corpus
print("Encoding corpus...")
token_ids = [word2id.get(w, 1) for w in words]
print(f"  Encoded: {len(token_ids):,} tokens")

# Create sequences
num_sequences = (len(token_ids) - 1) // SEQ_LEN
data = torch.tensor(token_ids[:num_sequences * SEQ_LEN + 1], dtype=torch.long)
print(f"  Sequences: {num_sequences:,} (len={SEQ_LEN})")
print()

# ============================================================================
# TRANSFORMER MODEL
# ============================================================================

class BlackRoadLLM(nn.Module):
    def __init__(self):
        super().__init__()
        self.embedding = nn.Embedding(actual_vocab, DIM)
        self.pos_embedding = nn.Embedding(SEQ_LEN, DIM)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=DIM,
            nhead=NUM_HEADS,
            dim_feedforward=DIM * 4,
            dropout=0.1,
            batch_first=True,
            norm_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=NUM_LAYERS)
        self.ln_f = nn.LayerNorm(DIM)
        self.head = nn.Linear(DIM, actual_vocab, bias=False)

        # Causal mask
        self.register_buffer(
            "causal_mask",
            torch.triu(torch.ones(SEQ_LEN, SEQ_LEN), diagonal=1).bool()
        )

    def forward(self, x):
        B, T = x.shape
        pos = torch.arange(T, device=x.device).unsqueeze(0)
        x = self.embedding(x) + self.pos_embedding(pos)
        x = self.transformer(x, mask=self.causal_mask[:T, :T])
        x = self.ln_f(x)
        return self.head(x)

model = BlackRoadLLM().to(DEVICE)
num_params = sum(p.numel() for p in model.parameters())
print(f"Model: {num_params:,} parameters ({num_params/1e6:.1f}M)")

optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS * (num_sequences // BATCH_SIZE))

# ============================================================================
# TRAINING LOOP
# ============================================================================

print(f"\nTraining {EPOCHS} epochs...")
start_time = time.time()

for epoch in range(EPOCHS):
    model.train()
    epoch_loss = 0
    num_batches = 0

    # Shuffle sequence order
    perm = torch.randperm(num_sequences)

    for i in range(0, num_sequences - BATCH_SIZE, BATCH_SIZE):
        batch_idx = perm[i:i + BATCH_SIZE]

        # Build batch
        inputs = torch.stack([data[idx * SEQ_LEN:(idx * SEQ_LEN) + SEQ_LEN] for idx in batch_idx]).to(DEVICE)
        targets = torch.stack([data[(idx * SEQ_LEN) + 1:(idx * SEQ_LEN) + SEQ_LEN + 1] for idx in batch_idx]).to(DEVICE)

        logits = model(inputs)
        loss = nn.functional.cross_entropy(logits.reshape(-1, actual_vocab), targets.reshape(-1), ignore_index=0)

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()

        epoch_loss += loss.item()
        num_batches += 1

        if num_batches % 100 == 0:
            avg_loss = epoch_loss / num_batches
            ppl = math.exp(min(avg_loss, 20))
            elapsed = time.time() - start_time
            print(f"  Epoch {epoch+1}/{EPOCHS} | Batch {num_batches} | Loss: {avg_loss:.4f} | PPL: {ppl:.1f} | Time: {elapsed:.0f}s")

    avg_loss = epoch_loss / max(num_batches, 1)
    ppl = math.exp(min(avg_loss, 20))
    elapsed = time.time() - start_time
    print(f"  Epoch {epoch+1} DONE — Loss: {avg_loss:.4f} | PPL: {ppl:.1f} | Time: {elapsed:.0f}s")
    print()

total_time = time.time() - start_time
print(f"Training complete in {total_time:.0f}s ({total_time/60:.1f} min)")

# ============================================================================
# SAVE
# ============================================================================

torch.save({
    'model_state_dict': model.state_dict(),
    'word2id': word2id,
    'id2word': id2word,
    'config': {
        'vocab_size': actual_vocab,
        'dim': DIM,
        'num_layers': NUM_LAYERS,
        'num_heads': NUM_HEADS,
        'seq_len': SEQ_LEN,
        'params': num_params,
        'corpus': 'v4',
        'corpus_size': len(text),
        'trained': time.strftime('%Y-%m-%dT%H:%M:%S'),
    }
}, MODEL_PATH)

print(f"Saved to {MODEL_PATH}")
size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
print(f"Model size: {size_mb:.1f}MB")

# ============================================================================
# QUICK TEST — generate a few tokens
# ============================================================================

print("\nTest generation:")
model.eval()
prompts = ["blackroad", "the mesh network", "agents collaborate"]
for prompt in prompts:
    tokens = [word2id.get(w, 1) for w in prompt.lower().split()]
    x = torch.tensor([tokens + [0] * (SEQ_LEN - len(tokens))], dtype=torch.long).to(DEVICE)

    with torch.no_grad():
        for _ in range(20):
            logits = model(x)
            next_token = logits[0, len(tokens) - 1].argmax().item()
            tokens.append(next_token)
            x = torch.tensor([tokens + [0] * (SEQ_LEN - len(tokens))], dtype=torch.long).to(DEVICE)

    output = ' '.join(id2word.get(t, '<UNK>') for t in tokens if t > 2)
    print(f"  '{prompt}' → {output[:100]}")

print("\nBlackRoad LLM v4 ready.")
