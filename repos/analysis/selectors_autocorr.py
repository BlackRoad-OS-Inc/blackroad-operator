#!/usr/bin/env python
# coding: utf-8

"""
Selector ablations + ACF contrasts.
Reads:
  data/raw/ISI_Even_Odd_Decomposition.csv
  data/raw/fig_acf_random.csv (optional precomputed)
  data/raw/fig_acf_ipow.csv   (optional)
"""
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

os.makedirs("figures", exist_ok=True)

def compute_autocorrelation(series, max_lag=50):
    """Compute autocorrelation function for a time series."""
    n = len(series)
    mean = np.mean(series)
    var = np.var(series)

    acf = np.zeros(max_lag + 1)
    for lag in range(max_lag + 1):
        if lag == 0:
            acf[lag] = 1.0
        else:
            c = np.sum((series[:-lag] - mean) * (series[lag:] - mean)) / n
            acf[lag] = c / var if var > 0 else 0

    return acf

# ISI selector comparison
if Path("data/raw/ISI_Even_Odd_Decomposition.csv").exists():
    sel = pd.read_csv("data/raw/ISI_Even_Odd_Decomposition.csv")
    ax = sel.set_index("selector")["mse"].plot(kind="bar", figsize=(8,4))
    ax.set_ylabel("ISI MSE")
    ax.set_title("Selectors vs Base")
    plt.tight_layout()
    plt.savefig("figures/selectors_vs_base.png")
    plt.close()
    print("wrote figures/selectors_vs_base.png")

# Autocorrelation analysis
if Path("data/raw/fig_acf_random.csv").exists():
    acf_random = pd.read_csv("data/raw/fig_acf_random.csv")
    plt.figure(figsize=(10, 5))
    plt.plot(acf_random.index, acf_random.values, label="Random ACF")
    plt.axhline(y=0, color='k', linestyle='--', alpha=0.3)
    plt.xlabel("Lag")
    plt.ylabel("Autocorrelation")
    plt.title("Autocorrelation Function - Random")
    plt.legend()
    plt.tight_layout()
    plt.savefig("figures/acf_random.png")
    plt.close()
    print("wrote figures/acf_random.png")

if Path("data/raw/fig_acf_ipow.csv").exists():
    acf_ipow = pd.read_csv("data/raw/fig_acf_ipow.csv")
    plt.figure(figsize=(10, 5))
    plt.plot(acf_ipow.index, acf_ipow.values, label="iPow ACF")
    plt.axhline(y=0, color='k', linestyle='--', alpha=0.3)
    plt.xlabel("Lag")
    plt.ylabel("Autocorrelation")
    plt.title("Autocorrelation Function - iPow")
    plt.legend()
    plt.tight_layout()
    plt.savefig("figures/acf_ipow.png")
    plt.close()
    print("wrote figures/acf_ipow.png")

print("Analysis complete!")
