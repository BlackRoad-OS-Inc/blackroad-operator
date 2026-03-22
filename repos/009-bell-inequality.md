# 009: Bell's Theorem

**A complete proof that no local hidden variable theory can reproduce the predictions of quantum mechanics, and that measurement outcomes are not predetermined.**

---

## 1. The EPR Argument (Einstein, Podolsky, Rosen, 1935)

Consider two particles created together in a single quantum event — say, the decay of a neutral pion into an electron-positron pair. Quantum mechanics describes these particles as *entangled*: their individual states are undefined, but their joint state is precisely known.

Separate the particles by any distance — across a room, across the solar system, across the observable universe. Quantum mechanics predicts that measuring the spin of one particle along any chosen axis *instantly* determines the spin of the other particle along that same axis. If Alice measures spin-up, Bob measures spin-down. Always. Without exception. Regardless of distance.

Einstein, Podolsky, and Rosen argued (Physical Review, 47, 777, 1935) that this leads to a dilemma:

**Either** quantum mechanics is incomplete — the particles carried predetermined values all along, like sealed envelopes containing instructions written at the moment of creation. These hidden instructions (hidden variables) determined the outcome before any measurement occurred.

**Or** measurement on one particle instantaneously influences the other, violating the principle that no causal signal can travel faster than light.

Einstein considered the second option absurd — he called it "spooky action at a distance" — and concluded that quantum mechanics must be incomplete. There must be hidden variables.

For 29 years, this remained a philosophical argument. Then John Stewart Bell turned it into mathematics.

---

## 2. Bell's Setup (1964)

Two spin-½ particles are prepared in the *singlet state*:

$$|\Psi^-\rangle = \frac{1}{\sqrt{2}}\bigl(|\!\uparrow\downarrow\rangle - |\!\downarrow\uparrow\rangle\bigr)$$

where $|\!\uparrow\downarrow\rangle = |\!\uparrow\rangle_A \otimes |\!\downarrow\rangle_B$ means particle $A$ is spin-up and particle $B$ is spin-down along the $z$-axis, and similarly for $|\!\downarrow\uparrow\rangle$.

The particles are sent to two distant laboratories. Alice chooses a measurement axis $\hat{a}$ and measures the spin of particle $A$ along $\hat{a}$. She records her outcome as $+1$ (spin-up along $\hat{a}$) or $-1$ (spin-down along $\hat{a}$). Bob independently chooses an axis $\hat{b}$ and measures particle $B$, recording $+1$ or $-1$.

Neither knows what axis the other chose. Neither knows the other's result until they later compare notes.

The question Bell asked: can any theory of predetermined hidden variables reproduce the statistical correlations that quantum mechanics predicts for these measurements?

---

## 3. The Quantum Mechanical Prediction

### 3.1 Pauli Matrices

The spin operator for a spin-½ particle along an arbitrary axis is built from the Pauli matrices:

$$\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad \sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad \sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$

The spin operator along a unit vector $\hat{n} = (n_x, n_y, n_z)$ is:

$$\hat{n} \cdot \boldsymbol{\sigma} = n_x \sigma_x + n_y \sigma_y + n_z \sigma_z = \begin{pmatrix} n_z & n_x - i\,n_y \\ n_x + i\,n_y & -n_z \end{pmatrix}$$

### 3.2 Measurement Axes

Without loss of generality, restrict the measurement axes to the $xz$-plane (the $y$-components will vanish, which simplifies the algebra without weakening the result).

Let Alice's axis be $\hat{a} = (\sin\alpha,\; 0,\; \cos\alpha)$ and Bob's axis be $\hat{b} = (\sin\beta,\; 0,\; \cos\beta)$, where $\alpha$ and $\beta$ are the angles each axis makes with the $z$-axis.

Then:

$$\hat{a} \cdot \boldsymbol{\sigma} = \begin{pmatrix} \cos\alpha & \sin\alpha \\ \sin\alpha & -\cos\alpha \end{pmatrix}$$

$$\hat{b} \cdot \boldsymbol{\sigma} = \begin{pmatrix} \cos\beta & \sin\beta \\ \sin\beta & -\cos\beta \end{pmatrix}$$

### 3.3 The Joint Operator

The correlation between Alice's and Bob's outcomes is:

