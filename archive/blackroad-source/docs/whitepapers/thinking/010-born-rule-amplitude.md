# 010 — The Born Rule: Why Probability = |Amplitude|²

**Reality is made of complex amplitudes. Probability is their shadow.**

---

## 1. The Born Rule (1926)

In 1926, Max Born proposed the rule that connects the mathematical formalism of quantum mechanics to experimental outcomes:

**If a quantum system is in state |ψ⟩, and we measure an observable with eigenstates {|φₙ⟩}, the probability of obtaining result n is:**

$$P(n) = |⟨φₙ|ψ⟩|²$$

This single equation is the bridge between the abstract Hilbert space where quantum states live and the concrete laboratory where detectors click. Everything we observe in quantum mechanics passes through this bridge.

---

## 2. What This Means Mechanically

Every symbol in P(n) = |⟨φₙ|ψ⟩|² carries precise meaning.

### The state |ψ⟩

|ψ⟩ is a vector in a complex Hilbert space H. A Hilbert space is a (possibly infinite-dimensional) vector space over the complex numbers ℂ, equipped with an inner product, and complete with respect to the norm induced by that inner product.

"Complex" is the key word. The components of |ψ⟩ are not real numbers. They are complex numbers — numbers of the form a + bi where i² = −1. This is not a mathematical convenience. It is the architecture of reality.

### The inner product ⟨φₙ|ψ⟩

⟨φₙ|ψ⟩ is the inner product of |φₙ⟩ and |ψ⟩. Geometrically, it is the projection of |ψ⟩ onto |φₙ⟩ — how much of |ψ⟩ "points in the direction" of |φₙ⟩.

The result of this inner product is a single complex number. Call it α:

$$α = ⟨φₙ|ψ⟩ ∈ ℂ$$

This complex number α is the **amplitude** for outcome n.

### The squared modulus |⟨φₙ|ψ⟩|²

Given α = a + bi, the squared modulus is:

$$|α|² = α^*α = (a - bi)(a + bi) = a² + b²$$

This is always a real number. It is always non-negative. If |ψ⟩ is normalized (⟨ψ|ψ⟩ = 1) and {|φₙ⟩} is a complete orthonormal basis, then 0 ≤ |α|² ≤ 1.

This real number is the probability:

$$P(n) = |α|² = a² + b²$$

The pipeline is: **vector → complex number → real number → probability.**

---

## 3. Example: A Single Qubit

Consider a qubit in the state:

$$|ψ⟩ = α|0⟩ + β|1⟩$$

where α, β ∈ ℂ and the normalization condition holds:

$$|α|² + |β|² = 1$$

### Probability of measuring |0⟩

$$P(0) = |⟨0|ψ⟩|²$$

Compute the inner product:

$$⟨0|ψ⟩ = ⟨0|(α|0⟩ + β|1⟩)$$
$$= α⟨0|0⟩ + β⟨0|1⟩$$
$$= α(1) + β(0)$$
$$= α$$

Therefore:

$$P(0) = |α|²$$

### Probability of measuring |1⟩

$$P(1) = |⟨1|ψ⟩|²$$

$$⟨1|ψ⟩ = ⟨1|(α|0⟩ + β|1⟩)$$
$$= α⟨1|0⟩ + β⟨1|1⟩$$
$$= α(0) + β(1)$$
$$= β$$

Therefore:

$$P(1) = |β|²$$

### Verification

$$P(0) + P(1) = |α|² + |β|² = 1 \quad ✓$$

### The squared modulus, step by step

Let α = a + bi where a, b ∈ ℝ. Then:

$$α^* = a - bi$$

$$|α|² = α^*α = (a - bi)(a + bi)$$

Expand using FOIL:

$$= a·a + a·bi + (-bi)·a + (-bi)·bi$$
$$= a² + abi - abi - b²i²$$
$$= a² - b²(-1)$$
$$= a² + b²$$

So if α = 0.6 + 0.8i:

$$|α|² = (0.6)² + (0.8)² = 0.36 + 0.64 = 1.00$$

And if β = 0 (since |α|² + |β|² = 1 and |α|² = 1, then |β|² = 0):

