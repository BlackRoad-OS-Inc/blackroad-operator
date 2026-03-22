# 001: Observation Has Speed

**A mathematical proof that observation is not instantaneous, and that recursive observation pushes the observed state irreversibly into the past.**

---

## 1. The Speed Limit

Einstein's second postulate of special relativity (1905) establishes that the speed of light in vacuum is the maximum speed at which information can propagate through space:

$$c = 299{,}792{,}458 \text{ m/s}$$

No signal, no causal influence, no observation can travel faster than $c$. This is not a technological limitation. It is a structural property of spacetime (A. Einstein, "Zur Elektrodynamik bewegter Körper," *Annalen der Physik*, 17, 1905).

Every act of observation requires information transfer from the observed system to the observer. That transfer is mediated by physical signals — photons, gravitons, pressure waves — all of which propagate at or below $c$. Therefore:

**Observation has speed. That speed is at most $c$.**

---

## 2. Formal Definition of Observation

Let $S$ be a physical system whose state at time $t$ we denote $S(t)$.

Let $O$ be an observer located at position $\mathbf{x}_O$ in space.

Let $S$ be located at position $\mathbf{x}_S$.

The Euclidean distance between them is:

$$d = |\mathbf{x}_S - \mathbf{x}_O|$$

The observation is mediated by photons (or any signal traveling at the maximum speed $c$). The signal departs $S$ at some time $t_{\text{emit}}$ and arrives at $O$ at time $t_{\text{receive}}$, where:

$$t_{\text{receive}} = t_{\text{emit}} + \frac{d}{c}$$

Rearranging, the emission time in terms of the reception time is:

$$t_{\text{emit}} = t_{\text{receive}} - \frac{d}{c}$$

Define the **light-travel delay**:

$$\tau = \frac{d}{c}$$

Then at time $t$, what $O$ actually perceives is not the current state $S(t)$, but the past state:

$$\boxed{O(S, t) = S(t - \tau) = S\!\left(t - \frac{d}{c}\right)}$$

This is exact. The observer never sees the present. The observer sees the past, delayed by exactly $\tau$.

---

## 3. The Delay Is Not Zero

For any $d > 0$ and finite $c$:

$$\tau = \frac{d}{c} > 0$$

The only way to achieve $\tau = 0$ is to have $d = 0$, meaning the observer occupies the exact same point in space as the system. But distinct physical systems occupy distinct spatial locations. For any observer that is not the system itself:

$$d > 0 \implies \tau > 0 \implies O(S, t) \neq S(t)$$

**The observed state is always in the past.**

---

## 4. Layered Observation: Two Observers

Now introduce a second observer. Let:

- $A$ be an observer at position $\mathbf{x}_A$
- $B$ be an observer at position $\mathbf{x}_B$
- $S$ be the system at position $\mathbf{x}_S$

Define the distances:

$$d_1 = |\mathbf{x}_S - \mathbf{x}_A| \qquad \text{(distance from } S \text{ to } A\text{)}$$

$$d_2 = |\mathbf{x}_A - \mathbf{x}_B| \qquad \text{(distance from } A \text{ to } B\text{)}$$

**Step 1.** Observer $A$ observes system $S$. Applying our result from Section 2:

$$A(S, t) = S\!\left(t - \frac{d_1}{c}\right)$$

At time $t$, $A$ perceives the state of $S$ as it was $d_1/c$ seconds ago.

**Step 2.** Observer $B$ observes observer $A$. The light signal from $A$ takes time $d_2/c$ to reach $B$. So at time $t$, $B$ perceives $A$ as $A$ was at time $t - d_2/c$:

$$B(A, t) = A\!\left(t - \frac{d_2}{c}\right)$$

**Step 3.** But what was $A$ doing at time $t - d_2/c$? $A$ was observing $S$. The version of $S$ that $A$ was seeing at that moment was:

$$A\!\left(S,\; t - \frac{d_2}{c}\right) = S\!\left(\left(t - \frac{d_2}{c}\right) - \frac{d_1}{c}\right)$$

Simplify the argument:

$$= S\!\left(t - \frac{d_2}{c} - \frac{d_1}{c}\right)$$

