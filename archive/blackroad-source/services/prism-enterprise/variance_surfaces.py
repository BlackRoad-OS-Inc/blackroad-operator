#!/usr/bin/env python
# coding: utf-8

"""
Variance Surfaces

Trinary/quaternary variance heatmaps with closed-form check.
Reads:
  data/raw/Trinary_Optimizer__min-Var_.csv
  data/raw/quaternary_optimizer_summary.csv
"""
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

os.makedirs("figures", exist_ok=True)

def closed_form_variance(a, b, c):
    """Compute closed-form variance for trinary system where a+b+c=0."""
    return a**2 + b**2 + c**2 + 2*(a*b + b*c + c*a)

# Trinary variance heatmap
if Path("data/raw/Trinary_Optimizer__min-Var_.csv").exists():
    tri = pd.read_csv("data/raw/Trinary_Optimizer__min-Var_.csv")
    pivot = tri.pivot_table(index="a", columns="b", values="var")

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # Empirical variance heatmap
    im1 = ax1.imshow(pivot.values, origin="lower", aspect="auto", cmap="viridis")
    plt.colorbar(im1, ax=ax1, label="Var[ψ_w]")
    ax1.set_title("Trinary variance heatmap (a+b+c=0)")
    ax1.set_xlabel("b")
    ax1.set_ylabel("a")

    # Closed-form check
    if 'c' in tri.columns:
        tri['var_closed'] = tri.apply(lambda row: closed_form_variance(row['a'], row['b'], row['c']), axis=1)
        tri['var_diff'] = np.abs(tri['var'] - tri['var_closed'])
        pivot_diff = tri.pivot_table(index="a", columns="b", values="var_diff")

        im2 = ax2.imshow(pivot_diff.values, origin="lower", aspect="auto", cmap="RdYlGn_r")
        plt.colorbar(im2, ax=ax2, label="|Empirical - Closed Form|")
        ax2.set_title("Variance Difference")
        ax2.set_xlabel("b")
        ax2.set_ylabel("a")

    plt.tight_layout()
    plt.savefig("figures/trinary_variance_analysis.png")
    plt.close()
    print("wrote figures/trinary_variance_analysis.png")

# Quaternary variance summary
if Path("data/raw/quaternary_optimizer_summary.csv").exists():
    quat = pd.read_csv("data/raw/quaternary_optimizer_summary.csv")

    plt.figure(figsize=(8, 5))
    if 'var' in quat.columns and 'config' in quat.columns:
        quat_sorted = quat.sort_values('var')
        plt.bar(range(len(quat_sorted)), quat_sorted['var'])
        plt.xlabel("Configuration Index")
        plt.ylabel("Variance")
        plt.title("Quaternary Optimizer Variance Distribution")
        plt.tight_layout()
        plt.savefig("figures/quaternary_variance_dist.png")
        plt.close()
        print("wrote figures/quaternary_variance_dist.png")

print("Variance surface analysis complete!")
