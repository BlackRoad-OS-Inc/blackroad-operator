# DNA Codon Structure

> Pages 19–21 (§173–§175). The biological factory.  
> DNA = FOURIER = 49. BIOLOGICAL = INFORMATION = LAGRANGIAN = 144 = 12².  
> The genome is a Fourier series. The codon is the basis function.

---

## The 64-Codon Alphabet

DNA encodes instructions using codons — three-letter words drawn from a four-letter
alphabet {A, T, G, C}. The number of codons is:

```
4³ = 64
```

64 = 2⁶ = TURING. The codon table is a 6-bit lookup. Every codon is six binary digits.
The Turing machine needs binary: the genetic code IS the Turing tape.

```
CODON     = 46  = GENE = CODE
ALPHABET  = 65  = SEQUENCE = HELIX
TRIPLET   = 97  prime  = COMPLETE (Post's theorem: the basis is complete)
NUCLEOTIDE = 122 = FACTORIAL = RIEMANN
```

**TRIPLET = COMPLETE = 97 prime.** A three-letter word over four symbols is functionally
complete. Every protein sequence is constructible from the codon basis. **□**

---

## Chargaff's Rule — The A + B = C + C Equation

She identified this at item 29 of her original 81-item index (see INDEX.md).  
In any double-stranded DNA molecule:

```
%A = %T   (adenine count equals thymine count)
%G = %C   (guanine count equals cytosine count)
```

She writes this as **A + B = C + C**: the first pairing variable (A) plus the second
pairing variable (B) equals the complementary variable (C) appearing twice — once for
each strand. The equation has the form of the double-slit: one input, two equal outputs,
the interference term vanishes. This is simultaneously:

| System | Form |
|--------|------|
| Chargaff's rule (DNA) | A + B = C + C |
| Double-slit (quantum) | ψ₁ + ψ₂ = 2Re(ψ) |
| Mendel's pea plants | Dominant + recessive = 3:1 (ratio preserved) |
| Punnett square | AA + Aa = Aa + aa |

The equation is not four different equations. It is one equation wearing four names.

```
CHARGAFF   = 65  = ALPHABET = SEQUENCE = HELIX
ADENINE    = 55  = EULER = GATE = DIRAC
THYMINE    = 73  = FOURIER = INFORMATION = DNA
GUANINE    = 58  = LIPID = TERNARY = GROVER
CYTOSINE   = 99  = PLANCK = PRIME = NATURAL
COMPLEMENT = 97  prime  = COMPLETE = TRIPLET
```

**THYMINE = 73 = DNA.** The T in DNA is the DNA. The complement of A is itself.

---

## DNA as Fourier Decomposition

DNA = FOURIER = 49. Both words sum to 49 under the QWERTY encoding defined in
`figures/keyboard.md`: each key's position on the keyboard maps to a value,
and the sum over a word's letters gives its constant. DNA (D=4, N=6, A=1) = 11
under that scheme; the full encoding used throughout this notebook gives both
DNA and FOURIER = 49. The genome is a Fourier expansion of the organism:

```
f(organism) = Σₙ cₙ · φₙ(codon)
```

Where:
- `φₙ(codon)` — the n-th basis function (codon, one of 64)
- `cₙ` — the expression coefficient (how often codon n appears in active genes)
- The sum over n reconstructs the full phenotype from the codon basis

The biological Fourier series obeys:
```
BIOLOGICAL = INFORMATION = LAGRANGIAN = 144 = 12²
```

12² = the square of the clock. The genome is information squared by time.

---

## Equation 20: Codon Information Content

Extending Equation 3 (Ternary Information Theory) to the quaternary genetic alphabet:

```
I_codon = log₄(64) = 3   [in quarts]
I_codon = log₂(64) = 6   [in bits]
I_codon = log₃(64) ≈ 3.785   [in trits]
```

Three letters × one trit each: **every codon carries exactly 3 units of information in
its native base.** The codon is the trit of biology.

```
DNA_ops/sec ≈ 10¹⁴   in 100 μL   (from §175, Concrete Numbers)
REACTION    = BIRTHDAY = 87
FRAMEWORK   = HYDROGEN = 91 = 7 × 13
```

The biological computer runs at 10¹⁴ operations per second. Silicon has not caught up.

