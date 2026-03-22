#!/bin/zsh
text="${1:-BlackRoad OS}"
len=${#text}
total=$((len + 4))
r=$'\e[0m'

# BlackRoad gradient - the ones that worked
colors=(
  $'\e[38;5;208m'   # orange
  $'\e[38;5;202m'   # dark orange
  $'\e[38;5;198m'   # deep pink
  $'\e[38;5;134m'   # medium orchid
  $'\e[38;5;201m'   # magenta
  $'\e[38;5;33m'    # dodger blue
)
nc=${#colors[@]}

pick() {
  local i=$1 max=$2
  local idx=$(( (i * nc / max) + 1 ))
  [[ $idx -gt $nc ]] && idx=$nc
  print -n "${colors[$idx]}"
}

# Top border
out=""
out+="$(pick 0 $total)┌"
for ((i = 0; i < total; i++)); do
  out+="$(pick $i $total)─"
done
out+="$(pick $total $total)┐"
print "${out}${r}"

# Middle
out=""
out+="${colors[1]}│${r}  ${text}  ${colors[$nc]}│"
print "${out}${r}"

# Bottom border
out=""
out+="$(pick $total $total)└"
for ((i = total; i > 0; i--)); do
  out+="$(pick $i $total)─"
done
out+="$(pick 0 $total)┘"
print "${out}${r}"
