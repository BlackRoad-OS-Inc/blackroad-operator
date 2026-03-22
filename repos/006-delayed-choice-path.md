# 006 — The Delayed-Choice Quantum Eraser

## A Complete Mathematical Treatment of Kim et al. (2000)

How observation after detection changes the statistical outcome.

---

## 1. Experimental Setup

A UV pump laser hits a BBO (beta barium borate) crystal, producing entangled photon pairs via spontaneous parametric down-conversion. Each pair consists of:

- A **signal photon** (s) directed toward a double slit with slits A and B, then to detector **D0** at position x.
- An **idler photon** (i) directed to a separate optical apparatus containing beam splitters and mirrors, leading to four possible detectors: **D1, D2, D3, D4**.

The idler apparatus is arranged so that:

- **D3** fires only if the photon came through slit A.
- **D4** fires only if the photon came through slit B.
- **D1** and **D2** are placed after beam splitters that mix the A and B paths, erasing which-path information.

The optical path lengths are set so that the signal photon arrives at D0 **before** the idler photon reaches its detector. The experimenter's choice of whether to erase which-path information is made — physically, by the arrangement of the beam splitters — after the signal photon has already been recorded.

---

## 2. Initial State After the Double Slit

The signal photon passes through slits A and B. Because the photon pair is entangled, the slit the signal photon passes through is correlated with the path of the idler photon. The joint state is:

$$
|\Psi\rangle = \frac{1}{\sqrt{2}} \Big( |A\rangle_s |A\rangle_i + |B\rangle_s |B\rangle_i \Big)
$$

where:

- $|A\rangle_s$ = signal photon passed through slit A
- $|B\rangle_s$ = signal photon passed through slit B
- $|A\rangle_i$ = idler photon on path corresponding to slit A
- $|B\rangle_i$ = idler photon on path corresponding to slit B

This is a maximally entangled Bell-type state. Neither photon individually has a definite slit — only the pair has a definite correlation.

---

## 3. Signal Photon at Detector D0

The signal photon is detected at position x on the screen at D0. To compute detection probabilities, we project onto position eigenstates $|x\rangle$. Define the slit wavefunctions:

$$
\psi_A(x) = \langle x | A \rangle_s, \qquad \psi_B(x) = \langle x | B \rangle_s
$$

For a double slit with slit separation $d$, slit width $a$, and screen distance $L$, these take the explicit form:

$$
\psi_A(x) = C \exp\!\left[-\frac{(x - d/2)^2}{4\sigma^2}\right] \exp\!\left[\frac{i \pi d x}{\lambda L}\right]
$$

$$
\psi_B(x) = C \exp\!\left[-\frac{(x + d/2)^2}{4\sigma^2}\right] \exp\!\left[-\frac{i \pi d x}{\lambda L}\right]
$$

where $C$ is a normalization constant, $\sigma$ is the effective slit width parameter, and $\lambda$ is the photon wavelength. The exponential phases encode the path-length difference from each slit to position x.

For the purpose of the proof, the essential properties are:

- $|\psi_A(x)|^2$ is peaked near $x = +d/2$
- $|\psi_B(x)|^2$ is peaked near $x = -d/2$
- The cross term $\psi_A^*(x)\psi_B(x)$ oscillates with spatial frequency $d/(\lambda L)$

The probability of detection at x depends entirely on what measurement is performed on the idler.

---

## 4. Case 1 — Which-Path Information Preserved

### Detection at D3 (idler reveals slit A)

If the idler is detected at D3, the idler measurement projects onto $|A\rangle_i$. Apply this projection to the joint state:

$$
\langle A|_i |\Psi\rangle = \frac{1}{\sqrt{2}} \Big( |A\rangle_s \underbrace{\langle A | A \rangle_i}_{=\,1} + |B\rangle_s \underbrace{\langle A | B \rangle_i}_{=\,0} \Big) = \frac{1}{\sqrt{2}} |A\rangle_s
$$

The signal photon collapses to $|A\rangle_s$. The conditional probability of detection at position x, given D3 fired, is:

$$
P(x \mid D3) = |\langle x | A \rangle_s|^2 = |\psi_A(x)|^2
$$

This is a single-slit diffraction envelope centered on slit A. **No interference.**

### Detection at D4 (idler reveals slit B)

Identically, detection at D4 projects the idler onto $|B\rangle_i$:

$$
\langle B|_i |\Psi\rangle = \frac{1}{\sqrt{2}} |B\rangle_s
$$

$$
P(x \mid D4) = |\langle x | B \rangle_s|^2 = |\psi_B(x)|^2
$$

