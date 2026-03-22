# 003 — Newton's Prism as Change-of-Basis in ℝ³

## A Formal Decomposition of White Light in 3-Dimensional Color Vector Space

---

## 1. Definition of the Color Space

Let the RGB color space be the real vector space ℝ³. Every visible color is represented as a vector:

$$\mathbf{v} = (r,\, g,\, b)$$

where $r, g, b \in [0, 255]$ in standard 8-bit encoding, or normalized to $r, g, b \in [0, 1]$ by the map $x \mapsto x / 255$.

We work in the normalized space throughout. The color space is thus the unit cube $[0,1]^3 \subset \mathbb{R}^3$.

This space is closed under convex combination (mixing), equipped with the Euclidean inner product:

$$\langle \mathbf{u}, \mathbf{v} \rangle = u_r v_r + u_g v_g + u_b v_b$$

and the induced norm $\|\mathbf{v}\| = \sqrt{r^2 + g^2 + b^2}$.

---

## 2. White Light as Superposition

White light in this space is the vector:

$$\mathbf{W} = (1,\, 1,\, 1)$$

This is the **superposition state** — every basis component at maximum amplitude. All wavelengths present. All channels saturated. The vector $\mathbf{W}$ lies along the main diagonal of the unit cube, at maximal distance from the origin:

$$\|\mathbf{W}\| = \sqrt{1^2 + 1^2 + 1^2} = \sqrt{3}$$

---

## 3. Black as the Null Vector

Black is the vector:

$$\mathbf{B} = (0,\, 0,\, 0)$$

The **null vector**. The zero element of the vector space. The additive identity. Absence of all light. Absence of all observation. For any color $\mathbf{v}$:

$$\mathbf{v} + \mathbf{B} = \mathbf{v}$$

Black adds nothing. Black changes nothing. Black is the state before measurement.

---

## 4. The Standard Basis Vectors (Primary Colors)

The standard orthonormal basis for ℝ³ consists of three vectors, which we identify with the primary colors of light:

$$\hat{e}_r = (1,\, 0,\, 0) \quad \text{— Red}$$

$$\hat{e}_g = (0,\, 1,\, 0) \quad \text{— Green}$$

$$\hat{e}_b = (0,\, 0,\, 1) \quad \text{— Blue}$$

These vectors are orthonormal. We verify:

**Normalization:**

$$\|\hat{e}_r\| = \sqrt{1^2 + 0^2 + 0^2} = 1$$
$$\|\hat{e}_g\| = \sqrt{0^2 + 1^2 + 0^2} = 1$$
$$\|\hat{e}_b\| = \sqrt{0^2 + 0^2 + 1^2} = 1$$

**Orthogonality:**

$$\langle \hat{e}_r, \hat{e}_g \rangle = (1)(0) + (0)(1) + (0)(0) = 0$$
$$\langle \hat{e}_r, \hat{e}_b \rangle = (1)(0) + (0)(0) + (0)(1) = 0$$
$$\langle \hat{e}_g, \hat{e}_b \rangle = (0)(0) + (1)(0) + (0)(1) = 0$$

The basis is orthonormal. $\{\hat{e}_r, \hat{e}_g, \hat{e}_b\}$ spans $\mathbb{R}^3$. Every visible color has a unique representation in this basis.

---

## 5. Explicit Linear Combination

**Theorem.** Any color $\mathbf{v} \in [0,1]^3$ can be written uniquely as a linear combination of the standard basis vectors:

$$\mathbf{v} = r \cdot \hat{e}_r + g \cdot \hat{e}_g + b \cdot \hat{e}_b$$

**Proof.** Expanding the right-hand side:

$$r \cdot \hat{e}_r + g \cdot \hat{e}_g + b \cdot \hat{e}_b$$

$$= r \cdot (1, 0, 0) + g \cdot (0, 1, 0) + b \cdot (0, 0, 1)$$

$$= (r, 0, 0) + (0, g, 0) + (0, 0, b)$$

$$= (r, g, b)$$

$$= \mathbf{v} \qquad \blacksquare$$

**Application to white light:**

$$\mathbf{W} = 1 \cdot \hat{e}_r + 1 \cdot \hat{e}_g + 1 \cdot \hat{e}_b$$

$$= (1, 0, 0) + (0, 1, 0) + (0, 0, 1)$$

$$= (1, 1, 1)$$

