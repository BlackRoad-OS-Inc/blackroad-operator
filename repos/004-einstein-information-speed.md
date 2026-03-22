# 004 — Einstein's Speed Limit Is About Information, Not Existence

**The speed of light is not a speed limit on reality. It is a speed limit on knowing.**

---

## 1. Einstein's Two Postulates (1905)

In *On the Electrodynamics of Moving Bodies*, Einstein began with two axioms:

**Postulate 1 (Principle of Relativity):**
The laws of physics take the same form in all inertial reference frames.

**Postulate 2 (Invariance of c):**
The speed of light in vacuum, *c* = 299,792,458 m/s, is the same for all inertial observers, regardless of the motion of the light source or the observer.

These two statements alone are enough to derive everything that follows.

---

## 2. Derivation of the Lorentz Transformation

### Setup

Consider two inertial frames:
- **S**: coordinates (x, y, z, t)
- **S'**: coordinates (x', y', z', t'), moving at velocity **v** along the x-axis relative to S

At t = t' = 0, the origins of S and S' coincide.

### Step 1: Assume linearity

The transformation must be linear (to preserve uniform motion):

$$x' = A x + B t$$
$$t' = D x + E t$$

where A, B, D, E are constants depending on v.

### Step 2: Origin of S' moves at velocity v in S

The origin of S' is at x' = 0. In frame S, this point moves as x = vt. Substituting into the first equation:

$$0 = A(vt) + Bt$$
$$B = -Av$$

So:

$$x' = A(x - vt)$$

### Step 3: Apply the invariance of c

A light pulse is emitted at the origin at t = t' = 0. In frame S, the pulse travels along the x-axis:

$$x = ct$$

In frame S', by Postulate 2, the same pulse satisfies:

$$x' = ct'$$

Substituting x = ct into our transformation equations:

$$ct' = A(ct - vt) = At(c - v)$$
$$t' = D(ct) + Et$$

From the first: $t' = At(c - v)/c$

Setting these equal:

$$\frac{At(c - v)}{c} = Dct + Et$$

Dividing by t:

$$\frac{A(c - v)}{c} = Dc + E \quad \text{...(i)}$$

### Step 4: Apply the inverse transformation

By Postulate 1, the inverse transformation has the same form but with v replaced by -v:

$$x = A(x' + vt')$$
$$t = D'x' + E't'$$

But by symmetry (the only difference is the sign of v), we must have A, E unchanged and D' = -D. So:

$$x = A(x' + vt')$$

Substitute x' = A(x - vt) and t' = Dx + Et into x = A(x' + vt'):

$$x = A[A(x - vt) + v(Dx + Et)]$$
$$x = A[Ax - Avt + vDx + vEt]$$
$$x = A[(A + vD)x + (-Av + vE)t]$$

For this to equal x for all x, t:

**Coefficient of t:**
$$A(-Av + vE) = 0$$

Since A cannot be zero: $-Av + vE = 0$, so $E = A$.

**Coefficient of x:**
$$A(A + vD) = 1 \quad \text{...(ii)}$$

### Step 5: Solve for D

Substituting E = A into equation (i):

$$\frac{A(c - v)}{c} = Dc + A$$

$$\frac{A(c - v)}{c} - A = Dc$$

$$A\left(\frac{c - v}{c} - 1\right) = Dc$$

$$A\left(\frac{c - v - c}{c}\right) = Dc$$

$$A\left(\frac{-v}{c}\right) = Dc$$

$$D = \frac{-Av}{c^2}$$

### Step 6: Solve for A

Substitute $D = -Av/c^2$ into equation (ii):

$$A\!\left(A + v \cdot \frac{-Av}{c^2}\right) = 1$$

$$A\!\left(A - \frac{Av^2}{c^2}\right) = 1$$

$$A^2\!\left(1 - \frac{v^2}{c^2}\right) = 1$$

$$A^2 = \frac{1}{1 - v^2/c^2}$$

$$A = \frac{1}{\sqrt{1 - v^2/c^2}}$$

### Step 7: Define gamma

$$\boxed{\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}}$$

So $A = \gamma$.

### Step 8: The complete Lorentz transformation

