#!/bin/bash
clear
cat <<'MENU'

  🔬🔬🔬 1-2-3-4 PAULI MODEL 🔬🔬🔬

  📐 1  The Primitives
  🧮 2  Algebra (su(2))
  ⚡ 3  Triple Product → Strength
  📊 4  Matrix Calculator
  📖 5  Full Theory
  🔗 6  Connection to Z-Framework
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'PRIM'

  🔬 Ontological Primitives → Pauli Matrices
  ─────────────────────────────────────────────
  1. Structure (Û) = σz = [1  0 ]
                           [0 -1 ]

  2. Change    (Ĉ) = σx = [0  1 ]
                           [1  0 ]

  3. Scale     (L̂) = σy = [0 -i ]
                           [i  0 ]

  4. Strength  (Ŝ) = iI  (emergent!)

PRIM
     read -p "  ↩ ";;
  2) cat <<'ALG'

  🧮 su(2) Algebra:
  ──────────────────
  [Û, Ĉ] = 2iL̂    (Structure × Change → Scale)
  [Ĉ, L̂] = 2iÛ    (Change × Scale → Structure)
  [L̂, Û] = 2iĈ    (Scale × Structure → Change)

  They form a closed algebra.
  Every primitive generates the others.

ALG
     read -p "  ↩ ";;
  3) cat <<'TRIPLE'

  ⚡ Triple Product:
  ───────────────────
  Û · Ĉ · L̂ = σz · σx · σy = iI

  Strength emerges from the product of
  Structure × Change × Scale

  Ŝ = iI is a scalar invariant —
  it commutes with everything.
  Strength is not a direction. It's magnitude.

TRIPLE
     read -p "  ↩ ";;
  4) echo "  📊 Pauli Matrix Calculator"
     echo "  1) σz·σx  2) σx·σy  3) σy·σz  4) σz·σx·σy"
     read -p "  > " m
     case $m in
       1) echo "  σz·σx = iσy = i[0 -i; i 0] = [0 1; -1 0]";;
       2) echo "  σx·σy = iσz = i[1 0; 0 -1] = [i 0; 0 -i]";;
       3) echo "  σy·σz = iσx = i[0 1; 1 0] = [0 i; i 0]";;
       4) echo "  σz·σx·σy = iI = [i 0; 0 i]";;
       *) echo "  ❌";;
     esac; read -p "  ↩ ";;
  5) cat <<'FULL'
  📖 Full Theory:
  ────────────────
  The universe needs exactly 3 primitives:
  Structure (what persists), Change (what moves),
  Scale (what grows/shrinks).

  These map to Pauli matrices — the generators
  of SU(2), the simplest non-trivial Lie group.

  Their triple product yields Strength — not as
  a 4th primitive but as emergent invariant.

  1-2-3 generates 4. The universe bootstraps
  itself from 3 directions into magnitude.

  This is the 1-2-3-4 model.
FULL
     read -p "  ↩ ";;
  6) cat <<'ZCONN'
  🔗 Pauli ↔ Z-Framework:
  ──────────────────────────
  Z := yx - w

  y = output (Change, σx)
  x = input  (Structure, σz)
  w = weight (Scale, σy)

  Z = yx - w = Ĉ·Û - L̂

  When Z = ∅: the three primitives balance.
  When Z ≠ ∅: the system must ADAPT.

  Strength (Ŝ = iI) is what remains invariant
  through all adaptation.
ZCONN
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./pauli.sh