White light is the **equal superposition** of all three basis vectors. Each primary color contributes with coefficient 1. No basis vector is privileged. This is the state of maximal symmetry.

---

## 6. The Prism as Projection Operator

Newton's prism accepts white light and decomposes it into spectral components. We formalize this as the application of **projection operators**.

Define, for each primary wavelength band $\lambda \in \{r, g, b\}$, a projection operator $P_\lambda : \mathbb{R}^3 \to \mathbb{R}^3$ that extracts the corresponding component.

**Definition.** The projection operators are the $3 \times 3$ matrices:

$$P_r = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

$$P_g = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

$$P_b = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

**Action on white light:**

$$P_r(\mathbf{W}) = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} = \hat{e}_r$$

$$P_g(\mathbf{W}) = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix} = \hat{e}_g$$

$$P_b(\mathbf{W}) = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix} = \hat{e}_b$$

The prism decomposes the superposition into its basis components. White light enters. Three primary colors exit. The prism is a **change-of-basis made physical**.

---

## 7. Completeness: The Projections Sum to Identity

**Theorem.** $P_r + P_g + P_b = I$, where $I$ is the $3 \times 3$ identity matrix.

**Proof.**

$$P_r + P_g + P_b = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} + \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix} + \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

Adding entry by entry:

Position $(1,1)$: $1 + 0 + 0 = 1$

Position $(1,2)$: $0 + 0 + 0 = 0$

Position $(1,3)$: $0 + 0 + 0 = 0$

Position $(2,1)$: $0 + 0 + 0 = 0$

Position $(2,2)$: $0 + 1 + 0 = 1$

Position $(2,3)$: $0 + 0 + 0 = 0$

Position $(3,1)$: $0 + 0 + 0 = 0$

Position $(3,2)$: $0 + 0 + 0 = 0$

Position $(3,3)$: $0 + 0 + 1 = 1$

$$P_r + P_g + P_b = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 1 \end{pmatrix} = I \qquad \blacksquare$$

**Consequence.** For any color $\mathbf{v}$:

$$P_r(\mathbf{v}) + P_g(\mathbf{v}) + P_b(\mathbf{v}) = I \cdot \mathbf{v} = \mathbf{v}$$

The decomposition is **complete**. No information is lost. The prism takes the whole and separates it into parts. The parts, summed, reconstitute the whole. Newton demonstrated this experimentally with a second prism — recombining the spectrum back into white light.

---

## 8. Idempotence: $P_\lambda^2 = P_\lambda$

**Theorem.** Each projection operator is idempotent: applying it twice yields the same result as applying it once.

**Proof for $P_r$:**

$$P_r^2 = P_r \cdot P_r = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

Computing each entry of the product $C = AB$ where $C_{ij} = \sum_k A_{ik} B_{kj}$:

$C_{11} = (1)(1) + (0)(0) + (0)(0) = 1$

$C_{12} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{13} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{21} = (0)(1) + (0)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{23} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{31} = (0)(1) + (0)(0) + (0)(0) = 0$

$C_{32} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (0)(0) = 0$

$$P_r^2 = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} = P_r \qquad \checkmark$$

**Proof for $P_g$:**

$$P_g^2 = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

$C_{11} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{12} = (0)(0) + (0)(1) + (0)(0) = 0$

$C_{13} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{21} = (0)(0) + (1)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (1)(1) + (0)(0) = 1$

$C_{23} = (0)(0) + (1)(0) + (0)(0) = 0$

$C_{31} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{32} = (0)(0) + (0)(1) + (0)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (0)(0) = 0$

$$P_g^2 = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix} = P_g \qquad \checkmark$$

**Proof for $P_b$:**

$$P_b^2 = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

$C_{11} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{12} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{13} = (0)(0) + (0)(0) + (0)(1) = 0$

$C_{21} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{23} = (0)(0) + (0)(0) + (0)(1) = 0$

$C_{31} = (0)(0) + (0)(0) + (1)(0) = 0$

$C_{32} = (0)(0) + (0)(0) + (1)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (1)(1) = 1$

$$P_b^2 = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix} = P_b \qquad \checkmark$$

Therefore $P_\lambda^2 = P_\lambda$ for all $\lambda \in \{r, g, b\}$. $\blacksquare$

**Interpretation.** Once you have isolated red light, isolating it again changes nothing. Measuring something that has already been measured yields the same result. The observation is stable. The state has **collapsed**.

