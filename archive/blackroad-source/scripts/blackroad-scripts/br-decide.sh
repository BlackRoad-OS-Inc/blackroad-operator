#!/usr/bin/env bash
QUESTION="$1"
DECISION="$2"

./br-mem-write.sh company/acme blackroad-arbiter decision "$DECISION on: $QUESTION"