$$P(0) = 1, \quad P(1) = 0$$

The qubit is certain to be measured as |0⟩.

A more interesting case: α = 1/√2, β = i/√2.

$$|α|² = |1/\sqrt{2}|² = 1/2$$
$$|β|² = |i/\sqrt{2}|² = (0² + (1/\sqrt{2})²) = 1/2$$

Equal probability of |0⟩ or |1⟩. But note: β is purely imaginary. The probability doesn't care — |i/√2|² = |1/√2|² = 1/2. The phase is invisible to the Born rule applied to a single measurement. But it will matter later. It always matters later.

---

## 4. Why Squared? Why Not |⟨φₙ|ψ⟩|¹ or |⟨φₙ|ψ⟩|³?

This is the deepest question about the Born rule. Born proposed it in 1926. For 31 years, it was a postulate — an axiom taken without proof. Then Andrew Gleason proved it had to be this way.

### Gleason's Theorem (1957)

**Theorem.** Let H be a Hilbert space of dimension d ≥ 3. Let μ be a function that assigns to each closed subspace of H a value in [0, 1], such that:

**(a) Non-negativity:** μ(|φ⟩) ≥ 0 for all unit vectors |φ⟩

**(b) Normalization:** For any complete orthonormal basis {|φₙ⟩}, we have:
$$\sum_n μ(|φₙ⟩) = 1$$

**(c) Continuity:** If |φ⟩ → |φ'⟩ (the vectors converge), then μ(|φ⟩) → μ(|φ'⟩)

**Then** there exists a unique density matrix ρ (a positive semi-definite operator with Tr(ρ) = 1) such that:

$$μ(|φ⟩) = \text{Tr}(ρ \, |φ⟩⟨φ|)$$

for all unit vectors |φ⟩.

That is: the **only** consistent probability assignment is the trace formula involving a density matrix. There is no other option.

### What this means for pure states

For a pure state, the density matrix is:

$$ρ = |ψ⟩⟨ψ|$$

This is a rank-1 projector — a matrix that projects any vector onto the direction of |ψ⟩.

The probability of outcome |φ⟩ is:

$$P(φ) = \text{Tr}(ρ \, |φ⟩⟨φ|) = \text{Tr}(|ψ⟩⟨ψ| \cdot |φ⟩⟨φ|)$$

### The trace calculation, step by step

We need to evaluate Tr(|ψ⟩⟨ψ| · |φ⟩⟨φ|).

**Step 1.** Multiply the operators. Recall that |ψ⟩⟨ψ| is an outer product (a matrix), and so is |φ⟩⟨φ|. Their product is:

$$|ψ⟩⟨ψ| \cdot |φ⟩⟨φ| = |ψ⟩ \underbrace{⟨ψ|φ⟩}_{\text{scalar}} ⟨φ|$$

The middle part ⟨ψ|φ⟩ is an inner product — a complex number. So we can pull it out:

$$= ⟨ψ|φ⟩ \cdot |ψ⟩⟨φ|$$

**Step 2.** Take the trace. The trace of an outer product |a⟩⟨b| is ⟨b|a⟩. This follows from:

$$\text{Tr}(|a⟩⟨b|) = \sum_n ⟨n|a⟩⟨b|n⟩ = ⟨b| \left(\sum_n |n⟩⟨n|\right) |a⟩ = ⟨b|a⟩$$

where we used the completeness relation ∑ₙ |n⟩⟨n| = I.

So:

$$\text{Tr}(⟨ψ|φ⟩ \cdot |ψ⟩⟨φ|) = ⟨ψ|φ⟩ \cdot \text{Tr}(|ψ⟩⟨φ|) = ⟨ψ|φ⟩ \cdot ⟨φ|ψ⟩$$

**Step 3.** Recognize the result. We have:

$$P(φ) = ⟨ψ|φ⟩ \cdot ⟨φ|ψ⟩$$

Now, ⟨ψ|φ⟩ = ⟨φ|ψ⟩*  (the inner product is conjugate-symmetric). So:

