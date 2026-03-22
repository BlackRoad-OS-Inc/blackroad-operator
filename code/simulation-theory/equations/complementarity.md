# Complementarity Equations

> Inverse reactions, the trivial zero, Chargaff's rule, Punnett squares, and the Euler product.
> These equations formalize the observation from INDEX.md: "every reaction has an opposite reaction."

---

## The Inverse Reaction Principle

**For every a ∈ {−1, 0, +1}:**
```
TNEG(a) = −a
a + TNEG(a) = TXOR(a, −a) = 0
```

Every state has an equal and opposite state. Their sum is the trivial zero.

This is Equation 8 applied universally: Newton's Third Law is TNEG.

```
NEWTON   = N(25)+E(3)+W(2)+T(5)+O(9)+N(25) = 69 = SHELL = STRUCTURE
TNEG     = ZSH = SPHERE = SELF             = 48 = 2×PURE
```

NEWTON = STRUCTURE = 69. The law of equal and opposite reactions = the structure of the shell.
TNEG = SELF = 48. Negation = the self. The opposite of you = you, reflected.

---

## The Trivial Zero: Why −1 + 1 = 0

```
TXOR(−1, +1) = (−1) + (+1) mod 3 = 0
```

The question: how can −1 + 1 = 0 if −1 ≠ 0, +1 ≠ 0, and = is not 0?

Because the trivial zero is not absence. It is balance. It is the stationary point.

−1 is real. +1 is real. Neither is zero. Yet their sum collapses to zero because they
are inverses — TNEG of each other — and the system is balanced.

```
ZERO = EULER = REPEAT = STATE = 36   (δS = 0 — the zero is stationary action)
REAL = TESTS = ELSE   = 37           (the components are real — prime, irreducible)
```

ZERO = EULER = 36. The zero that results from −1 + 1 is Euler's zero: the point where
the action S does not vary to first order. The system is at its minimum. δS = 0.

The equation −1 + 1 = 0 is not arithmetic. It is the principle of stationary action.

---

## A + B = C: Matrix Concatenation — The Punnett Square

The simplest A + B = C with matrices concatenated to A and B is the Punnett square:

```
         A        a
    ┌─────────┬─────────┐
  A │   AA    │   Aa    │
    ├─────────┼─────────┤
  a │   Aa    │   aa    │
    └─────────┴─────────┘
```

In matrix form — the outer (Kronecker) product of the allele set [A, a] with itself:

```
P = [A] ⊗ [A  a] = [A·A  A·a] = [AA  Aa]
    [a]             [a·A  a·a]   [aA  aa]
```

A and B are the parent allele vectors. C = P is their concatenation — the tensor product.
C is not A. C is not B. C is A ⊗ B: both parents simultaneously, at every combination.

```
PUNNETT = P(10)+U(7)+N(25)+N(25)+E(3)+T(5)+T(5) = 80 = NOBLE = ACTION
```

PUNNETT = ACTION = 80. The Punnett square = the principle of stationary action.
The genetic cross = the variational principle. Same number.

---

## Type-A Programming: Chargaff's Rules

In DNA, "Charlie only comes from Alice and Bob":

**Chargaff's First Rule (macro-level):**
```
[A] = [T]   (adenine count equals thymine count)
[G] = [C]   (guanine count equals cytosine count)
```

**Chargaff's Second Rule (base-pair level), in balanced ternary:**
```
A + T = (+1) + (−1) = 0   ← AT pair sums to trivial zero
G + C = (+1) + (−1) = 0   ← GC pair sums to trivial zero
```

Every base pair = TXOR(a, TNEG(a)) = 0. DNA is made entirely of trivial zeros.

**The algebraic system** — "type-A programming":
```
A + B = C + C   →   both complementary pairs sum to zero: [AT] = [GC] = 0
A + C = A + A   →   C = A: each base templates its Watson-Crick complement
B + C = B + B   →   C = B: the complement strand is fully determined by either strand
```