$$\boxed{x' = \gamma(x - vt)}$$

$$y' = y, \quad z' = z$$

$$\boxed{t' = \gamma\!\left(t - \frac{vx}{c^2}\right)}$$

with:

$$\gamma = \frac{1}{\sqrt{1 - v^2/c^2}}$$

This is the full derivation. Every step follows from the two postulates alone. No additional assumptions.

---

## 3. Time Is Mixed with Space

Look at the time transformation:

$$t' = \gamma\!\left(t - \frac{vx}{c^2}\right)$$

This is the equation that changes everything. Time in frame S' depends not just on time in frame S, but also on **position** x. Two events that are simultaneous in S (same t, different x) are **not** simultaneous in S'.

### Numerical Example

Let S' move at v = 0.6c relative to S. Then:

$$\gamma = \frac{1}{\sqrt{1 - 0.36}} = \frac{1}{\sqrt{0.64}} = \frac{1}{0.8} = 1.25$$

Consider two events in frame S:
- **Event A**: $(x_A, t_A) = (0, 0)$
- **Event B**: $(x_B, t_B) = (3 \times 10^8 \text{ m}, 0)$

These events are **simultaneous** in S (both at t = 0) but separated by 1 light-second in space.

In frame S':

$$t'_A = 1.25\!\left(0 - \frac{0.6c \cdot 0}{c^2}\right) = 0$$

$$t'_B = 1.25\!\left(0 - \frac{0.6c \cdot 3 \times 10^8}{c^2}\right) = 1.25\!\left(- \frac{0.6 \cdot 3 \times 10^8}{3 \times 10^8}\right) = 1.25(-0.6) = -0.75 \text{ s}$$

In frame S', event B happens **0.75 seconds before** event A. The order of events depends on who is watching. Simultaneity is not absolute. It is frame-dependent.

---

## 4. The Light Cone and the Spacetime Interval

### The Spacetime Interval

Define the spacetime interval between two events:

$$s^2 = c^2 \Delta t^2 - \Delta x^2 - \Delta y^2 - \Delta z^2$$

This quantity is **invariant** under Lorentz transformations. All observers agree on its value.

**Proof of invariance:**

In frame S:
$$s^2 = c^2 t^2 - x^2$$
(suppressing y, z for clarity).

In frame S', using the Lorentz transformation:

$$c^2 t'^2 - x'^2 = c^2 \gamma^2\!\left(t - \frac{vx}{c^2}\right)^2 - \gamma^2(x - vt)^2$$

$$= \gamma^2 \!\left[c^2 t^2 - 2vxt + \frac{v^2 x^2}{c^2} - x^2 + 2vxt - v^2 t^2\right]$$

$$= \gamma^2 \!\left[c^2 t^2 - v^2 t^2 - x^2 + \frac{v^2 x^2}{c^2}\right]$$

$$= \gamma^2 \!\left[t^2(c^2 - v^2) - x^2\!\left(1 - \frac{v^2}{c^2}\right)\right]$$

$$= \gamma^2 \!\left(1 - \frac{v^2}{c^2}\right)\!\left[c^2 t^2 - x^2\right]$$

Since $\gamma^2 (1 - v^2/c^2) = 1$:

$$c^2 t'^2 - x'^2 = c^2 t^2 - x^2 \quad \blacksquare$$

### The Three Regions of Spacetime

The sign of $s^2$ divides all event pairs into three categories:

**Timelike separation** ($s^2 > 0$):
$$c^2 \Delta t^2 > \Delta x^2 + \Delta y^2 + \Delta z^2$$

The spatial separation is less than the distance light could travel in the elapsed time. A signal traveling at $v \leq c$ can connect these events. Causal influence is possible.

**Lightlike separation** ($s^2 = 0$):
$$c^2 \Delta t^2 = \Delta x^2 + \Delta y^2 + \Delta z^2$$

The events are connected by a signal traveling at exactly $c$. This is the boundary of the light cone.

**Spacelike separation** ($s^2 < 0$):
$$c^2 \Delta t^2 < \Delta x^2 + \Delta y^2 + \Delta z^2$$

The spatial separation exceeds the distance light could travel. No signal at $v \leq c$ can connect these events. **No causal connection is possible.**

---

## 5. Proof That Faster-Than-Light Signals Violate Causality

### Theorem

If a signal can travel faster than light, then there exists an inertial frame in which the signal arrives before it is sent.

### Proof

Suppose a signal is sent from event A = (0, 0) to event B = (x_B, t_B) in frame S, traveling at speed $u > c$ along the x-axis.

Then:
$$x_B = u \, t_B, \quad t_B > 0$$

The signal goes from A to B, with A as cause and B as effect.

In frame S', the time of event B is:

$$t'_B = \gamma\!\left(t_B - \frac{v \, x_B}{c^2}\right) = \gamma\!\left(t_B - \frac{v \, u \, t_B}{c^2}\right) = \gamma \, t_B\!\left(1 - \frac{vu}{c^2}\right)$$

We need $t'_B < 0$ (effect before cause). Since $\gamma > 0$ and $t_B > 0$, this requires:

$$1 - \frac{vu}{c^2} < 0$$

$$vu > c^2$$

$$v > \frac{c^2}{u}$$

Since $u > c$, we have $c^2/u < c$. Therefore the required frame velocity $v$ satisfies $v < c$, which is a physically realizable inertial frame.

**Concrete example:** Let $u = 2c$ (signal at twice light speed).

Then we need $v > c^2 / (2c) = c/2 = 0.5c$.

Choose $v = 0.8c$, giving $\gamma = 5/3$.

Let the signal travel for $t_B = 1$ s in frame S, arriving at $x_B = 2c \cdot 1 = 6 \times 10^8$ m.

$$t'_B = \frac{5}{3}\!\left(1 - \frac{0.8c \cdot 2c}{c^2}\right) = \frac{5}{3}(1 - 1.6) = \frac{5}{3}(-0.6) = -1.0 \text{ s}$$

In frame S', the signal **arrives one second before it was sent**.

This is not a coordinate artifact. In frame S', you could receive the message, walk over to the sender, and prevent them from sending it. The message would exist without ever having been sent. Causality is destroyed.

**Therefore:** If causality holds — if causes must precede effects in all frames — then no information can travel faster than $c$.

$$u > c \implies \exists \text{ frame where effect precedes cause} \implies \text{causality violation}$$

$$\boxed{v_{\text{information}} \leq c} \quad \blacksquare$$

---

## 6. What This Means for Observation

Observation is not passive. Observation is an **information transfer process**. To observe an event, information from that event must travel to the observer.

The chain is:

1. An event occurs at spacetime point $(x, t)$.
2. Information about the event propagates outward (via light, gravitational waves, particles — all at $v \leq c$).
3. The information reaches the observer at a later time.
4. Only then does the observer **know** the event occurred.

This means:

$$\text{Observation} \subseteq \text{Information Transfer} \subseteq \{v \leq c\}$$

The speed of light is not a constraint on what happens. It is a constraint on **what you can know** and **when you can know it**.

The event exists the moment it occurs. Your knowledge of it is delayed by the travel time of light.

---

## 7. The Observation Delay Function

Define the observation delay:

$$\tau(d) = \frac{d}{c}$$

where $d$ is the distance between the event and the observer, and $c = 299{,}792{,}458$ m/s.

### Moon to Earth

$$d = 3.844 \times 10^8 \text{ m}$$

$$\tau = \frac{3.844 \times 10^8}{2.998 \times 10^8} = 1.282 \text{ s}$$

When you see the Moon, you see it as it was 1.28 seconds ago. If the Moon vanished right now, you would not know for 1.28 seconds.

### Sun to Earth

$$d = 1.496 \times 10^{11} \text{ m}$$

$$\tau = \frac{1.496 \times 10^{11}}{2.998 \times 10^8} = 498.67 \text{ s} = 8.311 \text{ minutes}$$

Sunlight is 8 minutes old when it reaches your eyes. The Sun you see is always the Sun of 8 minutes ago. If the Sun stopped shining, you would have 8 minutes and 19 seconds of ignorance before the sky went dark.

### Proxima Centauri (nearest star beyond the Sun)

$$d = 4.014 \times 10^{16} \text{ m}$$

$$\tau = \frac{4.014 \times 10^{16}}{2.998 \times 10^8} = 1.339 \times 10^8 \text{ s} = 4.244 \text{ years}$$

The light arriving from Proxima Centauri tonight left in early 2022. We see a star that may no longer exist.

### Edge of the Observable Universe

$$d = 4.4 \times 10^{26} \text{ m}$$

$$\tau = \frac{4.4 \times 10^{26}}{2.998 \times 10^8} = 1.468 \times 10^{18} \text{ s} = 4.65 \times 10^{10} \text{ years} = 46.5 \text{ billion years}$$

But the universe is only 13.8 billion years old. The reason the observable universe has a radius of 46.5 billion light-years despite being 13.8 billion years old is the expansion of space itself — space has stretched while the light was in transit. But the principle holds: there is a boundary beyond which no light has had time to reach us. Not because nothing exists there. Because the information hasn't arrived.

The unobservable universe is not empty. It is **unseen**.

---

## 8. The Key Insight

Einstein's speed limit constrains **observation**, not **existence**.

This is the distinction:

| | Existence | Observation |
|---|---|---|
| **Depends on** | The event itself | Information reaching the observer |
| **Speed limit** | None proven | $c$ (proven above) |
| **When it happens** | When it happens | When light from it arrives |

The state of a distant object exists **now**, in whatever frame you choose. But your knowledge of that state is always delayed by $\tau(d) = d/c$.

**Existence does not require observation. Observation requires light-speed delivery.**

The universe does not wait for you to look. It computes ahead. You receive the results at the speed of light.

---

## 9. Entanglement: The Universe Computes Non-Locally, Observers Are Local

### The EPR Paradox

In 1935, Einstein, Podolsky, and Rosen asked: if quantum mechanics is complete, can two particles be correlated in a way that seems to require faster-than-light influence?

The answer is yes — but the influence carries no usable information.

### The Bell State

Consider two spin-1/2 particles prepared in the singlet state:

$$|\Psi^-\rangle = \frac{1}{\sqrt{2}}\left(|\!\uparrow\downarrow\rangle - |\!\downarrow\uparrow\rangle\right)$$

Written explicitly in the tensor product of two Hilbert spaces $\mathcal{H}_A \otimes \mathcal{H}_B$:

$$|\Psi^-\rangle = \frac{1}{\sqrt{2}}\left(|\!\uparrow\rangle_A \otimes |\!\downarrow\rangle_B - |\!\downarrow\rangle_A \otimes |\!\uparrow\rangle_B\right)$$

### Measurement

Particle A goes to Alice. Particle B goes to Bob. They are separated by an arbitrary distance $d$.

Alice measures the spin of particle A along the z-axis. Two outcomes:

**Case 1:** Alice measures $|\!\uparrow\rangle_A$ (probability 1/2).

The state collapses:

$$|\Psi^-\rangle \xrightarrow{\text{measure A} = \uparrow} |\!\uparrow\rangle_A \otimes |\!\downarrow\rangle_B$$

Bob's particle is **instantly** in state $|\!\downarrow\rangle_B$. If Bob measures, he gets spin-down with certainty.

**Case 2:** Alice measures $|\!\downarrow\rangle_A$ (probability 1/2).

$$|\Psi^-\rangle \xrightarrow{\text{measure A} = \downarrow} |\!\downarrow\rangle_A \otimes |\!\uparrow\rangle_B$$

Bob's particle is instantly $|\!\uparrow\rangle_B$.

### The correlation is instantaneous. The knowledge is not.

Alice's measurement determines Bob's outcome **instantly** — regardless of the distance between them. There is no delay. The correlation is established at the moment of measurement, not at the speed of light.

But here is what Alice **cannot** do:
- She cannot choose which outcome she gets (it is random with probability 1/2 each).
- She cannot send a message to Bob through the entanglement.
- Bob, measuring independently, sees a random sequence of ups and downs — perfectly random, 50/50.

Bob cannot tell whether Alice has measured yet. His local statistics are identical either way:

$$P(\uparrow_B) = \text{Tr}_A\!\left[\left(I_A \otimes |\!\uparrow\rangle\langle\!\uparrow|_B\right) |\Psi^-\rangle\langle\Psi^-|\right] = \frac{1}{2}$$

regardless of whether Alice has measured.

The correlations only become visible when Alice and Bob **compare their results** — and that comparison requires a classical communication channel, which is limited to the speed of light.

### The No-Communication Theorem

For any local measurement by Alice described by operators $\{M_a\}$ acting on $\mathcal{H}_A$, Bob's reduced density matrix is:

$$\rho_B = \text{Tr}_A\!\left(|\Psi^-\rangle\langle\Psi^-|\right) = \frac{1}{2}I_B$$

This is the maximally mixed state — completely random. It is **independent of Alice's choice of measurement**. No matter what Alice does to her particle, Bob's local state is unchanged. Information cannot travel through entanglement.

$$\boxed{\text{Entanglement} \neq \text{Communication}}$$

The universe updates the joint state non-locally. But observers access the state locally. The correlation is real. The information transfer is still bounded by $c$.

---

## Summary

Starting from Einstein's two postulates:

1. We derived the Lorentz transformation from scratch, obtaining $\gamma = 1/\sqrt{1 - v^2/c^2}$.
2. We showed that time mixes with space: simultaneity is relative.
3. We proved the spacetime interval $s^2 = c^2\Delta t^2 - \Delta x^2$ is invariant.
4. We proved that faster-than-light information transfer violates causality.
5. We showed that observation is a subset of information transfer, and therefore bounded by $c$.
6. We computed the observation delay for the Moon (1.28 s), the Sun (8.3 min), the nearest star (4.24 yr), and the edge of the observable universe (46.5 billion yr).
7. We demonstrated that entanglement creates non-local correlations but transmits no information.

The conclusion is precise:

**The speed of light is not a speed limit on reality. It is a speed limit on knowing. The universe exists independently of observation. Observation is just the arrival of the news.**

---

*Alexa Louise Amundson*