---

## 9. Orthogonality: $P_i \cdot P_j = 0$ for $i \neq j$

**Theorem.** The projection operators are mutually orthogonal: the product of any two distinct projections is the zero matrix.

**Proof for $P_r \cdot P_g$:**

$$P_r \cdot P_g = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix}$$

$C_{11} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{12} = (1)(0) + (0)(1) + (0)(0) = 0$

$C_{13} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{21} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (0)(1) + (0)(0) = 0$

$C_{23} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{31} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{32} = (0)(0) + (0)(1) + (0)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (0)(0) = 0$

$$P_r \cdot P_g = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} = \mathbf{0} \qquad \checkmark$$

**Proof for $P_r \cdot P_b$:**

$$P_r \cdot P_b = \begin{pmatrix} 1 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

$C_{11} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{12} = (1)(0) + (0)(0) + (0)(0) = 0$

$C_{13} = (1)(0) + (0)(0) + (0)(1) = 0$

$C_{21} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{23} = (0)(0) + (0)(0) + (0)(1) = 0$

$C_{31} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{32} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (0)(1) = 0$

$$P_r \cdot P_b = \mathbf{0} \qquad \checkmark$$

**Proof for $P_g \cdot P_b$:**

$$P_g \cdot P_b = \begin{pmatrix} 0 & 0 & 0 \\ 0 & 1 & 0 \\ 0 & 0 & 0 \end{pmatrix} \begin{pmatrix} 0 & 0 & 0 \\ 0 & 0 & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

$C_{11} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{12} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{13} = (0)(0) + (0)(0) + (0)(1) = 0$

$C_{21} = (0)(0) + (1)(0) + (0)(0) = 0$

$C_{22} = (0)(0) + (1)(0) + (0)(0) = 0$

$C_{23} = (0)(0) + (1)(0) + (0)(1) = 0$

$C_{31} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{32} = (0)(0) + (0)(0) + (0)(0) = 0$

$C_{33} = (0)(0) + (0)(0) + (0)(1) = 0$

$$P_g \cdot P_b = \mathbf{0} \qquad \checkmark$$

By symmetry of the zero matrix, $P_g \cdot P_r = \mathbf{0}$, $P_b \cdot P_r = \mathbf{0}$, and $P_b \cdot P_g = \mathbf{0}$ as well.

Therefore $P_i \cdot P_j = \mathbf{0}$ for all $i \neq j$. $\blacksquare$

**Interpretation.** Projecting onto red and then projecting that result onto green yields nothing. The channels do not interfere. The measurements are **independent**. Red contains no green. Green contains no blue. The basis vectors are absolutely separated.

---

## 10. Newton's Prism Satisfies the Axioms of Quantum Measurement

In quantum mechanics, a projective measurement on a system with Hilbert space $\mathcal{H}$ is defined by a set of operators $\{P_i\}$ satisfying three axioms:

| Axiom | Statement | Newton's Prism |
|-------|-----------|----------------|
| **Completeness** | $\displaystyle\sum_i P_i = I$ | $P_r + P_g + P_b = I$ (Section 7) |
| **Idempotence** | $P_i^2 = P_i$ | $P_r^2 = P_r$, $P_g^2 = P_g$, $P_b^2 = P_b$ (Section 8) |
| **Orthogonality** | $P_i P_j = 0$ for $i \neq j$ | $P_r P_g = P_r P_b = P_g P_b = \mathbf{0}$ (Section 9) |

All three axioms are satisfied.

Additionally, each $P_\lambda$ is **Hermitian** ($P_\lambda = P_\lambda^\dagger$), since each is a real diagonal matrix and therefore equal to its own conjugate transpose. This satisfies the further requirement that quantum observables be self-adjoint.

The probability of measuring outcome $\lambda$ given state $\mathbf{v}$ in quantum mechanics is:

$$\text{Pr}(\lambda \mid \mathbf{v}) = \frac{\langle \mathbf{v} \mid P_\lambda \mid \mathbf{v} \rangle}{\langle \mathbf{v} \mid \mathbf{v} \rangle}$$

For white light $\mathbf{W} = (1, 1, 1)$:

$$\text{Pr}(r \mid \mathbf{W}) = \frac{\mathbf{W}^T P_r \mathbf{W}}{\mathbf{W}^T \mathbf{W}} = \frac{(1, 1, 1) \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}}{(1)(1) + (1)(1) + (1)(1)} = \frac{1}{3}$$

$$\text{Pr}(g \mid \mathbf{W}) = \frac{1}{3}, \qquad \text{Pr}(b \mid \mathbf{W}) = \frac{1}{3}$$

Each primary color is equally probable. The prism measures white light and collapses it into one of three basis states, each with probability $1/3$. The symmetry of $\mathbf{W}$ with respect to the basis guarantees equal probability. White light has **no preferred direction** in color space.

Newton built a measurement apparatus. He published it as optics. It was always linear algebra.

---

## 11. Cardinality of the Observable State Space

Each color channel is encoded in 8 bits. One byte. Values $\{0, 1, 2, \ldots, 255\}$, giving $2^8 = 256$ discrete levels per channel.

Three independent channels:

$$|\mathcal{S}| = 256 \times 256 \times 256 = 256^3$$

We compute:

$$256^3 = (2^8)^3 = 2^{8 \times 3} = 2^{24} = 16{,}777{,}216$$

The observable color space contains exactly **16,777,216** distinct states.

This factors as:

$$2^{24} = 2^{3 \times 8}$$

Three basis vectors. Eight bits each. The total information content of one color observation is 24 bits. The structure is:

$$\underbrace{8 \text{ bits}}_{\text{red}} \times \underbrace{8 \text{ bits}}_{\text{green}} \times \underbrace{8 \text{ bits}}_{\text{blue}} = 24 \text{ bits total}$$

Or equivalently, 3 bytes. One color = one point in a 24-dimensional binary hypercube projected into a 3-dimensional integer lattice.

---

## 12. Observation: 24

$$3 \times 8 = 24$$

The number of bits in a color.

The number of hours in one rotation of the Earth.

The number of frames per second in cinema (standard film: 24 fps).

The number of carats in pure gold.

The number of major and minor keys in Western tonal music.

One full rotation of the planet. One full traversal of the color space. One complete day is one complete observation — from black (midnight, $\mathbf{B} = \mathbf{0}$) through the spectrum (dawn, noon, dusk) and back to black (midnight).

This is not a proof. It is a resonance. Note it. Move on.

---

## 13. Seven Spectral Bands from Three Basis Vectors

Newton divided the visible spectrum into seven bands: **Red, Orange, Yellow, Green, Blue, Indigo, Violet** (ROYGBIV). He chose seven deliberately, by analogy with the seven notes of the diatonic major scale (C D E F G A B).

But the seven bands are **not** basis vectors. The underlying space is 3-dimensional. Seven vectors in $\mathbb{R}^3$ cannot be linearly independent — at most three can be.

The seven spectral bands are **specific linear combinations** of the three basis vectors:

| Band | Approximate RGB (normalized) | As linear combination |
|------|------------------------------|----------------------|
| Red | $(1.00,\, 0.00,\, 0.00)$ | $1.00\,\hat{e}_r + 0.00\,\hat{e}_g + 0.00\,\hat{e}_b$ |
| Orange | $(1.00,\, 0.50,\, 0.00)$ | $1.00\,\hat{e}_r + 0.50\,\hat{e}_g + 0.00\,\hat{e}_b$ |
| Yellow | $(1.00,\, 1.00,\, 0.00)$ | $1.00\,\hat{e}_r + 1.00\,\hat{e}_g + 0.00\,\hat{e}_b$ |
| Green | $(0.00,\, 1.00,\, 0.00)$ | $0.00\,\hat{e}_r + 1.00\,\hat{e}_g + 0.00\,\hat{e}_b$ |
| Blue | $(0.00,\, 0.00,\, 1.00)$ | $0.00\,\hat{e}_r + 0.00\,\hat{e}_g + 1.00\,\hat{e}_b$ |
| Indigo | $(0.29,\, 0.00,\, 0.51)$ | $0.29\,\hat{e}_r + 0.00\,\hat{e}_g + 0.51\,\hat{e}_b$ |
| Violet | $(0.56,\, 0.00,\, 1.00)$ | $0.56\,\hat{e}_r + 0.00\,\hat{e}_g + 1.00\,\hat{e}_b$ |

We can verify linear dependence. Take four of these vectors — say Red, Orange, Yellow, Green:

$$\mathbf{v}_{\text{orange}} = 1.0 \cdot \mathbf{v}_{\text{red}} + 0.5 \cdot \mathbf{v}_{\text{green}}$$

Check: $(1.0)(1, 0, 0) + (0.5)(0, 1, 0) = (1.0, 0.5, 0.0)$. Correct.

$$\mathbf{v}_{\text{yellow}} = 1.0 \cdot \mathbf{v}_{\text{red}} + 1.0 \cdot \mathbf{v}_{\text{green}}$$

Check: $(1.0)(1, 0, 0) + (1.0)(0, 1, 0) = (1.0, 1.0, 0.0)$. Correct.

Orange is not independent. Yellow is not independent. They are points along the edge of the color cube connecting Red to Green. Newton's seven bands are a **perceptual sampling** of a continuous path through $\mathbb{R}^3$, not a basis for it.

The dimension of the span:

$$\dim\left(\text{span}\{\mathbf{v}_{\text{R}}, \mathbf{v}_{\text{O}}, \mathbf{v}_{\text{Y}}, \mathbf{v}_{\text{G}}, \mathbf{v}_{\text{B}}, \mathbf{v}_{\text{I}}, \mathbf{v}_{\text{V}}\}\right) = 3$$

Seven vectors. Three dimensions. Four degrees of redundancy. Newton was mapping perceptual categories onto a 3-dimensional structure. The ear hears 7 notes in the scale. The eye sees 7 bands in the rainbow. But the ear's space is 1-dimensional (frequency). The eye's space is 3-dimensional (tristimulus). Newton forced the analogy. The mathematics reveals the forcing.

---

## 14. The # Operator

In digital color notation, every color is written:

$$\texttt{\#RRGGBB}$$

where RR, GG, BB are hexadecimal bytes encoding the coordinates in $\{0, \ldots, 255\}^3$.

**White:**

$$\texttt{\#FFFFFF} = (255, 255, 255) = (1, 1, 1) = \mathbf{W}$$

The superposition state. All channels at maximum. All basis vectors present with equal weight.

**Black:**

$$\texttt{\#000000} = (0, 0, 0) = \mathbf{B}$$

The null vector. No observation. No light. The zero element of the color space.

**Pure red:**

$$\texttt{\#FF0000} = (255, 0, 0) = \hat{e}_r$$

A basis vector. A collapsed state. A measurement outcome.

The `#` symbol is the **observation operator**. It prefixes every color code. Without `#`, the string `FF0000` is just data — six hexadecimal characters. With `#`, it becomes a coordinate: a specific point in $\mathbb{R}^3$, a specific observable state.

The `#` says: *this has been measured. This is a definite color. This is where the vector landed after projection.*

The full encoding is:

$$\texttt{\#} \underbrace{\texttt{RR}}_{\text{8 bits}} \underbrace{\texttt{GG}}_{\text{8 bits}} \underbrace{\texttt{BB}}_{\text{8 bits}}$$

One operator. Three coordinates. Twenty-four bits. One observation.

---

## Summary of Results

We have shown:

1. The RGB color space is $\mathbb{R}^3$ with orthonormal basis $\{\hat{e}_r, \hat{e}_g, \hat{e}_b\}$.

2. White light $\mathbf{W} = (1,1,1)$ is the equal superposition of all basis vectors.

3. Newton's prism implements projection operators $\{P_r, P_g, P_b\}$ that decompose $\mathbf{W}$ into its basis components.

4. These projections satisfy:
   - **Completeness**: $P_r + P_g + P_b = I$
   - **Idempotence**: $P_\lambda^2 = P_\lambda$ for all $\lambda$
   - **Orthogonality**: $P_i P_j = \mathbf{0}$ for $i \neq j$

5. These are precisely the axioms of projective quantum measurement.

6. The observable state space has cardinality $2^{24} = 2^{3 \times 8} = 16{,}777{,}216$.

7. Newton's seven spectral bands are linearly dependent vectors in a 3-dimensional space — perceptual bins, not basis vectors.

8. The `#` prefix in hex color notation functions as an observation operator, converting raw data into a definite coordinate in color space.

Newton decomposed white light in 1666. The mathematical structure he uncovered — orthogonal projection of a superposition state onto basis vectors — would not be formalized until quantum mechanics, 260 years later. The prism was always a measurement device. The rainbow was always a change of basis.

---

*Alexa Louise Amundson*
