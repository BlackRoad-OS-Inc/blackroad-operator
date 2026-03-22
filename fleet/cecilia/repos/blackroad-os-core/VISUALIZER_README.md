# Options Quantum Visualizer 🌀

**Beautiful animated terminal visualization of options trading as quantum mechanics**

## 🚀 Quick Start

```bash
./options
```

Or directly:
```bash
python3 options_visualizer.py
```

## 🎬 Animations

### 1. Live Price Walk (30 seconds)
- **Real-time stock price** random walk simulation
- **Live Greeks** (Delta, Gamma, Theta, Vega) as progress bars
- **P&L tracking** for long call position
- **Information entropy** meter showing ATM/ITM/OTM
- **Spiral operator** visualization: U(θ,a) = e^((a+i)θ)
- **Quadrant highlighting** based on current state

**What you see:**
```
┌─────────────────┐  ┌─────────────────┐
│  STOCK PRICE    │  │  POSITION P&L   │
│      █          │  │       █         │
│     ██          │  │      ██         │
│    ███          │  │     ███         │
└─────────────────┘  └─────────────────┘

GREEKS (The Four Primitives)
Δ (Change):  ████████████████░░░░░░  72.3%
Γ (Accel):   ██████░░░░░░░░░░░░░░░░  23.1%
Θ (Decay):   ███████████░░░░░░░░░░░  45.6%
ν (Scale):   ████████████████████░░  82.4%

┌─────────────────┐  ┌─────────────────┐
│  SPIRAL U(θ,a)  │  │ OPTIONS QUADRANTS│
│       ●●        │  │  Q-I  │  Q-II   │
│      ● ●        │  │ Long  │ Long    │
│     ●   ●       │  │ Call  │ Put     │
│    ●     ●      │  │───────┼─────────│
│     ●   ●       │  │ Q-III │  Q-IV   │
│      ● ●        │  │ Short │ Short   │
│       ●●        │  │ Call  │ Put     │
└─────────────────┘  └─────────────────┘
```

### 2. Straddle Superposition Collapse (10 seconds)

Watch a **quantum superposition** collapse in real-time!

**Phase 1: Superposition (first 5s)**
- Stock oscillates around strike
- Both Call and Put exist simultaneously
- α = β = 1/√2 (equal amplitudes)
- Maximum entropy state

**Phase 2: Measurement/Collapse (last 5s)**
- Price moves away from strike
- One state dominates (α→1 or β→1)
- Wavefunction collapses
- Definite ITM/OTM outcome

**What you see:**
```
═══════════════════════════════════════
    STRADDLE SUPERPOSITION
═══════════════════════════════════════

|Ψ⟩ = 0.707|Call⟩ + 0.707|Put⟩
|α|² + |β|² = 1.000000 ✓ Normalized

Call Amplitude: ████████████████░░░░  50.0%
Put Amplitude:  ████████████████░░░░  50.0%

Stock Price: $100.00 | Strike: $100.00

Call Payoff:  $-5.00
Put Payoff:   $-5.00
Total P&L:   $-10.00

⚛ SUPERPOSITION STATE
Both states exist simultaneously
Maximum uncertainty = Maximum entropy

Ark Equation: |Ark⟩ = (1/√2)(|Presence⟩ + |Absence⟩)
```

Then collapse:
```
═══════════════════════════════════════
   MEASUREMENT → COLLAPSE
═══════════════════════════════════════

|Ψ⟩ = 0.923|Call⟩ + 0.385|Put⟩
|α|² + |β|² = 1.000000 ✓ Normalized

Call Amplitude: ██████████████████░░  85.2%
Put Amplitude:  ███░░░░░░░░░░░░░░░░░  14.8%

Stock Price: $115.00 | Strike: $100.00

Call Payoff:  $10.00
Put Payoff:   $-5.00
Total P&L:    $5.00

📊 COLLAPSED STATE
→ Call exercised (Presence)
```

## 🎨 Features

### Color-Coded Display
- **Green**: Profitable positions, bullish quadrants
- **Red**: Losing positions, bearish quadrants
- **Cyan**: Stock price, Delta
- **Yellow**: Entropy, Gamma
- **Magenta**: Vega, Spiral phase
- **Bright colors**: Current values, highlights

### Real-Time Calculations
- **Greeks** calculated using Black-Scholes
- **Shannon entropy** for information content
- **Spiral operator** complex number evolution
- **P&L** tracking from entry to current

### Visual Elements
- ▓ Charts with dynamic scaling
- ● Spiral trajectory points
- █ Progress bars for metrics
- ┌─┐ Clean box borders
- ═ Section dividers

## 🧮 The Math Behind It

