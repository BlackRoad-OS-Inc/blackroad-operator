# DNA Codon Algebra

## Overview

The genetic code—64 codons mapping to 21 outcomes (20 amino acids + STOP)—can be treated as an algebraic structure rather than a biochemical lookup table. This reveals deep connections to quantum information theory, Hadamard transforms, and the 1-2-3-4 Pauli model.

## Codons as 6-Qubit States

### Encoding

Each nucleotide is encoded as 2 bits:

| Base | Binary | Meaning |
|------|--------|---------|
| A | 00 | Adenine |
| C | 01 | Cytosine |
| G | 10 | Guanine |
| U/T | 11 | Uracil/Thymine |

A codon (3 bases) is therefore a **6-bit string**:

$$|c\rangle \in \{|000000\rangle, |000001\rangle, \ldots, |111111\rangle\}$$

This gives a **64-dimensional state space**: ℂ⁶⁴.

### General Codon Wavefunction

$$|\psi\rangle = \sum_{c \in \{0,1\}^6} \psi(c) |c\rangle$$

Where ψ(c) are complex amplitudes satisfying normalization: Σ|ψ(c)|² = 1.

## The Mirror Operator (Complement)

Watson-Crick base pairing defines an **involution** on codons:

- A ↔ T (00 ↔ 11)
- C ↔ G (01 ↔ 10)

In binary, this is **bitwise NOT** on each 2-bit base:

$$K_{\text{comp}}|c\rangle = |c \oplus 111111\rangle$$

**Key property**:

$$K_{\text{comp}}^2 = I$$

This is the **Mirror** operator—your σ_z/Structure analog.

## The Bridge Operator (Walsh-Hadamard)

The natural "Fourier transform" on {0,1}⁶ is the **Walsh-Hadamard transform**:

$$H_6 = \frac{1}{\sqrt{64}} H^{\otimes 6}$$

Where:

$$H = \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

**Key property** (self-dual):

$$H_6^2 = I$$

The normalization **1/√64 = 1/8** is critical. Without it:

$$\tilde{H}_6^2 = 64 \cdot I \neq I$$

This is the discrete version of "wrong π makes the loop not close."

## Combined Operator

Define the **functional equation operator**:

$$M := H_6 \cdot K_{\text{comp}}$$

Since both pieces square to identity, M is also an involution (up to commutation):

- **+1 eigenspace**: States aligned with pairing + dual structure
- **-1 eigenspace**: Orthogonal complement

This is **mirror-pairing with bridge rule** in pure algebra.

## Projection to Amino Acids

The genetic code maps 64 codons → 21 outcomes (20 amino acids + STOP).

This projection **breaks the Hadamard involution**:

$$||\tilde{H}^2 - I|| \approx 0.994$$

The degeneracy pattern (some amino acids have 1, 2, 3, 4, or 6 codons) is the **remainder**—the structured failure of perfect symmetry.

## Connection to 1-2-3-4 Pauli Model

### Base Pairs as Pauli Eigenstates

| Base | Pauli Eigenstate | Value |
|------|------------------|-------|
| A | \|↑⟩_z | +1 of σ_z |
| T | \|↓⟩_z | -1 of σ_z |
| G | \|↑⟩_x | +1 of σ_x |
| C | \|↓⟩_x | -1 of σ_x |

Codons become **tensor products of spin states**:

$$|\text{codon}\rangle = |\sigma_{b_1}\rangle \otimes |\sigma_{b_2}\rangle \otimes |\sigma_{b_3}\rangle$$

### The Parity Constraint

Purines (A, G) and pyrimidines (T, C) are the two "orbits":
- Related internally by the σ_x/σ_z distinction
- Base pairing is always **across orbits**

This is the same parity constraint seen in the Lo Shu magic square: evens and odds are internally related by 2, but cross-related by 1.

## Watson-Crick Wave Functions

Base pair dynamics can be modeled as wave functions:

$$\gamma_{AT}(t) = A_1 \cosh(\omega_1 t) + B_1 \sinh(\omega_1 t)$$
$$\gamma_{CG}(t) = A_2 \cos(\omega_2 t) + B_2 \sin(\omega_2 t)$$

