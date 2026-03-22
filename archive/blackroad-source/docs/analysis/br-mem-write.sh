#!/usr/bin/env bash
SCOPE=$1          # e.g. company/acme
AUTHOR=$2
KIND=$3
CONTENT=$4

ID=$(uuidgen)
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

BASE=${SCOPE%%/*}        # company
NAME=${SCOPE#*/}        # acme
DIR="memory/$BASE"

mkdir -p "$DIR"

cat >> "$DIR/$NAME.jsonl" <<JSON
{"id":"$ID","timestamp":"$TS","author":"$AUTHOR","kind":"$KIND","content":"$CONTENT"}
JSON
