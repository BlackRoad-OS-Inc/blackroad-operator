#!/usr/bin/env python3
"""
BlackRoad Threshold Memory Benchmark
Runs on CPU baseline, optionally on Hailo-8 NPU if available.

O.O.O.O.B.L.A.C.K.R.O.A.D.O.S.I.N.C.D.O.T.C.O.M.M.U.N.I.C.A.T.I.O.N
34 positions — threshold cascade: if position fires, zeros propagate downstream.
"""

import time
import numpy as np
import struct

# ─── Threshold chain ────────────────────────────────────────────────
CHAIN = "O.O.O.O.B.L.A.C.K.R.O.A.D.O.S.I.N.C.D.O.T.C.O.M.M.U.N.I.C.A.T.I.O.N"
POSITIONS = CHAIN.split(".")
NUM_POSITIONS = len(POSITIONS)  # 34

# Device mapping (same as hybrid-memory.js)
DEVICE_MAP = {
    "O": "octavia", "B": "blackroad", "L": "lucidia", "A": "alice",
    "C": "cecilia", "K": "kodex",     "R": "roadcode", "D": "drive",
    "S": "stripe",  "I": "infra",     "N": "network",  "T": "tunnel",
    "M": "memory",  "U": "unity",
}

# ─── 12 memory layers ───────────────────────────────────────────────
LAYERS = [
    (2,    "Register", "binary"),
    (4,    "Cache",    "binary"),
    (8,    "Heap",     "binary"),
    (16,   "Stack",    "binary"),
    (32,   "Soul",     "balanced"),
    (64,   "Aura",     "trinary"),
    (128,  "Witness",  "trinary"),
    (256,  "Chain",    "hybrid"),
    (512,  "Pixel",    "hybrid"),
    (1024, "Volume",   "trinary"),
    (2048, "Archive",  "trinary"),
    (4096, "Dream",    "balanced"),
]


def fire_threshold_scalar(state, position):
    """Fire threshold at position, cascade zeros downstream."""
    state = list(state)
    state[position] = 1
    for i in range(position + 1, NUM_POSITIONS):
        state[i] = 0
    return state


def threshold_to_layer(state):
    """Map fired count to memory layer index."""
    fired = sum(state)
    idx = min(fired, len(LAYERS) - 1)
    return idx


# ─── Vectorized (NumPy) ─────────────────────────────────────────────
def bench_numpy(iterations):
    """Batch threshold ops using NumPy arrays."""
    # Create batch of random states
    states = np.random.randint(0, 2, size=(iterations, NUM_POSITIONS), dtype=np.uint8)
    positions = np.random.randint(0, NUM_POSITIONS, size=iterations)

    t0 = time.perf_counter()

    # Fire thresholds vectorized
    for i in range(iterations):
        p = positions[i]
        states[i, p] = 1
        states[i, p+1:] = 0

    dt = time.perf_counter() - t0
    ops_per_sec = iterations / dt
    return dt, ops_per_sec


def bench_numpy_batch(iterations):
    """Fully vectorized batch — no Python loop."""
    states = np.random.randint(0, 2, size=(iterations, NUM_POSITIONS), dtype=np.uint8)
    positions = np.random.randint(0, NUM_POSITIONS, size=iterations)

    t0 = time.perf_counter()

    # Build mask: for each row, cols > position get zeroed
    cols = np.arange(NUM_POSITIONS)
    mask = cols[None, :] > positions[:, None]  # (iterations, 34)

    # Fire: set position col to 1
    rows = np.arange(iterations)
    states[rows, positions] = 1

    # Cascade: zero everything after
    states[mask] = 0

    dt = time.perf_counter() - t0
    ops_per_sec = iterations / dt
    return dt, ops_per_sec


def bench_layer_routing(iterations):
    """Route to memory layer based on fired count."""
    states = np.random.randint(0, 2, size=(iterations, NUM_POSITIONS), dtype=np.uint8)

    t0 = time.perf_counter()

    fired_counts = states.sum(axis=1)
    layer_indices = np.minimum(fired_counts, len(LAYERS) - 1)

    dt = time.perf_counter() - t0
    ops_per_sec = iterations / dt
    return dt, ops_per_sec, layer_indices


def bench_decision_routing(iterations):
    """Three-state decision: YES(1)→binary, NO(-1)→balanced, MACHINE(0)→trinary."""
    decisions = np.random.choice([-1, 0, 1], size=iterations)
    states = np.random.randint(0, 2, size=(iterations, NUM_POSITIONS), dtype=np.uint8)

    t0 = time.perf_counter()

    fired_counts = states.sum(axis=1)
    layer_indices = np.minimum(fired_counts, len(LAYERS) - 1)

    # Decision routing
    # YES (1) → force binary layers (0-3)
    # NO (-1) → force balanced layers (4 or 11)
    # MACHINE (0) → use trinary layers (5-6, 9-10)
    yes_mask = decisions == 1
    no_mask = decisions == -1
    machine_mask = decisions == 0

    routed = layer_indices.copy()
    routed[yes_mask] = np.minimum(layer_indices[yes_mask], 3)
    routed[no_mask] = np.where(layer_indices[no_mask] > 6, 11, 4)
    routed[machine_mask] = np.clip(layer_indices[machine_mask], 5, 10)

    dt = time.perf_counter() - t0
    ops_per_sec = iterations / dt
    return dt, ops_per_sec


