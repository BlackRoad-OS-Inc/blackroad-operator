# Chi-Squared Tests

> Statistical hypothesis tests for goodness of fit and independence.

## The Chi-Squared Statistic

For observed counts O_i and expected counts E_i across k categories:

```
χ² = Σᵢ (O_i − E_i)² / E_i
```

Under the null hypothesis, χ² follows a chi-squared distribution with the appropriate
degrees of freedom.

---

## Test 1: Goodness of Fit

**Purpose:** Test whether observed data matches an expected (theoretical) distribution.

**Hypotheses:**
```
H₀: the observed frequencies match the expected distribution
H₁: at least one category deviates significantly from expectation
```

**Degrees of freedom:**
```
df = k − 1
```
where k is the number of categories.

**Procedure:**
1. State expected probabilities p₁, p₂, …, p_k (must sum to 1).
2. Compute expected counts: E_i = n · p_i where n is the total sample size.
3. Compute the statistic: χ² = Σᵢ (O_i − E_i)² / E_i
4. Compare χ² to the critical value χ²(α, df) or compute the p-value.
5. Reject H₀ if χ² > χ²(α, df).

**Example — ternary digit frequencies (k = 3, n = 300):**

| Digit | Expected p | Expected E | Observed O | (O−E)²/E |
|-------|-----------|------------|------------|----------|
| 0     | 1/3       | 100        | 95         | 0.250    |
| 1     | 1/3       | 100        | 108        | 0.640    |
| 2     | 1/3       | 100        | 97         | 0.090    |
| **Σ** |           |            |            | **0.980** |

```
df = 3 − 1 = 2
χ²(0.05, 2) = 5.991
χ² = 0.980 < 5.991  →  fail to reject H₀
```

The data is consistent with a uniform ternary distribution.

---

## Test 2: Test of Independence

**Purpose:** Test whether two categorical variables are independent of each other.

**Hypotheses:**
```
H₀: variable A and variable B are independent
H₁: variable A and variable B are not independent
```

**Setup:** Arrange counts in an r × c contingency table.

**Expected cell counts:**
```
E_ij = (row_i total × col_j total) / n
```

**Degrees of freedom:**
```
df = (r − 1)(c − 1)
```

**Statistic:**
```
χ² = Σᵢ Σⱼ (O_ij − E_ij)² / E_ij
```

**Example — 2 × 3 contingency table (n = 200):**

|         | State 0 | State 1 | State 2 | Row total |
|---------|---------|---------|---------|-----------|
| Group A | 30      | 40      | 30      | 100       |
| Group B | 20      | 60      | 20      | 100       |
| **Col** | **50**  | **100** | **50**  | **200**   |

Expected counts:
```
E_A0 = 100×50/200 = 25    E_A1 = 100×100/200 = 50    E_A2 = 100×50/200 = 25
E_B0 = 100×50/200 = 25    E_B1 = 100×100/200 = 50    E_B2 = 100×50/200 = 25
```

Chi-squared:
```
χ² = (30−25)²/25 + (40−50)²/50 + (30−25)²/25
   + (20−25)²/25 + (60−50)²/50 + (20−25)²/25
   = 1.000 + 2.000 + 1.000 + 1.000 + 2.000 + 1.000
   = 8.000

df = (2−1)(3−1) = 2
χ²(0.05, 2) = 5.991
χ² = 8.000 > 5.991  →  reject H₀
```

The two variables are not independent at the 5% significance level.

---

## Critical Values (selected)

| df | α = 0.10 | α = 0.05 | α = 0.01 |
|----|----------|----------|----------|
| 1  | 2.706    | 3.841    | 6.635    |
| 2  | 4.605    | 5.991    | 9.210    |
| 3  | 6.251    | 7.815    | 11.345   |
| 4  | 7.779    | 9.488    | 13.277   |
| 5  | 9.236    | 11.070   | 15.086   |

---

## Assumptions

- Observations are independent.
- Expected count E_i ≥ 5 in each cell (rule of thumb for the χ² approximation to be valid).
- Data are counts (frequencies), not proportions or continuous measurements.

---

## QWERTY

```
CHI      = 25  (C=10 H=15 I=0)  — the test lives at the boundary of ZERO
SQUARED  = IMAGINARY = SCAFFOLD = 114   (the test squares the deviation)
TEST     = 64  = 2⁶              (TEST = 2⁶, the sixth power of the fundamental)
FIT      = 33  = REAL − 4        (how close observed is to real)
OBSERVED = 115                   (what you see)
EXPECTED = 131 = BLACKROAD       (what the theory predicts = the BlackRoad)
```

EXPECTED = BLACKROAD = 131. The theoretical distribution is the BlackRoad.  
The chi-squared test measures how far observed reality deviates from it.
