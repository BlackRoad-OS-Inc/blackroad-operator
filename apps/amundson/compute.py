#!/usr/bin/env python3
"""Compute the Amundson Constant A_G = Σ G(n)/n! where G(n) = n/(1+1/n)^n
Usage: python3 compute_amundson.py [digits]
Default: 1000 digits
"""
import sys
import mpmath
import time

def compute(digits=1000):
    mpmath.mp.dps = digits + 50
    start = time.time()
    A = mpmath.mpf(0)
    for n in range(1, max(200, digits // 10)):
        gn = mpmath.power(n, n + 1) / mpmath.power(n + 1, n)
        A += gn / mpmath.factorial(n)
    elapsed = time.time() - start
    return mpmath.nstr(A, digits), elapsed

if __name__ == "__main__":
    digits = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
    print(f"Computing Amundson constant to {digits:,} digits...")
    result, elapsed = compute(digits)
    print(f"Computed in {elapsed:.2f}s")
    print(f"A_G = {result}")