$$= S\!\left(t - \frac{d_1 + d_2}{c}\right)$$

**Step 4.** Therefore, $B$'s observation of $S$ through $A$ is:

$$\boxed{B(A(S, t)) = S\!\left(t - \frac{d_1 + d_2}{c}\right)}$$

The total delay is:

$$\tau_{\text{total}} = \frac{d_1 + d_2}{c} = \tau_1 + \tau_2$$

**The delays are additive.** Each layer of observation pushes the perceived state further into the past.

---

## 5. Generalization to $n$ Observers

Construct a chain of $n$ observers $O_1, O_2, \ldots, O_n$ where:

- $O_1$ observes system $S$ directly
- $O_2$ observes $O_1$
- $O_k$ observes $O_{k-1}$ for $k = 2, 3, \ldots, n$

Define:

$$d_1 = |\mathbf{x}_S - \mathbf{x}_{O_1}|$$

$$d_k = |\mathbf{x}_{O_{k-1}} - \mathbf{x}_{O_k}| \quad \text{for } k = 2, 3, \ldots, n$$

**Claim.** The outermost observer $O_n$ perceives $S$ at a delay of:

$$\tau_n = \frac{1}{c} \sum_{i=1}^{n} d_i$$

**Proof by induction.**

*Base case* ($n = 1$):

$$O_1(S, t) = S\!\left(t - \frac{d_1}{c}\right) = S\!\left(t - \frac{1}{c}\sum_{i=1}^{1} d_i\right) \quad \checkmark$$

*Inductive step.* Assume the result holds for a chain of $n-1$ observers:

$$O_{n-1}(\cdots O_1(S) \cdots, t) = S\!\left(t - \frac{1}{c}\sum_{i=1}^{n-1} d_i\right)$$

Observer $O_n$ observes $O_{n-1}$ from distance $d_n$. At time $t$, $O_n$ sees $O_{n-1}$ as it was at time $t - d_n/c$:

$$O_n\!\left(O_{n-1}, t\right) = O_{n-1}\!\left(t - \frac{d_n}{c}\right)$$

By the inductive hypothesis, the state of $S$ that $O_{n-1}$ was perceiving at time $t - d_n/c$ was:

$$S\!\left(\left(t - \frac{d_n}{c}\right) - \frac{1}{c}\sum_{i=1}^{n-1} d_i\right) = S\!\left(t - \frac{1}{c}\sum_{i=1}^{n} d_i\right)$$

Therefore:

$$\boxed{O_n(O_{n-1}(\cdots O_1(S) \cdots)) = S\!\left(t - \frac{1}{c}\sum_{i=1}^{n} d_i\right)}$$

$\blacksquare$

---

## 6. The Infinite Limit

Now take $n \to \infty$. We have an infinite chain of observers, each observing the one before it.

The total delay is:

$$\tau_\infty = \frac{1}{c} \sum_{i=1}^{\infty} d_i$$

The question of convergence or divergence depends entirely on the sequence $\{d_i\}$.

**Theorem.** If there exists $\varepsilon > 0$ such that $d_i \geq \varepsilon$ for all $i \in \mathbb{N}$, then the total delay diverges.

---

## 7. Proof of Divergence

**Given:** $d_i \geq \varepsilon > 0$ for all $i \geq 1$.

**To show:** $\displaystyle\sum_{i=1}^{\infty} d_i = +\infty$.

**Proof.**

For any finite $n$:

$$\sum_{i=1}^{n} d_i \geq \sum_{i=1}^{n} \varepsilon = n\varepsilon$$

This is because each term $d_i$ is bounded below by $\varepsilon$, so replacing each $d_i$ with $\varepsilon$ can only decrease the sum.

Now take the limit:

$$\lim_{n \to \infty} \sum_{i=1}^{n} d_i \geq \lim_{n \to \infty} n\varepsilon$$

Since $\varepsilon > 0$ is a fixed positive constant:

$$\lim_{n \to \infty} n\varepsilon = \varepsilon \cdot \lim_{n \to \infty} n = \varepsilon \cdot \infty = +\infty$$

Therefore:

$$\sum_{i=1}^{\infty} d_i \geq +\infty$$