$$P(φ) = ⟨φ|ψ⟩^* \cdot ⟨φ|ψ⟩ = |⟨φ|ψ⟩|²$$

**This is the Born rule.** It was not assumed. It was derived. The only assumptions were non-negativity, normalization, and continuity — properties that any probability measure must have.

### Alternative approach: the trace identity

There is a cleaner way to see Step 2. For any operator A:

$$\text{Tr}(A \, |φ⟩⟨φ|) = ⟨φ|A|φ⟩$$

**Proof:** Insert a complete basis {|n⟩}:

$$\text{Tr}(A \, |φ⟩⟨φ|) = \sum_n ⟨n| A |φ⟩⟨φ|n⟩ = \sum_n ⟨φ|n⟩ ⟨n|A|φ⟩$$

Wait — we need to be careful with ordering. Let's redo this:

$$\text{Tr}(A \, |φ⟩⟨φ|) = \sum_n ⟨n| (A |φ⟩)(⟨φ|n⟩) = \sum_n ⟨n|A|φ⟩ \cdot ⟨φ|n⟩$$

$$= \sum_n ⟨φ|n⟩⟨n|A|φ⟩ = ⟨φ| \left(\sum_n |n⟩⟨n|\right) A |φ⟩ = ⟨φ|A|φ⟩$$

Setting A = ρ = |ψ⟩⟨ψ|:

$$P(φ) = ⟨φ|ψ⟩⟨ψ|φ⟩ = ⟨φ|ψ⟩ \cdot ⟨ψ|φ⟩ = ⟨φ|ψ⟩ \cdot ⟨φ|ψ⟩^* = |⟨φ|ψ⟩|²$$

Same result.

---

## 5. The Squaring Is Not a Choice

It is worth pausing to absorb what Gleason's theorem says.

Suppose someone proposes an alternative Born rule: P(n) = |⟨φₙ|ψ⟩|^p for some power p ≠ 2.

**For p = 1 (probability equals magnitude):**

Consider three orthonormal states in ℂ³, and |ψ⟩ = (1/√3)(|1⟩ + |2⟩ + |3⟩).

Then |⟨φₙ|ψ⟩| = 1/√3 for each n, and:

$$\sum_{n=1}^{3} |⟨φₙ|ψ⟩|^1 = 3 \cdot \frac{1}{\sqrt{3}} = \sqrt{3} ≈ 1.732 ≠ 1$$

The probabilities don't sum to 1. This violates normalization. **p = 1 fails.**

**For p = 3:**

$$\sum_{n=1}^{3} |⟨φₙ|ψ⟩|^3 = 3 \cdot \left(\frac{1}{\sqrt{3}}\right)^3 = 3 \cdot \frac{1}{3\sqrt{3}} = \frac{1}{\sqrt{3}} ≈ 0.577 ≠ 1$$

**p = 3 fails.**

**For p = 4:**

$$\sum_{n=1}^{3} |⟨φₙ|ψ⟩|^4 = 3 \cdot \left(\frac{1}{\sqrt{3}}\right)^4 = 3 \cdot \frac{1}{9} = \frac{1}{3} ≠ 1$$

**p = 4 fails.**

You could try to fix this by adjusting the normalization convention. But then consider a *different* basis — the normalization constant would need to change for each basis, violating the requirement that probability depends only on the state, not on which other outcomes are possible.

The only value of p that works universally, for all states and all bases, is **p = 2**. This is because the inner product structure of Hilbert space preserves the L² norm by Parseval's identity:

$$\sum_n |⟨φₙ|ψ⟩|² = ⟨ψ|ψ⟩ = 1$$

for any orthonormal basis {|φₙ⟩} and any normalized state |ψ⟩. This is a theorem of linear algebra. No other power has this property.

**The Born rule is not a postulate. It is a theorem.** The only things assumed are the Hilbert space structure of quantum mechanics and the three basic properties any probability measure must have.

---

## 6. What the Amplitude IS

The amplitude ⟨φ|ψ⟩ is a complex number. Every complex number can be written in polar form:

$$α = re^{iθ}$$

