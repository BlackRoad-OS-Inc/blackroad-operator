#!/bin/bash
clear
cat <<'MENU'

  ⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛
  🟥                             🟥
  ⬛   🖤 B L A C K R O A D 🖤   ⬛
  🟥         O S  v0.8           🟥
  ⬛        64 modules            ⬛
  🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥⬛🟥

  ── CORE ───────────────────
  🧠 1  Lucidia   🤖 2  Agents
  🌐 3  Network   💾 4  Memory
  🔧 5  Hardware  📡 6  Comms
  🎨 7  Metaverse 🔐 8  Security
  📊 9  Sysmon
  ── INFRA ──────────────────
  🚀 d  Deploy    🔌 s  SSH
  🌍 w  Domains   🐙 g  GitHub
  🔁 Q  GH Actions ⚙️  U  GH Workflows
  🔀 V  GH PRs     📋 Z  GH Issues
  📚 O  Repo Index 🔍 [  Repo Search
  ☁️  f  Cloudflare ⛓️  b  Chain
  🐳 k  Docker    🦙 o  Ollama
  ☸️  x  K3s       🔗 t  Tailscale
  🌐 D  DNS
  ── FLEET ──────────────────
  🍓 F  Pi Fleet  🧿 H  Hailo
  💽 N  NVMe      🔌 m  MCUs
  📡 n  Sensors   📺 v  Displays
  🔋 e  Power     🎮 P  PSP
  📷 A  Camera    🔌 I  I2C/GPIO
  📻 L  LoRa      ⚡ X  ESP Flash
  📳 J  Haptic
  ── DEV ────────────────────
  🔀 h  Git       🐍 Y  Python
  🟩 K  Node.js   🌶️  S  Web Srv
  ⚙️  W  Processes ⏰ j  Cron
  🔐 E  Env
  ── SERVICES ───────────────
  🧠 @  Anthropic  🤖 $  OpenAI
  🌌 %  xAI/Grok   🔵 ^  Google
  💳 &  Stripe     🤗 !  HuggingFace
  🚂 (  Railway    🌊 )  DigitalOcean
  ⚡ +  Zapier     📟 =  Termius/iSH
  ── THEORY ─────────────────
  ⚡ z  Z-Frame   🔬 p  Pauli
  🧮 C  Calculator 🔣 R  Ciphers
  ── LIFE ───────────────────
  🎭 i  Identities 🐱 c  Cats
  📝 u  Notes      💜 y  Maggie
  🥚 G  Easter     🎨 T  Theme
  📶 q  WiFi       🎵 M  Audio
  🖼️  B  ASCII Art  💿 r  Backup

  🚪 0  Exit

MENU
read -p "  ⌨️  > " c
case $c in
  1) ./lucidia.sh;; 2) ./agents.sh;; 3) ./network.sh;;
  4) ./memory.sh;; 5) ./hardware.sh;; 6) ./comms.sh;;
  7) ./metaverse.sh;; 8) ./security.sh;; 9) ./sysmon.sh;;
  d) ./deploy.sh;; s) ./ssh.sh;; w) ./domains.sh;;
  g) ./github.sh;; Q) ./gh-actions.sh;; U) ./gh-workflows.sh;;
  V) ./gh-prs.sh;; Z) ./gh-issues.sh;;
  O) ./repo-index.sh;; '[') ./repo-search.sh;;
  b) ./blockchain.sh;; f) ./cloudflare.sh;;
  k) ./docker.sh;; o) ./ollama.sh;; x) ./k3s.sh;; t) ./tailscale.sh;;
  D) ./dns.sh;;
  F) ./pifleet.sh;; H) ./hailo.sh;; N) ./nvme.sh;;
  m) ./mcus.sh;; n) ./sensors.sh;; v) ./displays.sh;;
  e) ./power.sh;; P) ./psp.sh;; A) ./camera.sh;;
  I) ./i2c.sh;; L) ./lora.sh;; X) ./espflash.sh;; J) ./haptic.sh;;
  h) ./git.sh;; Y) ./pip.sh;; K) ./node.sh;; S) ./flask.sh;;
  W) ./process.sh;; j) ./cron.sh;; E) ./env.sh;;
  @) ./anthropic.sh;; '$') ./openai.sh;; '%') ./xai.sh;; '^') ./google.sh;;
  '&') ./stripe.sh;; '!') ./huggingface.sh;; '(') ./railway.sh;; ')') ./digitalocean.sh;;
  +) ./zapier.sh;; =) ./termius.sh;;
  z) ./zframework.sh;; p) ./pauli.sh;; C) ./calculator.sh;; R) ./cipher.sh;;
  i) ./identities.sh;; c) ./cats.sh;; u) ./notes.sh;; y) ./maggie.sh;;
  G) ./easter.sh;; T) ./theme.sh;; q) ./wifi.sh;; M) ./spotify.sh;;
  B) ./ascii.sh;; r) ./backup.sh;;
  0) clear; echo "  👋 Bye."; exit 0;;
  *) echo "  ❌"; sleep 1; exec ./menu.sh;;
esac
