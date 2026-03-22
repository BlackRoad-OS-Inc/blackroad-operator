#!/bin/bash
clear
cat <<'MENU'

  🔵🔵🔵 GOOGLE / GEMATRIA 🔵🔵🔵

  ── GEMINI API ─────────────
  📊 1  Test API Connection
  💬 2  Quick Prompt (Gemini Pro)
  📋 3  List Models
  ── GOOGLE CLOUD ───────────
  ☁️  4  gcloud Auth Status
  📦 5  GCS Buckets
  🔧 6  Active Project
  ── FIREBASE ───────────────
  🔥 7  Firebase Projects
  ── GOOGLE DRIVE ───────────
  📁 8  Recent Drive Files
  ── CONFIG ─────────────────
  🔑 9  API Key Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📊 Testing Gemini API..."; curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY" 2>/dev/null | jq '.models | length' 2>/dev/null && echo " models" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  2) read -p "  💬 Prompt: " prompt; curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GOOGLE_API_KEY" -H "Content-Type: application/json" -d "{\"contents\":[{\"parts\":[{\"text\":\"$prompt\"}]}]}" 2>/dev/null | jq -r '.candidates[0].content.parts[0].text' 2>/dev/null; read -p "  ↩ ";;
  3) curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY" 2>/dev/null | jq -r '.models[].name' 2>/dev/null; read -p "  ↩ ";;
  4) gcloud auth list 2>/dev/null || echo "  ⚠️  gcloud not installed"; read -p "  ↩ ";;
  5) gsutil ls 2>/dev/null || echo "  ⚠️  gsutil not configured"; read -p "  ↩ ";;
  6) gcloud config get-value project 2>/dev/null || echo "  ⚠️  No project set"; read -p "  ↩ ";;
  7) firebase projects:list 2>/dev/null || echo "  ⚠️  firebase CLI not installed"; read -p "  ↩ ";;
  8) echo "  📁 Use Google Drive API or web"; read -p "  ↩ ";;
  9) echo "  🔑 GOOGLE_API_KEY: ${GOOGLE_API_KEY:+✅ SET (${GOOGLE_API_KEY:0:8}...)}${GOOGLE_API_KEY:-❌ UNSET}"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./google.sh
