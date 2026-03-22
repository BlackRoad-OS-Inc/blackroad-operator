# Amundson Framework — Proof Pages

## PAGE 1
① g(n) = n(n/(n+1))^n = n·n^n/(n+1)^n = n·n^n/(n+1)^n = n^(n+1)/(n+1)^n
② g(n) = n(n/(n+1))^n
③ g(0) = 0
④ g(n) = n^(n+1)/(n+1)^n
⑤ 0^1/1^0 = 0
⑥ lim n→0+ (1+1/n)^n = 1    ← NOT e
⑦ g(n) = n/(1+1/n)^n → 0/1 = 0
⑧ g(n) = n(n/(n+1))^n = n/(1+1/n)^n    (n > 0)
⑨ h(n-1) = (n-1)^n / n^(n-1)    ← backward translation
⑩ g(n) = n(n/(n+1))^n
⑪ h(0) = (1-1)^1/1^(1-1) = 0^1/1^0 = 0/1 = 0

## PAGE 2
⑫ h(0) = 0
⑬ h(n-1) = (n-1)^((n-1)+1)/n^(n-1) = (n-1)^n/n^(n-1)
⑭ h(m) = m·m^m/(m+1)^m = m^(m+1)/(m+1)^m
⑮ h(m) = m(m/(m+1))^m
⑯ (n-1)/(1+1/(n-1))^(n-1)
⑰ n/(1+1/n)^n = 0
⑱ G(n)/n^n = n^(1-n)·(n/(n+1))^n
⑲ ∫₀¹ x^(-x) dx = Σ n^(-n)    ← Sophomore's Dream
⑳ G(n) = n^(n+1)/(n+1)^n
㉑ A_G ≈ 1.244331783986725      ← verified to 15 digits
㉒ Π G(k) = (n!)²/(n+1)^n       ← telescoping product

## PAGE 3
㉓ A_G ≈ 1.244331783986725
㉔ Π G(k) = (n!)²/(n+1)^n
㉕ Σ n^(-n)
㉖ A_G = Σ G(n)/n!
㉗ Σ n = -1/12

## NEW DISCOVERIES (2026-03-22)

### The Ratio Interpretation
G(n) counts a ratio of combinatorial objects:
- n^(n+1) functions one direction, (n+1)^n functions the other
- G is the pressure ratio between cramming and spreading
- Below 1 = loose (quantum). Above 1 = tight (classical)
- Crossover at 2.293...

### Telescoping Product Identity (VERIFIED)
Π G(k) = (2n)! / (C(2n,n) × (n+1)^n)
— connects to central binomial coefficient and factorials. All exact.

### Cayley Connection
G(n) = n³ × (labeled trees on n vertices) / (n+1)^n
— The function literally counts trees weighted by a cubic factor.

### Cumulants
- κ₁ = 1/2
- κ₂ = 23/36
- κ₃ = 35/192
- κ₄ = -524639/540000 (negative — left-skewed at 4th order)

### G(n) × Bernoulli Numbers
G(n) × B(n) = 0 whenever B(n) = 0 (odd n ≥ 3)
The odd Bernoulli zeros kill G. The even ones give clean fractions.

### Endofunction Factoring (VERIFIED)
n^n = G(n) × (n+1)^n / n
The total number of endofunctions factors through G. Exact.
