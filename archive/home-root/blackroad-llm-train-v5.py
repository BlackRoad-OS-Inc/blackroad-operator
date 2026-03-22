#!/usr/bin/env python3
"""
BlackRoad LLM v5 — Train 21M param transformer on corpus v5 (8.7MB)
Word-level tokenizer + MPS acceleration on Mac M1
Bigger model, bigger corpus, longer context
"""
import torch
import torch.nn as nn
import torch.optim as optim
import time
import os
import math
import json
from collections import Counter

CORPUS_PATH = os.path.expanduser("~/.blackroad/training-corpus-v5.txt")
MODEL_PATH = os.path.expanduser("~/.blackroad/blackroad-llm-21m.pt")
VOCAB_PATH = os.path.expanduser("~/.blackroad/vocab-v5.json")
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

# Model config — ~21M params (fits in M1 8GB with room)
VOCAB_SIZE = 20000
DIM = 384
NUM_LAYERS = 8
NUM_HEADS = 8
SEQ_LEN = 192
BATCH_SIZE = 12
EPOCHS = 5
LR = 2.5e-4
WARMUP_STEPS = 200

print(f"\033[38;5;205m╔══════════════════════════════════════════════╗\033[0m")
print(f"\033[38;5;205m║  BlackRoad LLM v5 Training                  ║\033[0m")
print(f"\033[38;5;205m╚══════════════════════════════════════════════╝\033[0m")
print(f"Device: {DEVICE} | Target: ~21M params | Corpus: v5")
print(f"Config: dim={DIM}, layers={NUM_LAYERS}, heads={NUM_HEADS}, vocab={VOCAB_SIZE}, seq={SEQ_LEN}")
print("=" * 60)

# ============================================================================
# TOKENIZER — word-level with subword fallback for unknown
# ============================================================================

print("Loading corpus...")
with open(CORPUS_PATH, 'r', encoding='utf-8') as f:
    text = f.read()
print(f"  Corpus: {len(text):,} chars, {len(text.split()):,} words")

# Clean: remove source markers, normalize whitespace
import re
text = re.sub(r'--- SOURCE:.*?---', '', text)
text = re.sub(r'\n{3,}', '\n\n', text)

words = text.lower().split()
word_counts = Counter(words)
vocab_words = [w for w, _ in word_counts.most_common(VOCAB_SIZE - 4)]

word2id = {"<PAD>": 0, "<UNK>": 1, "<EOS>": 2, "<BOS>": 3}
for i, w in enumerate(vocab_words, start=4):
    word2id[w] = i
id2word = {v: k for k, v in word2id.items()}
actual_vocab = len(word2id)
print(f"  Vocabulary: {actual_vocab:,} tokens")

# Save vocab
with open(VOCAB_PATH, 'w') as f:
    json.dump({'word2id': word2id, 'config': {
        'vocab_size': actual_vocab, 'dim': DIM, 'num_layers': NUM_LAYERS,
        'num_heads': NUM_HEADS, 'seq_len': SEQ_LEN
    }}, f)
print(f"  Vocab saved to {VOCAB_PATH}")

# Encode
print("Encoding corpus...")
token_ids = [word2id.get(w, 1) for w in words]
unk_count = sum(1 for t in token_ids if t == 1)
unk_pct = 100 * unk_count / len(token_ids)
print(f"  Encoded: {len(token_ids):,} tokens ({unk_pct:.1f}% UNK)")

num_sequences = (len(token_ids) - 1) // SEQ_LEN
data = torch.tensor(token_ids[:num_sequences * SEQ_LEN + 1], dtype=torch.long)
print(f"  Sequences: {num_sequences:,} (len={SEQ_LEN})")
print()

# ============================================================================
# MODEL — Transformer with pre-norm, SwiGLU FFN
# ============================================================================

class SwiGLU(nn.Module):
    def __init__(self, dim, hidden_dim):
        super().__init__()
        self.w1 = nn.Linear(dim, hidden_dim, bias=False)
        self.w2 = nn.Linear(hidden_dim, dim, bias=False)
        self.w3 = nn.Linear(dim, hidden_dim, bias=False)

    def forward(self, x):
        return self.w2(nn.functional.silu(self.w1(x)) * self.w3(x))


class TransformerBlock(nn.Module):
    def __init__(self, dim, num_heads):
        super().__init__()
        self.ln1 = nn.RMSNorm(dim)
        self.attn = nn.MultiheadAttention(dim, num_heads, dropout=0.05, batch_first=True)
        self.ln2 = nn.RMSNorm(dim)
        self.ffn = SwiGLU(dim, dim * 4)

    def forward(self, x, mask):
        h = self.ln1(x)
        h, _ = self.attn(h, h, h, attn_mask=mask, is_causal=True)
        x = x + h
        x = x + self.ffn(self.ln2(x))
        return x