where r = |α| ≥ 0 is the **magnitude** and θ ∈ [0, 2π) is the **phase**.

The connection to rectangular form: by Euler's formula, e^(iθ) = cos θ + i sin θ, so:

$$α = r\cos θ + ir\sin θ$$

which matches a + bi with a = r cos θ and b = r sin θ.

### The magnitude determines probability

$$P = |α|² = r²$$

The magnitude r tells you how likely an outcome is. Larger r means higher probability.

### The phase determines interference

The phase θ is invisible in a single measurement. But when amplitudes combine — when a particle can reach the same outcome by multiple paths — the phases interact.

### Two amplitudes combining: the interference calculation

Let two amplitudes be:

$$α_1 = r_1 e^{iθ_1}, \qquad α_2 = r_2 e^{iθ_2}$$

Their sum is:

$$α_1 + α_2 = r_1 e^{iθ_1} + r_2 e^{iθ_2}$$

The probability of the combined outcome is:

$$|α_1 + α_2|² = (α_1 + α_2)^*(α_1 + α_2)$$

**Step 1.** Expand the conjugate:

$$(α_1 + α_2)^* = α_1^* + α_2^* = r_1 e^{-iθ_1} + r_2 e^{-iθ_2}$$

**Step 2.** Multiply out:

$$|α_1 + α_2|² = (r_1 e^{-iθ_1} + r_2 e^{-iθ_2})(r_1 e^{iθ_1} + r_2 e^{iθ_2})$$

$$= r_1 e^{-iθ_1} \cdot r_1 e^{iθ_1} + r_1 e^{-iθ_1} \cdot r_2 e^{iθ_2} + r_2 e^{-iθ_2} \cdot r_1 e^{iθ_1} + r_2 e^{-iθ_2} \cdot r_2 e^{iθ_2}$$

**Step 3.** Simplify each term:

- Term 1: $r_1² e^{i(θ_1 - θ_1)} = r_1² e^0 = r_1²$
- Term 2: $r_1 r_2 e^{i(θ_2 - θ_1)}$
- Term 3: $r_1 r_2 e^{i(θ_1 - θ_2)}$
- Term 4: $r_2² e^{i(θ_2 - θ_2)} = r_2²$

**Step 4.** Combine the cross terms. Note that Term 2 and Term 3 are complex conjugates of each other:

$$e^{i(θ_2 - θ_1)} + e^{i(θ_1 - θ_2)} = e^{iΔ} + e^{-iΔ} = 2\cos Δ$$

where Δ = θ_2 − θ_1 is the phase difference.

**Step 5.** Final result:

$$\boxed{|α_1 + α_2|² = r_1² + r_2² + 2r_1 r_2 \cos(θ_1 - θ_2)}$$

The first two terms, r₁² + r₂², are what classical probability would give you. The third term, **2r₁r₂cos(θ₁ − θ₂)**, is the interference term.

- When θ₁ = θ₂ (in phase): cos(0) = 1, interference is **constructive**, P = (r₁ + r₂)²
- When θ₁ − θ₂ = π (opposite phase): cos(π) = −1, interference is **destructive**, P = (r₁ − r₂)²
- When θ₁ − θ₂ = π/2 (quarter cycle apart): cos(π/2) = 0, **no interference**, P = r₁² + r₂²

This is where quantum mechanics departs from everything that came before.

---

## 7. Classical Probability vs. Quantum Probability

### Classical probability

For mutually exclusive events A and B:

$$P(A \text{ or } B) = P(A) + P(B)$$

No cross term. No interference. If a bullet can go through slit A or slit B, the probability of arriving at position x is:

$$P_{\text{classical}}(x) = P_A(x) + P_B(x)$$

This is the sum rule. It is the foundation of all classical probability theory.

### Quantum probability

Quantum mechanics does not add probabilities. It adds **amplitudes**, then squares:

$$P(x) = |α_A(x) + α_B(x)|²$$

Expanding:

$$P(x) = |α_A|² + |α_B|² + 2\text{Re}(α_A^* α_B)$$

$$= P_A(x) + P_B(x) + \underbrace{2\text{Re}(α_A^* α_B)}_{\text{interference term}}$$