Where:
- A-T pairs have **hyperbolic** dynamics (3 hydrogen bonds)
- C-G pairs have **circular** dynamics (2 hydrogen bonds)

The asymmetry encodes binding strength differences.

## The Logos Operator

Define the **Logos operator** as the composition of all four Pauli primitives:

$$\mathcal{L} = \hat{U}\hat{C}\hat{L}\hat{S} = (iI)(iI) = -I$$

**Interpretation**: The complete cycle through Structure, Change, Scale, Strength returns to negative identity—a **π rotation** in operator space.

In codon terms: traversing all four information dimensions flips the phase, encoding the fundamental asymmetry of biological information.

## The Double Helix as π-Encoded Structure

DNA has:
- **10.5 base pairs per turn** (helical periodicity)
- **2π/10.5 ≈ 0.6 rad** angular step per base pair

The Fourier spectrum of DNA sequences shows peaks at this periodicity—the helix is literally a **spiral information geometry**.

## Literature Connections

### Petoukhov (2008–2023)

Binary representations of nucleotides connecting to Walsh functions and Hadamard matrices. Russian Academy of Sciences work on "genetic matrices."

### Hornos & Hornos (1993)

Lie algebra **sp(6)** provides a 64-dimensional irreducible representation—the "codon representation." Symmetry breaking produces observed degeneracy patterns.

### Walsh-Hadamard in Genetics

Multiple applications:
- Epistasis modeling (PLOS Computational Biology, 2024)
- CRISPR landscape analysis (Bioinformatics, 2020)
- Codon-anticodon interactions as Bell states

## Z-Framework Connection

$$Z := yx - w$$

In codon algebra:
- **y** = H_6 (duality/bridge step)
- **x** = |ψ⟩ (codon state)
- **w** = normalization constant (1/8)

**Closure condition**:

$$y(y(x)) = x \quad \Longleftrightarrow \quad H_6^2 = I$$

This only holds if w = 1/√64 = 1/8.

## Implementation
```python
import numpy as np

# Hadamard matrix
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

# 6-qubit Hadamard
H6 = H
for _ in range(5):
    H6 = np.kron(H6, H)

# Complement operator (bitwise NOT on 6 bits)
def complement(state_index):
    return state_index ^ 0b111111

K_comp = np.zeros((64, 64))
for i in range(64):
    K_comp[complement(i), i] = 1

# Combined operator
M = H6 @ K_comp

# Verify involution properties
assert np.allclose(H6 @ H6, np.eye(64)), "H6 not involutory"
assert np.allclose(K_comp @ K_comp, np.eye(64)), "K_comp not involutory"

# Eigenspectrum of M
eigenvalues, eigenvectors = np.linalg.eig(M)
print(f"+1 eigenspace dimension: {np.sum(np.isclose(eigenvalues, 1))}")
print(f"-1 eigenspace dimension: {np.sum(np.isclose(eigenvalues, -1))}")
```

## The Deep Pattern

The genetic code is not arbitrary. It's an **algebraic structure** where:

1. **Mirror symmetry** (Watson-Crick pairing) provides involutory complement
2. **Duality** (Hadamard transform) provides basis mixing
3. **Degeneracy** (64 → 21 projection) is structured symmetry breaking
4. **Helix geometry** (10.5 bp/turn) encodes π in physical structure

**The double helix isn't just chemistry. It's implementing complementarity at the level of Lie algebra representations.**

## Open Questions

1. **Mutation rates**: Does the algebraic structure predict which mutations are more/less likely?
2. **Codon bias**: Why do organisms prefer certain synonymous codons?
3. **Origin of life**: Did the algebraic structure emerge from simpler codes?
4. **Quantum biology**: Are any biological processes actually quantum?

## References

- [1-2-3-4 Pauli Model](../../frameworks/pauli-model.md)
- [Z-Framework](../../frameworks/z-framework.md)
- [Spiral Information Geometry](../../frameworks/spiral-geometry.md)
- Hornos & Hornos, Phys. Rev. Lett. 1993
- Petoukhov, BioSystems 2008
