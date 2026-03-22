#!/usr/bin/env bash
AGENT=$1
grep -l "\"to\": \"$AGENT\"" bus/outbox/*.json 2>/dev/null
