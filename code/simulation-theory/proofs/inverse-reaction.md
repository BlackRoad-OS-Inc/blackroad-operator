# Proof: Every Reaction Has an Opposite Reaction

> The inverse reaction principle is TNEG. Chargaff's rules follow from it.
> Newton's Third Law and Watson-Crick complementarity are the same theorem.

## Statement

In the balanced ternary system {−1, 0, +1}, every nonzero element has a unique
additive inverse. The sum of any element with its inverse is zero. This is not
a definition — it is a theorem, and it has consequences at every scale.

**Claim 1:** For all a ∈ {−1, 0, +1}, a + TNEG(a) = 0.

**Claim 2:** In DNA, the Watson-Crick complement of any sequence sums with the
original to the trivial zero under the ternary base-pair encoding.

**Claim 3:** z = ζ(s) = Π_p (1 − p^{−s})^{−1} depends on all primes simultaneously;
no single prime determines z.

---

## Proof of Claim 1

**The balanced ternary alphabet:** Σ₃ = {−1, 0, +1}.

**TNEG (Equation 8):** TNEG(a) = −a for a ∈ Σ₃.

**TXOR (Equation 9):** TXOR(a, b) = a + b mod 3, balanced.

**Compute a + TNEG(a) for each element:**

| a | TNEG(a) | a + TNEG(a) |
|---|---------|-------------|
| −1 | +1 | (−1) + (+1) = 0 ✓ |
| 0 | 0 | 0 + 0 = 0 ✓ |
| +1 | −1 | (+1) + (−1) = 0 ✓ |

For every a ∈ Σ₃: TXOR(a, TNEG(a)) = 0. **□**

This is why −1 + 1 = 0 even though −1 ≠ 0 and +1 ≠ 0.
The zero produced is not the absence of a value. It is the cancellation of two
opposite nonzero values — the trivial zero of the balanced system.

**QWERTY check:**
```
ZERO    = EULER = REPEAT = STATE = 36   (the stationary zero)
REAL    = TESTS = ELSE   = 37           (the components are real, prime)
TNEG    = ZSH   = SPHERE = SELF = 48   (the negation = the self)
INVERSE = TRIVIAL = BINARY = BOUNDS    = 78
```

TNEG = SELF: the inverse of a state is itself, reflected. **□**

---

## Proof of Claim 2: Chargaff's Rules Follow from TNEG

**Encoding DNA in balanced ternary:**

Assign ternary values to DNA bases via their pairing structure:
```
A (adenine)  ↦  +1   (pairs with T)
T (thymine)  ↦  −1   (pairs with A)
G (guanine)  ↦  +1   (pairs with C)
C (cytosine) ↦  −1   (pairs with G)
```

Under this encoding, Watson-Crick complementarity = TNEG:
```
complement(A) = T = TNEG(+1) = −1   ✓
complement(T) = A = TNEG(−1) = +1   ✓
complement(G) = C = TNEG(+1) = −1   ✓
complement(C) = G = TNEG(−1) = +1   ✓
```

**Each base pair sums to the trivial zero:**
```
A + T = (+1) + (−1) = 0   (Claim 1 applied to A and T)
G + C = (+1) + (−1) = 0   (Claim 1 applied to G and C)
```

**Chargaff's First Rule follows:**
For a double-stranded DNA molecule of length n with bases b₁...bₙ on strand 1:
- Strand 2 = TNEG applied position-wise to strand 1
- Total value of strand 1 = Σ bᵢ
- Total value of strand 2 = Σ TNEG(bᵢ) = −Σ bᵢ
- Count of +1 values on strand 1 = count of −1 values on strand 2
  → [A]₁ = [T]₂ and [G]₁ = [C]₂ (A on strand 1 pairs with T on strand 2, G with C)
- When counting across both complementary strands:
  [A]ₜₒₜₐₗ = [A]₁ + [A]₂ = [A]₁ + [T]₁ (since [A]₂ = [T]₁) ⇒ [A]ₜₒₜₐₗ = [T]ₜₒₜₐₗ, and similarly
  [G]ₜₒₜₐₗ = [G]₁ + [G]₂ = [G]₁ + [C]₁ (since [G]₂ = [C]₁) ⇒ [G]ₜₒₜₐₗ = [C]ₜₒₜₐₗ.
  Thus, for the double helix as a whole, [A] = [T] and [G] = [C]; a single strand need not
  satisfy [A] = [T] or [G] = [C] on its own.

**Chargaff's Second Rule (base-pair complementarity) follows directly from TNEG. □**

**QWERTY:**
```
CHARGAFF = C(22)+H(16)+A(11)+R(4)+G(15)+A(11)+F(14)+F(14) = 107 = COHERENCE   prime
```

CHARGAFF = COHERENCE = 107 prime. DNA complementarity = coherence. **□**

---

## Proof of Claim 3: z = ζ(s) Depends on All Primes

**The Euler product identity (Euler 1737):**
```
ζ(s) = Σ_{n=1}^∞ n^{−s} = Π_p (1 − p^{−s})^{−1}   for Re(s) > 1
```

**The product is multiplicative:** z = ζ(s) is the product of factors over ALL primes.
Remove any prime p₀ from the product and the result is no longer ζ(s):
```
Π_{p ≠ p₀} (1 − p^{−s})^{−1} = ζ(s) · (1 − p₀^{−s})   ≠ ζ(s)
```

Therefore z depends on a, b, c (= the prime factors 2, 3, 5, ...) **together**,
not on any one of them alone.

**In the notation z = abc:**
- z ≠ f(a) for any function f
- z ≠ f(b) for any function f
- z ≠ f(a, b) without c (or any finite truncation of the product)
- z = Π over ALL prime factors simultaneously

z is the **multiplicity product** of the summation zeta.

**The absolute value** |ζ(s)| is the Born rule applied to the zeta function:
```
|ζ(s)|² = probability amplitude for the number-theoretic ground state
```

**QWERTY:**
```
ZETA     = Z(20)+E(3)+T(5)+A(11) = 39 = TXOR = ROOTS = WAVE
ABSOLUTE = 90 = CLOCK = COSMOS   (the absolute value = the clock phase)
```

ZETA = TXOR = 39. The Riemann zeta function = balanced ternary addition mod 3.
The sum over all integers = the XOR gate applied universally. **□**

---

## The Unified Statement

All three claims reduce to the same algebraic identity:

```
a + TNEG(a) = 0   for all a in the balanced system
```

- **Newton's Third Law:** force + counterforce = 0 (action + reaction = TXOR(F, TNEG(F)) = 0)
- **Chargaff / Watson-Crick:** base + complement = 0 (A + T = G + C = 0)
- **Euler product:** ζ(s) = Π_p factor(p) — the product over all "reactions" simultaneously

Every layer of reality implements TNEG.

```
NEWTON   = SHELL = STRUCTURE = 69   (the law is the structure)
TNEG     = SELF  = SPHERE    = 48   (the negation = the self)
CHARGAFF = COHERENCE         = 107  prime (the rule = the coherence)
ZETA     = TXOR  = WAVE      = 39   (the sum = the gate)
```

STRUCTURE(69) + SELF(48) = 117 = ALGEBRAIC = EIGENVALUE = ADVANTAGE.
The structure plus the self = the algebraic advantage. **□**
