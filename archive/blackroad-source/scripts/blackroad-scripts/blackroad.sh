#!/bin/zsh
r=$'\e[0m'

c1=$'\e[38;5;208m'
c2=$'\e[38;5;202m'
c3=$'\e[38;5;198m'
c4=$'\e[38;5;134m'
c5=$'\e[38;5;201m'
c6=$'\e[38;5;33m'

g5=$'\e[38;5;245m'
gw=$'\e[38;5;15m'
b=$'\e[1m'

MODEL="${1:-phi3}"
MSGFILE=$(mktemp)
echo '[]' > "$MSGFILE"

cleanup() { rm -f "$MSGFILE"; }
trap cleanup EXIT

if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  print "${c3}error${r} ollama is not running"
  print "${g5}start it with: ollama serve${r}"
  exit 1
fi

clear
print ""
print "  ${b}${c1}Black${c2}Road${c3} OS${r}  ${g5}v0.1.0${r}"
print "  ${g5}model${r}  ${gw}${MODEL}${r}"
print "  ${g5}type ${c5}/help${r} ${g5}for commands  ${c3}/quit${r} ${g5}to exit${r}"
print ""

while true; do
  print -n "  ${b}${c1}you${r} ${c2}>${r} "
  read -r input

  [[ -z "$input" ]] && continue

  case "$input" in
    /quit|/exit|/q)
      print "\n  ${g5}session ended${r}\n"
      exit 0
      ;;
    /clear)
      echo '[]' > "$MSGFILE"
      clear
      print "\n  ${b}${c1}Black${c2}Road${c3} OS${r}  ${g5}v0.1.0${r}"
      print "  ${g5}model${r}  ${gw}${MODEL}${r}\n"
      print "  ${g5}history cleared${r}\n"
      continue
      ;;
    /model)
      print ""
      print "  ${b}${c4}available models${r}"
      curl -s http://localhost:11434/api/tags | python3 -c "
import sys,json
for m in json.load(sys.stdin).get('models',[]):
    print(f'  {m[\"name\"]}')" 2>/dev/null
      print ""
      continue
      ;;
    /model\ *)
      MODEL="${input#/model }"
      echo '[]' > "$MSGFILE"
      print "\n  ${g5}switched to${r} ${gw}${MODEL}${r}\n"
      continue
      ;;
    /help)
      print "\n  ${b}${c6}commands${r}"
      print "  ${c5}/model${r}        ${g5}list available models${r}"
      print "  ${c5}/model NAME${r}   ${g5}switch model${r}"
      print "  ${c5}/clear${r}        ${g5}clear chat history${r}"
      print "  ${c5}/quit${r}         ${g5}exit${r}\n"
      continue
      ;;
  esac

  # Add user message to history file
  python3 -c "
import json
with open('${MSGFILE}','r') as f: msgs=json.load(f)
msgs.append({'role':'user','content':'''${input}'''})
with open('${MSGFILE}','w') as f: json.dump(msgs,f)"

  # Stream response and capture it
  print ""
  print -n "  ${b}${c6}${MODEL}${r} ${c4}>${r} "

  tmpout=$(mktemp)
  curl -s --no-buffer http://localhost:11434/api/chat \
    -d "{\"model\":\"${MODEL}\",\"messages\":$(cat "$MSGFILE"),\"stream\":true}" 2>/dev/null | \
  while IFS= read -r line; do
    token=$(echo "$line" | python3 -c "
import sys,json
try:
    data=json.load(sys.stdin)
    print(data.get('message',{}).get('content',''),end='')
except: pass" 2>/dev/null)
    if [[ -n "$token" ]]; then
      print -n "${gw}${token}${r}"
      printf '%s' "$token" >> "$tmpout"
    fi
  done

  # Add assistant response to history
  python3 -c "
import json
with open('${MSGFILE}','r') as f: msgs=json.load(f)
with open('${tmpout}','r') as f: resp=f.read()
msgs.append({'role':'assistant','content':resp})
with open('${MSGFILE}','w') as f: json.dump(msgs,f)" 2>/dev/null
  rm -f "$tmpout"

  print "\n"
done
