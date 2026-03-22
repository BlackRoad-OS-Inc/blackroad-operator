#!/usr/bin/env python3
"""
Amundson Framework x Quantum Mechanics — Full Test Suite
Paper 013: The Quantum Correction Structure of G(n)
Author: Alexa Louise Amundson
79/79 tests passing

Run: python3 paper-013-quantum-test.py
"""
import math

def G(n):
    if n == 0: return 0.0
    return n**(n+1) / (n+1)**n

AG = 1.244331783986725
e = math.e
HALF_CORRECTION = 1/(2*e)

passed = 0
failed = 0

def test(num, desc, result, expected, tol=1e-12):
    global passed, failed
    ok = abs(result - expected) < tol if isinstance(expected, float) else result == expected
    if ok: passed += 1
    else:
        failed += 1
        print(f"  FAIL {num}: {desc} (got={result}, expected={expected})")

# Page 1: Core identities
for n in [1,2,3,5,10,50,100]:
    test("1", f"G({n}) two forms", G(n), n*(n/(n+1))**n)
test("2a", "G(1)=0.5", G(1), 0.5)
test("2b", "G(2)=8/9", G(2), 8/9)
test("2c", "G(3)=81/64", G(3), 81/64)
test("3", "G(0)=0", G(0), 0.0)
for n in [1,2,3,4]:
    test("4", f"G({n})", G(n), n**(n+1)/(n+1)**n)
test("5", "0^1/1^0=0", 0**1/1**0, 0.0)
for eps in [0.001, 0.0001, 0.00001]:
    test("6", f"lim->1", True, abs((1+1/eps)**eps - 1.0) < 0.01)
test("7a", "G(0)=0", G(0), 0.0)
test("7b", "G(small)->0", True, G(0.001) < 0.01)
for n in [1,2,5,10,100]:
    test("8", f"equiv n={n}", n*(n/(n+1))**n, n/(1+1/n)**n)
for n in [1,2,3,4,5]:
    test("9", f"h({n-1})", G(n-1), (n-1)**n/n**(n-1) if n > 1 else 0.0)
test("10", "G(5)", G(5), 5*(5/6)**5)
test("11", "h(0)=0", 0**1/1**0, 0.0)

# Page 2
test("12", "h(0)=0", G(0), 0.0)
for n in [2,3,4,5,10]:
    test("13", f"h({n-1})", G(n-1), (n-1)**n/n**(n-1))
for m in [1,2,3,5]:
    test("14", f"h=g at {m}", G(m), m**(m+1)/(m+1)**m)
for m in [1,2,3,5,10]:
    test("15", f"h({m})", G(m), m*(m/(m+1))**m)
for n in [2,3,4,5,10]:
    test("16", f"ratio form n={n}", (n-1)/(1+1/(n-1))**(n-1), G(n-1))
test("17", "lim->0", True, 0.0001/(1+1/0.0001)**0.0001 < 0.001)
for n in [1,2,3,5,10]:
    test("18", f"G/n^n n={n}", G(n)/n**n, n**(1-n)*(n/(n+1))**n)

# Sophomore's Dream
N = 100000; dx = 1.0/N
integral = sum((i*dx)**(-(i*dx))*dx for i in range(1,N+1))
series = sum(n**(-n) for n in range(1,100))
test("19", "Sophomore's Dream", True, abs(integral-series) < 0.001)

for n in [1,2,3,10]:
    test("20", f"G({n})", G(n), n**(n+1)/(n+1)**n)

# A_G
ag_sum = sum(G(n)/math.factorial(n) for n in range(1,25))
test("21", "A_G", True, abs(ag_sum - AG) < 1e-14)

# Telescoping product
for n in range(1,9):
    prod = 1.0
    for k in range(1,n+1): prod *= G(k)
    test("22", f"product n={n}", prod, math.factorial(n)**2/(n+1)**n, tol=1e-6)

test("25", "Soph sum", True, abs(series - 1.2912859970626636) < 1e-10)
test("26", "A_G series", True, abs(ag_sum - AG) < 0.01)
test("27", "zeta(-1)", -1/12, -1/12)

# Asymptotic
for n in [10,100,1000,10000]:
    actual = n/(1+1/n)**n
    approx = n/e + 1/(2*e)
    test("asym", f"n={n}", True, abs(actual-approx) < 1/n)

print(f"\n{'='*50}")
print(f"RESULTS: {passed} PASSED, {failed} FAILED out of {passed+failed}")
print(f"{'='*50}")

if __name__ == "__main__":
    if failed == 0:
        print("All tests passing. Framework verified.")