def bench_bitfield_insane(iterations):
    """Insane mode: pack 34 positions into uint64 bitfield."""
    t0 = time.perf_counter()

    # Pack states as uint64
    states = np.random.randint(0, 2**34, size=iterations, dtype=np.uint64)
    positions = np.random.randint(0, NUM_POSITIONS, size=iterations, dtype=np.uint64)

    # Fire: set bit at position, clear all bits above
    fire_mask = (np.uint64(1) << positions)
    clear_mask = fire_mask - np.uint64(1)  # bits below position
    states = (states & clear_mask) | fire_mask

    # Count bits (layer routing)
    # NumPy doesn't have popcount, use a trick
    counts = np.zeros(iterations, dtype=np.uint64)
    tmp = states.copy()
    while np.any(tmp > 0):
        counts += tmp & np.uint64(1)
        tmp >>= np.uint64(1)

    dt = time.perf_counter() - t0
    ops_per_sec = iterations / dt
    return dt, ops_per_sec


def bench_dns_baseline(iterations):
    """Simulate DNS hashmap lookup for comparison."""
    # Build a dict of 1000 domains
    domains = {f"node{i}.blackroad.systems": f"192.168.4.{i}" for i in range(1000)}
    keys = list(domains.keys())

    indices = np.random.randint(0, len(keys), size=iterations)

    t0 = time.perf_counter()
    for i in range(iterations):
        _ = domains[keys[indices[i]]]
    dt = time.perf_counter() - t0

    ops_per_sec = iterations / dt
    return dt, ops_per_sec


# ─── Hailo-8 benchmark (if available) ───────────────────────────────
def try_hailo_benchmark(iterations):
    """Attempt to run threshold ops on Hailo-8 NPU."""
    try:
        from hailo_platform import HailoDevice
        device = HailoDevice()
        info = device.get_info()
        print(f"\n{'='*60}")
        print(f"  HAILO-8 DETECTED: {info.device_id}")
        print(f"  Architecture: {info.device_architecture}")
        print(f"  FW version: {info.firmware_version}")
        print(f"{'='*60}")

        # The Hailo-8 runs HEF (compiled neural network) models
        # For threshold ops, we'd need to compile a tiny model
        # For now, measure raw data transfer throughput
        print("  Hailo-8 raw transfer benchmark coming soon")
        print("  (Need to compile threshold cascade as HEF model)")
        return True
    except ImportError:
        print("\n  [hailo] hailort Python bindings not available on this host")
        return False
    except Exception as e:
        print(f"\n  [hailo] Device not ready: {e}")
        return False


# ─── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    PINK = "\033[38;5;205m"
    AMBER = "\033[38;5;214m"
    GREEN = "\033[38;5;82m"
    BLUE = "\033[38;5;69m"
    RESET = "\033[0m"

    print(f"\n{PINK}{'='*60}")
    print(f"  BlackRoad Threshold Memory Benchmark")
    print(f"  Chain: {CHAIN}")
    print(f"  Positions: {NUM_POSITIONS}")
    print(f"{'='*60}{RESET}\n")

    N = 1_000_000
    N_DNS = 1_000_000

    results = []

    # 1. NumPy loop
    print(f"{AMBER}[1/6] NumPy threshold fire (loop)...{RESET}")
    dt, ops = bench_numpy(N)
    results.append(("NumPy loop", ops))
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms for {N:,} ops)\n")

    # 2. NumPy fully vectorized
    print(f"{AMBER}[2/6] NumPy threshold fire (vectorized)...{RESET}")
    dt, ops = bench_numpy_batch(N)
    results.append(("NumPy vectorized", ops))
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms for {N:,} ops)\n")

    # 3. Layer routing
    print(f"{AMBER}[3/6] Layer routing (fired → layer)...{RESET}")
    dt, ops, layers = bench_layer_routing(N)
    results.append(("Layer routing", ops))
    # Show layer distribution
    unique, counts = np.unique(layers, return_counts=True)
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms)")
    for u, c in zip(unique, counts):
        pct = c / N * 100
        bar = "█" * int(pct / 2)
        print(f"    L{u:2d} {LAYERS[u][1]:10s} {pct:5.1f}% {bar}")
    print()

    # 4. Decision routing
    print(f"{AMBER}[4/6] Decision routing (YES/NO/MACHINE)...{RESET}")
    dt, ops = bench_decision_routing(N)
    results.append(("Decision routing", ops))
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms)\n")

    # 5. Bitfield insane mode
    print(f"{AMBER}[5/6] Bitfield insane mode (uint64)...{RESET}")
    dt, ops = bench_bitfield_insane(N)
    results.append(("Bitfield insane", ops))
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms)\n")

    # 6. DNS baseline
    print(f"{AMBER}[6/6] DNS hashmap baseline...{RESET}")
    dt, ops = bench_dns_baseline(N_DNS)
    results.append(("DNS hashmap", ops))
    print(f"  {GREEN}{ops/1e6:.1f}M ops/s{RESET}  ({dt*1000:.1f}ms)\n")

    # Summary
    dns_ops = results[-1][1]
    print(f"{PINK}{'─'*60}")
    print(f"  RESULTS SUMMARY")
    print(f"{'─'*60}{RESET}")
    print(f"  {'Method':<22s} {'Ops/s':>12s}  {'vs DNS':>8s}")
    print(f"  {'─'*46}")
    for name, ops in results:
        ratio = ops / dns_ops
        color = GREEN if ratio >= 1.0 else PINK
        print(f"  {name:<22s} {color}{ops/1e6:>9.1f}M{RESET}  {ratio:>7.1f}×")
    print()

    # Try Hailo
    try_hailo_benchmark(N)

    print(f"\n{PINK}Done.{RESET}\n")
