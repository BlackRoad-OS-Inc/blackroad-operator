#!/bin/bash
clear
cat <<'MENU'

  🐱🐱🐱 FELIX & OLIVER 🐱🐱🐱

  🧡 1  Felix Profile
  🤍 2  Oliver Profile
  🎨 3  Felix ASCII Art
  🎨 4  Oliver ASCII Art
  📊 5  Cat Status Board
  🐾 6  Daily Cat Report
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'FELIX'
  🧡 FELIX — Ground Floor Operations
  ────────────────────────────────────
  Breed:    Persian
  Color:    Orange/Cream
  Domain:   Ground floor, all surfaces < 2ft
  Role:     Chief Comfort Officer
  Status:   Dramatic, fluffy, clearly #1 priority
  Skills:   Strategic napping, food negotiation
FELIX
     read -p "  ↩ ";;
  2) cat <<'OLIVER'
  🤍 OLIVER — Elevated Perch Command
  ────────────────────────────────────
  Breed:    Persian
  Color:    White/Cream
  Domain:   All elevated perches, claims high ground
  Role:     Chief Observation Officer
  Status:   Dramatic, fluffy, clearly #1 priority
  Skills:   Surveillance, judging from above
OLIVER
     read -p "  ↩ ";;
  3) cat <<'FART'

     🧡 FELIX 🧡
      /\_/\
     ( o.o )  ~ *judges from floor*
      > ^ 
     /|   |\
    (_|   |_)
      |   |
      "   "

FART
     read -p "  ↩ ";;
  4) cat <<'OART'

     🤍 OLIVER 🤍
      /\_/\
     ( ◕.◕ )  ~ *surveys domain from above*
      > ^ 
     /|   |\
    (_|   |_)
      |   |
      "   "

OART
     read -p "  ↩ ";;
  5) cat <<'STATUS'

  📊 CAT STATUS BOARD
  ════════════════════════════
  Felix   🧡  [████████░░] Napping 80%
  Oliver  🤍  [██████████] Judging 100%
  ────────────────────────────
  Food:   [██░░░░░░░░] Refill needed
  Drama:  [██████████] Maximum
  Fluff:  [██████████] Maximum
  Priority: ⭐⭐⭐⭐⭐ CLEARLY #1

STATUS
     read -p "  ↩ ";;
  6) echo "  🐾 Daily Cat Report — $(date +%Y-%m-%d)"
     echo "  ──────────────────────────"
     echo "  Felix:  Operational. Demanded treats ×3."
     echo "  Oliver: Perched. Judged humans ×∞."
     echo "  Drama level: ELEVATED"
     echo "  Floof factor: MAXIMUM"
     echo "  Priority status: UNCHANGED (#1)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./cats.sh