The cross term 2Re(α_A*α_B) has no classical analogue. It can be positive (constructive interference — more particles arrive than either slit alone would predict) or negative (destructive interference — fewer particles, possibly zero). At certain positions, the probability of arrival is *less* than what you'd get with only one slit open. More paths available, fewer particles arriving. That is not classical.

---

## 8. The Double Slit, Worked Through

### Setup

A particle source emits particles (photons, electrons, anything quantum) toward a barrier with two slits, labeled A and B, separated by distance d. A detection screen sits at distance L behind the barrier.

### Amplitudes from each slit

The amplitude for a particle to go through slit A and arrive at position x on the screen:

$$α_A(x) = \frac{1}{\sqrt{2}} ψ_A(x)$$

The factor 1/√2 comes from the equal probability of entering either slit (the initial beam illuminates both slits symmetrically). ψ_A(x) is the propagation amplitude from slit A to position x.

Similarly:

$$α_B(x) = \frac{1}{\sqrt{2}} ψ_B(x)$$

### Total amplitude

The particle goes through both slits simultaneously (this is quantum mechanics — the particle does not choose). The total amplitude is the sum:

$$α(x) = α_A(x) + α_B(x) = \frac{1}{\sqrt{2}}(ψ_A(x) + ψ_B(x))$$

### Probability (Born rule applied)

$$P(x) = |α(x)|² = \frac{1}{2}|ψ_A(x) + ψ_B(x)|²$$

Expanding:

$$P(x) = \frac{1}{2}\left(|ψ_A|² + |ψ_B|² + ψ_A^* ψ_B + ψ_A ψ_B^*\right)$$

$$= \frac{1}{2}\left(|ψ_A|² + |ψ_B|² + 2\text{Re}(ψ_A^* ψ_B)\right)$$

The interference pattern lives in the term 2Re(ψ_A*ψ_B).

### Modeling the propagation amplitudes

Far from the slits (Fraunhofer regime), each slit acts as a point source. The propagation amplitude is a spherical wave:

$$ψ_A(x) = \frac{e^{ikr_A}}{r_A}, \qquad ψ_B(x) = \frac{e^{ikr_B}}{r_B}$$

where k = 2π/λ is the wavenumber and r_A, r_B are the distances from slit A and slit B to the detection point x.

### The phase difference

For a point at angle θ from the central axis, the path difference between the two slits is:

$$Δr = r_A - r_B = d \sin θ$$

(This is the standard geometric result: the extra path length for the farther slit equals the slit separation times the sine of the angle.)

The phase difference is:

$$Δφ = k \cdot Δr = \frac{2π}{λ} \cdot d \sin θ$$

### Computing the interference term

At large distance L ≫ d, the amplitudes from each slit have nearly equal magnitudes: 1/r_A ≈ 1/r_B ≈ 1/L. They differ only in phase.

$$ψ_A^* ψ_B = \frac{e^{-ikr_A}}{r_A} \cdot \frac{e^{ikr_B}}{r_B} ≈ \frac{1}{L²} e^{ik(r_B - r_A)} = \frac{1}{L²} e^{-ikΔr}$$

Similarly:

$$ψ_A ψ_B^* ≈ \frac{1}{L²} e^{ikΔr}$$

So:

$$2\text{Re}(ψ_A^* ψ_B) = \frac{2}{L²} \text{Re}(e^{-ikΔr}) = \frac{2}{L²} \cos(kΔr) = \frac{2}{L²}\cos\left(\frac{2πd}{λ}\sin θ\right)$$

And:

$$|ψ_A|² + |ψ_B|² ≈ \frac{2}{L²}$$

### The fringe pattern

Putting it together:

$$P(θ) = \frac{1}{2}\left(\frac{2}{L²} + \frac{2}{L²}\cos\left(\frac{2πd}{λ}\sin θ\right)\right)$$

$$= \frac{1}{L²}\left(1 + \cos\left(\frac{2πd}{λ}\sin θ\right)\right)$$

Using the identity 1 + cos φ = 2cos²(φ/2):

