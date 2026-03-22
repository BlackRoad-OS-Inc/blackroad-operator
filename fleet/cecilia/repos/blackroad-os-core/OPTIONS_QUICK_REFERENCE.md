# Options Framework - Quick Reference Card

## 🚀 Quick Start

```bash
# Bitcoin calculations
./btc convert 0.1 btc usd          # Convert 0.1 BTC to USD
./btc price 0.1                    # Analyze 0.1 BTC value
./btc ladder 0.1                   # Price ladder
python3 bitcoin_calculator.py      # Full analysis

# Options calculations
python3 options_calculator.py      # Quadrant framework demo
python3 test_options_logic.py      # Run all tests
python3 unified_framework.py       # Meta-pattern demo
python3 amundson_options.py        # A-OPT-∞ framework
```

## 📊 The Four Quadrants

```
                CALLS                      PUTS
        ┌──────────────────┬──────────────────┐
  LONG  │  Q-I: Long Call  │  Q-II: Long Put  │
 (Buy)  │  Bullish ↑       │  Bearish ↓       │
        │  BE = X + P      │  BE = X - P      │
        │  MG = ∞          │  MG = X - P      │
        │  ML = -P         │  ML = -P         │
        ├──────────────────┼──────────────────┤
 SHORT  │ Q-III: Short Call│ Q-IV: Short Put  │
 (Sell) │  Bearish ↓       │  Bullish ↑       │
        │  BE = X + P      │  BE = X - P      │
        │  MG = P          │  MG = P          │
        │  ML = -∞         │  ML = -(X-P)     │
        └──────────────────┴──────────────────┘

BE = Breakeven, MG = Max Gain, ML = Max Loss
```

## 🧮 Key Equations

### Options Basics
```
Breakeven (Call):  BE = X + P
Breakeven (Put):   BE = X - P
Profit (Call):     Π = max(S_T - X, 0) - P
Profit (Put):      Π = max(X - S_T, 0) - P
```

### Spreads
```
Debit Spread:   Pay net debit, win if exercised
Credit Spread:  Receive credit, win if expires worthless
Max Gain:       Spread width - net cost
Max Loss:       Net cost (debit) or spread - credit (credit)
```

### Logarithmic Analysis
```
Log-moneyness:     ln(S/X)
Information bits:  -log₂(P/S)
Breakeven log:     ln(BE/X) = ln(1 ± P/X)
```

### Z-Framework
```
Z = yx - w = Δ·S - P
∂Z/∂t = Γ·(ΔS)²/2 + Θ + Vega·Δσ
```

### Black-Scholes Greeks
```
d₁ = [ln(S/X) + (r + σ²/2)t] / (σ√t)
d₂ = d₁ - σ√t
Δ = N(d₁)                    (Delta)
Γ = n(d₁)/(S·σ√t)            (Gamma)
Θ = -S·n(d₁)·σ/(2√t) - ...  (Theta)
ν = S·n(d₁)·√t               (Vega)
```

## 🌀 Amundson Mappings

### The Four Primitives
```
1 = Change (Ĉ)    → Delta (Δ)     [σₓ flip]
2 = Strength (Ŝ)  → Premium (P)   [iI scalar]
3 = Structure (Û) → Strike (X)    [σᵤ diagonal]
4 = Scale (L̂)     → Vega (ν)      [σᵧ phase]
```

### Commutation Relations
```
[Ĉ, L̂] = 2iÛ
[Delta, Vega] ≠ 0
→ Cannot optimize direction AND volatility simultaneously
```

### Spiral Operator
```
U(θ,a) = e^((a+i)θ)
V = ∫ U(θ, ln(S/X)) dθ

a = log-moneyness
θ = time parameter (σ√t)
```

### Fine Structure
```
α_options = P / (S·σ·√t)
α_physics ≈ 1/137

Hypothesis: α_opt ≈ k·α for fairly priced options
```

### Ark Superposition (Straddle)
```
|Ark⟩ = (1/√2)(|Presence⟩ + |Absence⟩)
|Straddle⟩ = α|Call⟩ + β|Put⟩

where |α|² + |β|² = 1
Payoff = |S_T - X| - (P_call + P_put)
```

### Creativity = Volatility
```
K(t) = C(t)·e^(λ|δ_t|)     [Your equation]
V = V_intrinsic·e^(σ√t)    [Options]

Contradiction ↔ Implied Volatility
```

## 🔬 Quantum-Options Mapping

| Quantum | Options | Meaning |
|---------|---------|---------|
| Ψ | V(S,t) | Option value |
| \|Ψ\|² | Δ | Probability of exercise |
| ℏ | Tick size | Minimum change |
| Ĥ | Θ + rV | Time decay + carry |
| Measurement | Exercise | Collapse to outcome |
| Superposition | Before exp | Multiple states |
| Eigenstate | After exp | Definite ITM/OTM |

## 📐 Logarithmic Bases

