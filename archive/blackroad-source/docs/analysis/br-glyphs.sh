#!/bin/bash

# ---- BlackRoad glyph printer ----
c() { printf "\033[38;5;%sm%s\033[0m\n" "$1" "$2"; }

BR_HOME() {
  c 208 "███"
  c 208 "█░█"
  c 208 "███"
}

BR_AGENT() {
  c 198 "░█░"
  c 198 "███"
  c 198 "░█░"
}

BR_LAB() {
  c 163 "███"
  c 163 "█░░"
  c 163 "███"
}

BR_DOOR() {
  c 33 "██░"
  c 33 "██░"
  c 33 "██░"
}

BR_NET() {
  c 255 "░█░"
  c 255 "█░█"
  c 255 "░█░"
}