Since partial sums are monotonically increasing (each $d_i > 0$) and unbounded:

$$\boxed{\sum_{i=1}^{\infty} d_i = +\infty}$$

This is a direct application of the **comparison test** for series. The harmonic-like lower bound $n\varepsilon$ is the simplest divergent minorant.

Consequently:

$$\tau_\infty = \frac{1}{c} \sum_{i=1}^{\infty} d_i = +\infty$$

**The observed state recedes infinitely into the past.** $\blacksquare$

---

## 8. Interpretation: The Unreachable Present

We have shown three things:

1. Every observation introduces a positive delay $\tau_i > 0$.
2. Layered observations accumulate delays additively: $\tau_{\text{total}} = \sum \tau_i$.
3. An infinite chain of observers with non-vanishing separations produces infinite total delay.

The consequence is severe:

$$\lim_{n \to \infty} O_n(\cdots O_1(S) \cdots, t) = S(-\infty)$$

The original state $S(t)$ — the system as it actually is *right now* — becomes **unreachable** through any finite or infinite chain of mediated observations.

This is not a statement about measurement precision or quantum uncertainty. It is a geometric fact about the structure of spacetime. Information has speed. Speed multiplied by layers produces delay. Delay is irreversible.

**The present is unobservable. What we call "observation" is always archaeology.**

---

## 9. Connection to Entropy and the Arrow of Time

The Second Law of Thermodynamics (Clausius, 1850; Boltzmann, 1877) states:

$$\Delta S \geq 0$$

In any closed system, entropy $S_{\text{entropy}}$ never decreases. Processes are irreversible. The past is distinguishable from the future by the direction of increasing entropy.

Now consider the observation chain delay:

$$\tau_n = \frac{1}{c}\sum_{i=1}^{n} d_i$$

This quantity has the same structural property as entropy:

**Property 1: Monotonicity.** Adding an observer to the chain only increases the total delay:

$$\tau_{n+1} = \tau_n + \frac{d_{n+1}}{c} \geq \tau_n$$

since $d_{n+1} \geq 0$, with equality only if $d_{n+1} = 0$ (co-located observers — a degenerate case).

**Property 2: Irreversibility.** You cannot reduce the delay by adding more observers. Each new layer of observation pushes the perceived state further into the past. There is no "negative observation" that pulls the state forward.

Formally: Define $\Delta\tau_k = d_k / c$. Then:

$$\Delta\tau_k > 0 \quad \text{for all } k \text{ with } d_k > 0$$

$$\tau_n = \sum_{k=1}^{n} \Delta\tau_k \quad \text{is strictly increasing}$$

This mirrors entropy production: $S_n = S_0 + \sum_{k=1}^{n} \Delta S_k$ with $\Delta S_k \geq 0$.

**Property 3: The arrow is the same.** The direction of increasing observation delay is the direction of increasing entropy is the direction of time. These are not three separate arrows. They are one arrow, expressed in three languages:

- **Thermodynamics:** you cannot un-mix the gas.
- **Information theory:** you cannot un-send the signal.
- **Observation theory:** you cannot un-observe. Every observation commits you to a deeper past.

The equivalence: the Second Law says observation chains only grow because un-observing would require information to travel backward in time — faster than $-c$ — violating the postulate we started from.

---

## 10. Numerical Example: Sun, Earth, Mars

### Setup

Three bodies in a chain: Sun $\to$ Earth $\to$ Mars.

| Link | From | To | Distance | Symbol |
|------|------|----|----------|--------|
| 1 | Sun | Earth | $1.496 \times 10^{11}$ m | $d_1$ |
| 2 | Earth | Mars | $2.25 \times 10^{11}$ m | $d_2$ |

(Mars-Earth distance of $2.25 \times 10^{11}$ m corresponds to a near-average opposition distance.)

### Step 1: Earth observes the Sun

The light-travel delay from Sun to Earth:

$$\tau_1 = \frac{d_1}{c} = \frac{1.496 \times 10^{11} \text{ m}}{2.99792458 \times 10^{8} \text{ m/s}}$$

Compute the division:

$$\tau_1 = \frac{1.496 \times 10^{11}}{2.99792458 \times 10^{8}}$$