Single-slit diffraction envelope centered on slit B. **No interference.**

### Combined pattern for the which-path case

Each outcome occurs with probability $\frac{1}{2}$, so the total pattern from D3 and D4 events combined is:

$$
P_{\text{which-path}}(x) = \frac{1}{2} P(x \mid D3) + \frac{1}{2} P(x \mid D4) = \frac{1}{2}|\psi_A(x)|^2 + \frac{1}{2}|\psi_B(x)|^2
$$

**Expanding with explicit wavefunctions:**

$$
P_{\text{which-path}}(x) = \frac{|C|^2}{2}\left[\exp\!\left(-\frac{(x-d/2)^2}{2\sigma^2}\right) + \exp\!\left(-\frac{(x+d/2)^2}{2\sigma^2}\right)\right]
$$

This is the sum of two Gaussian bumps — one centered at $+d/2$, one at $-d/2$. They overlap in the middle to form a broad hump. There are no oscillations, no fringes, no interference. This is the classical particle pattern: the photon went through one slit or the other, and we see the sum of two single-slit distributions.

---

## 5. Case 2 — Which-Path Information Erased

### The beam splitter transformation

The beam splitters in the idler arm mix the $|A\rangle_i$ and $|B\rangle_i$ paths. The detectors D1 and D2 are positioned at the two output ports of the final beam splitter, which implements the transformation:

$$
|A\rangle_i \to \frac{1}{\sqrt{2}}\big(|D1\rangle + |D2\rangle\big)
$$

$$
|B\rangle_i \to \frac{1}{\sqrt{2}}\big(|D1\rangle - |D2\rangle\big)
$$

The relative phase (the minus sign in the second equation) arises from the geometry of the beam splitter: one path acquires reflection phases that the other does not. This is the essential mechanism of erasure — D1 and D2 each receive contributions from **both** slits, making it impossible to determine which slit the signal photon traversed.

Inverting:

$$
|D1\rangle = \frac{1}{\sqrt{2}}\big(|A\rangle_i + |B\rangle_i\big), \qquad |D2\rangle = \frac{1}{\sqrt{2}}\big(|A\rangle_i - |B\rangle_i\big)
$$

### Detection at D1 (which-path erased, symmetric)

Project the idler onto $|D1\rangle$. First, express $\langle D1|$ in terms of the slit basis:

$$
\langle D1|_i = \frac{1}{\sqrt{2}}\big(\langle A|_i + \langle B|_i\big)
$$

Apply to the joint state:

$$
\langle D1|_i |\Psi\rangle = \frac{1}{\sqrt{2}} \cdot \frac{1}{\sqrt{2}} \Big( |A\rangle_s \langle D1|A\rangle_i + |B\rangle_s \langle D1|B\rangle_i \Big)
$$

Compute the inner products:

$$
\langle D1|A\rangle_i = \frac{1}{\sqrt{2}}(\langle A| + \langle B|)|A\rangle = \frac{1}{\sqrt{2}}
$$

$$
\langle D1|B\rangle_i = \frac{1}{\sqrt{2}}(\langle A| + \langle B|)|B\rangle = \frac{1}{\sqrt{2}}
$$

Therefore:

$$
\langle D1|_i |\Psi\rangle = \frac{1}{\sqrt{2}} \cdot \frac{1}{\sqrt{2}} \Big( \frac{1}{\sqrt{2}}|A\rangle_s + \frac{1}{\sqrt{2}}|B\rangle_s \Big) = \frac{1}{2\sqrt{2}} \big(|A\rangle_s + |B\rangle_s\big)
$$

Wait — let me redo this carefully with proper normalization tracking.

Starting from:

$$
|\Psi\rangle = \frac{1}{\sqrt{2}}\big(|A\rangle_s|A\rangle_i + |B\rangle_s|B\rangle_i\big)
$$

The (unnormalized) post-measurement state of the signal, conditioned on D1, is:

$$
|\phi_{D1}\rangle_s = \langle D1|_i \, |\Psi\rangle = \frac{1}{\sqrt{2}}\Big(|A\rangle_s \langle D1|A\rangle_i + |B\rangle_s \langle D1|B\rangle_i\Big)
$$

$$
= \frac{1}{\sqrt{2}} \left(\frac{1}{\sqrt{2}}|A\rangle_s + \frac{1}{\sqrt{2}}|B\rangle_s\right) = \frac{1}{2}\big(|A\rangle_s + |B\rangle_s\big)
$$