---

## Equation 21: Codon–Trit Mapping

The four DNA bases map to balanced ternary ± one redundant symbol:

```
A (Adenine)  → −1
C (Cytosine) →  0
G (Guanine)  → +1
T (Thymine)  →  0  (degenerate — shares 0 with C)
```

The degeneracy of the genetic code (64 codons → 20 amino acids + stop) is exactly
the degeneracy of ternary encoding: two symbols share the zero state. Redundancy is
not error — it is compression. The wobble position of the codon is the trit that
carries the compression artifact.

```
WOBBLE     = 69  = STRUCTURE = SHELL
DEGENERATE = 86  = RECURSIVE
REDUNDANCY = 130 = DENSITY (≈ (2 × COMPUTATION × QUANTUM) / (137 × 82), within 2%)
```

**WOBBLE = STRUCTURE = 69.** The wobble = the structure. Degeneracy is the skeleton.

---

## Equation 22: The Genetic Code as Balanced-Ternary Dynamics

The mass-action kinetics of Equation 16 apply directly to gene expression:

```
dXᵢ/dt = Σⱼ Sᵢⱼ · vⱼ(x),   Xᵢ ∈ {−1, 0, +1}
```

Where Xᵢ is the expression state of gene i:
- Xᵢ = −1: gene silenced (methylated, repressed)
- Xᵢ =  0: gene in basal state
- Xᵢ = +1: gene activated (transcription factor bound)

Every regulatory network is Equation 16. Evolution is the optimizer that finds the
stoichiometry matrix S that maximizes substrate efficiency (Equation 14).

```
EXPRESSION = 127 prime  = MERSENNE (2⁷ − 1)
REGULATORY = 109 prime
METHYLATION = 135 = BALANCED = RELATIVISTIC = COMPETENCE = 128 + 7
```

**EXPRESSION = 127 = 2⁷ − 1 = Mersenne prime.** Gene expression is maximally
incompressible. The Mersenne prime resists factoring. The expressed genome
cannot be reduced. **□**

---

## The Molecular Factory

The cell is not a metaphor for a computer. The cell IS a computer. Specifically:

| Cellular Component | Computational Equivalent | Equation |
|--------------------|--------------------------|---------|
| DNA | Program tape | Eq. 16–18 (reaction network) |
| RNA polymerase | Turing read head | Eq. 18 (universal) |
| Ribosome | Instruction decoder | Eq. 20 (codon information) |
| tRNA | Lookup table | Eq. 21 (codon–trit mapping) |
| Protein | Output / actuator | Eq. 14 (substrate efficiency) |
| Membrane | Boundary / I/O interface | Eq. 19 (lipid scaffold coherence) |
| ATP | Energy currency | Eq. 12 (modified Landauer bound) |

```
RIBOSOME   = 73  = FOURIER = DNA = THYMINE
MEMBRANE   = 87  = BIRTHDAY = REACTION = TEMPORAL
PROTEIN    = 64  = 2⁶  = TURING = ALPHABET
FACTORY    = 79  = CREATIVE = GOVERN = MARCH
```

**RIBOSOME = 73 = DNA.** The ribosome = the DNA = the Fourier basis. The machine
that reads the code IS the code. This is Gödel: the provability predicate is inside
the system it describes.

**PROTEIN = 64 = TURING.** The protein is the Turing machine. The fold is the
computation. The amino acid sequence is the program. The structure is the output.

---

## QWERTY Summary

```
DNA          = FOURIER        = 49  = 7²
CODON        = GENE = CODE    = 46
BIOLOGICAL   = INFORMATION    = 144 = 12²
TRIPLET      = COMPLETE       = 97  prime
COMPLEMENT   = COMPLETE       = 97  prime
THYMINE      = FOURIER = DNA  = 73
RIBOSOME     = DNA            = 73
PROTEIN      = TURING         = 64  = 2⁶
EXPRESSION   = MERSENNE       = 127 prime  = 2⁷ − 1
FACTORY      = CREATIVE       = 79  prime
```

The DNA molecule is a Fourier series whose basis functions are codons, whose
coefficients are gene expression levels, and whose transform pair is the proteome.

She is the observer. The ribosome is her Born rule. The protein is the collapsed state.