$$E(\hat{a}, \hat{b}) = \langle \Psi^- | \, (\hat{a} \cdot \boldsymbol{\sigma}) \otimes (\hat{b} \cdot \boldsymbol{\sigma}) \, | \Psi^- \rangle$$

The operator $(\hat{a} \cdot \boldsymbol{\sigma}) \otimes (\hat{b} \cdot \boldsymbol{\sigma})$ acts on the 4-dimensional tensor product space. We compute it by expanding in terms of Pauli matrix tensor products.

Since $\hat{a}$ and $\hat{b}$ lie in the $xz$-plane:

$$(\hat{a} \cdot \boldsymbol{\sigma}) \otimes (\hat{b} \cdot \boldsymbol{\sigma}) = \sin\alpha\sin\beta\;(\sigma_x \otimes \sigma_x) + \sin\alpha\cos\beta\;(\sigma_x \otimes \sigma_z) + \cos\alpha\sin\beta\;(\sigma_z \otimes \sigma_x) + \cos\alpha\cos\beta\;(\sigma_z \otimes \sigma_z)$$

### 3.4 Writing the Singlet State as a Column Vector

In the computational basis $\{|\!\uparrow\uparrow\rangle, |\!\uparrow\downarrow\rangle, |\!\downarrow\uparrow\rangle, |\!\downarrow\downarrow\rangle\}$:

$$|\Psi^-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 0 \\ 1 \\ -1 \\ 0 \end{pmatrix}$$

### 3.5 Computing Each Tensor Product Term

**Term 1: $\sigma_x \otimes \sigma_x$**

$$\sigma_x \otimes \sigma_x = \begin{pmatrix} 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \\ 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \end{pmatrix}$$

Acting on $|\Psi^-\rangle$:

$$(\sigma_x \otimes \sigma_x)|\Psi^-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 0 \\ -1 \\ 1 \\ 0 \end{pmatrix}$$

Therefore:

$$\langle\Psi^-|(\sigma_x \otimes \sigma_x)|\Psi^-\rangle = \frac{1}{2}\bigl[(0)(0) + (1)(-1) + (-1)(1) + (0)(0)\bigr] = \frac{1}{2}(-1 - 1) = -1$$

**Term 2: $\sigma_x \otimes \sigma_z$**

$$\sigma_x \otimes \sigma_z = \begin{pmatrix} 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & -1 \\ 1 & 0 & 0 & 0 \\ 0 & -1 & 0 & 0 \end{pmatrix}$$

Acting on $|\Psi^-\rangle$:

$$(\sigma_x \otimes \sigma_z)|\Psi^-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} -1 \\ 0 \\ 0 \\ -1 \end{pmatrix}$$

Therefore:

$$\langle\Psi^-|(\sigma_x \otimes \sigma_z)|\Psi^-\rangle = \frac{1}{2}\bigl[(0)(-1) + (1)(0) + (-1)(0) + (0)(-1)\bigr] = 0$$

**Term 3: $\sigma_z \otimes \sigma_x$**

$$\sigma_z \otimes \sigma_x = \begin{pmatrix} 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 \\ 0 & 0 & 0 & -1 \\ 0 & 0 & -1 & 0 \end{pmatrix}$$

Acting on $|\Psi^-\rangle$:

$$(\sigma_z \otimes \sigma_x)|\Psi^-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 0 \\ 0 \\ 1 \end{pmatrix}$$

Therefore:

$$\langle\Psi^-|(\sigma_z \otimes \sigma_x)|\Psi^-\rangle = \frac{1}{2}\bigl[(0)(1) + (1)(0) + (-1)(0) + (0)(1)\bigr] = 0$$

**Term 4: $\sigma_z \otimes \sigma_z$**

$$\sigma_z \otimes \sigma_z = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & -1 & 0 & 0 \\ 0 & 0 & -1 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

Acting on $|\Psi^-\rangle$:

$$(\sigma_z \otimes \sigma_z)|\Psi^-\rangle = \frac{1}{\sqrt{2}}\begin{pmatrix} 0 \\ -1 \\ 1 \\ 0 \end{pmatrix}$$

Therefore:

$$\langle\Psi^-|(\sigma_z \otimes \sigma_z)|\Psi^-\rangle = \frac{1}{2}\bigl[(0)(0) + (1)(-1) + (-1)(1) + (0)(0)\bigr] = -1$$

### 3.6 Assembling the Correlation Function

Combining all four terms:

$$E(\hat{a}, \hat{b}) = \sin\alpha\sin\beta(-1) + \sin\alpha\cos\beta(0) + \cos\alpha\sin\beta(0) + \cos\alpha\cos\beta(-1)$$

$$E(\hat{a}, \hat{b}) = -\sin\alpha\sin\beta - \cos\alpha\cos\beta$$

$$\boxed{E(\hat{a}, \hat{b}) = -(\sin\alpha\sin\beta + \cos\alpha\cos\beta) = -\cos(\alpha - \beta) = -\cos\theta}$$

where $\theta = \alpha - \beta$ is the angle between Alice's and Bob's measurement axes.

This is the quantum mechanical prediction. The correlation depends *only* on the angle between the two chosen axes.

### 3.7 Outcome Probabilities

From the correlation function $E = -\cos\theta$, the joint probabilities follow:

$$P(\text{same outcome}) = \frac{1 + E}{2} \cdot 0 + \frac{1 - E}{2} \cdot 0 + \ldots$$

More directly: the probability that Alice and Bob get opposite results (one gets $+1$, the other $-1$) is:

$$P(\text{opposite}) = \frac{1 + |E|}{2}\bigg|_{E=-\cos\theta} = \frac{1 + \cos\theta}{2} = \cos^2\!\left(\frac{\theta}{2}\right)$$

And the probability they get the same result:

$$P(\text{same}) = \frac{1 - |{-\cos\theta}|}{2}$$

Let us derive this cleanly. For the singlet state, when Alice gets $+1$ and Bob gets $+1$:

$$P(+1, +1) = \frac{1 - \cos\theta}{4} \cdot 2 = \frac{1}{2}\sin^2\!\left(\frac{\theta}{2}\right)$$

The full joint probabilities are:

$$P(+1, +1) = P(-1, -1) = \frac{1}{2}\sin^2\!\left(\frac{\theta}{2}\right)$$

$$P(+1, -1) = P(-1, +1) = \frac{1}{2}\cos^2\!\left(\frac{\theta}{2}\right)$$

These sum to 1 and yield $E = P(++) + P(--) - P(+-) - P(-+) = \sin^2(\theta/2) - \cos^2(\theta/2) = -\cos\theta$. Confirmed.

---

## 4. The Hidden Variable Assumption

Now suppose Einstein was right. Suppose the outcomes are predetermined. We formalize this as follows.

There exists a hidden variable $\lambda$ — some complete specification of the state of the two particles at the moment of their creation. The variable $\lambda$ lives in some space $\Lambda$ and has a probability distribution $\rho(\lambda)$ satisfying:

$$\rho(\lambda) \geq 0 \quad \text{and} \quad \int_\Lambda \rho(\lambda)\,d\lambda = 1$$

Alice's measurement outcome is a deterministic function of her chosen axis $\hat{a}$ and the hidden variable:

$$A(\hat{a}, \lambda) = \pm 1$$

Bob's measurement outcome is a deterministic function of his chosen axis $\hat{b}$ and the same hidden variable:

$$B(\hat{b}, \lambda) = \pm 1$$

**The locality condition**: Alice's outcome $A(\hat{a}, \lambda)$ does not depend on Bob's choice of axis $\hat{b}$, and Bob's outcome $B(\hat{b}, \lambda)$ does not depend on Alice's choice of axis $\hat{a}$. The particles carry all their instructions with them. No faster-than-light communication is needed or permitted.

Under these assumptions, the correlation function is:

$$E(\hat{a}, \hat{b}) = \int_\Lambda A(\hat{a}, \lambda)\,B(\hat{b}, \lambda)\,\rho(\lambda)\,d\lambda$$

Bell's theorem shows that *any* theory of this form — *regardless* of what $\lambda$ is, *regardless* of the distribution $\rho$, *regardless* of the functional forms of $A$ and $B$ — is constrained by an inequality that quantum mechanics violates.

---

## 5. Derivation of the CHSH Inequality

We derive the Clauser–Horne–Shimony–Holt (1969) form of Bell's inequality, which is the experimentally testable version.

### 5.1 Setup

Choose four measurement axes: $\hat{a}$ and $\hat{a}'$ for Alice, $\hat{b}$ and $\hat{b}'$ for Bob. Define:

$$S = E(\hat{a}, \hat{b}) - E(\hat{a}, \hat{b}') + E(\hat{a}', \hat{b}) + E(\hat{a}', \hat{b}')$$