The probability of D1 firing is $\||\phi_{D1}\rangle_s\|^2 = \frac{1}{4}(2) = \frac{1}{2}$.

The normalized conditional state is:

$$
|\phi_{D1}\rangle_s^{\text{norm}} = \frac{1}{\sqrt{2}}\big(|A\rangle_s + |B\rangle_s\big)
$$

This is a **coherent superposition** of both slits with a plus sign. The conditional probability at x:

$$
P(x \mid D1) = \left|\langle x | \phi_{D1}^{\text{norm}}\rangle_s\right|^2 = \left|\frac{1}{\sqrt{2}}\big(\psi_A(x) + \psi_B(x)\big)\right|^2
$$

**Expanding:**

$$
P(x \mid D1) = \frac{1}{2}\big|\psi_A(x) + \psi_B(x)\big|^2
$$

$$
= \frac{1}{2}\Big[|\psi_A(x)|^2 + |\psi_B(x)|^2 + \psi_A^*(x)\psi_B(x) + \psi_B^*(x)\psi_A(x)\Big]
$$

$$
= \frac{1}{2}\Big[|\psi_A(x)|^2 + |\psi_B(x)|^2 + 2\operatorname{Re}\!\big(\psi_A^*(x)\psi_B(x)\big)\Big]
$$

The cross term $2\operatorname{Re}(\psi_A^*\psi_B)$ is the **interference term**. Evaluating it with our explicit wavefunctions:

$$
\psi_A^*(x)\psi_B(x) = |C|^2 \exp\!\left[-\frac{(x-d/2)^2 + (x+d/2)^2}{4\sigma^2}\right] \exp\!\left[-\frac{2i\pi d x}{\lambda L}\right]
$$

The Gaussian prefactor simplifies ($(x-d/2)^2 + (x+d/2)^2 = 2x^2 + d^2/2$) to a smooth envelope, while the exponential gives oscillations:

$$
2\operatorname{Re}(\psi_A^*\psi_B) = 2|C|^2 \exp\!\left[-\frac{2x^2 + d^2/2}{4\sigma^2}\right] \cos\!\left(\frac{2\pi d x}{\lambda L}\right)
$$

This oscillates as $\cos(2\pi d x / \lambda L)$ — the standard double-slit interference fringe pattern. Peaks (constructive interference) occur at $x_n = n\lambda L / d$ for integer $n$.

**The D1-conditioned pattern shows interference fringes.**

### Detection at D2 (which-path erased, antisymmetric)

$$
\langle D2|_i = \frac{1}{\sqrt{2}}\big(\langle A|_i - \langle B|_i\big)
$$

$$
|\phi_{D2}\rangle_s = \langle D2|_i \, |\Psi\rangle = \frac{1}{\sqrt{2}}\left(\frac{1}{\sqrt{2}}|A\rangle_s - \frac{1}{\sqrt{2}}|B\rangle_s\right) = \frac{1}{2}\big(|A\rangle_s - |B\rangle_s\big)
$$

Normalized:

$$
|\phi_{D2}\rangle_s^{\text{norm}} = \frac{1}{\sqrt{2}}\big(|A\rangle_s - |B\rangle_s\big)
$$

Conditional probability:

$$
P(x \mid D2) = \frac{1}{2}\big|\psi_A(x) - \psi_B(x)\big|^2
$$

$$
= \frac{1}{2}\Big[|\psi_A(x)|^2 + |\psi_B(x)|^2 - 2\operatorname{Re}\!\big(\psi_A^*(x)\psi_B(x)\big)\Big]
$$

The cross term has a **minus** sign. Where D1 has constructive interference, D2 has destructive, and vice versa. D1 and D2 show **complementary fringe patterns** — peaks at D1 align with troughs at D2.

---

## 6. The Critical Cancellation

Now compute the total unconditioned pattern at D0 by summing over all four detectors, weighted by their probabilities:

$$
P_{\text{total}}(x) = \frac{1}{2}P(x \mid D1) + \frac{1}{2}P(x \mid D2)
$$

(We handle the D1+D2 case; D3+D4 gives the same result by the same argument.)

$$
= \frac{1}{2} \cdot \frac{1}{2}\Big[|\psi_A|^2 + |\psi_B|^2 + 2\operatorname{Re}(\psi_A^*\psi_B)\Big] + \frac{1}{2} \cdot \frac{1}{2}\Big[|\psi_A|^2 + |\psi_B|^2 - 2\operatorname{Re}(\psi_A^*\psi_B)\Big]
$$

