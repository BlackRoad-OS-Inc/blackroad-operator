#!/bin/bash
clear
cat <<'MENU'

  📝📝📝 NOTES 📝📝📝

  📖 1  View Notes
  ✏️  2  New Note
  🔍 3  Search Notes
  📋 4  List All
  🗑️  5  Delete Note
  📓 6  Notebook Hashes
  🔙 0  ← Main Menu

MENU
NOTES_DIR="$HOME/.blackroad/notes"
mkdir -p "$NOTES_DIR"
read -p "  ⌨️  > " c
case $c in
  1) read -p "  📖 Filename: " f; cat "$NOTES_DIR/$f" 2>/dev/null || echo "  ⚠️  Not found"; read -p "  ↩ ";;
  2) read -p "  ✏️  Title: " title; fn=$(echo "$title" | tr ' ' '_' | tr '[:upper:]' '[:lower:]').md; echo "# $title" > "$NOTES_DIR/$fn"; echo "Created: $(date -Is)" >> "$NOTES_DIR/$fn"; echo "" >> "$NOTES_DIR/$fn"; ${EDITOR:-nano} "$NOTES_DIR/$fn"; echo "  ✅ Saved $fn";;
  3) read -p "  🔍 Search: " q; grep -ril "$q" "$NOTES_DIR/" 2>/dev/null || echo "  (no matches)"; read -p "  ↩ ";;
  4) ls -lt "$NOTES_DIR/" 2>/dev/null || echo "  (empty)"; read -p "  ↩ ";;
  5) read -p "  🗑️  Filename: " f; rm "$NOTES_DIR/$f" 2>/dev/null && echo "  ✅ Deleted" || echo "  ⚠️  Not found"; read -p "  ↩ ";;
  6) cat <<'HASHES'
  📓 Notebook Hash Index:
  ─────────────────────────
  Halting problem, Turing diagonalization
  Hamiltonian → Schrödinger, α ≈ 1/137
  Möbius function ↔ Riemann zeta 1/ζ(s)
  Gaussian Fourier transforms
  Golden Braid (Hofstadter)
  Euler's circle: e^iθ = cosθ + i·sinθ
  Caesar ciphers, Magic squares (34→136→137)
  DNA codons as mathematical structures
HASHES
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./notes.sh
