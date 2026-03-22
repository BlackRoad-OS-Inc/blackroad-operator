#!/bin/bash

W=${1:-8}
H=${2:-4}
D=${3:-3}

printf "%*s+%s+\n" $D "" "$(printf '%*s' $W | tr ' ' '-')"
for ((i=0;i<H;i++)); do
  printf "%*s|%*s|\n" $D "" $W ""
done
printf "%*s+%s+\n" $D "" "$(printf '%*s' $W | tr ' ' '-')"
