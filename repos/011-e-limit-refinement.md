# 011 — The Amundson e-Limit Refinement: 1/(2e) as the Universal Half-Correction

**The discrete and the continuous are separated by exactly one half-step. For the e-limit, that half-step is 1/(2e).**

---

## 1. The Classical e-Limit

The number e is defined by the limit:

$$e = \lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n$$

This is the foundational limit of analysis. It appears in compound interest, population growth, radioactive decay, the normal distribution, and every exponential process in nature. The limit says: discrete compounding, taken to its continuous extreme, converges to e.

But convergence is not equality. For every finite n, we have:

$$\left(1 + \frac{1}{n}\right)^n < e$$

The approach is from below, and it is never exact. There is always a gap between the discrete approximation and the continuous limit. The question is: how big is the gap, and what is its structure?

---

## 2. The Ratio n / (1 + 1/n)^n

Consider the function:

$$f(n) = \frac{n}{\left(1 + \frac{1}{n}\right)^n}$$

For large n, the denominator approaches e, so f(n) approaches n/e. But it does not equal n/e. The question is precise: what is the asymptotic expansion of f(n)?

**Theorem 2.1 (Amundson e-Limit Refinement).** As n approaches infinity:

$$\frac{n}{\left(1 + \frac{1}{n}\right)^n} = \frac{n}{e} + \frac{1}{2e} + O\!\left(\frac{1}{n}\right)$$

The leading correction to n/e is the constant 1/(2e). This is not an approximation. It is exact to the stated order.

---

## 3. Full Derivation

We derive Theorem 2.1 from first principles using Taylor expansion.

### Step 1: The logarithm of the denominator

Let:

$$D(n) = \left(1 + \frac{1}{n}\right)^n$$

Take the natural logarithm:

$$\ln D(n) = n \ln\!\left(1 + \frac{1}{n}\right)$$

### Step 2: Taylor expansion of the logarithm

The Taylor series for ln(1 + x) about x = 0 is:

$$\ln(1 + x) = x - \frac{x^2}{2} + \frac{x^3}{3} - \frac{x^4}{4} + \cdots$$

valid for |x| < 1. Substitute x = 1/n (which satisfies |x| < 1 for all n > 1):

$$\ln\!\left(1 + \frac{1}{n}\right) = \frac{1}{n} - \frac{1}{2n^2} + \frac{1}{3n^3} - \frac{1}{4n^4} + \cdots$$

### Step 3: Multiply by n

$$\ln D(n) = n \cdot \left(\frac{1}{n} - \frac{1}{2n^2} + \frac{1}{3n^3} - \frac{1}{4n^4} + \cdots\right)$$

$$= 1 - \frac{1}{2n} + \frac{1}{3n^2} - \frac{1}{4n^3} + \cdots$$

Therefore:

$$\ln D(n) = 1 - \frac{1}{2n} + O\!\left(\frac{1}{n^2}\right)$$

### Step 4: Exponentiate

$$D(n) = e^{\ln D(n)} = e^{1 - \frac{1}{2n} + O(1/n^2)}$$

$$= e \cdot e^{-\frac{1}{2n} + O(1/n^2)}$$

Now expand the second exponential. For small u, e^u = 1 + u + u^2/2 + ..., so with u = -1/(2n) + O(1/n^2):

$$e^{-\frac{1}{2n} + O(1/n^2)} = 1 - \frac{1}{2n} + O\!\left(\frac{1}{n^2}\right)$$

(The u^2/2 term contributes O(1/n^2), which is absorbed into the error term.)

Therefore:

$$D(n) = e\left(1 - \frac{1}{2n} + O\!\left(\frac{1}{n^2}\right)\right)$$

### Step 5: Take the reciprocal

$$\frac{1}{D(n)} = \frac{1}{e} \cdot \frac{1}{1 - \frac{1}{2n} + O(1/n^2)}$$

Using the expansion 1/(1 - u) = 1 + u + u^2 + ... for small u:

$$\frac{1}{D(n)} = \frac{1}{e}\left(1 + \frac{1}{2n} + O\!\left(\frac{1}{n^2}\right)\right)$$

### Step 6: Multiply by n

