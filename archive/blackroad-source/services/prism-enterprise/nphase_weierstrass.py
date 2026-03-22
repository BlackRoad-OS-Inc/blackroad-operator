#!/usr/bin/env python
# coding: utf-8

"""
N-phase Cancellation & Weierstrass Scaling

N-phase cancellation & Weierstrass scaling analysis (synthetic if CSV missing).
Writes PNGs to figures/.
"""
import os
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

os.makedirs("figures", exist_ok=True)

def compute_nphase_cancellation(n_values):
    """
    Compute N-phase cancellation for given N values.
    Measures max amplitude of Σ sin(t+2πk/N) over a time period.
    """
    results = []
    t = np.linspace(0, 2*np.pi, 1000)

    for N in n_values:
        phases = np.array([2*np.pi*k/N for k in range(N)])
        signal_sum = np.zeros_like(t)

        for phase in phases:
            signal_sum += np.sin(t + phase)

        max_amplitude = np.max(np.abs(signal_sum))
        results.append(max_amplitude)

    return np.array(results)

def weierstrass_function(m, alpha=0.6, beta=0.1):
    """
    Compute Weierstrass-like structure function.
    S(m) ~ m^(-alpha) * (1 + beta*sin(log(m)))
    """
    return m**(-alpha) * (1 + beta*np.sin(np.log(m)))

# N-phase cancellation analysis
N_values = np.arange(3, 9)
max_cancel = compute_nphase_cancellation(N_values)

plt.figure(figsize=(8, 5))
plt.plot(N_values, max_cancel, marker="o", linewidth=2, markersize=8)
plt.title("N-phase cancellation (max |Σ sin(t+2πk/N)|)")
plt.xlabel("N (number of phases)")
plt.ylabel("Max amplitude")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("figures/nphase_cancellation.png", dpi=150)
plt.close()

# Weierstrass scaling analysis
m_values = np.logspace(0, 6, 200)
S_values = weierstrass_function(m_values)

plt.figure(figsize=(8, 5))
plt.loglog(m_values, S_values, linewidth=2)
plt.title("Weierstrass structure function (log-log)")
plt.xlabel("m (scale)")
plt.ylabel("S(m) (structure function)")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("figures/weierstrass_scaling.png", dpi=150)
plt.close()

print("wrote figures/nphase_cancellation.png, figures/weierstrass_scaling.png")
print("N-phase and Weierstrass analysis complete!")