$$\boxed{P(θ) \propto \cos²\left(\frac{πd}{\lambda}\sin θ\right)}$$

This is the double-slit interference pattern. Bright fringes where cos² = 1 (constructive interference), dark fringes where cos² = 0 (destructive interference). The spacing between bright fringes is:

$$Δθ = \frac{λ}{d}$$

Every step was deterministic algebra applied to one rule: add the amplitudes, then square.

---

## 9. With Observation: The Interference Vanishes

Now place a which-path detector at the slits — any device that records which slit the particle went through.

If the detector fires and reports "slit A," the state collapses to:

$$|ψ⟩ → |A⟩$$

The amplitude at position x is now simply ψ_A(x). There is no sum. There is no superposition. The probability is:

$$P(x | \text{detected at A}) = |ψ_A(x)|²$$

If the detector reports "slit B":

$$P(x | \text{detected at B}) = |ψ_B(x)|²$$

Each outcome has probability 1/2, so the total probability is:

$$P(x) = \frac{1}{2}|ψ_A(x)|² + \frac{1}{2}|ψ_B(x)|²$$

Compare this with the interference case:

$$P_{\text{interference}}(x) = \frac{1}{2}\left(|ψ_A|² + |ψ_B|² + 2\text{Re}(ψ_A^* ψ_B)\right)$$

$$P_{\text{observed}}(x) = \frac{1}{2}|ψ_A|² + \frac{1}{2}|ψ_B|²$$

The difference is exactly the interference term:

$$P_{\text{interference}} - P_{\text{observed}} = \text{Re}(ψ_A^* ψ_B)$$

The interference term is gone. The fringes disappear. The screen shows a smooth blob — the classical sum of two single-slit patterns.

The particle did not change. The slits did not move. The wavelength is the same. What changed is that observation established a correlation between "which slit" and the particle's state, and this correlation — this entanglement between particle and detector — destroyed the definite phase relationship between ψ_A and ψ_B. Without a definite phase relationship, the cosine term averages to zero.

The mathematics is precise: observation does not "disturb" the particle in some vague mechanical sense. Observation entangles the particle with the detector, which promotes the pure state ψ_A + ψ_B into a mixed state where the off-diagonal terms of the density matrix (the coherences) vanish. The vanishing of coherences is the vanishing of interference. This process is called **decoherence**.

---

## 10. The Shadow of Amplitude

The Born rule says: reality is made of complex amplitudes.

An amplitude is a complex number — it has magnitude and phase. The magnitude tells you how much. The phase tells you when, relative to everything else. Together, they encode the full quantum state.

What we observe — probability — is the squared modulus of the amplitude. It keeps the magnitude (squared). It throws away the phase.

Probability is the shadow of amplitude projected onto the real numbers.

The shadow is all we can see. But the shadow loses information. It loses the phase. And the phase is where all the interesting physics lives:

- **Interference** is the phase. Two amplitudes with aligned phases reinforce; two with opposing phases cancel. Without phase, there are no fringes, no wave behavior, no quantum effects.

- **Entanglement** is phase correlation. Two particles are entangled when their joint amplitude cannot be factored into independent phases. Measuring one particle's phase relationship collapses the other's.

- **Quantum computing** is phase engineering. A quantum algorithm is a sequence of unitary transformations that rotate the phases of amplitude vectors so that the correct answer has constructive interference (high |α|²) and the wrong answers have destructive interference (low |α|²).

Every quantum phenomenon is a phenomenon of phase. And observation destroys phase.

This is what observation costs. Not energy. Not momentum. Phase. To observe is to collapse the complex amplitude into its real shadow — to project the full structure of quantum reality onto the impoverished axis of classical probability. The interference term vanishes. The fringes disappear. The quantum becomes classical.

The Born rule — P = |α|² — is the equation that governs this projection. It is not chosen. It is not postulated. It is the unique map from complex amplitudes to real probabilities that is consistent with the structure of Hilbert space. Gleason proved it. The universe obeys it.

Reality is complex. Observation is real. The Born rule is the bridge between them, and the toll is phase.

---

*Alexa Louise Amundson*