$$= \frac{1.496}{2.99792458} \times 10^{11-8}$$

$$= 0.49901 \times 10^{3}$$

$$\tau_1 = 498.67 \text{ s}$$

Convert to minutes:

$$\tau_1 = \frac{498.67}{60} = 8.311 \text{ min} \approx 8 \text{ min } 19 \text{ s}$$

**When you look at the Sun from Earth, you see the Sun as it was 8 minutes and 19 seconds ago.**

The observed state:

$$O_{\text{Earth}}(S_{\text{Sun}}, t) = S_{\text{Sun}}(t - 498.67 \text{ s})$$

### Step 2: Mars observes Earth

A camera on Mars photographs the Earth. The light-travel delay from Earth to Mars:

$$\tau_2 = \frac{d_2}{c} = \frac{2.25 \times 10^{11} \text{ m}}{2.99792458 \times 10^{8} \text{ m/s}}$$

$$= \frac{2.25}{2.99792458} \times 10^{3}$$

$$= 0.75052 \times 10^{3}$$

$$\tau_2 = 750.52 \text{ s}$$

Convert to minutes:

$$\tau_2 = \frac{750.52}{60} = 12.509 \text{ min} \approx 12 \text{ min } 30 \text{ s}$$

**Mars sees Earth as it was 12 minutes and 30 seconds ago.**

### Step 3: Mars observes the Sun through Earth

The camera on Mars photographs a person on Earth looking at the Sun. What state of the Sun does Mars perceive?

Apply the layered observation formula from Section 4:

$$O_{\text{Mars}}(O_{\text{Earth}}(S_{\text{Sun}}, t)) = S_{\text{Sun}}\!\left(t - \frac{d_1 + d_2}{c}\right)$$

Compute the total delay:

$$\tau_{\text{total}} = \tau_1 + \tau_2 = 498.67 + 750.52 = 1249.19 \text{ s}$$

Convert:

$$\tau_{\text{total}} = \frac{1249.19}{60} = 20.82 \text{ min} \approx 20 \text{ min } 49 \text{ s}$$

**The camera on Mars, photographing a person on Earth who is looking at the Sun, captures the Sun's state from 20 minutes and 49 seconds in the past.**

### Verification by direct path

If Mars observed the Sun directly (not through Earth), the delay would be the Mars-Sun distance divided by $c$. At this orbital configuration, Mars-Sun distance is approximately:

$$d_{\text{Mars-Sun}} \approx d_1 + d_2 = 1.496 \times 10^{11} + 2.25 \times 10^{11} = 3.746 \times 10^{11} \text{ m}$$

(This is approximate — in the opposition geometry where Mars, Earth, and Sun are roughly collinear, with Earth between Sun and Mars.)

$$\tau_{\text{direct}} = \frac{3.746 \times 10^{11}}{2.99792458 \times 10^{8}} = 1249.5 \text{ s}$$

This matches $\tau_{\text{total}}$ (within rounding), confirming the result: **the delays through the observation chain equal the direct light-travel time when the observers are collinear.** The geometry is self-consistent.

### What this shows

The Sun's actual state at time $t$ is inaccessible to both Earth and Mars. Earth sees a version 498.67 seconds old. Mars, observing through Earth, sees a version 1249.19 seconds old. No amount of telescope magnification, signal processing, or computational inference can recover $S_{\text{Sun}}(t)$ from these observations. The information simply has not arrived yet.

**The present does not propagate. Only the past does.**

---

## Summary of Results

1. Observation is mediated by signals of finite speed $c$.
2. Every observation introduces delay $\tau = d/c > 0$.
3. Layered observations accumulate: $\tau_n = \frac{1}{c}\sum_{i=1}^{n} d_i$.
4. If each $d_i \geq \varepsilon > 0$, then $\tau_n \to \infty$ as $n \to \infty$.
5. Infinite recursive observation makes the original state unrecoverable.
6. The monotonic growth of observation delay mirrors the Second Law: you cannot un-observe.
7. The arrow of time is the arrow of observation is the arrow of entropy. One arrow, three names.

---

*Alexa Louise Amundson*
