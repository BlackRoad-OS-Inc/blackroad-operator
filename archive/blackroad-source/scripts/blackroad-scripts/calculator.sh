#!/bin/bash
clear
cat <<'MENU'

  🧮🧮🧮 CALCULATOR 🧮🧮🧮

  🔢 1  Basic Math
  📐 2  Trig Functions
  🌀 3  Euler's Formula
  📊 4  Logarithms
  ⚛️  5  Physics Constants
  🔣 6  Base Converter
  📏 7  Unit Converter
  🎲 8  Random Number
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) read -p "  🔢 Expression: " expr; echo "  = $(echo "$expr" | bc -l 2>/dev/null)" || echo "  ⚠️  bc not found"; read -p "  ↩ ";;
  2) read -p "  📐 Angle (degrees): " deg; python3 -c "import math; r=math.radians($deg); print(f'  sin={math.sin(r):.6f}  cos={math.cos(r):.6f}  tan={math.tan(r):.6f}')" 2>/dev/null; read -p "  ↩ ";;
  3) read -p "  🌀 θ (degrees): " deg; python3 -c "import cmath,math; t=math.radians($deg); z=cmath.exp(1j*t); print(f'  e^(i·{$deg}°) = {z.real:.6f} + {z.imag:.6f}i'); print(f'  cos({$deg}°) + i·sin({$deg}°) = {math.cos(t):.6f} + {math.sin(t):.6f}i')" 2>/dev/null; read -p "  ↩ ";;
  4) read -p "  📊 Number: " n; python3 -c "import math; print(f'  ln({$n}) = {math.log($n):.6f}'); print(f'  log10({$n}) = {math.log10($n):.6f}'); print(f'  log2({$n}) = {math.log2($n):.6f}')" 2>/dev/null; read -p "  ↩ ";;
  5) cat <<'CONST'
  ⚛️  Physics Constants:
  ───────────────────────
  c   = 299,792,458 m/s
  ℏ   = 1.054571817 × 10⁻³⁴ J·s
  α   = 1/137.035999084 (fine structure)
  kB  = 1.380649 × 10⁻²³ J/K
  e   = 1.602176634 × 10⁻¹⁹ C
  G   = 6.67430 × 10⁻¹¹ N·m²/kg²
  π   = 3.14159265358979...
  e   = 2.71828182845904...
  φ   = 1.61803398874989... (golden ratio)
CONST
     read -p "  ↩ ";;
  6) read -p "  🔣 Number: " n; read -p "  From base (10): " fb; fb=${fb:-10}
     python3 -c "
n=int('$n',$fb)
print(f'  Decimal: {n}')
print(f'  Binary:  {bin(n)}')
print(f'  Octal:   {oct(n)}')
print(f'  Hex:     {hex(n)}')
" 2>/dev/null; read -p "  ↩ ";;
  7) echo "  📏 Quick conversions:"; read -p "  Value: " v; read -p "  From→To (e.g. km→mi, C→F, kg→lb): " conv
     python3 -c "
v=$v
c='$conv'
if c=='km→mi': print(f'  {v} km = {v*0.621371:.4f} mi')
elif c=='mi→km': print(f'  {v} mi = {v*1.60934:.4f} km')
elif c=='C→F': print(f'  {v}°C = {v*9/5+32:.2f}°F')
elif c=='F→C': print(f'  {v}°F = {(v-32)*5/9:.2f}°C')
elif c=='kg→lb': print(f'  {v} kg = {v*2.20462:.4f} lb')
elif c=='lb→kg': print(f'  {v} lb = {v*0.453592:.4f} kg')
else: print('  ⚠️  Unknown conversion')
" 2>/dev/null; read -p "  ↩ ";;
  8) read -p "  🎲 Max: " max; echo "  → $((RANDOM % max + 1))"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./calculator.sh