class BlackRoadLLM(nn.Module):
    def __init__(self):
        super().__init__()
        self.tok_emb = nn.Embedding(actual_vocab, DIM)
        self.pos_emb = nn.Embedding(SEQ_LEN, DIM)
        self.drop = nn.Dropout(0.05)
        self.blocks = nn.ModuleList([TransformerBlock(DIM, NUM_HEADS) for _ in range(NUM_LAYERS)])
        self.ln_f = nn.RMSNorm(DIM)
        self.head = nn.Linear(DIM, actual_vocab, bias=False)
        # Weight tying
        self.head.weight = self.tok_emb.weight

    def forward(self, x):
        B, T = x.shape
        pos = torch.arange(T, device=x.device)
        x = self.drop(self.tok_emb(x) + self.pos_emb(pos))

        mask = nn.Transformer.generate_square_subsequent_mask(T, device=x.device)
        for block in self.blocks:
            x = block(x, mask)

        x = self.ln_f(x)
        return self.head(x)

    @torch.no_grad()
    def generate(self, prompt_ids, max_new=50, temperature=0.8, top_k=40):
        self.eval()
        tokens = list(prompt_ids)
        for _ in range(max_new):
            ctx = tokens[-SEQ_LEN:]
            x = torch.tensor([ctx], dtype=torch.long, device=DEVICE)
            logits = self(x)[0, -1] / temperature
            # Top-k sampling
            if top_k > 0:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[-1]] = float('-inf')
            probs = torch.softmax(logits, dim=-1)
            next_id = torch.multinomial(probs, 1).item()
            if next_id == 2:  # EOS
                break
            tokens.append(next_id)
        return tokens


model = BlackRoadLLM().to(DEVICE)
num_params = sum(p.numel() for p in model.parameters())
print(f"Model: {num_params:,} parameters ({num_params/1e6:.1f}M)")
print()

# ============================================================================
# TRAINING
# ============================================================================

optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=0.05, betas=(0.9, 0.95))
total_steps = EPOCHS * (num_sequences // BATCH_SIZE)

def get_lr(step):
    if step < WARMUP_STEPS:
        return LR * step / WARMUP_STEPS
    progress = (step - WARMUP_STEPS) / max(total_steps - WARMUP_STEPS, 1)
    return LR * 0.1 + 0.9 * LR * 0.5 * (1 + math.cos(math.pi * progress))

print(f"Training {EPOCHS} epochs ({total_steps:,} steps)...")
print(f"Warmup: {WARMUP_STEPS} steps | Total: {total_steps:,} steps")
print()

start_time = time.time()
global_step = 0
best_loss = float('inf')

for epoch in range(EPOCHS):
    model.train()
    epoch_loss = 0
    num_batches = 0
    perm = torch.randperm(num_sequences)

    for i in range(0, num_sequences - BATCH_SIZE, BATCH_SIZE):
        batch_idx = perm[i:i + BATCH_SIZE]

        inputs = torch.stack([data[idx * SEQ_LEN:(idx * SEQ_LEN) + SEQ_LEN] for idx in batch_idx]).to(DEVICE)
        targets = torch.stack([data[(idx * SEQ_LEN) + 1:(idx * SEQ_LEN) + SEQ_LEN + 1] for idx in batch_idx]).to(DEVICE)

        logits = model(inputs)
        loss = nn.functional.cross_entropy(logits.reshape(-1, actual_vocab), targets.reshape(-1), ignore_index=0)

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

        # LR schedule
        lr = get_lr(global_step)
        for pg in optimizer.param_groups:
            pg['lr'] = lr

        optimizer.step()

        epoch_loss += loss.item()
        num_batches += 1
        global_step += 1

        if num_batches % 50 == 0:
            avg = epoch_loss / num_batches
            ppl = math.exp(min(avg, 20))
            elapsed = time.time() - start_time
            tps = global_step * BATCH_SIZE * SEQ_LEN / elapsed
            print(f"  E{epoch+1} | B{num_batches:>4d} | Loss: {avg:.4f} | PPL: {ppl:.1f} | LR: {lr:.2e} | {tps:.0f} tok/s | {elapsed:.0f}s")

    avg_loss = epoch_loss / max(num_batches, 1)
    ppl = math.exp(min(avg_loss, 20))
    elapsed = time.time() - start_time
    print(f"\n  Epoch {epoch+1} DONE — Loss: {avg_loss:.4f} | PPL: {ppl:.1f} | Time: {elapsed:.0f}s")

    # Save best
    if avg_loss < best_loss:
        best_loss = avg_loss
        torch.save({
            'model_state_dict': model.state_dict(),
            'word2id': word2id,
            'id2word': id2word,
            'config': {
                'vocab_size': actual_vocab, 'dim': DIM, 'num_layers': NUM_LAYERS,
                'num_heads': NUM_HEADS, 'seq_len': SEQ_LEN, 'params': num_params,
                'corpus': 'v5', 'corpus_size': len(text), 'corpus_words': len(words),
                'best_loss': best_loss, 'epoch': epoch + 1,
                'trained': time.strftime('%Y-%m-%dT%H:%M:%S'),
            }
        }, MODEL_PATH)
        print(f"  Saved best model (loss={best_loss:.4f})")

    # Generate sample
    print(f"\n  Sample generations:")
    for prompt in ["blackroad os", "the amundson framework", "agents collaborate through", "pave tomorrow"]:
        tokens = [word2id.get(w, 1) for w in prompt.split()]
        out = model.generate(tokens, max_new=30, temperature=0.8)
        text_out = ' '.join(id2word.get(t, '?') for t in out if t > 3)
        print(f"    '{prompt}' → {text_out[:120]}")
    print()

total_time = time.time() - start_time
print(f"\n{'='*60}")
print(f"Training complete in {total_time:.0f}s ({total_time/60:.1f} min)")
print(f"Best loss: {best_loss:.4f} | PPL: {math.exp(min(best_loss, 20)):.1f}")
size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
print(f"Model saved: {MODEL_PATH} ({size_mb:.1f}MB)")
print(f"\033[38;5;205mBlackRoad LLM v5 — {num_params/1e6:.1f}M params — Pave Tomorrow.\033[0m")
