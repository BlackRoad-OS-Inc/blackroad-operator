#!/bin/bash
clear
cat <<'MENU'

  🔣🔣🔣 CIPHERS 🔣🔣🔣

  🔤 1  Caesar Cipher
  🔤 2  ROT13
  🔢 3  ASCII ↔ Text
  🔣 4  Base64 Encode/Decode
  🔮 5  Magic Square (4×4)
  🔗 6  34 → 136 → 137 → α
  🔐 7  SHA256 Hash
  📊 8  PS-SHA∞ Demo
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) read -p "  🔤 Text: " txt; read -p "  Shift (3): " s; s=${s:-3}
     echo "$txt" | tr "$(echo {A..Z} | tr -d ' ')$(echo {a..z} | tr -d ' ')" "$(echo {A..Z} | tr -d ' ' | cut -c$((s+1))-; echo {A..Z} | tr -d ' ' | cut -c1-$s)$(echo {a..z} | tr -d ' ' | cut -c$((s+1))-; echo {a..z} | tr -d ' ' | cut -c1-$s)" 2>/dev/null || python3 -c "
t='$txt';s=$s
print(''.join(chr((ord(c)-65+s)%26+65) if c.isupper() else chr((ord(c)-97+s)%26+97) if c.islower() else c for c in t))
" 2>/dev/null; read -p "  ↩ ";;
  2) read -p "  🔤 Text: " txt; echo "$txt" | tr 'A-Za-z' 'N-ZA-Mn-za-m'; read -p "  ↩ ";;
  3) read -p "  🔢 1) text→ascii  2) ascii→text: " mode
     if [ "$mode" = "1" ]; then read -p "  Text: " txt; python3 -c "print(' '.join(str(ord(c)) for c in '$txt'))"; else read -p "  ASCII (space-separated): " nums; python3 -c "print(''.join(chr(int(n)) for n in '$nums'.split()))"; fi; read -p "  ↩ ";;
  4) echo "  1) encode  2) decode"; read -p "  > " mode
     if [ "$mode" = "1" ]; then read -p "  Text: " txt; echo "$txt" | base64; else read -p "  Base64: " b; echo "$b" | base64 -d; echo; fi; read -p "  ↩ ";;
  5) cat <<'MAGIC'

  🔮 4×4 Magic Square (sum = 34):
  ┌────┬────┬────┬────┐
  │ 16 │  3 │  2 │ 13 │
  ├────┼────┼────┼────┤
  │  5 │ 10 │ 11 │  8 │
  ├────┼────┼────┼────┤
  │  9 │  6 │  7 │ 12 │
  ├────┼────┼────┼────┤
  │  4 │ 15 │ 14 │  1 │
  └────┴────┴────┴────┘
  Every row, column, diagonal = 34

MAGIC
     read -p "  ↩ ";;
  6) cat <<'ALPHA'

  🔗 The Chain: 34 → 136 → 137 → α
  ─────────────────────────────────────
  Magic square rows sum to 34
  All 16 cells sum to 136
  136 + 1 = 137
  α = 1/137.035999084...

  The fine structure constant α governs
  the strength of electromagnetic force.

  α = e²/(4πε₀ℏc) ≈ 1/137

  From a 4×4 magic square to the coupling
  constant that defines all of chemistry,
  light, and atomic structure.

ALPHA
     read -p "  ↩ ";;
  7) read -p "  🔐 Text: " txt; echo -n "$txt" | sha256sum; read -p "  ↩ ";;
  8) echo "  📊 PS-SHA∞ Memory Hash Demo"
     read -p "  Memory entry: " mem
     hash=$(echo -n "$mem$(date +%s)" | sha256sum | cut -c1-16)
     echo "  truth_state_hash: $hash"
     echo "  append_only: true"
     echo "  timestamp: $(date -Is)"
     echo "  status: committed ✓"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./cipher.sh
