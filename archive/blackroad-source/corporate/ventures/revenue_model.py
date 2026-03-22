#!/usr/bin/env python3
"""
BlackRoad OS — Revenue Model & Analytics
Forecasts ARR, agent fleet economics, and product metrics.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import NamedTuple
import math

# ── Pricing Tiers ─────────────────────────────────────────────────────────────

@dataclass
class Tier:
    name: str
    monthly_usd: float
    agents: int
    memory_gb: float
    overage_per_agent: float = 0.01

TIERS = [
    Tier("Starter",    29,   10,   1.0),
    Tier("Growth",    149,  100,   5.0),
    Tier("Pro",       499,  500,  20.0),
    Tier("Enterprise", 0,  30_000, 135.0),  # custom pricing
]

# ── Unit Economics ─────────────────────────────────────────────────────────────

GPU_COST_PER_HOUR = 2.50        # A100 on Railway
TOKENS_PER_DOLLAR = 1_000_000   # ~$1/1M tokens (Ollama local ≈ free)
AVG_TOKENS_PER_SESSION = 4_000

def compute_unit_economics(
    monthly_active_users: int,
    avg_tier: Tier,
    local_inference_ratio: float = 0.70,  # 70% of traffic uses local Ollama
) -> dict:
    mrr = monthly_active_users * avg_tier.monthly_usd
    arr = mrr * 12

    # Compute costs
    cloud_sessions = monthly_active_users * 30 * (1 - local_inference_ratio)
    cloud_token_cost = (cloud_sessions * AVG_TOKENS_PER_SESSION / TOKENS_PER_DOLLAR) * 10  # ~$10/1M
    infra_cost = monthly_active_users * 0.50  # $0.50/user/month base infra

    gross_margin = (mrr - cloud_token_cost - infra_cost) / mrr * 100 if mrr > 0 else 0

    return {
        "mrr": round(mrr, 2),
        "arr": round(arr, 2),
        "gross_margin_pct": round(gross_margin, 1),
        "cloud_token_cost": round(cloud_token_cost, 2),
        "infra_cost": round(infra_cost, 2),
        "net_revenue": round(mrr - cloud_token_cost - infra_cost, 2),
    }

# ── Growth Model ──────────────────────────────────────────────────────────────

class GrowthSnapshot(NamedTuple):
    month: int
    mau: int
    mrr: float
    arr: float
    margin: float

def project_growth(
    initial_mau: int = 50,
    monthly_growth_rate: float = 0.15,  # 15% MoM
    months: int = 24,
    avg_tier: Tier = TIERS[1],
) -> list[GrowthSnapshot]:
    snapshots = []
    mau = initial_mau
    for m in range(1, months + 1):
        economics = compute_unit_economics(mau, avg_tier)
        snapshots.append(GrowthSnapshot(
            month=m,
            mau=mau,
            mrr=economics["mrr"],
            arr=economics["arr"],
            margin=economics["gross_margin_pct"],
        ))
        mau = int(mau * (1 + monthly_growth_rate))
    return snapshots

# ── Report ────────────────────────────────────────────────────────────────────

def print_report() -> None:
    print("=" * 60)
    print("  BlackRoad OS — Revenue Projection (24-Month)")
    print("=" * 60)
    snapshots = project_growth()

    print(f"\n{'Month':>5} | {'MAU':>8} | {'MRR':>12} | {'ARR':>14} | {'Margin':>7}")
    print("-" * 60)
    for s in snapshots:
        if s.month in (1, 3, 6, 12, 18, 24):
            print(f"  M{s.month:>2}  | {s.mau:>8,} | ${s.mrr:>11,.0f} | ${s.arr:>13,.0f} | {s.margin:>6.1f}%")

    final = snapshots[-1]
    print(f"\n  24-Month ARR Target: ${final.arr:,.0f}")
    print(f"  24-Month MAU Target: {final.mau:,}")
    print(f"  Gross Margin:        {final.margin:.1f}%")

    # Agent fleet economics
    print("\n--- Agent Fleet Economics ---")
    for tier in TIERS[:3]:
        fleet_cost = tier.agents * GPU_COST_PER_HOUR * 24 * 30 / 1000  # fractional GPU
        print(f"  {tier.name}: {tier.agents} agents @ ${tier.monthly_usd}/mo (infra ~${fleet_cost:.0f}/mo)")

if __name__ == "__main__":
    print_report()