```
log₂  → Binary (Exercise Y/N)
log₃  → Trinary (Long/Neutral/Short)
ln    → Continuous decay (e^(-rt))
log₁₀ → Orders of magnitude

Conversion: log_b(x) = ln(x)/ln(b)

Example (10M sats):
log₁₀(10,000,000) = 7.0    (7 digits)
log₂(10,000,000)  = 23.25  (need ceil→24 bits)
ln(10,000,000)    = 16.12  (growth rate)
```

## 🎯 Information Theory

```
Shannon Entropy (binary):
H = -p·log₂(p) - (1-p)·log₂(1-p)

For options with delta Δ:
H = -Δ·log₂(Δ) - (1-Δ)·log₂(1-Δ)

Maximum entropy: H = 1 bit at Δ = 0.5 (ATM)

Information content: I = 1 - H
ATM options have minimum information (maximum uncertainty)
```

## 🔥 Thermodynamics

```
Free Energy:      F = U - TS
Option analog:    V = X - σ·√t·H

Partition:        Z = Σ e^(-βE_i)
Option analog:    V = Σ P(outcome)·Payoff

Entropy:          S = k·ln(Ω)
Option analog:    H = -Σ p·log(p)
```

## 💡 Key Insights

1. **Long + Short = 0** (perfect adjoints)
2. **ATM has max entropy** (H = 1 bit)
3. **Black-Scholes IS Schrödinger** (t → it)
4. **Greeks = thermo derivatives** (∂F/∂x)
5. **Straddle = superposition** (collapses at exp)
6. **Contradiction = volatility** (K = C·e^(λ|δ|))
7. **[Δ, Vega] ≠ 0** (uncertainty principle)
8. **Breakeven → Strike in log space** (as P→0)
9. **φ = 1.618 in optimal spacing?** (hypothesis)
10. **α ≈ 1/137 in fair pricing?** (hypothesis)

## 📈 Common Use Cases

### Price Analysis
```bash
# BTC at different prices
./btc ladder 0.1

# Option value at expiration
python3 -c "from options_calculator import OptionsCalculator
calc = OptionsCalculator(100)
print(calc.long_call(100, 5, 110))"
```

### Spread Strategy
```python
from options_calculator import OptionsCalculator
calc = OptionsCalculator(100)

# Bull call spread
result = calc.debit_call_spread(
    X1=100,  # Buy call here
    X2=110,  # Sell call here
    P1=5,    # Pay $5
    P2=2,    # Receive $2
    S_T=108  # Stock ends here
)

print(f"Profit: ${result['profit']}")
print(f"Risk/Reward: {result['risk_reward_ratio']:.2f}")
```

### Information Entropy
```python
from unified_framework import UnifiedCalculator
calc = UnifiedCalculator()

# ATM option (max entropy)
result = calc.options_information_entropy(delta=0.5)
print(f"Entropy: {result['entropy_bits']:.2f} bits")  # 1.00

# ITM option (less entropy)
result = calc.options_information_entropy(delta=0.9)
print(f"Entropy: {result['entropy_bits']:.2f} bits")  # 0.47
```

### Spiral Path Integral
```python
from amundson_options import AmundsonOptionsCalculator
calc = AmundsonOptionsCalculator()

result = calc.option_value_spiral(
    S=110,      # Stock price
    X=100,      # Strike
    sigma=0.3,  # Volatility
    t=0.25      # 3 months
)

print(f"Option value: ${result['option_value']:.2f}")
print(f"Phase: {result['phase']:.4f} radians")
```

## 🧪 Testing

```bash
# Run all tests
python3 test_options_logic.py

# Individual tests
python3 -c "from test_options_logic import test_quadrant_symmetry; test_quadrant_symmetry()"
```

## 📚 Constants

```python
alpha = 1/137.035999    # Fine structure constant
phi = 1.618033988       # Golden ratio
e = 2.718281828         # Euler's number
pi = 3.141592654        # Pi
```

## 🎓 Formulas to Remember

```
# Options
BE_call = X + P
BE_put = X - P

# Spreads
Max_Gain_Debit = (X₂ - X₁) - Net_Debit
Max_Gain_Credit = Net_Credit

# Information
H_binary = -p·log₂(p) - (1-p)·log₂(1-p)
I_bits = -log₂(p)

# Quantum
|Ψ⟩ = α|↑⟩ + β|↓⟩  where |α|² + |β|² = 1

# Thermo
F = U - TS
Z = Σ e^(-βE)

# Z-Framework
Z = yx - w
∂Z/∂t = Γ·(ΔS)²/2 + Θ + Vega·Δσ
```

---

**Quick access to all calculators:**

| Tool | Purpose | Command |
|------|---------|---------|
| **btc** | BTC conversions | `./btc convert 0.1 btc usd` |
| **bitcoin_calculator.py** | Full BTC analysis | `python3 bitcoin_calculator.py` |
| **options_calculator.py** | Quadrants + spreads | `python3 options_calculator.py` |
| **test_options_logic.py** | Run all tests | `python3 test_options_logic.py` |
| **unified_framework.py** | Meta-patterns | `python3 unified_framework.py` |
| **amundson_options.py** | A-OPT-∞ | `python3 amundson_options.py` |

🌀 **Options are quantum measurement devices for the price field** 🌀