Charlie (C = the complement strand) only comes from Alice (A) and Bob (B).
Because C is TNEG applied to every position. C is the mirror: for each position i, Cᵢ = TNEG(strandᵢ).

```
CHARGAFF  = C(22)+H(16)+A(11)+R(4)+G(15)+A(11)+F(14)+F(14) = 107 = COHERENCE   prime
```

CHARGAFF = COHERENCE = 107 prime. Every complementary base pair is a coherent state.
The double helix holds coherence for exactly BIRTHDAY = 87 time units (§174).

---

## z = abc: The Euler Product and the Zeta Function

```
z = a · b · c · ...
```

Does z depend on a alone? Or b alone? Or c?

No. z = ζ(s): the Riemann zeta function, expressed as the Euler product:

```
ζ(s) = Σ_{n=1}^∞  n^{−s}   [the additive (sum) representation]
     = Π_p (1 − p^{−s})^{−1}  [the multiplicative (product) representation]
```

Where the product runs over all primes p = 2, 3, 5, 7, 11, ...

In the notation z = abc:
```
a = (1 − 2^{−s})^{−1}   (the 2-prime factor)
b = (1 − 3^{−s})^{−1}   (the 3-prime factor)
c = (1 − 5^{−s})^{−1}   (the 5-prime factor)
```

z does NOT depend on a, b, or c individually. z IS the multiplicity product —
the infinite product of ALL prime factors simultaneously. Remove any one prime
and the product collapses. Every prime is necessary.

**The absolute value:**
```
|ζ(s)| = |Π_p (1 − p^{−s})^{−1}|
```

This is the Born rule (Max Born, INDEX.md) applied to the zeta function.
Probability = |ψ|². The magnitude of the zeta function = the amplitude of
the number-theoretic wavefunction. The square root of the probability that a
randomly chosen integer is divisible only by primes above a given threshold.

```
ZETA      = Z(20)+E(3)+T(5)+A(11)                  = 39  = TXOR = ROOTS = WAVE
RIEMANN   = R(4)+I(8)+E(3)+M(26)+A(11)+N(25)+N(25) = 102 = AMPLITUDE = CANCEL = MADNESS
ABSOLUTE  = A(11)+B(24)+S(12)+O(9)+L(19)+U(7)+T(5)+E(3) = 90 = CLOCK = COSMOS = HIERARCHY
```

**ZETA = TXOR = 39.** The Riemann zeta function = the ternary XOR gate.
The sum over all integers = the balanced addition mod 3 = TXOR.

**ABSOLUTE = CLOCK = 90.** The absolute value = the clock operator Z.
The magnitude of the wavefunction = the phase advance of the clock.

**RIEMANN = AMPLITUDE = 102.** The Riemann hypothesis is a statement about amplitude.
The non-trivial zeros cancel each other: AMPLITUDE = CANCEL = 102.

---

## The Limit on Zipping and Unzipping

DNA replication (unzipping and rezipping) is bounded by:

```
E_min per replication = k_B · T · ln(3) · N_bases
```

where N_bases is the number of base pairs. Each base pair = one ternary erasure
(§173, Equation 12). At the Landauer limit, each unzip-rezip cycle costs exactly
k_B T ln(3) per trit, and there are 3×10⁹ base pairs in human DNA.

The limit on how many times DNA can zip and unzip = the thermodynamic bound:

```
max_replications = E_cell / (k_B · T · ln(3) · N_bases)
                 ≈ ΔG_ATP · N_ATP / (4.44×10⁻²¹ J · 3×10⁹)
                 ≈ finite
```

This is the Hayflick limit expressed as a Landauer bound.
Biology knew before physics that computation is thermodynamically bounded.

```
COMPLEMENT = C(22)+O(9)+M(26)+P(10)+L(19)+E(3)+M(26)+E(3)+N(25)+T(5) = 148 = 4×REAL
```

COMPLEMENT = 4 × REAL = 148. The complement is four times real.
The four DNA bases, each paired with its real complement, sum to four times the axiom.
