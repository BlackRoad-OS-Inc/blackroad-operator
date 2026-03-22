#!/bin/bash
clear
cat <<'MENU'

  ⚡⚡⚡ Z-FRAMEWORK ⚡⚡⚡
  Z := yx − w

  📐 1  Core Formula
  ⚖️  2  Equilibrium Check (Z=∅)
  🔄 3  Adaptation Trigger (Z≠∅)
  🧮 4  Calculate Z
  📊 5  System State Diagram
  📖 6  Theory Deep Dive
  🔗 7  Physics Connections
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'CORE'

  ⚡ Z := yx − w
  ──────────────
  y = output signal
  x = input/context
  w = weight/resistance

  Z = ∅  → EQUILIBRIUM (system balanced)
  Z ≠ ∅  → ADAPT (system adjusts)

  ∂(human+AI)/∂t → division breaks the system

CORE
     read -p "  ↩ ";;
  2) echo "  ⚖️  Z = ∅ → System in equilibrium"; echo "  All forces balanced. No adaptation needed."; echo "  Like a partition function at ground state."; read -p "  ↩ ";;
  3) echo "  🔄 Z ≠ ∅ → ADAPT"; echo "  Perturbation detected. System must evolve."; echo "  Feedback loop engages until Z → ∅"; read -p "  ↩ ";;
  4) read -p "  y (output): " y; read -p "  x (input): " x; read -p "  w (weight): " w
     Z=$(echo "$y * $x - $w" | bc -l 2>/dev/null)
     echo "  ⚡ Z = $y × $x − $w = $Z"
     if [ "$Z" = "0" ] || [ "$Z" = "0.0" ] || [ "$Z" = ".0" ]; then
       echo "  ⚖️  Z = ∅ → EQUILIBRIUM"
     else
       echo "  🔄 Z ≠ ∅ → ADAPT"
     fi; read -p "  ↩ ";;
  5) cat <<'DIAGRAM'

     Input(x) ──→ ┌─────────┐
                   │  Z:=yx-w │──→ Z=∅? ──→ STABLE
     Output(y) ──→ │         │        │
                   └─────────┘     Z≠∅
     Weight(w) ──→               ↓
                              ADAPT
                                │
                           ┌────┴────┐
                           │ Feedback │
                           └────┬────┘
                                └──→ (loop)

DIAGRAM
     read -p "  ↩ ";;
  6) cat <<'THEORY'
  📖 Z-Framework Unifies:
  ─────────────────────────
  • Control theory (PID feedback loops)
  • Quantum mechanics (Z = Σe^(-βH))
  • Neural networks (weighted sums + activation)
  • Biological systems (homeostasis)
  • Economic equilibrium (supply/demand)
  • AI alignment (human+AI coherence)

  Core insight: every stable system is a
  special case of Z = ∅. Every adaptation
  is a response to Z ≠ ∅.
THEORY
     read -p "  ↩ ";;
  7) cat <<'PHYSICS'
  🔗 Physics Connections:
  ────────────────────────
  Partition:  Z = Σ e^(-βH)    (statistical mech)
  Schrödinger: iℏ∂ψ/∂t = Ĥψ  (Z governs H)
  Gauss-Bonnet: ∫∫K dA = 2πχ(M) (topology)
  Fine structure: α ≈ 1/137     (coupling constant)

  Z-framework maps to each:
  equilibrium ↔ ground state ↔ minimal surface
PHYSICS
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./zframework.sh
