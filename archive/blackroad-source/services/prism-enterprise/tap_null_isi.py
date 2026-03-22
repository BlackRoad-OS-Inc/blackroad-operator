#!/usr/bin/env python
# coding: utf-8

"""
Tap-Null ISI Analysis

Generates Tap-Null vs Base ISI charts from shipped CSVs.
Reads:
  data/raw/Tap-Null_Pulse_ISI_Results.csv
  data/raw/4-ary_vs_8-ary__ISI_with_without_tap-null.csv
Writes PNGs to figures/.
"""
import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

os.makedirs("figures", exist_ok=True)

def create_barplot(df, title, output_file, ylabel="ISI MSE"):
    """Create and save a bar plot comparison."""
    fig, ax = plt.subplots(figsize=(10, 5))
    df.plot(kind="bar", ax=ax, width=0.8)
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.legend(loc='best')
    ax.grid(True, alpha=0.3, axis='y')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(output_file, dpi=150)
    plt.close()
    print(f"wrote {output_file}")

def compute_improvement(df, base_col='base', tap_col='tap_null'):
    """Compute percentage improvement from tap-null over base."""
    if base_col in df.columns and tap_col in df.columns:
        improvement = ((df[base_col] - df[tap_col]) / df[base_col]) * 100
        df['improvement_%'] = improvement
    return df

# Tap-Null vs Base (all codes)
if Path("data/raw/Tap-Null_Pulse_ISI_Results.csv").exists():
    df1 = pd.read_csv("data/raw/Tap-Null_Pulse_ISI_Results.csv")
    df1_indexed = df1.set_index("label")[["base", "tap_null"]]

    create_barplot(
        df1_indexed,
        "Tap-Null vs Base (all codes)",
        "figures/tap_null_vs_base.png"
    )

    df1_with_improvement = compute_improvement(df1.set_index("label"))
    if 'improvement_%' in df1_with_improvement.columns:
        print(f"\nAverage improvement: {df1_with_improvement['improvement_%'].mean():.2f}%")

# 4-ary vs 8-ary comparison
if Path("data/raw/4-ary_vs_8-ary__ISI_with_without_tap-null.csv").exists():
    df2 = pd.read_csv("data/raw/4-ary_vs_8-ary__ISI_with_without_tap-null.csv")
    df2_indexed = df2.set_index("code")[["base", "tap_null"]]

    create_barplot(
        df2_indexed,
        "4-ary vs 8-ary (Tap-Null)",
        "figures/4ary_8ary_tapnull.png"
    )

    df2_with_improvement = compute_improvement(df2.set_index("code"))
    if 'improvement_%' in df2_with_improvement.columns:
        fig, ax = plt.subplots(figsize=(8, 5))
        df2_with_improvement['improvement_%'].plot(kind='bar', ax=ax, color='green', alpha=0.7)
        ax.set_ylabel("Improvement (%)")
        ax.set_title("ISI Improvement: Tap-Null over Base")
        ax.axhline(y=0, color='k', linestyle='--', alpha=0.5)
        ax.grid(True, alpha=0.3, axis='y')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig("figures/tapnull_improvement.png", dpi=150)
        plt.close()
        print("wrote figures/tapnull_improvement.png")

print("\nTap-Null ISI analysis complete!")