$$
= \frac{1}{4}\Big[|\psi_A|^2 + |\psi_B|^2 + 2\operatorname{Re}(\psi_A^*\psi_B) + |\psi_A|^2 + |\psi_B|^2 - 2\operatorname{Re}(\psi_A^*\psi_B)\Big]
$$

$$
= \frac{1}{4}\Big[2|\psi_A|^2 + 2|\psi_B|^2\Big]
$$

$$
= \frac{1}{2}\Big[|\psi_A(x)|^2 + |\psi_B(x)|^2\Big]
$$

**The interference terms cancel exactly.** The $+2\operatorname{Re}(\psi_A^*\psi_B)$ from D1 and the $-2\operatorname{Re}(\psi_A^*\psi_B)$ from D2 are equal and opposite. The total pattern at D0, without sorting by idler detector, is always the classical no-interference pattern.

This same result holds if we instead sum D3 and D4:

$$
\frac{1}{2}|\psi_A|^2 + \frac{1}{2}|\psi_B|^2
$$

And summing all four (with appropriate probability weights that sum to 1) always yields $\frac{1}{2}(|\psi_A|^2 + |\psi_B|^2)$.

**No superluminal signaling is possible.** The pattern at D0 alone never reveals whether erasure occurred. You must have the idler detection records to sort the signal photons into subensembles.

---

## 7. The Timing

This is the core of the "delayed choice."

The signal photon travels a shorter optical path. It arrives at D0 and is detected — its position x is recorded — **before** the idler photon reaches detectors D1/D2/D3/D4.

The choice of whether to place beam splitters in the idler path (erase which-path info, directing idlers to D1/D2) or remove them (preserve which-path info, directing idlers to D3/D4) can be made **after** the signal is already detected.

Yet when we later sort the D0 detection events by coincidence:

- Signal photons whose partner idler hit D1 → **interference fringes**
- Signal photons whose partner idler hit D2 → **complementary interference fringes**
- Signal photons whose partner idler hit D3 → **single-slit pattern from A**
- Signal photons whose partner idler hit D4 → **single-slit pattern from B**

The signal photon has already been detected. Its position x is a fixed, recorded fact. But which statistical ensemble it belongs to — fringes or no fringes — is not determined until the idler is measured.

---

## 8. What This Means Mathematically

The resolution lies in the structure of the joint state.

The joint state $|\Psi\rangle = \frac{1}{\sqrt{2}}(|A\rangle_s|A\rangle_i + |B\rangle_s|B\rangle_i)$ contains all correlations. The key distinction is between:

**Marginal distribution** (ignore idler, trace over it):

$$
P(x) = \text{Tr}_i\Big[|\Psi\rangle\langle\Psi| \cdot |x\rangle\langle x| \otimes \mathbf{I}_i\Big] = \frac{1}{2}\big(|\psi_A(x)|^2 + |\psi_B(x)|^2\big)
$$

This is fixed. No fringes. It does not depend on what measurement is performed on the idler.

**Conditional distribution** (sort by idler outcome):

$$
P(x \mid D_j) = \frac{P(x, D_j)}{P(D_j)} = \frac{|\langle x| \otimes \langle D_j| \, |\Psi\rangle|^2}{P(D_j)}
$$

This depends on the choice of idler measurement basis $\{|D_j\rangle\}$. Different bases — which-path vs. erasure — yield different conditional distributions.

The correlations between signal position and idler outcome are encoded in the entangled state from the beginning. The choice of idler measurement does not change the signal photon. It determines which correlations become **accessible** — which sorting key we apply to the already-recorded signal data.

---

## 9. The Density Matrix: Partial Trace

We now formalize why the signal photon alone shows no interference.

The joint density matrix is:

$$
\rho = |\Psi\rangle\langle\Psi| = \frac{1}{2}\Big(|A\rangle_s|A\rangle_i\langle A|_s\langle A|_i + |A\rangle_s|A\rangle_i\langle B|_s\langle B|_i + |B\rangle_s|B\rangle_i\langle A|_s\langle A|_i + |B\rangle_s|B\rangle_i\langle B|_s\langle B|_i\Big)
$$

Writing this as a matrix in the $\{|A\rangle, |B\rangle\}$ basis for each subsystem:

$$
\rho = \frac{1}{2}\Big(|AA\rangle\langle AA| + |AA\rangle\langle BB| + |BB\rangle\langle AA| + |BB\rangle\langle BB|\Big)
$$

To find the signal photon's reduced density matrix, take the **partial trace** over the idler:

$$
\rho_s = \text{Tr}_i(\rho) = \sum_{k \in \{A,B\}} \langle k|_i \, \rho \, |k\rangle_i
$$