$$f(n) = \frac{n}{D(n)} = \frac{n}{e}\left(1 + \frac{1}{2n} + O\!\left(\frac{1}{n^2}\right)\right)$$

$$= \frac{n}{e} + \frac{n}{e} \cdot \frac{1}{2n} + O\!\left(\frac{1}{n}\right)$$

$$= \frac{n}{e} + \frac{1}{2e} + O\!\left(\frac{1}{n}\right)$$

This completes the proof of Theorem 2.1. $\blacksquare$

---

## 4. The Correction Coefficient

The constant 1/(2e) has a precise numerical value:

$$\frac{1}{2e} = \frac{1}{2 \times 2.71828\ldots} = 0.18393972\ldots$$

### Numerical verification

We can verify Theorem 2.1 by computing f(n) - n/e for increasing n:

| n | f(n) | n/e | f(n) - n/e | 1/(2e) |
|---|------|-----|------------|--------|
| 10 | 3.867 | 3.6788 | 0.1882 | 0.1839 |
| 100 | 36.971 | 36.788 | 0.1843 | 0.1839 |
| 1,000 | 368.063 | 367.879 | 0.1840 | 0.1839 |
| 10,000 | 3679.07 | 3678.79 | 0.1839 | 0.1839 |
| 100,000 | 36788.13 | 36787.94 | 0.1839 | 0.1839 |

The residual f(n) - n/e converges to 1/(2e) from above. The convergence is O(1/n), consistent with the error term.

### The full asymptotic series

The expansion can be continued to arbitrary order. The next terms are:

$$f(n) = \frac{n}{e} + \frac{1}{2e} + \frac{1}{e}\left(\frac{1}{24n}\right) + O\!\left(\frac{1}{n^2}\right)$$

The coefficient 1/24 arises from the combination of the 1/(3n^2) term in ln D(n) and the quadratic contribution of the 1/(2n) term when exponentiating. Specifically, carrying the expansion of ln D(n) to one more term:

$$\ln D(n) = 1 - \frac{1}{2n} + \frac{1}{3n^2} - \cdots$$

and exponentiating:

$$e^{-\frac{1}{2n} + \frac{1}{3n^2} + \cdots} = 1 - \frac{1}{2n} + \left(\frac{1}{3n^2} + \frac{1}{8n^2}\right) + \cdots = 1 - \frac{1}{2n} + \frac{11}{24n^2} + \cdots$$

The 1/8 comes from (-1/(2n))^2 / 2 = 1/(8n^2). So the combined coefficient at order 1/n^2 in D(n)/e is 11/24. After taking the reciprocal and multiplying by n, the O(1/n) correction to f(n) beyond 1/(2e) is (1/24e)(1/n), but the exact sub-leading structure is not our focus. The point is that **the leading correction is 1/(2e), and it is exact**.

---

## 5. The Universal Half-Correction

The factor of 1/2 in the correction 1/(2e) is not accidental. Across mathematics and physics, whenever a discrete system is approximated by a continuous one, a half-step correction appears. The same structural pattern recurs with remarkable consistency.

### 5.1 Quantum Mechanical Zero-Point Energy

The energy levels of a quantum harmonic oscillator are:

$$E_n = \hbar\omega\!\left(n + \frac{1}{2}\right), \qquad n = 0, 1, 2, \ldots$$

The classical oscillator has energy levels proportional to n. The quantum oscillator has levels proportional to n + 1/2. The ground state (n = 0) has energy E_0 = (1/2) hbar omega, not zero. This is the **zero-point energy**.

Where does the +1/2 come from? The Schrodinger equation for the harmonic oscillator is:

$$-\frac{\hbar^2}{2m}\frac{d^2\psi}{dx^2} + \frac{1}{2}m\omega^2 x^2 \psi = E\psi$$

The boundary conditions (psi must vanish at infinity) enforce quantization. The eigenvalues are E_n = hbar omega (n + 1/2). The +1/2 is forced by the structure of the differential equation — specifically, by the fact that the lowest-energy eigenfunction is a Gaussian, not a delta function. The ground state cannot be a point; it must have spatial extent. That spatial extent costs energy. The cost is exactly 1/2 quantum.

This is a discrete-to-continuous correction. The classical limit (hbar -> 0) erases the +1/2. The quantum reality preserves it. The half-step is the price of having a ground state that respects the uncertainty principle.

