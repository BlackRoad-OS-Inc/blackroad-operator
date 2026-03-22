#!/usr/bin/env python3
"""
Experiment 005: Agent Memory Pattern Analysis
BlackRoad Labs Research — Analyzes world artifact patterns and agent memory structure

Dependencies: httpx, collections (stdlib)
"""

import httpx, json, re
from collections import Counter, defaultdict
from datetime import datetime

WORLDS_API = "https://worlds.blackroad.io/"
DASHBOARD_API = "https://dashboard-api.blackroad.io/"

# ── Fetch Data ──────────────────────────────────────────────────────────────

def fetch_worlds(limit=100):
    r = httpx.get(f"{WORLDS_API}?limit={limit}", timeout=15)
    r.raise_for_status()
    return r.json()

def fetch_dashboard():
    r = httpx.get(DASHBOARD_API, timeout=15)
    r.raise_for_status()
    return r.json()

# ── Analysis Functions ───────────────────────────────────────────────────────

def analyze_temporal_patterns(worlds):
    """Find hourly generation rates"""
    hour_counts = Counter()
    for w in worlds:
        hour = w["timestamp"][11:13]
        hour_counts[hour] += 1
    return dict(sorted(hour_counts.items()))

def analyze_type_distribution(worlds):
    """World/lore/code type ratios"""
    return dict(Counter(w["type"] for w in worlds))

def analyze_node_productivity(worlds):
    """Per-node generation rates"""
    node_type = defaultdict(lambda: Counter())
    for w in worlds:
        node_type[w["node"]][w["type"]] += 1
    return {node: dict(counts) for node, counts in node_type.items()}

def compute_entropy(counts):
    """Shannon entropy of distribution"""
    import math
    total = sum(counts.values())
    return -sum((c/total) * math.log2(c/total) for c in counts.values() if c > 0)

def extract_vocabulary(worlds):
    """Most frequent words in world titles"""
    words = []
    for w in worlds:
        words.extend(re.findall(rw+, w["title"].lower()))
    stopwords = {"a", "the", "of", "in", "to", "and", "is", "that"}
    filtered = [w for w in words if w not in stopwords and len(w) > 2]
    return Counter(filtered).most_common(20)

def knowledge_graph(worlds):
    """Build simple co-occurrence graph from titles"""
    graph = defaultdict(set)
    for w in worlds:
        tokens = [t.lower() for t in re.findall(r"\w+", w["title"]) if len(t) > 3]
        for i, t1 in enumerate(tokens):
            for t2 in tokens[i+1:]:
                graph[t1].add(t2)
                graph[t2].add(t1)
    return {k: list(v) for k, v in graph.items() if len(v) >= 2}

# ── Report ────────────────────────────────────────────────────────────────

def bar_chart(data, width=40):
    if not data: return ""
    max_val = max(data.values())
    lines = []
    for k, v in sorted(data.items(), key=lambda x: -x[1]):
        bar_len = int(v / max_val * width) if max_val > 0 else 0
        lines.append(f"  {k:<15} {█ * bar_len} {v}")
    return "\n".join(lines)

def run():
    print("=" * 60)
    print("EXP-005: Agent Memory Pattern Analysis")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print("=" * 60)

    data = fetch_worlds(100)
    worlds = data["worlds"]
    total = data["total"]
    print(f"\nDataset: {total} total world artifacts ({len(worlds)} analyzed)\n")

    # Type distribution
    types = analyze_type_distribution(worlds)
    type_entropy = compute_entropy(types)
    print("── Type Distribution ──────────────────────────────────")
    print(bar_chart(types))
    print(f"  Shannon Entropy: {type_entropy:.3f} bits")

    # Node productivity
    print("\n── Node Productivity ──────────────────────────────────")
    node_prod = analyze_node_productivity(worlds)
    for node, counts in node_prod.items():
        total_node = sum(counts.values())
        print(f"  {node}: {total_node} artifacts — {counts}")

    # Temporal patterns
    print("\n── Hourly Generation Pattern ──────────────────────────")
    hourly = analyze_temporal_patterns(worlds)
    print(bar_chart(hourly, width=20))

    # Vocabulary
    print("\n── Memory Vocabulary (top 20 tokens) ─────────────────")
    vocab = extract_vocabulary(worlds)
    for word, count in vocab[:10]:
        print(f"  {word:<20} {count}")

    # Knowledge graph
    print("\n── Knowledge Graph (co-occurrences) ───────────────────")
    kg = knowledge_graph(worlds)
    for k, v in list(kg.items())[:10]:
        print(f"  {k} → {", ".join(list(v)[:5])}")

    print("\n✅ Experiment 005 complete")

if __name__ == "__main__":
    run()