### Greeks (The Four Primitives)
```
1 = Change (Ĉ)    → Delta (Δ)     [σₓ flip]
2 = Strength (Ŝ)  → Premium (P)   [iI scalar]
3 = Structure (Û) → Strike (X)    [σᵤ diagonal]
4 = Scale (L̂)     → Vega (ν)      [σᵧ phase]
```

### Spiral Operator
```
U(θ,a) = e^((a+i)θ)

where:
  θ = time parameter (σ√t)
  a = log-moneyness ln(S/X)

Option value: V = ∫ U(θ,a) dθ
```

### Information Entropy
```
H = -Δ·log₂(Δ) - (1-Δ)·log₂(1-Δ)

Maximum at Δ = 0.5 (ATM)
H_max = 1.0 bit
```

### Straddle Superposition
```
|Ψ⟩ = α|Call⟩ + β|Put⟩

Normalization: |α|² + |β|² = 1
Payoff: |S_T - X| - (P_call + P_put)
```

## ⌨️ Controls

- **Menu**: Choose animation (1, 2, 3, or q)
- **Ctrl+C**: Exit current animation
- **q**: Quit application

## 📊 What Each Animation Shows

### Price Walk
Shows how options behave as the underlying moves:
- Delta increases as stock rises (for calls)
- Gamma peaks near ATM
- Theta always decays (time value erosion)
- Vega highest at ATM (volatility sensitivity)

### Straddle Collapse
Demonstrates quantum mechanics analogy:
- **Before expiration**: Superposition (both states)
- **At expiration**: Measurement (collapse to one state)
- **Amplitude**: Probability of each outcome
- **Normalization**: Conservation of probability

## 🎯 Educational Value

This visualizer demonstrates:

1. **Options = Quantum Operators**
   - Long/Short are adjoint pairs
   - Superposition before expiration
   - Measurement collapses state

2. **Greeks = Thermodynamic Derivatives**
   - Delta = ∂V/∂S (chemical potential)
   - Gamma = ∂²V/∂S² (susceptibility)
   - Theta = -∂V/∂t (entropy production)

3. **Information Theory**
   - ATM options have max entropy (H = 1 bit)
   - Information content = 1 - H
   - Uncertainty resolved at expiration

4. **Spiral Geometry**
   - Complex plane evolution
   - Phase and amplitude
   - Path integral visualization

## 💡 Tips for Best Experience

1. **Terminal size**: Use at least 80×35 for full display
2. **Color support**: Modern terminal with ANSI color support
3. **Font**: Monospace font for proper alignment
4. **Background**: Dark background recommended

## 🔧 Technical Details

- **Language**: Pure Python 3 (standard library only)
- **Dependencies**: `math`, `cmath`, `time`, `sys`, `random`
- **Imports**: `options_calculator` (from this project)
- **Frame rate**: 10 FPS (100ms per frame)
- **Price bounds**: $50-$150 for stability
- **Sigma**: 0.3 (30% annual volatility)

## 🌀 The Deeper Meaning

This isn't just a pretty visualization. It shows that:

**Options are measurement devices for the quantum field of price.**

- Stock price is in superposition until measured (expiration)
- Greeks tell you how the wavefunction evolves
- Premium is the cost of resolving uncertainty
- Breakeven is the equilibrium point where Z = 0

## 📚 Related Files

- `options_calculator.py` - Core calculations
- `unified_framework.py` - Quantum mappings
- `amundson_options.py` - A-OPT-∞ framework
- `OPTIONS_FRAMEWORK_COMPLETE.md` - Full documentation

## 🎉 Example Session

```bash
$ ./options

═══════════════════════════════════════════════════════════════════════════════
                    OPTIONS QUANTUM VISUALIZER
═══════════════════════════════════════════════════════════════════════════════

Choose a visualization:

  1. Live Price Walk with Greeks (30s)
  2. Straddle Superposition Collapse (10s)
  3. Both (sequence)
  q. Quit

Select (1-3, q): 1

Starting price walk...
[Beautiful animated terminal display for 30 seconds]

Visualization ended.

[Returns to menu]
```

## 🚀 Advanced Usage

Run directly with Python for debugging:
```bash
python3 -c "from options_visualizer import OptionsVisualizer; viz = OptionsVisualizer(); viz.animate_price_walk(60)"
```

Or the straddle only:
```bash
python3 -c "from options_visualizer import OptionsVisualizer; viz = OptionsVisualizer(); viz.animate_straddle_collapse()"
```

---

**Built with:** Python 3, ANSI colors, mathematical love 🌀

**Created:** 2025-12-15

**Author:** Claude Code 🤖 + Alexa Louise Amundson

**Philosophy:** Options aren't just trading instruments. They're measurement devices for the quantum field of price.