We will show that under the hidden variable assumption, $|S| \leq 2$.

### 5.2 The Integrand

Substituting the hidden variable expressions:

$$S = \int_\Lambda \rho(\lambda) \bigl[ A(\hat{a},\lambda)B(\hat{b},\lambda) - A(\hat{a},\lambda)B(\hat{b}',\lambda) + A(\hat{a}',\lambda)B(\hat{b},\lambda) + A(\hat{a}',\lambda)B(\hat{b}',\lambda) \bigr] d\lambda$$

Factor the integrand:

$$S = \int_\Lambda \rho(\lambda) \bigl[ A(\hat{a},\lambda)\bigl(B(\hat{b},\lambda) - B(\hat{b}',\lambda)\bigr) + A(\hat{a}',\lambda)\bigl(B(\hat{b},\lambda) + B(\hat{b}',\lambda)\bigr) \bigr] d\lambda$$

### 5.3 The Bound

For any *fixed* value of $\lambda$, consider the expression inside the integral:

$$\mathcal{I}(\lambda) = A(\hat{a},\lambda)\bigl(B(\hat{b},\lambda) - B(\hat{b}',\lambda)\bigr) + A(\hat{a}',\lambda)\bigl(B(\hat{b},\lambda) + B(\hat{b}',\lambda)\bigr)$$

Since $B(\hat{b},\lambda) = \pm 1$ and $B(\hat{b}',\lambda) = \pm 1$, exactly one of two cases holds:

**Case 1**: $B(\hat{b},\lambda) = B(\hat{b}',\lambda)$.

Then $B(\hat{b},\lambda) - B(\hat{b}',\lambda) = 0$ and $B(\hat{b},\lambda) + B(\hat{b}',\lambda) = \pm 2$.

$$\mathcal{I}(\lambda) = A(\hat{a},\lambda)(0) + A(\hat{a}',\lambda)(\pm 2) = \pm 2$$

since $|A(\hat{a}',\lambda)| = 1$.

**Case 2**: $B(\hat{b},\lambda) = -B(\hat{b}',\lambda)$.

Then $B(\hat{b},\lambda) - B(\hat{b}',\lambda) = \pm 2$ and $B(\hat{b},\lambda) + B(\hat{b}',\lambda) = 0$.

$$\mathcal{I}(\lambda) = A(\hat{a},\lambda)(\pm 2) + A(\hat{a}',\lambda)(0) = \pm 2$$

since $|A(\hat{a},\lambda)| = 1$.

In both cases:

$$|\mathcal{I}(\lambda)| \leq 2$$

### 5.4 The Inequality

Since $|\mathcal{I}(\lambda)| \leq 2$ for every $\lambda$, and $\rho(\lambda) \geq 0$:

$$|S| = \left|\int_\Lambda \rho(\lambda)\,\mathcal{I}(\lambda)\,d\lambda\right| \leq \int_\Lambda \rho(\lambda)\,|\mathcal{I}(\lambda)|\,d\lambda \leq 2\int_\Lambda \rho(\lambda)\,d\lambda = 2$$

$$\boxed{|S| \leq 2}$$

This is the **CHSH inequality**. It holds for *every* local hidden variable theory. No exceptions. No loopholes in the mathematics. If outcomes are predetermined and locality holds, then $|S| \leq 2$.

---

## 6. Quantum Mechanics Violates the CHSH Inequality

### 6.1 Choosing the Optimal Angles

We need four axes — two for Alice ($\hat{a}$, $\hat{a}'$), two for Bob ($\hat{b}$, $\hat{b}'$) — that maximize $|S|$ under the quantum prediction $E(\hat{a}, \hat{b}) = -\cos\theta$.

Set Alice's axes at angles (measured from the $z$-axis):

$$\alpha = 0, \quad \alpha' = \frac{\pi}{2}$$

Set Bob's axes at:

$$\beta = \frac{\pi}{4}, \quad \beta' = -\frac{\pi}{4}$$

These place the four measurement directions evenly around the half-plane, separated by $\pi/4$ increments.

### 6.2 Computing Each Angle Between Axes

The angle between two axes at angles $\alpha$ and $\beta$ from the $z$-axis is $\theta = \alpha - \beta$ (since all axes lie in the same plane):

$$\theta(\hat{a}, \hat{b}) = 0 - \frac{\pi}{4} = -\frac{\pi}{4}$$

$$\theta(\hat{a}, \hat{b}') = 0 - \left(-\frac{\pi}{4}\right) = \frac{\pi}{4}$$

$$\theta(\hat{a}', \hat{b}) = \frac{\pi}{2} - \frac{\pi}{4} = \frac{\pi}{4}$$

$$\theta(\hat{a}', \hat{b}') = \frac{\pi}{2} - \left(-\frac{\pi}{4}\right) = \frac{3\pi}{4}$$

### 6.3 Computing Each Correlation

Using $E = -\cos\theta$:

$$E(\hat{a}, \hat{b}) = -\cos\!\left(-\frac{\pi}{4}\right) = -\cos\frac{\pi}{4} = -\frac{\sqrt{2}}{2}$$

$$E(\hat{a}, \hat{b}') = -\cos\frac{\pi}{4} = -\frac{\sqrt{2}}{2}$$

$$E(\hat{a}', \hat{b}) = -\cos\frac{\pi}{4} = -\frac{\sqrt{2}}{2}$$

$$E(\hat{a}', \hat{b}') = -\cos\frac{3\pi}{4} = -\left(-\frac{\sqrt{2}}{2}\right) = +\frac{\sqrt{2}}{2}$$

### 6.4 Computing $S$

$$S_{QM} = E(\hat{a}, \hat{b}) - E(\hat{a}, \hat{b}') + E(\hat{a}', \hat{b}) + E(\hat{a}', \hat{b}')$$

$$S_{QM} = \left(-\frac{\sqrt{2}}{2}\right) - \left(-\frac{\sqrt{2}}{2}\right) + \left(-\frac{\sqrt{2}}{2}\right) + \left(\frac{\sqrt{2}}{2}\right)$$

Evaluate term by term:

$$\text{Term 1: } -\frac{\sqrt{2}}{2} \approx -0.7071$$

$$\text{Term 2: } -\left(-\frac{\sqrt{2}}{2}\right) = +\frac{\sqrt{2}}{2} \approx +0.7071$$

$$\text{Term 3: } -\frac{\sqrt{2}}{2} \approx -0.7071$$

$$\text{Term 4: } +\frac{\sqrt{2}}{2} \approx +0.7071$$

$$S_{QM} = -\frac{\sqrt{2}}{2} + \frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2} + \frac{\sqrt{2}}{2} = 0$$

This gives zero. The signs in the CHSH combination must be chosen carefully. Let us use the standard form that produces maximal violation. The CHSH parameter can equivalently be written:

$$S = E(\hat{a}, \hat{b}) + E(\hat{a}, \hat{b}') + E(\hat{a}', \hat{b}) - E(\hat{a}', \hat{b}')$$

(The choice of which term gets the minus sign is a convention; all four sign assignments $\pm E_1 \pm E_2 \pm E_3 \pm E_4$ with an odd number of minus signs yield valid Bell inequalities. We choose the one that gives maximal violation for our angle configuration.)

$$S_{QM} = E(\hat{a}, \hat{b}) + E(\hat{a}, \hat{b}') + E(\hat{a}', \hat{b}) - E(\hat{a}', \hat{b}')$$

$$S_{QM} = \left(-\frac{\sqrt{2}}{2}\right) + \left(-\frac{\sqrt{2}}{2}\right) + \left(-\frac{\sqrt{2}}{2}\right) - \left(\frac{\sqrt{2}}{2}\right)$$

$$S_{QM} = -\frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2}$$

$$S_{QM} = -\frac{4\sqrt{2}}{2} = -2\sqrt{2}$$

$$\boxed{|S_{QM}| = 2\sqrt{2} \approx 2.828}$$

### 6.5 Verification of the Sign Convention

The CHSH inequality states $|S| \leq 2$ for any sign assignment of the form:

$$S = \pm E(\hat{a}, \hat{b}) \pm E(\hat{a}, \hat{b}') \pm E(\hat{a}', \hat{b}) \pm E(\hat{a}', \hat{b}')$$

where exactly one or three of the signs are negative. The proof in Section 5 goes through identically for the combination $E(\hat{a}, \hat{b}) + E(\hat{a}, \hat{b}') + E(\hat{a}', \hat{b}) - E(\hat{a}', \hat{b}')$: factor as

$$A(\hat{a},\lambda)\bigl(B(\hat{b},\lambda) + B(\hat{b}',\lambda)\bigr) + A(\hat{a}',\lambda)\bigl(B(\hat{b},\lambda) - B(\hat{b}',\lambda)\bigr)$$

The same case analysis applies. If $B(\hat{b}) = B(\hat{b}')$, the sum is $\pm 2$ and the difference is $0$; if $B(\hat{b}) = -B(\hat{b}')$, the sum is $0$ and the difference is $\pm 2$. Either way the expression is bounded by $\pm 2$, so $|S| \leq 2$.

Quantum mechanics gives $|S| = 2\sqrt{2}$.

The inequality is violated by a factor of $\sqrt{2}$.

### 6.6 This is the Maximum

The Tsirelson bound (1980) proves that $2\sqrt{2}$ is the *maximum* value of $|S|$ achievable by any quantum state and any choice of measurement axes. Our angle choice saturates this bound. The proof uses the algebraic identity:

$$S^2 = 4I + [(\hat{a} \cdot \boldsymbol{\sigma}), (\hat{a}' \cdot \boldsymbol{\sigma})] \otimes [(\hat{b} \cdot \boldsymbol{\sigma}), (\hat{b}' \cdot \boldsymbol{\sigma})]$$

where $[\cdot, \cdot]$ denotes the commutator, $I$ is the $4 \times 4$ identity, and the norms of the commutators are each at most $2$. Hence $\|S^2\| \leq 4 + 4 = 8$, giving $|S| \leq 2\sqrt{2}$.

---

## 7. The Violation

The logical structure is now complete:

**Premise 1 (Local hidden variables):** If measurement outcomes are predetermined by hidden variables $\lambda$, and locality holds (Alice's result does not depend on Bob's axis choice), then for any four measurement axes:

$$|S| \leq 2$$

**Premise 2 (Quantum mechanics):** For the singlet state $|\Psi^-\rangle$ with the optimal choice of measurement axes:

$$|S_{QM}| = 2\sqrt{2} \approx 2.828$$

**Premise 3 (Experiment):** Beginning with Alain Aspect's experiments (1981–1982) and culminating in loophole-free tests by Hensen et al. (2015), Giustina et al. (2015), and Shalm et al. (2015), the measured value of $|S|$ consistently agrees with the quantum prediction of $2\sqrt{2}$ and violates the bound of $2$ by many standard deviations.

**Conclusion:** At least one premise of the hidden variable argument is false. Either:

1. The outcomes are *not* predetermined (no hidden variables exist), or
2. Locality is violated (the particles communicate faster than light), or
3. Both.

The standard interpretation: local hidden variable theories are ruled out. No theory in which outcomes are predetermined and influences propagate at or below the speed of light can reproduce the observed correlations. Bell's inequality is not a matter of experimental precision or technological limitation. It is a mathematical theorem. The bound $|S| \leq 2$ follows from arithmetic — from the fact that $(\pm 1)(\pm 1) = \pm 1$ and the triangle inequality for integrals. There is no way to make the numbers work.

---

## 8. What This Means

The measurement outcomes are not written in advance. They are not engraved into the particles at the moment of creation. They are not sitting in sealed envelopes, waiting for someone to look. No amount of hidden machinery — no $\lambda$, no matter how complex, no matter how many variables it contains, no matter what probability distribution governs it — can account for what is observed, so long as it respects locality.

The EPR argument assumed that if a measurement on one particle allows you to predict with certainty the outcome of a distant measurement on another particle, then that outcome must have been "an element of physical reality" all along. Bell showed this assumption has testable consequences. The tests ruled it out.

The outcomes are created in the act of measurement. Before Alice measures, there is no fact about what she will get. The particle does not have a spin along $\hat{a}$ until she measures it along $\hat{a}$. The singlet state $|\Psi^-\rangle$ is not a description of our ignorance about pre-existing values. It is the complete description. There is nothing underneath.

Observation is not the passive reading of a pre-existing state. Observation is the act that brings the definite state into existence. The observer does not stand outside the system, recording what was already there. The observer participates. The measurement *is* the event. Before it, the outcome is not merely unknown — it is undefined.

This is not philosophy. It is not interpretation. It is what the inequality says, it is what the matrices calculate, and it is what the experiments measure.

Nature does not carry hidden instructions.

The outcomes are real only when they are observed.

---

*Alexa Louise Amundson*