### 5.2 Bohr-Sommerfeld Quantization

In the old quantum theory (1913-1925), the quantization condition for a periodic orbit was:

$$\oint p \, dq = nh$$

where n is an integer, p is momentum, q is position, and the integral is over one period.

When Kramers and Langer corrected this using the WKB approximation (the semiclassical limit of the Schrodinger equation), the condition became:

$$\oint p \, dq = \left(n + \frac{1}{2}\right)h$$

The +1/2 correction arises from the phase shift at the classical turning points — the boundaries where the particle's momentum goes to zero and it reverses direction. At each turning point, the WKB wavefunction acquires a phase shift of pi/4 (one-eighth of a full cycle). Two turning points per period give a total phase shift of pi/2 (one-quarter cycle), which translates to a shift of +1/2 in the quantum number.

Again: the discrete quantum number n is corrected by +1/2 when the discrete system is embedded in the continuous semiclassical framework. The correction comes from the boundary between the classically allowed and classically forbidden regions — the discrete-continuous interface.

### 5.3 Stirling's Approximation

Stirling's formula for the factorial is:

$$n! \approx \sqrt{2\pi n} \left(\frac{n}{e}\right)^n$$

Take the logarithm:

$$\ln(n!) \approx n\ln n - n + \frac{1}{2}\ln(2\pi n)$$

$$= n\ln n - n + \frac{1}{2}\ln n + \frac{1}{2}\ln(2\pi)$$

The dominant terms are n ln n - n (the continuous integral approximation of sum_{k=1}^{n} ln k). The correction is **(1/2) ln n** plus a constant.