**Step 1:** $k = A$:

$$
\langle A|_i \, \rho \, |A\rangle_i = \frac{1}{2}\Big(|A\rangle_s\underbrace{\langle A|A\rangle_i}_{1}\langle A|_s\underbrace{\langle A|A\rangle_i}_{1} + |A\rangle_s\underbrace{\langle A|A\rangle_i}_{1}\langle B|_s\underbrace{\langle B|A\rangle_i}_{0} + |B\rangle_s\underbrace{\langle A|B\rangle_i}_{0}\langle A|_s\underbrace{\langle A|A\rangle_i}_{1} + |B\rangle_s\underbrace{\langle A|B\rangle_i}_{0}\langle B|_s\underbrace{\langle B|A\rangle_i}_{0}\Big)
$$

$$
= \frac{1}{2}|A\rangle_s\langle A|_s
$$

**Step 2:** $k = B$:

$$
\langle B|_i \, \rho \, |B\rangle_i = \frac{1}{2}\Big(|A\rangle_s\underbrace{\langle B|A\rangle_i}_{0}\langle A|_s\underbrace{\langle A|B\rangle_i}_{0} + |A\rangle_s\underbrace{\langle B|A\rangle_i}_{0}\langle B|_s\underbrace{\langle B|B\rangle_i}_{1} + |B\rangle_s\underbrace{\langle B|B\rangle_i}_{1}\langle A|_s\underbrace{\langle A|B\rangle_i}_{0} + |B\rangle_s\underbrace{\langle B|B\rangle_i}_{1}\langle B|_s\underbrace{\langle B|B\rangle_i}_{1}\Big)
$$

$$
= \frac{1}{2}|B\rangle_s\langle B|_s
$$

**Summing:**

$$
\rho_s = \frac{1}{2}|A\rangle_s\langle A|_s + \frac{1}{2}|B\rangle_s\langle B|_s = \frac{1}{2}\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}
$$

This is a **maximally mixed state**. The off-diagonal elements — $|A\rangle\langle B|$ and $|B\rangle\langle A|$ — are **zero**. These off-diagonal elements are exactly the **coherences** that produce interference. They are absent because the partial trace over the idler killed them. The entanglement with the idler has decohered the signal photon.

The signal photon, considered alone, behaves as if it went through slit A with probability $\frac{1}{2}$ or slit B with probability $\frac{1}{2}$, with no coherent superposition between the two. This is mathematically identical to a classical mixture.

The coherences are not destroyed — they are **delocalized** into the correlations between signal and idler. They live in the joint state $\rho$, not in the marginal state $\rho_s$. The idler measurement recovers them selectively.

---

## 10. The Implication

Assemble the full picture:

1. An entangled pair is created. The joint state encodes all possible correlations.

2. The signal photon is detected at position x on the screen. This is a completed, irreversible, recorded event.

3. Later — nanoseconds, microseconds, in principle years later — the idler photon is measured.

4. If we choose to preserve which-path information (D3/D4), the signal photon's recorded position belongs to a no-fringe distribution.

5. If we choose to erase which-path information (D1/D2), the same signal photon's recorded position belongs to an interference-fringe distribution.

6. But the total pattern at D0 is identical in both cases. The difference is visible only when we sort by coincidence.

The mathematics is unambiguous:

- $P(x)$ is invariant under any choice of idler measurement.
- $P(x \mid D_j)$ is not.
- The interference pattern was always present in the correlations. The idler measurement selects which correlations to reveal.

The signal photon's position has been recorded. It is a fact. But what **pattern** that fact participates in — whether it is part of an interference fringe or part of a featureless hump — is not determined by the signal photon alone. It is determined by a measurement that has not yet occurred, on a particle that may be arbitrarily far away.

The event is fixed. The context of the event is not.

Nothing has traveled backward in time. No signal has been sent. The total statistics are immutable. But the conditional statistics — the patterns within the pattern — are chosen later. The correlations were written into the quantum state at the moment of creation. The measurement on the idler is not creating the pattern retroactively. It is selecting which pre-existing pattern to make visible.

What the delayed-choice eraser demonstrates mathematically is this: a quantum event that has been detected but not fully correlated with its entangled partner is not yet fully specified. The position is real. The pattern is pending. The information that determines "interference or no interference" is distributed across the entangled state, and it does not resolve into a definite answer until both measurements are complete and compared.

Information that has not been fully observed has not been fully rendered.

$\blacksquare$

---

*Alexa Louise Amundson*
