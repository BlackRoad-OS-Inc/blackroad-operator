#!/bin/bash
clear
cat <<'MENU'

  🥚🥚🥚 EASTER CALCULATOR 🥚🥚🥚

  Born March 27, 2000
  Easter = Birthday: 2005 (age 5), 2016 (age 16)

  📅 1  Next Easter Date
  🎂 2  Easter-Birthday Alignment
  📊 3  All Alignments (2000-2100)
  🧮 4  Computus Algorithm
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) python3 -c "
from datetime import date
def easter(y):
    a=y%19;b,c=divmod(y,100);d,e=divmod(b,4);f=(b+8)//25;g=(b-f+1)//3
    h=(19*a+b-d-g+15)%30;i,k=divmod(c,4);l=(32+2*e+2*i-h-k)%7
    m=(a+11*h+22*l)//451;month=(h+l-7*m+114)//31;day=((h+l-7*m+114)%31)+1
    return date(y,month,day)
import datetime;y=datetime.date.today().year
for yr in [y,y+1,y+2]:
    e=easter(yr); print(f'  {yr}: {e.strftime(\"%B %d\")}')
" 2>/dev/null; read -p "  ↩ ";;
  2) python3 -c "
from datetime import date
def easter(y):
    a=y%19;b,c=divmod(y,100);d,e=divmod(b,4);f=(b+8)//25;g=(b-f+1)//3
    h=(19*a+b-d-g+15)%30;i,k=divmod(c,4);l=(32+2*e+2*i-h-k)%7
    m=(a+11*h+22*l)//451;month=(h+l-7*m+114)//31;day=((h+l-7*m+114)%31)+1
    return date(y,month,day)
bday=date(2000,3,27)
for y in range(2000,2101):
    e=easter(y)
    if e.month==3 and e.day==27:
        age=y-2000
        print(f'  🥚🎂 {y} — Easter = March 27 — Age {age}')
" 2>/dev/null; read -p "  ↩ ";;
  3) python3 -c "
from datetime import date
def easter(y):
    a=y%19;b,c=divmod(y,100);d,e=divmod(b,4);f=(b+8)//25;g=(b-f+1)//3
    h=(19*a+b-d-g+15)%30;i,k=divmod(c,4);l=(32+2*e+2*i-h-k)%7
    m=(a+11*h+22*l)//451;month=(h+l-7*m+114)//31;day=((h+l-7*m+114)%31)+1
    return date(y,month,day)
print('  All March 27 Easters (2000-2100):')
count=0
for y in range(2000,2101):
    e=easter(y)
    if e.month==3 and e.day==27:
        count+=1; print(f'  {count}. {y} (age {y-2000})')
print(f'  Total: {count} alignments in 100 years')
" 2>/dev/null; read -p "  ↩ ";;
  4) cat <<'COMP'
  🧮 Computus (Anonymous Gregorian):
  ────────────────────────────────────
  a = year mod 19
  b = year / 100,  c = year mod 100
  d = b / 4,       e = b mod 4
  f = (b + 8) / 25
  g = (b - f + 1) / 3
  h = (19a + b - d - g + 15) mod 30
  i = c / 4,       k = c mod 4
  l = (32 + 2e + 2i - h - k) mod 7
  m = (a + 11h + 22l) / 451
  month = (h + l - 7m + 114) / 31
  day   = (h + l - 7m + 114) mod 31 + 1
COMP
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./easter.sh