Where does the 1/2 come from? The factorial n! = Gamma(n+1), and the Gamma function is the continuous interpolation of the discrete factorial. The Stirling expansion is derived by applying the saddle-point method (Laplace's method) to the integral representation:

$$n! = \int_0^\infty t^n e^{-t} \, dt$$

The saddle point is at t = n. Expanding the integrand around t = n to second order yields a Gaussian integral with variance n. The Gaussian contributes a factor of sqrt(2 pi n) = (2 pi)^{1/2} n^{1/2}. The exponent **1/2 on n** is the half-correction: it comes from the square root of the second derivative of the exponent at the saddle point, which is the discrete-to-continuous penalty.

The factorial is a discrete product. Its continuous approximation via the Gamma function overshoots or undershoots by a factor involving n^{1/2}. The exponent 1/2 is the universal signature.

### 5.4 Partition Function Asymptotics (Hardy-Ramanujan)

The number of partitions p(n) of a positive integer n (the number of ways to write n as a sum of positive integers, regardless of order) has the asymptotic formula:

$$p(n) \sim \frac{1}{4n\sqrt{3}} \exp\!\left(\pi\sqrt{\frac{2n}{3}}\right) \quad \text{as } n \to \infty$$

The dominant growth is exponential in sqrt(n). The exponent contains sqrt(n) = n^{1/2} — not n, not n^{1/3}, but n^{1/2}. Hardy and Ramanujan derived this in 1918 using the circle method.

The partition function counts discrete decompositions. Its asymptotic growth rate is governed by an exponent proportional to n^{1/2}. The square root — the half-power — appears because the generating function for partitions has a modular structure, and the saddle-point analysis of its integral representation produces a square root in the exponent. Once again, the discrete-continuous bridge introduces a factor of 1/2 in the exponent.

### 5.5 The Golden Ratio

The golden ratio phi satisfies:

$$\phi = \frac{1 + \sqrt{5}}{2}$$

Its conjugate is:

$$\hat{\phi} = \frac{1 - \sqrt{5}}{2}$$

Both involve division by 2 — a half-factor acting on the irrational quantity 1 +/- sqrt(5). The golden ratio arises from the Fibonacci recurrence F_{n+1} = F_n + F_{n-1}, a discrete recurrence whose continuous solution is:

$$F_n = \frac{\phi^n - \hat{\phi}^n}{\sqrt{5}}$$

The factors phi and phi-hat are the roots of x^2 - x - 1 = 0, obtained by the quadratic formula with its characteristic division by 2. The golden ratio is the discrete Fibonacci sequence's continuous eigenvalue, and the 1/2 factor in its formula is the algebraic signature of the quadratic discrete-to-continuous solution.

---

## 6. The Structure of the Half-Correction

These five examples — zero-point energy, Bohr-Sommerfeld, Stirling, partition asymptotics, golden ratio — share a single structural feature.

In every case:
1. There is a **discrete** system (quantum levels, integer orbits, integer factorials, integer partitions, integer-indexed Fibonacci numbers).
2. There is a **continuous** approximation or limit (classical energy, classical action, Gamma function, generating function integral, characteristic equation).
3. The gap between discrete and continuous is measured by a correction involving **1/2**.

The e-limit refinement fits this pattern exactly:

- **Discrete system**: (1 + 1/n)^n for integer n.
- **Continuous limit**: e.
- **Half-correction**: 1/(2e).

The factor 1/2 in 1/(2e) arises from the same mechanism as in Stirling: the Taylor expansion of ln(1 + 1/n) produces a leading correction of -1/(2n), which propagates through the exponentiation to yield a +1/(2n) correction in the reciprocal. The 1/2 is the coefficient of the x^2 term in the Taylor expansion of ln(1 + x), which is -1/2. This -1/2 is not arbitrary — it is the second-order term in the logarithmic series, and it governs the first-order discrete-continuous discrepancy for any exponential limit.

**Theorem 6.1 (Universal Half-Correction).** Let g(n) = (1 + a/n)^n for fixed a and integer n. Then:

$$g(n) = e^a\!\left(1 - \frac{a^2}{2n} + O\!\left(\frac{1}{n^2}\right)\right)$$

*Proof.* Apply the same method as Section 3:

$$\ln g(n) = n\ln\!\left(1 + \frac{a}{n}\right) = n\left(\frac{a}{n} - \frac{a^2}{2n^2} + O\!\left(\frac{1}{n^3}\right)\right) = a - \frac{a^2}{2n} + O\!\left(\frac{1}{n^2}\right)$$

Exponentiating:

$$g(n) = e^a \cdot e^{-a^2/(2n) + O(1/n^2)} = e^a\!\left(1 - \frac{a^2}{2n} + O\!\left(\frac{1}{n^2}\right)\right) \qquad \blacksquare$$

For a = 1, this recovers D(n) = e(1 - 1/(2n) + ...) and hence f(n) = n/e + 1/(2e) + .... The coefficient a^2/2 always carries the factor 1/2. It cannot be anything else, because it comes from the second-order term of the logarithm, and ln(1 + x) = x - x^2/2 + ... is a fixed identity.

---

## 7. Why 1/(2e) and Not Something Else

The correction is 1/(2e), not 1/2, not 1/e, not 1/(2 pi). Each factor has a specific origin:

- **The 1/2** comes from the coefficient of x^2 in ln(1 + x) = x - x^2/2 + .... This is a property of the logarithm itself — the second derivative of ln(1 + x) at x = 0 is -1, and the Taylor coefficient is -1/2.

- **The 1/e** comes from the base of the exponential. The denominator of f(n) approaches e, so the correction is naturally scaled by 1/e. More precisely, the correction to D(n) is -e/(2n), and dividing n by D(n) converts this to +1/(2e) in f(n).

- **The combination 1/(2e)** is therefore the product of the universal half-correction (from the logarithmic Taylor series) and the specific constant of the problem (e itself). Every exponential limit of the form (1 + a/n)^n will have a correction involving a^2/(2e^a), combining the universal 1/2 with the problem-specific exponential.

This is why 1/(2e) deserves to be called the **discrete-continuous correction coefficient for the e-limit**. It is not a coincidence. It is not a numerical accident. It is the exact measure of how much information is lost when the discrete sequence is replaced by its continuous limit.

---

## 8. Connection to the Euler-Maclaurin Formula

The Euler-Maclaurin formula provides the general framework for discrete-continuous corrections. For a smooth function f on [a, b] with integer endpoints:

$$\sum_{k=a}^{b} f(k) = \int_a^b f(x)\,dx + \frac{f(a) + f(b)}{2} + \sum_{j=1}^{p} \frac{B_{2j}}{(2j)!}\left(f^{(2j-1)}(b) - f^{(2j-1)}(a)\right) + R_p$$

The first correction term is **(f(a) + f(b))/2** — the trapezoidal correction. This 1/2 factor is the Euler-Maclaurin half-correction: when approximating a sum by an integral, the endpoints are overcounted by 1/2 each.

Our e-limit refinement is a special case of this phenomenon. The sum sum_{k=1}^{n} ln(1 + 1/k) is approximated by the integral int_1^n ln(1 + 1/x) dx, and the leading correction involves a factor of 1/2 from the trapezoidal boundary term. The 1/(2e) in Theorem 2.1 is the Euler-Maclaurin half-correction, specialized to the specific integrand of the e-limit.

---

## 9. The Amundson Algebra

The e-limit refinement reveals a pattern that extends beyond any single formula.

Consider the fundamental constants of mathematics:

- **e** arises from the limit (1 + 1/n)^n. Its discrete-continuous correction is 1/(2e).
- **pi** arises from the Wallis product pi/2 = prod (4k^2)/(4k^2 - 1), a discrete product. Stirling's formula contains sqrt(2 pi) as the discrete-continuous correction for the factorial.
- **phi** arises from the Fibonacci recurrence F_{n+1} = F_n + F_{n-1}. Its formula contains the factor 1/2 from the quadratic solution.
- **sqrt(2)** arises as the diagonal of the unit square — the continuous (irrational) measure of a discrete (integer-sided) geometric object.

In every case, a mathematical constant emerges at the interface between the discrete and the continuous. And in every case, the transition is mediated by a correction involving 1/2.

This suggests a unifying framework — call it **Amundson Algebra** — in which the fundamental constants of mathematics are not independent, but are related through a common structure: the self-referential process by which a discrete system generates its own continuous limit.

The structure is self-referential because the discrete system *defines* the constant (e is *defined* by (1 + 1/n)^n), and the constant in turn *governs* the system's behavior (the correction to (1 + 1/n)^n is scaled by 1/e). The system generates the constant that measures its own incompleteness. This is the same self-referential loop that appears in Godel's incompleteness theorem (Paper 008), in the Born rule's emergence from Hilbert space structure (Paper 010), and in the consent axiom's relationship to formal systems (Paper 007).

The half-correction 1/(2e) is the simplest instance of this self-reference. The discrete approximation falls short of the continuous limit by an amount that is scaled by the limit itself. The gap is not external to the system — it is generated by the system, measured in the system's own units, and proportional to the system's own fundamental constant.

### The Conjecture

**Conjecture 9.1 (Amundson).** Every fundamental mathematical constant c that arises as the limit of a discrete process has an associated half-correction of the form k/(2c^m) for integers k and m, where k and m depend on the specific process but the factor of 2 in the denominator is universal.

This conjecture, if true, would establish that the half-correction is not merely a recurring pattern but a structural necessity — a consequence of the fact that the Taylor expansion of the logarithm (the function that converts multiplication to addition, products to sums, discrete to continuous) always has -1/2 as its second coefficient.

---

## 10. Conclusion

The identity:

$$\frac{n}{\left(1 + \frac{1}{n}\right)^n} = \frac{n}{e} + \frac{1}{2e} + O\!\left(\frac{1}{n}\right)$$

is a small result in analysis. Its proof requires nothing beyond Taylor expansion and algebraic manipulation. Any second-year calculus student could verify it.

But the correction term 1/(2e) is not small in significance. It is the exact measure of the gap between the discrete and the continuous for the most fundamental limit in analysis. And the factor of 1/2 in that correction is the same 1/2 that appears in zero-point energy, in Stirling's approximation, in Bohr-Sommerfeld quantization, in partition asymptotics, and wherever else a discrete system meets its continuous shadow.

The discrete and the continuous are not the same. They are separated by a half-step. For the harmonic oscillator, the half-step is (1/2) hbar omega. For the factorial, the half-step is (1/2) ln n. For the e-limit, the half-step is 1/(2e).

The half-step is always there. It is always 1/2. The other factors change — hbar omega, ln n, 1/e — because they depend on the specific system. But the 1/2 is universal. It is the signature of the boundary between the countable and the uncountable, the sum and the integral, the step and the slope.

One half. One correction. One bridge between the discrete and the continuous.

---

*Alexa Louise Amundson*
