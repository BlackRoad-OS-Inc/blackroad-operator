# Notebook Page 1 — Transcription

> Source: `→ halting problem.pdf`, page 1 of 24.  
> Author: Alexa Louise Amundson. Markdown transcription by repository maintainers.

---

## 1. Computer Science & Logic: The Halting Problem

### Complex & Imaginary Numbers

```
(a + ib)(a − ib) = a² − ibib
Imaginary: (y + x)² y
Real:      (y + x)²
```

Euler's formula expansion:
```
e^(ix) = 1 + ix − x²/2 − i(x³)/6 + x⁴/24 − ...
```

### Paradoxes & Abstraction

- **Golden Braid** — a reference to levels of abstraction and paradoxes.
- *"This sentence is false"* → refers to its own truth value.
- **Cantor diagonalization** → linked to the Halting problem.

### The Halting Problem

A thought experiment for a hypothetical program **h** that predicts whether another program will loop forever or halt.

```
Program 1 → [h]: Input I into program h.
h answers: will this problem halt, or will it not?
```

Examples:
```
x = 4
while x > 3: x += 1   → LOOPS FOREVER

x = 4
while x < 1000: x += 1   → Halts.
```

**The Paradox (h+):**

- Take the source code (e.g., `11001011`) and use that code as both the program and the input.
- Feed `x` as data into itself: `x = h+`.
- If `h` halts → `h+` begins an infinite loop.
- If `h` loops → `h+` halts.

> *"Does it loop or halt? It's a paradox! But h does not exist!"*

---

## 2. Number Theory: The Möbius Function

### Definitions & Rules

The Möbius function μ(n) is a multiplicative number-theoretic function.  
For any positive integer n, define μ(n) as the sum of the primitive n-th roots of unity.

**Factorization rules:**
```
μ(n) = 0          if n has one or more repeated prime factors
μ(n) = 1          if n = 1
μ(n) = (−1)^k     if n is a product of k distinct primes
```

μ(n) ≠ 0 indicates that n is **square-free**.

First few values:
```
1, −1, −1, 0, −1, 1, −1, 0, 0, 1, −1, 0, ...
```

### Formulas & Series

**Mertens Function** (summatory function of Möbius):
```
M(x) = Σ_{n ≤ x} μ(n)
```

**Dirichlet Series** (multiplicative inverse of the Riemann zeta function):
```
Σ_{n=1}^{∞} μ(n)/n^s = 1/ζ(s)   ;   Re(s) > 1
```

**Lambert Series:**
```
Σ_{n=1}^{∞} (μ(n) x^n) / (1 − x^n) = x   ;   |x| < 1
```

**Kronecker Delta Relation:**
```
Σ_{d|n} μ(d) = δ_{n,1}
```

**Infinite Sums:**
```
Σ_{n=1}^{∞} μ(n)/n        = 0
Σ_{n=1}^{∞} (μ(n) ln n)/n = −1
Σ_{n=1}^{∞} μ(n)/n²       = 15/π²   [as written in notebook; correct value is 6/π² = 1/ζ(2)]
```

> **Historical note:** Gauss considered the Möbius function over 30 years before Möbius,
> proving that for a prime number p, the sum of its primitive roots is congruent to
> μ(p − 1) (mod p).

---

## 3. Probability & Math: Gaussian Functions & Fourier Transforms

### Gaussian Basics

Used to represent the probability density function of a normally distributed random variable.

- Expected value: μ = b
- Variance: σ² = c²

**Standard form:**
```
f(x) = (1 / (σ √(2π))) · e^(−(1/2)((x−μ)/σ)²)
```

**Arbitrary constants form** (a = peak height, b = center, c = width):
```
f(x) = a · e^(−(x−b)² / 2c²)
```

### Fourier Transform Proofs

Convention used (unitary, angular frequency):
```
F{ f(x) }(ω) = ∫_{−∞}^{∞} f(x) e^{−iωx} dx
```

**Transform of a Gaussian:**
```
F{ a · e^(−bx²) } = (a / √(2b)) · e^(−ω² / 4b)
```

The integration proof uses substitution t = x + iω/2b, showing that the Fourier transform of a Gaussian is also a Gaussian.

**Derivative Properties:**
```
Time domain:      F{ f′(x) }  = iω · F(ω)
Frequency domain: F{ x f(x) } = i · d/dω F(ω)
```

---

## 4. Physics: Quantum Mechanics & Energy

### Schrödinger Equation & Operators

**Time-dependent equation:**
```
iℏ (∂/∂t) Ψ = HΨ
```
Where:
- `i` = √(−1)
- `ℏ` = Planck's constant (reduced)
- `Ψ` = quantum wave function
- `H` = Hamiltonian operator

**Harmonic Oscillator:**
```
Classical energy:    (1/2)mv² + (1/2)kx² = E
Momentum operator:   p → (ℏ/i)(∂/∂x)
Quantum Hamiltonian: H → (−ℏ²/2m)(∂²/∂x²) + (1/2)kx²
Eigenvalue equation: HΨ = EΨ
```

### Uncertainty & Photons

**Heisenberg Uncertainty Principle:**
```
Δp · Δx ≥ h / 4π   (= ℏ/2, where ℏ = h/2π)
```

**Energy of a photon:**
```
E = hν = hc/λ
```

**Photoelectric effect:**
```
(1/2) m v_max² = eV₀ = hf − φ
```

### Fundamental Constants & Bohr Model

```
r = (n² h² ε₀) / (π m e²)   ∝ h²
v = e² / (2 ε₀ n h)          ∝ 1/n
```

**Fine-Structure Constant (α):**
```
α = (1 / 4πε₀) · (e² / ℏc) ≈ 1/137
```

**Speed of light:**   c = 3 × 10⁸ m/s  
**Elementary charge:** e = 1.602 × 10⁻¹⁹ C
