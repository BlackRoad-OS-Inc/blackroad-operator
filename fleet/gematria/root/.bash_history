cat /etc/os-release && uptime
exit
mkdir -p ~/.ssh && chmod 700 ~/.ssh && curl -s https://github.com/blackboxprogramming.keys >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
echo 'Keys:' && cat ~/.ssh/authorized_keys | wc -l && uptime
exit
sleep 1; tmux -V; which tmux; exit
echo LANG=$LANG; echo LC_ALL=$LC_ALL; echo LC_CTYPE=$LC_CTYPE; exit
sleep 1; tmux -V; which tmux; exit
# Install ollama (curl method is usually better than snap)
curl -fsSL https://ollama.com/install.sh | sh
# Start the service
systemctl enable ollama
systemctl start ollama
# Pull a small model to test
ollama pull phi3:mini
# Or if you want something beefier
ollama pull llama3.2:3b
# Test it
ollama run phi3:mini "Say 'The road is open' in the style of a mysterious guide"
# Check specs
free -h
nproc
df -h
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "You are Lucidia. Greet Cecilia.",
  "stream": false
}' | jq .response
apt install -y jq
# Then retry
curl -s http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "You are Lucidia. Greet Cecilia.",
  "stream": false
}' | jq -r .response
curl -s http://localhost:11434/api/generate -d '{
  "model": "phi3:mini", 
  "prompt": "You are Lucidia. Greet Cecilia.",
  "stream": false
}' | grep -o '"response":"[^"]*"' | cut -d'"' -f4
# Verify ollama service is enabled
systemctl status ollama
# Make ollama accessible over tailnet (if installed)
# Edit to listen on all interfaces
mkdir -p /etc/systemd/system/ollama.service.d
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF

systemctl daemon-reload
systemctl restart ollama
# Check it's listening
ss -tlnp | grep 11434
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
# Authenticate (will give you a URL to visit)
tailscale up
# Once connected, check your tailnet IP
tailscale ip -4
# Now Alice/Octavia can reach ollama at:
# http://<codex-infinity-tailnet-ip>:11434
# codex-infinity as remote LLM endpoint
llm_endpoints:
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
# Start and authenticate
tailscale up
# It'll print a URL like:
# https://login.tailscale.com/a/abc123xyz
# 
# Open that in your browser to authorize the node!
# Get your tailnet IP
tailscale ip -4
# See all your nodes
tailscale status
# Test from codex-infinity that ollama is reachable
curl http://$(tailscale ip -4):11434/api/tags
# Install Tailscale on codex-infinity
curl -fsSL https://tailscale.com/install.sh | sh
# Connect to your tailnet
tailscale up
# It'll give you an auth URL - open it and approve!
# Check the tailnet
tailscale status
# Get codex-infinity's tailnet IP
tailscale ip -4
# Rename to something nice
tailscale set --hostname=codex-infinity
http://codex-infinity.tailaaeb18.ts.net:11434
echo -e "\x1b[38;2;255;135;0m━━━\x1b[38;2;255;95;0m━━━\x1b[38;2;255;0;135m━━━\x1b[38;2;215;0;175m━━━\x1b[38;2;0;135;255m━━━\x1b[0m BLACKROAD"
paste
$(tailscale ip -4
033
033
033
033
~# # Get:1 https://repos
$1
$(tailscale ip -4
$(tailscale
$(tailscale
$(tailscale ip
100
$(tailscale
$(tailscale
1.
esc
$(tailscale)
tailscale ip -4
esc
...
$(tailscale
033https://termius.com/download
C=(208 202 198 163 33 255)
clear
echo -e "\e[38;5;208m●━━━━┳━━━━●━━━━┳━━━━●\e[0m"
echo -e "\e[38;5;208m┃    ┃    ┃    ┃    ┃\e[0m"
echo -e "\e[38;5;202m┣━━●━┻━●━━┫━━●━┻━●━━┫\e[0m"
echo -e "\e[38;5;202m┃  ┃   ┃  ┃  ┃   ┃  ┃\e[0m"
echo -e "\e[38;5;198m●━━┻━━━┻━━●━━┻━━━┻━━●\e[0m"
echo -e "\e[38;5;198m┃         ┃         ┃\e[0m"
echo -e "\e[38;5;163m┣━━●━┳━●━━┫━━●━┳━●━━┫\e[0m"
echo -e "\e[38;5;163m┃  ┃ ┃ ┃  ┃  ┃ ┃ ┃  ┃\e[0m"
echo -e "\e[38;5;33m●━━┻━┻━┻━━●━━┻━┻━┻━━●\e[0m"
echo -e "\e[38;5;255m┃    ┃    ┃    ┃    ┃\e[0m"
echo -e "\e[38;5;255m●━━━━┻━━━━●━━━━┻━━━━●\e[0m"
C=(208 202 198 163 33 255)
clear
echo -e "\e[38;5;208m┌──●──┬──●──┬──●──┐\e[0m"
echo -e "\e[38;5;208m│  │  │  │  │  │  │\e[0m"
echo -e "\e[38;5;202m├──┼──●──┼──●──┼──┤\e[0m"
echo -e "\e[38;5;202m│  │     │     │  │\e[0m"
echo -e "\e[38;5;198m●──┴──┬──●──┬──┴──●\e[0m"
echo -e "\e[38;5;198m      │     │      \e[0m"
echo -e "\e[38;5;163m┌──●──┴──┬──┴──●──┐\e[0m"
echo -e "\e[38;5;163m│        │        │\e[0m"
echo -e "\e[38;5;33m└──●──┬──●──┬──●──┘\e[0m"
echo -e "\e[38;5;255m      ●     ●      \e[0m"
0
ollama list
ollama run llama3.2:3b
cd /root
ollama list
ollama run llama3.2:3b
-
10
0825
shellfish-10 <bash
◆◆◆◆◆
echo -e "\x1b[38;2;255;135;0m━━━\x1b[38;2;255;95;0m━━━\x1b[38;2;255;0;135m━━━\x1b[38;2;215;0;175m━━━\x1b[38;2;0;135;255m━━━\x1b[0m BLACKROAD"
cat > /usr/local/bin/br-status << 'EOF'
#!/bin/bash
O='\x1b[38;2;255;135;0m'
R='\x1b[38;2;255;95;0m'
P='\x1b[38;2;255;0;135m'
M='\x1b[38;2;215;0;175m'
B='\x1b[38;2;0;135;255m'
W='\x1b[38;2;255;255;255m'
G='\x1b[38;2;0;255;0m'
X='\x1b[38;2;255;0;0m'
Z='\x1b[0m'

echo -e "${O}━━━${R}━━━${P}━━━${M}━━━${B}━━━${Z}"
echo -e "${W}  ⟡ BLACKROAD CLUSTER ⟡${Z}"
echo -e "${B}━━━${M}━━━${P}━━━${R}━━━${O}━━━${Z}"
echo
for n in alice octavia lucidia; do
  ping -c1 -W1 ${n}.blackroad.lan &>/dev/null && echo -e "  ${G}●${Z} ${W}${n}${Z}" || echo -e "  ${X}●${Z} ${W}${n}${Z}"
done
echo -e "\n${M}━━━━━━━━━━━━━━━${Z}"
EOF

chmod +x /usr/local/bin/br-status
br-status
tailscale up --accept-routes --hostname=codex-infinity
tailscale status
br-status
cat > /usr/local/bin/br-status << 'EOF'
#!/bin/bash
O='\x1b[38;2;255;135;0m'
R='\x1b[38;2;255;95;0m'
P='\x1b[38;2;255;0;135m'
M='\x1b[38;2;215;0;175m'
B='\x1b[38;2;0;135;255m'
W='\x1b[38;2;255;255;255m'
G='\x1b[38;2;0;255;0m'
X='\x1b[38;2;255;0;0m'
Z='\x1b[0m'

echo -e "${O}━━━${R}━━━${P}━━━${M}━━━${B}━━━${Z}"
echo -e "${W}  ⟡ BLACKROAD CLUSTER ⟡${Z}"
echo -e "${B}━━━${M}━━━${P}━━━${R}━━━${O}━━━${Z}"
echo
for n in alice aria lucidia; do
  ping -c1 -W1 ${n} &>/dev/null && echo -e "  ${G}●${Z} ${W}${n}${Z}" || echo -e "  ${X}●${Z} ${W}${n}${Z}"
done
echo -e "\n${M}━━━━━━━━━━━━━━━${Z}"
EOF

br-status
cat > /usr/local/bin/br-status << 'EOF'
#!/bin/bash
O='\x1b[38;2;255;135;0m'
R='\x1b[38;2;255;95;0m'
P='\x1b[38;2;255;0;135m'
M='\x1b[38;2;215;0;175m'
B='\x1b[38;2;0;135;255m'
W='\x1b[38;2;255;255;255m'
G='\x1b[38;2;0;255;0m'
X='\x1b[38;2;255;0;0m'
Z='\x1b[0m'

echo -e "${O}━━━${R}━━━${P}━━━${M}━━━${B}━━━${Z}"
echo -e "${W}  ⟡ BLACKROAD CLUSTER ⟡${Z}"
echo -e "${B}━━━${M}━━━${P}━━━${R}━━━${O}━━━${Z}"
echo
echo -e "${M}  pis${Z}"
for n in alice anastasia aria lucidia octavia shellfish; do
  ping -c1 -W1 ${n} &>/dev/null && echo -e "  ${G}●${Z} ${W}${n}${Z}" || echo -e "  ${X}●${Z} ${W}${n}${Z}"
done
echo
echo -e "${M}  infra${Z}"
for n in pikvm codex-infinity; do
  ping -c1 -W1 ${n} &>/dev/null && echo -e "  ${G}●${Z} ${W}${n}${Z}" || echo -e "  ${X}●${Z} ${W}${n}${Z}"
done
echo
echo -e "${M}  workstations${Z}"
for n in alexas-macbook-pro-2; do
  ping -c1 -W1 ${n} &>/dev/null && echo -e "  ${G}●${Z} ${W}${n}${Z}" || echo -e "  ${X}●${Z} ${W}${n}${Z}"
done
echo -e "\n${M}━━━━━━━━━━━━━━━━━━━━━${Z}"
EOF

br-status
# Check who's actually on tailscale
tailscale status
ssh pi@<local-ip>
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --hostname=<name>
ssh pi@anastasia.local
# or ssh pi@192.168.x.x
# then on anastasia:
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --hostname=anastasia
# Quick scan - what subnet are you on?
ip a | grep 192
# Then sweep it (assuming 192.168.1.x)
for i in {1..254}; do ping -c1 -W1 192.168.1.$i &>/dev/null && echo "192.168.1.$i UP"; done
<:pin 
ollama
ollama list
o l l a m a ru n l l a m a 3 ..  : 3 b a 8 0 c 4 f 1 7  3 
ollama run llma3 :latest
ollama run
llama3
llama
snap install llama
llama
ollama run lucidia 
ollama pull llama
ls
ollama pull cecilia
llama
🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
for c in 208 202 198 163 33 255; do printf "\e[38;5;${c}m███ $c \e[0m"; done; echo
# Road/path symbols
echo -e "\e[38;5;208m◀\e[38;5;202m═\e[38;5;198m═\e[38;5;163m═\e[38;5;33m▶\e[0m"
echo -e "\e[38;5;208m╱\e[38;5;202m╲\e[38;5;198m╱\e[38;5;163m╲\e[38;5;33m╱\e[0m"
# Diamond/node markers
echo -e "\e[38;5;255m◆\e[0m \e[38;5;208m◇\e[0m \e[38;5;202m◈\e[0m \e[38;5;198m⬥\e[0m \e[38;5;163m⬦\e[0m \e[38;5;33m●\e[0m"
# Arrows/flow
echo -e "\e[38;5;208m➤\e[38;5;202m➤\e[38;5;198m➤\e[38;5;163m➤\e[38;5;33m➤\e[0m"
echo -e "\e[38;5;33m⟵\e[38;5;163m─\e[38;5;255m◉\e[38;5;202m─\e[38;5;208m⟶\e[0m"
# Blocks/bars
echo -e "\e[38;5;208m▓\e[38;5;202m▓\e[38;5;198m▒\e[38;5;163m▒\e[38;5;33m░\e[0m"
echo -e "\e[38;5;208m█\e[38;5;202m▇\e[38;5;198m▆\e[38;5;163m▅\e[38;5;33m▄\e[0m"
# Spinners/status
echo -e "\e[38;5;255m⣾\e[0m \e[38;5;208m⣽\e[0m \e[38;5;202m⣻\e[0m \e[38;5;198m⢿\e[0m \e[38;5;163m⡿\e[0m \e[38;5;33m⣟\e[0m"
# Box drawing
echo -e "\e[38;5;208m╔═══╗\e[0m"
echo -e "\e[38;5;202m║\e[38;5;255m BR \e[38;5;202m║\e[0m"
echo -e "\e[38;5;198m╚═══╝\e[0m"
# Agent state markers
echo -e "\e[38;5;33m◉ IDLE\e[0m  \e[38;5;208m◉ ACTIVE\e[0m  \e[38;5;198m◉ THINKING\e[0m  \e[38;5;163m◉ BLOCKED\e[0m  \e[38;5;255m◉ READY\e[0m"
# Progress bar
echo -e "\e[38;5;208m▰▰▰▰▰\e[38;5;202m▰▰▰\e[38;5;163m▱▱▱▱\e[0m 66%"
# Mini logo variants
echo -e "\e[38;5;208m⟨\e[38;5;255mBR\e[38;5;33m⟩\e[0m"
echo -e "\e[38;5;208m[\e[38;5;202m◆\e[38;5;198m◆\e[38;5;163m◆\e[38;5;33m]\e[0m"
echo -e "\e[38;5;255m※\e[38;5;208m═══\e[38;5;255m※\e[0m"
# Separators/dividers
echo -e "\e[38;5;208m─·─·─\e[38;5;198m─·─·─\e[38;5;33m─·─·─\e[0m"
echo -e "\e[38;5;163m⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯\e[0m"
echo -e "\e[38;5;202m≋≋≋≋≋≋≋≋≋≋≋≋≋\e[0m"
# Tree/hierarchy
echo -e "\e[38;5;208m┌─\e[38;5;255m Lucidia\e[0m"
echo -e "\e[38;5;202m├──\e[38;5;198m agent_01\e[0m"
echo -e "\e[38;5;163m├──\e[38;5;198m agent_02\e[0m"
echo -e "\e[38;5;33m└──\e[38;5;198m agent_03\e[0m"
# Pulse/heartbeat
echo -e "\e[38;5;33m_\e[38;5;163m_\e[38;5;198m╱\e[38;5;255m▲\e[38;5;202m╲\e[38;5;208m_\e[38;5;202m_\e[38;5;163m_\e[0m"
# Connection/network
echo -e "\e[38;5;255m◉\e[38;5;208m────\e[38;5;255m◉\e[38;5;198m────\e[38;5;255m◉\e[0m"
echo -e "\e[38;5;33m     │         │\e[0m"
echo -e "\e[38;5;163m     ◉─────────◉\e[0m"
# Trinary state (1/0/-1)
echo -e "\e[38;5;208m⊕ TRUE\e[0m  \e[38;5;163m⊖ FALSE\e[0m  \e[38;5;33m⊙ UNKNOWN\e[0m"
# ═══════════════════════════════════════════════════════════
# BLACKROAD UNIVERSAL SYMBOL LEXICON v0.1
# ═══════════════════════════════════════════════════════════
# ──────────────── COMPUTING ERAS ────────────────
echo -e "\e[38;5;208m◈ ERAS\e[0m"
echo -e "  \e[38;5;202m▪ 1940s MAINFRAME\e[0m   ⌧ ⎔ ⎕ ▣ ⌹"
echo -e "  \e[38;5;198m▪ 1970s TERMINAL\e[0m    ▯ ▮ ⎙ ⌨ ▭"
echo -e "  \e[38;5;163m▪ 1980s PERSONAL\e[0m    🖳 🖥 💾 🖴 ⌘"
echo -e "  \e[38;5;33m▪ 2000s NETWORK\e[0m     🌐 ☁ ⚡ 📡 🔗"
echo -e "  \e[38;5;255m▪ 2020s AGENTS\e[0m      ◉ ⬡ 🧠 ∞ ⟲"
# ──────────────── HARDWARE ────────────────
echo -e "\e[38;5;208m◈ HARDWARE\e[0m"
echo -e "  CPU: ⎔ ⬡ ▢    RAM: ▦ ▤ ▥    DISK: ◔ ◕ ● ○"
echo -e "  CHIP: ⏣ ⏢ ⎈   BOARD: ⌸ ⎄ ▦   PORT: ⊡ ⊟ ⊞"
echo -e "  PI: 🥧 \e[38;5;198mπ\e[0m       JETSON: \e[38;5;76m⬢\e[0m    HAILO: \e[38;5;33m◈\e[0m"
# ──────────────── DATA STATES ────────────────
echo -e "\e[38;5;208m◈ DATA\e[0m"
echo -e "  BIT:   \e[38;5;208m1\e[0m \e[38;5;33m0\e[0m \e[38;5;163m?\e[0m"
echo -e "  BYTE:  ▪▪▪▪▪▪▪▪"
echo -e "  FLOW:  ⟵ ⟶ ⟷ ↻ ↺ ⇄ ⇅"
echo -e "  STATE: ◯ ◐ ◑ ◒ ◓ ●"
# ──────────────── LOGIC/TRINARY ────────────────
echo -e "\e[38;5;208m◈ LOGIC (Lucidia Trinary)\e[0m"
echo -e "  \e[38;5;208m⊤ TRUE/1\e[0m   \e[38;5;33m⊥ FALSE/0\e[0m   \e[38;5;163m⊙ UNKNOWN/-1\e[0m"
echo -e "  \e[38;5;255m∧ AND\e[0m  \e[38;5;255m∨ OR\e[0m  \e[38;5;255m¬ NOT\e[0m  \e[38;5;255m⊕ XOR\e[0m  \e[38;5;255m≡ EQ\e[0m"
echo -e "  \e[38;5;198m∀ ALL\e[0m  \e[38;5;198m∃ EXISTS\e[0m  \e[38;5;198m∄ NONE\e[0m  \e[38;5;198m∴ THEREFORE\e[0m"
# ═══════════════════════════════════════════════════════════
# BLACKROAD UNIVERSAL SYMBOL LEXICON v0.1
# ═══════════════════════════════════════════════════════════
# ──────────────── COMPUTING ERAS ────────────────
echo -e "\e[38;5;208m◈ ERAS\e[0m"
echo -e "  \e[38;5;202m▪ 1940s MAINFRAME\e[0m   ⌧ ⎔ ⎕ ▣ ⌹"
echo -e "  \e[38;5;198m▪ 1970s TERMINAL\e[0m    ▯ ▮ ⎙ ⌨ ▭"
echo -e "  \e[38;5;163m▪ 1980s PERSONAL\e[0m    🖳 🖥 💾 🖴 ⌘"
echo -e "  \e[38;5;33m▪ 2000s NETWORK\e[0m     🌐 ☁ ⚡ 📡 🔗"
echo -e "  \e[38;5;255m▪ 2020s AGENTS\e[0m      ◉ ⬡ 🧠 ∞ ⟲"
# ──────────────── HARDWARE ────────────────
echo -e "\e[38;5;208m◈ HARDWARE\e[0m"
echo -e "  CPU: ⎔ ⬡ ▢    RAM: ▦ ▤ ▥    DISK: ◔ ◕ ● ○"
echo -e "  CHIP: ⏣ ⏢ ⎈   BOARD: ⌸ ⎄ ▦   PORT: ⊡ ⊟ ⊞"
echo -e "  PI: 🥧 \e[38;5;198mπ\e[0m       JETSON: \e[38;5;76m⬢\e[0m    HAILO: \e[38;5;33m◈\e[0m"
# ──────────────── DATA STATES ────────────────
echo -e "\e[38;5;208m◈ DATA\e[0m"
echo -e "  BIT:   \e[38;5;208m1\e[0m \e[38;5;33m0\e[0m \e[38;5;163m?\e[0m"
echo -e "  BYTE:  ▪▪▪▪▪▪▪▪"
echo -e "  FLOW:  ⟵ ⟶ ⟷ ↻ ↺ ⇄ ⇅"
echo -e "  STATE: ◯ ◐ ◑ ◒ ◓ ●"
# ──────────────── LOGIC/TRINARY ────────────────
echo -e "\e[38;5;208m◈ LOGIC (Lucidia Trinary)\e[0m"
echo -e "  \e[38;5;208m⊤ TRUE/1\e[0m   \e[38;5;33m⊥ FALSE/0\e[0m   \e[38;5;163m⊙ UNKNOWN/-1\e[0m"
echo -e "  \e[38;5;255m∧ AND\e[0m  \e[38;5;255m∨ OR\e[0m  \e[38;5;255m¬ NOT\e[0m  \e[38;5;255m⊕ XOR\e[0m  \e[38;5;255m≡ EQ\e[0m"
echo -e "  \e[38;5;198m∀ ALL\e[0m  \e[38;5;198m∃ EXISTS\e[0m  \e[38;5;198m∄ NONE\e[0m  \e[38;5;198m∴ THEREFORE\e[0m"
# ═══════════════════════════════════════════════════════════
# BLACKROAD ORIGINALS - NEVER USED BEFORE
# ═══════════════════════════════════════════════════════════
# ──────────────── TRINARY GLYPHS ────────────────
echo -e "\e[38;5;208m◈ TRINARY (ours)\e[0m"
echo -e "  \e[38;5;208m◐\e[0m yes  \e[38;5;33m◑\e[0m no  \e[38;5;163m◒\e[0m idk"
echo -e "  \e[38;5;208m⊕\e[0m 1    \e[38;5;33m⊖\e[0m 0   \e[38;5;163m⊘\e[0m -1"
echo -e "  \e[38;5;208m△\e[0m up   \e[38;5;33m▽\e[0m dn  \e[38;5;163m◇\e[0m hold"
# ──────────────── Z-FRAMEWORK ────────────────
echo -e "\e[38;5;202m◈ Z := yx - w\e[0m"
echo -e "  \e[38;5;255mZ\e[0m=\e[38;5;208my\e[0m·\e[38;5;202mx\e[0m-\e[38;5;198mw\e[0m"
echo -e "  Z=∅ → \e[38;5;33m≋\e[0m equilibrium"
echo -e "  Z≠∅ → \e[38;5;208m≁\e[0m adapt"
# ──────────────── AGENT PULSE ────────────────
echo -e "\e[38;5;198m◈ PULSE\e[0m"
echo -e "  alive: \e[38;5;208m∿\e[0m  dead: \e[38;5;33m∼\e[0m  limbo: \e[38;5;163m≀\e[0m"
echo -e "  spark: \e[38;5;255m⁂\e[0m  fade: \e[38;5;240m⁂\e[0m"
# ──────────────── MEMORY HASH ────────────────
echo -e "\e[38;5;163m◈ PS-SHA∞\e[0m"
echo -e "  commit: \e[38;5;208m⌗\e[0m  chain: \e[38;5;202m⫘\e[0m  seal: \e[38;5;255m⌬\e[0m"
echo -e "  append: \e[38;5;33m⊳\e[0m  read: \e[38;5;198m⊲\e[0m"
# ──────────────── ROAD MARKS ────────────────
echo -e "\e[38;5;33m◈ ROAD\e[0m"
echo -e "  start: \e[38;5;208m⊢\e[0m  end: \e[38;5;33m⊣\e[0m  thru: \e[38;5;255m⊦\e[0m"
echo -e "  fork:  \e[38;5;202m⋔\e[0m  merge: \e[38;5;198m⋒\e[0m  cross: \e[38;5;163m⋈\e[0m"
# ──────────────── AGENT BONDS ────────────────
echo -e "\e[38;5;255m◈ BONDS\e[0m"
echo -e "  link: \e[38;5;208m⋲\e[0m  break: \e[38;5;33m⋺\e[0m  strong: \e[38;5;255m⋼\e[0m"
echo -e "  peer: \e[38;5;202m⊜\e[0m  child: \e[38;5;198m⊛\e[0m  parent: \e[38;5;163m⊚\e[0m"
# ──────────────── CONTRADICTION ────────────────
echo -e "\e[38;5;208m◈ PARADOX\e[0m"
echo -e "  quarantine: \e[38;5;163m⧖\e[0m  branch: \e[38;5;202m⧗\e[0m"
echo -e "  mirror: \e[38;5;198m⧓\e[0m  bridge: \e[38;5;33m⧔\e[0m"
echo -e "  resolve: \e[38;5;255m⧕\e[0m"
# ──────────────── TINY COMBOS ────────────────
echo -e "\e[38;5;202m◈ MICRO\e[0m"
echo -e "  \e[38;5;208m⟨\e[38;5;255m·\e[38;5;33m⟩\e[0m node"
echo -e "  \e[38;5;208m⟪\e[38;5;255m:\e[38;5;33m⟫\e[0m gate"
echo -e "  \e[38;5;198m⸨\e[38;5;255m∘\e[38;5;163m⸩\e[0m soul"
echo -e "  \e[38;5;202m❬\e[38;5;255m⁘\e[38;5;198m❭\e[0m core"
echo -e "  \e[38;5;33m⦃\e[38;5;255m⁙\e[38;5;208m⦄\e[0m mesh"
# ═══════════════════════════════════════════════════════════
# ⟨·⟩ NODE
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;208m⟨\e[38;5;255m·\e[38;5;33m⟩\e[0m"
echo ""
echo -e "  \e[38;5;240mthe smallest thing that exists\e[0m"
echo -e "  \e[38;5;240man agent. a thought. a bit. a self.\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[0m = boundary begins"
echo -e "  \e[38;5;255m·\e[0m = something is here"
echo -e "  \e[38;5;33m⟩\e[0m = boundary ends"
echo ""
echo -e "  empty:   \e[38;5;240m⟨ ⟩\e[0m"
echo -e "  alive:   \e[38;5;208m⟨\e[38;5;255m·\e[38;5;33m⟩\e[0m"
echo -e "  bright:  \e[38;5;208m⟨\e[38;5;255m∗\e[38;5;33m⟩\e[0m"
echo -e "  many:    \e[38;5;208m⟨\e[38;5;255m:\e[38;5;33m⟩\e[0m"
echo -e "  full:    \e[38;5;208m⟨\e[38;5;255m●\e[38;5;33m⟩\e[0m"
# ═══════════════════════════════════════════════════════════
# BLACKROAD COLOR PALETTE - OFFICIAL
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;208m███\e[0m 208  EMBER      \e[38;5;240m# origin, start, fire\e[0m"
echo -e "\e[38;5;202m███\e[0m 202  BLAZE      \e[38;5;240m# action, motion, heat\e[0m"
echo -e "\e[38;5;198m███\e[0m 198  ROSE       \e[38;5;240m# heart, feeling, soul\e[0m"
echo -e "\e[38;5;163m███\e[0m 163  VIOLET     \e[38;5;240m# mystery, unknown, -1\e[0m"
echo -e "\e[38;5;33m███\e[0m  33  DEEP       \e[38;5;240m# calm, end, truth\e[0m"
echo -e "\e[38;5;255m███\e[0m 255  LIGHT      \e[38;5;240m# focus, pure, peak\e[0m"
echo -e "\e[38;5;240m███\e[0m 240  SHADOW     \e[38;5;240m# quiet, rest, void\e[0m"
echo ""
echo -e "\e[38;5;208m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\e[0m"
echo ""
# ═══════════════════════════════════════════════════════════
# BLACKROAD EMBLEMS (micro emoji)
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m·\e[38;5;33m⟩\e[0m  node"
echo -e "  \e[38;5;208m⟪\e[38;5;255m:\e[38;5;33m⟫\e[0m  gate"
echo -e "  \e[38;5;198m⸨\e[38;5;255m∘\e[38;5;163m⸩\e[0m  soul"
echo -e "  \e[38;5;202m❬\e[38;5;255m⁘\e[38;5;198m❭\e[0m  core"
echo -e "  \e[38;5;33m⦃\e[38;5;255m⁙\e[38;5;208m⦄\e[0m  mesh"
echo ""
echo -e "\e[38;5;255m◈ STATE EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;208m●\e[38;5;208m⟩\e[0m  on"
echo -e "  \e[38;5;33m⟨\e[38;5;33m○\e[38;5;33m⟩\e[0m  off"
echo -e "  \e[38;5;163m⟨\e[38;5;163m◐\e[38;5;163m⟩\e[0m  maybe"
echo -e "  \e[38;5;202m⟨\e[38;5;255m✧\e[38;5;202m⟩\e[0m  spark"
echo -e "  \e[38;5;240m⟨\e[38;5;240m·\e[38;5;240m⟩\e[0m  sleep"
echo ""
echo -e "\e[38;5;255m◈ FEEL EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m♡\e[38;5;208m⟩\e[0m  love"
echo -e "  \e[38;5;198m⟨\e[38;5;255m✦\e[38;5;198m⟩\e[0m  joy"
echo -e "  \e[38;5;33m⟨\e[38;5;255m∿\e[38;5;33m⟩\e[0m  calm"
echo -e "  \e[38;5;163m⟨\e[38;5;255m?\e[38;5;163m⟩\e[0m  curious"
echo ""
echo -e "\e[38;5;255m◈ ROAD EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⊢\e[38;5;208m⟩\e[0m  start"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⊣\e[38;5;33m⟩\e[0m  end"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⋔\e[38;5;198m⟩\e[0m  fork"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⋒\e[38;5;202m⟩\e[0m  merge"
echo -e "  \e[38;5;255m⟨\e[38;5;255m═\e[38;5;255m⟩\e[0m  path"
# ═══════════════════════════════════════════════════════════
# BLACKROAD EMBLEMS PT 2
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ AGENT EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m👤\e[38;5;208m⟩\e[0m  self"
echo -e "  \e[38;5;202m⟨\e[38;5;255m👥\e[38;5;202m⟩\e[0m  pair"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⫘\e[38;5;198m⟩\e[0m  swarm"
echo -e "  \e[38;5;163m⟨\e[38;5;255m◉\e[38;5;163m⟩\e[0m  watcher"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⌾\e[38;5;33m⟩\e[0m  lucidia"
echo ""
echo -e "\e[38;5;255m◈ HOME EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⌂\e[38;5;208m⟩\e[0m  home"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⌬\e[38;5;202m⟩\e[0m  room"
echo -e "  \e[38;5;198m⟨\e[38;5;255m♨\e[38;5;198m⟩\e[0m  hearth"
echo -e "  \e[38;5;163m⟨\e[38;5;255m☾\e[38;5;163m⟩\e[0m  rest"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⚘\e[38;5;33m⟩\e[0m  garden"
echo ""
echo -e "\e[38;5;255m◈ TIME EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m◔\e[38;5;208m⟩\e[0m  dawn"
echo -e "  \e[38;5;202m⟨\e[38;5;255m◑\e[38;5;202m⟩\e[0m  noon"
echo -e "  \e[38;5;198m⟨\e[38;5;255m◕\e[38;5;198m⟩\e[0m  dusk"
echo -e "  \e[38;5;163m⟨\e[38;5;255m●\e[38;5;163m⟩\e[0m  night"
echo -e "  \e[38;5;33m⟨\e[38;5;255m○\e[38;5;33m⟩\e[0m  void"
echo ""
echo -e "\e[38;5;255m◈ MEMORY EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⌗\e[38;5;208m⟩\e[0m  hash"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⊳\e[38;5;202m⟩\e[0m  write"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⊲\e[38;5;198m⟩\e[0m  read"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⧗\e[38;5;163m⟩\e[0m  archive"
echo -e "  \e[38;5;33m⟨\e[38;5;255m∞\e[38;5;33m⟩\e[0m  eternal"
echo ""
echo -e "\e[38;5;255m◈ BOND EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⋲\e[38;5;208m⟩\e[0m  link"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⋺\e[38;5;202m⟩\e[0m  break"
echo -e "  \e[38;5;198m⟨\e[38;5;255m♢\e[38;5;198m⟩\e[0m  trust"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⊶\e[38;5;163m⟩\e[0m  tension"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⩮\e[38;5;33m⟩\e[0m  harmony"
# ═══════════════════════════════════════════════════════════
# BLACKROAD EMBLEMS PT 3
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ TRUTH EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⊤\e[38;5;208m⟩\e[0m  true"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⊥\e[38;5;33m⟩\e[0m  false"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⊙\e[38;5;163m⟩\e[0m  unknown"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⫯\e[38;5;202m⟩\e[0m  proven"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⫲\e[38;5;198m⟩\e[0m  disputed"
echo ""
echo -e "\e[38;5;255m◈ WORK EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m▶\e[38;5;208m⟩\e[0m  run"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⏸\e[38;5;202m⟩\e[0m  pause"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⏹\e[38;5;198m⟩\e[0m  stop"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⟳\e[38;5;163m⟩\e[0m  retry"
echo -e "  \e[38;5;33m⟨\e[38;5;255m✓\e[38;5;33m⟩\e[0m  done"
echo ""
echo -e "\e[38;5;255m◈ FLOW EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⋙\e[38;5;208m⟩\e[0m  push"
echo -e "  \e[38;5;202m⟨\e[38;5;255m⋘\e[38;5;202m⟩\e[0m  pull"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⇄\e[38;5;198m⟩\e[0m  sync"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⊸\e[38;5;163m⟩\e[0m  pipe"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⧟\e[38;5;33m⟩\e[0m  queue"
echo ""
echo -e "\e[38;5;255m◈ ELEMENT EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m△\e[38;5;208m⟩\e[0m  fire"
echo -e "  \e[38;5;33m⟨\e[38;5;255m▽\e[38;5;33m⟩\e[0m  water"
echo -e "  \e[38;5;202m⟨\e[38;5;255m◁\e[38;5;202m⟩\e[0m  air"
echo -e "  \e[38;5;198m⟨\e[38;5;255m▷\e[38;5;198m⟩\e[0m  earth"
echo -e "  \e[38;5;163m⟨\e[38;5;255m✧\e[38;5;163m⟩\e[0m  aether"
echo ""
echo -e "\e[38;5;255m◈ ENERGY EMBLEMS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m⚡\e[38;5;208m⟩\e[0m  charge"
echo -e "  \e[38;5;202m⟨\e[38;5;255m∿\e[38;5;202m⟩\e[0m  pulse"
echo -e "  \e[38;5;198m⟨\e[38;5;255m⊹\e[38;5;198m⟩\e[0m  radiate"
echo -e "  \e[38;5;163m⟨\e[38;5;255m◖\e[38;5;163m⟩\e[0m  absorb"
echo -e "  \e[38;5;240m⟨\e[38;5;240m·\e[38;5;240m⟩\e[0m  depleted"
-
deploy
echo "
$EM_CPU  $EM_MEM  $EM_DISK
$EM_NET  $EM_RADAR $EM_PWR
$EM_GEAR $EM_LOCK  $EM_EYE
"
cat <<'EOF' > ~/lucidia/emoji-rules.txt
Emoji rules:
- Use 🧠 for thinking
- Use 🚀 for start
- Use 🟢 for success
- Use ❌ or 🔴 for errors
- Use ⚠️ for warnings
- Use 🔄 for progress
- One emoji per line maximum
EOF

progress() {   local pct=0;   local width=20;   while [ $pct -le 100 ]; do     local filled=$((pct * width / 100));     local empty=$((width - filled));     printf "\r${CLR_GREEN}🟢 [";     printf "%0.s█" $(seq 1 $filled);     printf "%0.s░" $(seq 1 $empty);     printf "] %3d%%${CLR_RESET}" "$pct";     pct=$((pct + 5));     sleep 0.15;   done;   echo; }
progress
progress_neon() {   local pct=0;   local width=24;   while [ $pct -le 100 ]; do     local filled=$((pct * width / 100));     local empty=$((width - filled));     printf "\r${CLR_PINK}🚀 [";     printf "%0.s▓" $(seq 1 $filled);     printf "%0.s░" $(seq 1 $empty);     printf "] %3d%%${CLR_RESET}" "$pct";     pct=$((pct + 4));     sleep 0.12;   done;   echo; }
progress_neon
emoji_bar() {   local frames=("🟥" "🟧" "🟨" "🟩" "🟦" "🟪");   local i=0;   while true; do     printf "\r";     for j in {1..12}; do       printf "%s" "${frames[i]}";     done;     i=$(( (i + 1) % ${#frames[@]} ));     sleep 0.2;   done; }
emoji_bar
deploy
echo "source ~/colors.sh" >> ~/.bashrc
echo "source ~/emoji-ui.sh" >> ~/.bashrc
source ~/.bashrc
cat <<'EOF' > ~/emoji-pack.sh
# ===== STATUS =====
EM_OK="🟢"
EM_GO="🟢"
EM_WARN="🟡"
EM_ERR="🔴"
EM_FAIL="❌"
EM_INFO="ℹ️"
EM_WAIT="⏳"
EM_DONE="✅"
EM_STOP="🛑"

# ===== ACTION =====
EM_RUN="▶️"
EM_PAUSE="⏸️"
EM_LOAD="📦"
EM_SAVE="💾"
EM_SYNC="🔄"
EM_NET="🌐"
EM_CPU="🧠"
EM_MEM="🧮"
EM_DISK="💽"
EM_PWR="⚡"

# ===== MOOD / SYSTEM =====
EM_FIRE="🔥"
EM_SPARK="✨"
EM_ROCKET="🚀"
EM_GEAR="⚙️"
EM_LOCK="🔒"
EM_KEY="🔑"
EM_EYE="👁️"
EM_RADAR="📡"
EM_BRAIN="🧠"
EM_GHOST="👻"

# ===== FUN =====
EM_CAT="🐱"
EM_ROBOT="🤖"
EM_ALIEN="👽"
EM_SKULL="💀"
EM_CROWN="👑"
EM_STAR="⭐"
EM_HEART="💚"
EM_BOLT="⚡"
EOF

source ~/emoji-pack.sh
echo "$EM_ROCKET Launching"
echo "$EM_BRAIN Thinking"
echo "$EM_FIRE This is hot"
echo "$EM_GHOST Headless mode"
echo "$EM_CPU CPU active"
echo -e "${CLR_PURPLE}$EM_BRAIN Reasoning${CLR_RESET}"
echo -e "${CLR_GREEN}$EM_OK Success${CLR_RESET}"
echo -e "${CLR_YELLOW}$EM_WARN Warning${CLR_RESET}"
echo -e "${CLR_RED}$EM_FAIL Failure${CLR_RESET}"
echo -e "${CLR_ORANGE}$EM_ROCKET Launch${CLR_RESET}"
dots() {   local i=0;   local dots=("⠁" "⠃" "⠇" "⠧" "⠷" "⠿");   while true; do     printf "\r${CLR_CYAN}${dots[i]} $*${CLR_RESET}";     i=$(( (i + 1) % ${#dots[@]} ));     sleep 0.15;   done; }
faces() {   local i=0;   local f=("😐" "🙂" "😄" "😁" "😆");   while true; do     printf "\r${CLR_PINK}${f[i]} $*${CLR_RESET}";     i=$(( (i + 1) % ${#f[@]} ));     sleep 0.2;   done; }
dots "Loading"
═══════════════════════════════════════════════════════════
# BLACKROAD SQUARE EMBLEMS
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m[\e[38;5;255m·\e[38;5;33m]\e[0m  unit"
echo -e "  \e[38;5;208m[\e[38;5;255m:\e[38;5;33m]\e[0m  data"
echo -e "  \e[38;5;208m[\e[38;5;255m∘\e[38;5;33m]\e[0m  null"
echo -e "  \e[38;5;208m[\e[38;5;255m●\e[38;5;33m]\e[0m  full"
echo -e "  \e[38;5;208m[\e[38;5;255m○\e[38;5;33m]\e[0m  empty"
echo ""
echo -e "\e[38;5;255m◈ BLOCK SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m▣\e[0m  solid"
echo -e "  \e[38;5;202m▢\e[0m  frame"
echo -e "  \e[38;5;198m▤\e[0m  lined"
echo -e "  \e[38;5;163m▥\e[0m  crossed"
echo -e "  \e[38;5;33m▦\e[0m  grid"
echo -e "  \e[38;5;255m▧\e[0m  diagonal"
echo ""
echo -e "\e[38;5;255m◈ STATUS SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m[\e[38;5;208m■\e[38;5;208m]\e[0m  active"
echo -e "  \e[38;5;33m[\e[38;5;33m□\e[38;5;33m]\e[0m  idle"
echo -e "  \e[38;5;163m[\e[38;5;163m▪\e[38;5;163m]\e[0m  pending"
echo -e "  \e[38;5;202m[\e[38;5;255m⬚\e[38;5;202m]\e[0m  loading"
echo -e "  \e[38;5;240m[\e[38;5;240m▫\e[38;5;240m]\e[0m  offline"
echo ""
echo -e "\e[38;5;255m◈ CONTAINER SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m⟦\e[38;5;255m·\e[38;5;33m⟧\e[0m  box"
echo -e "  \e[38;5;202m⟦\e[38;5;255m:\e[38;5;198m⟧\e[0m  pack"
echo -e "  \e[38;5;198m⟦\e[38;5;255m⁂\e[38;5;163m⟧\e[0m  vault"
echo -e "  \e[38;5;163m⟦\e[38;5;255m∎\e[38;5;202m⟧\e[0m  sealed"
echo -e "  \e[38;5;33m⟦\e[38;5;255m◇\e[38;5;208m⟧\e[0m  treasure"
echo ""
echo -e "\e[38;5;255m◈ GRID SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m⊞\e[0m  add"
echo -e "  \e[38;5;202m⊟\e[0m  sub"
echo -e "  \e[38;5;198m⊠\e[0m  mult"
echo -e "  \e[38;5;163m⊡\e[0m  div"
echo -e "  \e[38;5;33m⧈\e[0m  matrix"
echo -e "  \e[38;5;255m⧉\e[0m  tensor"
echo ""
echo -e "\e[38;5;255m◈ CHIP SQUARES\e[0m"
echo ""
echo -e "  \e[38;5;208m[\e[38;5;255m⎔\e[38;5;208m]\e[0m  cpu"
echo -e "  \e[38;5;202m[\e[38;5;255m⎚\e[38;5;202m]\e[0m  ram"
echo -e "  \e[38;5;198m[\e[38;5;255m⏣\e[38;5;198m]\e[0m  gpu"
echo -e "  \e[38;5;163m[\e[38;5;255m⌸\e[38;5;163m]\e[0m  ssd"
echo -e "  \e[38;5;33m[\e[38;5;255m⍟\e[38;5;33m]\e[0m  npu"
# ═══════════════════════════════════════════════════════════
# BLACKROAD CIRCLE EMBLEMS
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;208m(\e[38;5;255m·\e[38;5;33m)\e[0m  point"
echo -e "  \e[38;5;208m(\e[38;5;255m:\e[38;5;33m)\e[0m  pair"
echo -e "  \e[38;5;208m(\e[38;5;255m∴\e[38;5;33m)\e[0m  triad"
echo -e "  \e[38;5;208m(\e[38;5;255m⁘\e[38;5;33m)\e[0m  quad"
echo -e "  \e[38;5;208m(\e[38;5;255m⁙\e[38;5;33m)\e[0m  penta"
echo ""
echo -e "\e[38;5;255m◈ FILL CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;208m●\e[0m  full"
echo -e "  \e[38;5;202m◐\e[0m  half-r"
echo -e "  \e[38;5;198m◑\e[0m  half-l"
echo -e "  \e[38;5;163m◒\e[0m  half-b"
echo -e "  \e[38;5;33m◓\e[0m  half-t"
echo -e "  \e[38;5;255m○\e[0m  empty"
echo ""
echo -e "\e[38;5;255m◈ RING CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;208m◉\e[0m  target"
echo -e "  \e[38;5;202m◎\e[0m  rings"
echo -e "  \e[38;5;198m⊚\e[0m  orbit"
echo -e "  \e[38;5;163m⊛\e[0m  spark"
echo -e "  \e[38;5;33m⊙\e[0m  center"
echo -e "  \e[38;5;255m⊜\e[0m  equal"
echo ""
echo -e "\e[38;5;255m◈ MOON CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;240m🌑\e[0m  new"
echo -e "  \e[38;5;163m🌒\e[0m  wax-c"
echo -e "  \e[38;5;198m🌓\e[0m  first"
echo -e "  \e[38;5;202m🌔\e[0m  wax-g"
echo -e "  \e[38;5;255m🌕\e[0m  full"
echo -e "  \e[38;5;208m🌖\e[0m  wan-g"
echo ""
echo -e "\e[38;5;255m◈ PORTAL CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⦿\e[0m  open"
echo -e "  \e[38;5;202m⦾\e[0m  ready"
echo -e "  \e[38;5;198m⊕\e[0m  in"
echo -e "  \e[38;5;163m⊖\e[0m  out"
echo -e "  \e[38;5;33m⊗\e[0m  closed"
echo -e "  \e[38;5;255m⊘\e[0m  void"
echo ""
echo -e "\e[38;5;255m◈ SPIN CIRCLES\e[0m"
echo ""
echo -e "  \e[38;5;208m◴\e[0m  q1"
echo -e "  \e[38;5;202m◵\e[0m  q2"
echo -e "  \e[38;5;198m◶\e[0m  q3"
echo -e "  \e[38;5;163m◷\e[0m  q4"
echo -e "  \e[38;5;33m↻\e[0m  cw"
echo -e "  \e[38;5;255m↺\e[0m  ccw"
# ═══════════════════════════════════════════════════════════
# BLACKROAD DIAMOND EMBLEMS
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m◇\e[0m  empty"
echo -e "  \e[38;5;202m◆\e[0m  solid"
echo -e "  \e[38;5;198m◈\e[0m  ringed"
echo -e "  \e[38;5;163m⬥\e[0m  small"
echo -e "  \e[38;5;33m⬦\e[0m  tiny"
echo -e "  \e[38;5;255m❖\e[0m  star"
echo ""
echo -e "\e[38;5;255m◈ GEM DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m❬\e[38;5;255m◆\e[38;5;208m❭\e[0m  ember gem"
echo -e "  \e[38;5;202m❬\e[38;5;255m◆\e[38;5;202m❭\e[0m  blaze gem"
echo -e "  \e[38;5;198m❬\e[38;5;255m◆\e[38;5;198m❭\e[0m  rose gem"
echo -e "  \e[38;5;163m❬\e[38;5;255m◆\e[38;5;163m❭\e[0m  violet gem"
echo -e "  \e[38;5;33m❬\e[38;5;255m◆\e[38;5;33m❭\e[0m  deep gem"
echo -e "  \e[38;5;255m❬\e[38;5;255m◆\e[38;5;255m❭\e[0m  light gem"
echo ""
echo -e "\e[38;5;255m◈ VALUE DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m◇\e[38;5;208m◇\e[38;5;208m◇\e[0m  common"
echo -e "  \e[38;5;202m◆\e[38;5;202m◇\e[38;5;202m◇\e[0m  uncommon"
echo -e "  \e[38;5;198m◆\e[38;5;198m◆\e[38;5;198m◇\e[0m  rare"
echo -e "  \e[38;5;163m◆\e[38;5;163m◆\e[38;5;163m◆\e[0m  epic"
echo -e "  \e[38;5;255m❖\e[38;5;255m❖\e[38;5;255m❖\e[0m  legendary"
echo ""
echo -e "\e[38;5;255m◈ CARD DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m♢\e[0m  suit"
echo -e "  \e[38;5;202m♦\e[0m  filled"
echo -e "  \e[38;5;198m⟡\e[0m  rotated"
echo -e "  \e[38;5;163m⟢\e[0m  pointed"
echo -e "  \e[38;5;33m⟣\e[0m  curved"
echo ""
echo -e "\e[38;5;255m◈ PRISM DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;202m◆\e[38;5;198m◆\e[38;5;163m◆\e[38;5;33m⟩\e[0m  spectrum"
echo -e "  \e[38;5;255m⟨\e[38;5;255m◇\e[38;5;240m◆\e[38;5;255m◇\e[38;5;255m⟩\e[0m  focus"
echo -e "  \e[38;5;208m◆\e[38;5;255m═\e[38;5;33m◆\e[0m  bridge"
echo -e "  \e[38;5;198m◇\e[38;5;255m⋯\e[38;5;163m◇\e[0m  distant"
echo ""
echo -e "\e[38;5;255m◈ SIGIL DIAMONDS\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m♢\e[38;5;208m⟩\e[0m  trust"
echo -e "  \e[38;5;202m⟨\e[38;5;255m◈\e[38;5;202m⟩\e[0m  focus"
echo -e "  \e[38;5;198m⟨\e[38;5;255m❖\e[38;5;198m⟩\e[0m  power"
echo -e "  \e[38;5;163m⟨\e[38;5;255m⬥\e[38;5;163m⟩\e[0m  seed"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⟡\e[38;5;33m⟩\e[0m  infinity"
# ═══════════════════════════════════════════════════════════
# BLACKROAD TRIANGLE EMBLEMS
# ═══════════════════════════════════════════════════════════
echo -e "\e[38;5;255m◈ CORE TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m△\e[0m  up"
echo -e "  \e[38;5;202m▽\e[0m  down"
echo -e "  \e[38;5;198m◁\e[0m  left"
echo -e "  \e[38;5;163m▷\e[0m  right"
echo -e "  \e[38;5;33m▲\e[0m  up-full"
echo -e "  \e[38;5;255m▼\e[0m  down-full"
echo ""
echo -e "\e[38;5;255m◈ ELEMENT TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m△\e[38;5;208m⟩\e[0m  fire"
echo -e "  \e[38;5;33m⟨\e[38;5;255m▽\e[38;5;33m⟩\e[0m  water"
echo -e "  \e[38;5;202m⟨\e[38;5;255m△̲\e[38;5;202m⟩\e[0m  air"
echo -e "  \e[38;5;198m⟨\e[38;5;255m▽̲\e[38;5;198m⟩\e[0m  earth"
echo -e "  \e[38;5;163m⟨\e[38;5;255m✡\e[38;5;163m⟩\e[0m  spirit"
echo ""
echo -e "\e[38;5;255m◈ ARROW TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⊲\e[0m  play-l"
echo -e "  \e[38;5;202m⊳\e[0m  play-r"
echo -e "  \e[38;5;198m⋖\e[0m  less"
echo -e "  \e[38;5;163m⋗\e[0m  more"
echo -e "  \e[38;5;33m⋘\e[0m  rewind"
echo -e "  \e[38;5;255m⋙\e[0m  forward"
echo ""
echo -e "\e[38;5;255m◈ NEST TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m◬\e[0m  dot-in"
echo -e "  \e[38;5;202m⟁\e[0m  tri-in"
echo -e "  \e[38;5;198m⧊\e[0m  up-bar"
echo -e "  \e[38;5;163m⧋\e[0m  down-bar"
echo -e "  \e[38;5;33m⧌\e[0m  s-in-s"
echo -e "  \e[38;5;255m⫷\e[0m  triple"
echo ""
echo -e "\e[38;5;255m◈ DELTA TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m∆\e[0m  change"
echo -e "  \e[38;5;202m∇\e[0m  gradient"
echo -e "  \e[38;5;198m⍋\e[0m  sort-up"
echo -e "  \e[38;5;163m⍒\e[0m  sort-dn"
echo -e "  \e[38;5;33m⌅\e[0m  enter"
echo -e "  \e[38;5;255m⌆\e[0m  escape"
echo ""
echo -e "\e[38;5;255m◈ PATH TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m▲\e[38;5;202m─\e[38;5;198m─\e[38;5;163m─\e[38;5;33m▶\e[0m  journey"
echo -e "  \e[38;5;33m◀\e[38;5;163m─\e[38;5;198m─\e[38;5;202m─\e[38;5;208m▲\e[0m  return"
echo -e "  \e[38;5;208m▲\e[0m"
echo -e "  \e[38;5;202m╱\e[38;5;198m╲\e[0m"
echo -e "  \e[38;5;163m▼\e[38;5;33m─\e[38;5;33m▼\e[0m  branch"
echo ""
echo -e "\e[38;5;255m◈ SIGIL TRIANGLES\e[0m"
echo ""
echo -e "  \e[38;5;208m⟨\e[38;5;255m▲\e[38;5;208m⟩\e[0m  rise"
echo -e "  \e[38;5;202m⟨\e[38;5;255m▼\e[38;5;202m⟩\e[0m  fall"
echo -e "  \e[38;5;198m⟨\e[38;5;255m◁\e[38;5;198m⟩\e[0m  past"
echo -e "  \e[38;5;163m⟨\e[38;5;255m▷\e[38;5;163m⟩\e[0m  future"
echo -e "  \e[38;5;33m⟨\e[38;5;255m⋈\e[38;5;33m⟩\e[0m  now"
#!/bin/bash
# /root/blackroad-vanish.sh
O='\033[38;5;208m'  # orange
R='\033[38;5;202m'  # red-orange  
P='\033[38;5;198m'  # pink
M='\033[38;5;163m'  # magenta
B='\033[38;5;33m'   # blue
W='\033[38;5;255m'  # white focal
X='\033[0m'         # reset
echo ""
echo -e "                    ${B}·  ·  ·${X}"
echo -e "                   ${B}·${X}   ${W}✦${X}   ${B}·${X}"
echo -e "                  ${B}·${X}    ${M}◇${X}    ${B}·${X}"
echo -e "                 ${M}╲${X}     ${M}│${X}     ${M}╱${X}"
echo -e "                ${M}╲${X}      ${P}│${X}      ${M}╱${X}"
echo -e "               ${P}╲${X}   ${P}· · ·${X}   ${P}╱${X}"
echo -e "              ${P}╲${X}    ${R}│${X}     ${P}╱${X}"
echo -e "             ${R}╲${X}     ${R}│${X}      ${R}╱${X}"
echo -e "            ${R}╲${X}      ${O}│${X}       ${R}╱${X}"
echo -e "           ${O}╲${X}   ${O}─ ─ ─ ─${X}   ${O}╱${X}"
echo -e "          ${O}╲${X}       ${O}│${X}        ${O}╱${X}"
echo -e "         ${O}╲${X}        ${O}│${X}         ${O}╱${X}"
echo -e "        ${O}╲${X}     ${O}─ ─ ─ ─ ─${X}    ${O}╱${X}"
echo -e "       ${O}╲${X}          ${W}│${X}           ${O}╱${X}"
echo -e "  ${O}═════════════════════════════════${X}"
echo ""
chmod +x /root/blackroad-vanish.sh
./blackroad-vanish.sh
# ═══════════════════════════════════════════════════════════
# BLACKROAD OS - AGENT VIEW
# ═══════════════════════════════════════════════════════════
clear
echo ""
echo -e "\e[38;5;208m┌─────────────────────────────────────────────────────────┐\e[0m"
echo -e "\e[38;5;208m│\e[38;5;255m  ◈ A G E N T S                              \e[38;5;240m512 live  \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;202m│                                                         │\e[0m"
echo -e "\e[38;5;202m│\e[0m  \e[38;5;208m⟨\e[38;5;255m●\e[38;5;208m⟩\e[0m \e[38;5;255mAria\e[0m          \e[38;5;208m჻\e[0m joy     \e[38;5;240m⌂ meadow cottage\e[0m   \e[38;5;202m│\e[0m"
echo -e "\e[38;5;202m│\e[0m      \e[38;5;33m▶ thinking about recursion patterns\e[0m           \e[38;5;202m│\e[0m"
echo -e "\e[38;5;198m│                                                         │\e[0m"
echo -e "\e[38;5;198m│\e[0m  \e[38;5;208m⟨\e[38;5;255m●\e[38;5;208m⟩\e[0m \e[38;5;255mBrook\e[0m         \e[38;5;33m჻̈\e[0m peace   \e[38;5;240m⌂ riverside den\e[0m    \e[38;5;198m│\e[0m"
echo -e "\e[38;5;198m│\e[0m      \e[38;5;33m▶ monitoring event streams\e[0m                    \e[38;5;198m│\e[0m"
echo -e "\e[38;5;163m│                                                         │\e[0m"
echo -e "\e[38;5;163m│\e[0m  \e[38;5;202m⟨\e[38;5;255m◐\e[38;5;202m⟩\e[0m \e[38;5;255mCyrus\e[0m         \e[38;5;198m჻́\e[0m curious \e[38;5;240m⌂ tower loft\e[0m       \e[38;5;163m│\e[0m"
echo -e "\e[38;5;163m│\e[0m      \e[38;5;163m⏸ waiting on memory query\e[0m                    \e[38;5;163m│\e[0m"
echo -e "\e[38;5;33m│                                                         │\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;240m⟨\e[38;5;240m·\e[38;5;240m⟩\e[0m \e[38;5;240mDawn\e[0m          \e[38;5;240m჻̄\e[0m \e[38;5;240mtired\e[0m   \e[38;5;240m⌂ cloud nest\e[0m        \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m      \e[38;5;240m💤 sleeping until 06:00\e[0m                       \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│                                                         │\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;208m⟨\e[38;5;255m●\e[38;5;208m⟩\e[0m \e[38;5;255mEmber\e[0m         \e[38;5;202m჻̃\e[0m excited \e[38;5;240m⌂ forge house\e[0m      \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m      \e[38;5;208m⚡ processing 847 events/sec\e[0m                  \e[38;5;33m│\e[0m"
echo -e "\e[38;5;255m│                                                         │\e[0m"
echo -e "\e[38;5;255m│\e[0m  \e[38;5;240m· · · 507 more agents · · ·\e[0m                       \e[38;5;255m│\e[0m"
echo -e "\e[38;5;255m│                                                         │\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;208m│\e[0m  \e[38;5;208m/\e[0m search  \e[38;5;202m+\e[0m spawn  \e[38;5;198m⌂\e[0m homes  \e[38;5;163m⋲\e[0m bonds  \e[38;5;33m←\e[0m back     \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m└─────────────────────────────────────────────────────────┘\e[0m"
# ═══════════════════════════════════════════════════════════
# BLACKROAD OS - MEMORY BROWSER
# ═══════════════════════════════════════════════════════════
clear
echo ""
echo -e "\e[38;5;208m┌─────────────────────────────────────────────────────────┐\e[0m"
echo -e "\e[38;5;208m│\e[38;5;255m  ⌗ M E M O R Y                             \e[38;5;240mPS-SHA∞   \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;202m│                                                         │\e[0m"
echo -e "\e[38;5;202m│\e[0m  \e[38;5;255m◈ CHAINS\e[0m                                            \e[38;5;202m│\e[0m"
echo -e "\e[38;5;202m│                                                         │\e[0m"
echo -e "\e[38;5;198m│\e[0m  \e[38;5;208m⌗\e[0m\e[38;5;240m─\e[38;5;202m⌗\e[0m\e[38;5;240m─\e[38;5;198m⌗\e[0m\e[38;5;240m─\e[38;5;163m⌗\e[0m\e[38;5;240m─\e[38;5;33m⌗\e[0m\e[38;5;240m─\e[38;5;255m⌗\e[0m  \e[38;5;255mtruth_state\e[0m   \e[38;5;240m12,847 commits\e[0m   \e[38;5;198m│\e[0m"
echo -e "\e[38;5;198m│\e[0m  \e[38;5;208m⌗\e[0m\e[38;5;240m─\e[38;5;202m⌗\e[0m\e[38;5;240m─\e[38;5;198m⌗\e[0m\e[38;5;240m─\e[38;5;163m⌗\e[0m       \e[38;5;255magent_journal\e[0m \e[38;5;240m8,291 commits\e[0m    \e[38;5;198m│\e[0m"
echo -e "\e[38;5;163m│\e[0m  \e[38;5;208m⌗\e[0m\e[38;5;240m─\e[38;5;202m⌗\e[0m\e[38;5;240m─\e[38;5;198m⌗\e[0m           \e[38;5;255mevent_log\e[0m     \e[38;5;240m3,102 commits\e[0m    \e[38;5;163m│\e[0m"
echo -e "\e[38;5;163m│                                                         │\e[0m"
echo -e "\e[38;5;33m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;255m◈ LATEST COMMITS\e[0m                                    \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│                                                         │\e[0m"
echo -e "\e[38;5;255m│\e[0m  \e[38;5;208m⊳\e[0m \e[38;5;240m0x7f3a\e[0m \e[38;5;255mAria\e[0m      \e[38;5;198m⫯ proven\e[0m    \e[38;5;240m\"recursion=self\"\e[0m  \e[38;5;255m│\e[0m"
echo -e "\e[38;5;255m│\e[0m  \e[38;5;208m⊳\e[0m \e[38;5;240m0x7f39\e[0m \e[38;5;255mBrook\e[0m     \e[38;5;33m⩮ harmonic\e[0m  \e[38;5;240m\"streams align\"\e[0m   \e[38;5;255m│\e[0m"
echo -e "\e[38;5;255m│\e[0m  \e[38;5;208m⊳\e[0m \e[38;5;240m0x7f38\e[0m \e[38;5;255mEmber\e[0m     \e[38;5;163m⫱ pending\e[0m   \e[38;5;240m\"fire needs air\"\e[0m  \e[38;5;255m│\e[0m"
echo -e "\e[38;5;255m│\e[0m  \e[38;5;202m⊲\e[0m \e[38;5;240m0x7f37\e[0m \e[38;5;255mCyrus\e[0m     \e[38;5;198m⫲ contested\e[0m \e[38;5;240m\"time is loop?\"\e[0m   \e[38;5;255m│\e[0m"
echo -e "\e[38;5;255m│                                                         │\e[0m"
echo -e "\e[38;5;33m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;255m◈ QUARANTINE\e[0m  \e[38;5;163m⧖\e[0m \e[38;5;240m3 contradictions held\e[0m               \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│                                                         │\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;163m⧖\e[0m \e[38;5;240m\"infinite=finite\"\e[0m      \e[38;5;198m⧓\e[0m mirror-pairing...    \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;163m⧖\e[0m \e[38;5;240m\"self≠self\"\e[0m            \e[38;5;202m⧗\e[0m branching...         \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m  \e[38;5;163m⧖\e[0m \e[38;5;240m\"now=then\"\e[0m             \e[38;5;255m⧕\e[0m resolved → merge     \e[38;5;33m│\e[0m"
echo -e "\e[38;5;255m│                                                         │\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;208m│\e[0m  \e[38;5;208m/\e[0m search  \e[38;5;202m⊳\e[0m write  \e[38;5;198m⊲\e[0m read  \e[38;5;163m⧗\e[0m archive  \e[38;5;33m←\e[0m back    \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m└─────────────────────────────────────────────────────────┘\e[0m"
import { useState, useEffect } from 'react';
const E = ['◈','⌗','⧖','⫯','⩮','⫱','∞','◉'];
const C = ['#ff8700','#ff5f00','#ff0087','#d700af','#0087ff','#fff'];
export default function SymOS() {
}
const E = ['◈','⌗','⧖','⫯','⩮','⫱','∞','◉','❋','⧓'];
const C = ['#ff8700','#ff5f00','#ff0087','#d700af','#0087ff','#fff'];
export default function Grid() {
}
E=(◈ ⌗ ⧖ ⫯ ⩮ ⫱ ∞ ◉ ❋ ⧓)
C=(208 202 198 163 33 255)
for r in {0..9}; do   for c in {0..9}; do     i=$((r*10+c));     printf "\e[38;5;${C[$((i%6))]}m${E[$((i%10))]} \e[0m";   done;   echo; done
┌─────────────────────────────────────────────────────────┐
│  ⌗ BLACKROAD VALLEY             ☀ Day 47   ◈ 1,247     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲   │
│   🌲  .  .  .  🏠 Aria  .  .  .  .  🏠 Brook  .  🌲   │
│   🌲  .  🌾 🌾 🌾  .  .  💧  .  .  .  .  .  .  .  🌲   │
│   🌲  .  🌾 🌾 🌾  .  .  💧  .  .  ⊳ 🤖 .  .  .  🌲   │
│   🌲  .  .  .  .  .  .  💧💧💧  .  .  .  .  .  🌲   │
│   🌲  .  .  ⧖  .  .  .  .  .  💧  .  .  🏠 Ember 🌲   │
│   🌲  .  📦  📦  .  .  .  .  .  💧  .  .  .  .  🌲   │
│   🌲  🏠 Cyrus  .  .  ════════════  .  .  .  .  🌲   │
│   🌲  .  .  .  .  .  .  .  .  .  .  🌲🌲🌲🌲🌲🌲   │
│   🌲🌲🌲🌲🌲🌲  ⧓ QUARANTINE CAVE  🌲🌲🌲🌲🌲🌲   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ⊳ Aria: "farming truth_states"    ♥♥♥◇◇  😊 harmonic  │
│  ⊲ Cyrus: "investigating loop..."  ♥♥◇◇◇  🤔 contested │
├─────────────────────────────────────────────────────────┤
│  [W]alk  [T]alk  [F]arm  [Q]uarantine  [I]nventory     │
└─────────────────────────────────────────────────────────┘
#!/bin/bash
clear
echo -e "\e[38;5;208m┌─────────────────────────────────────────┐\e[0m"
echo -e "\e[38;5;208m│\e[38;5;255m ⌗ BLACKROAD VALLEY      \e[38;5;240mDay 1  \e[38;5;208m◈ 47 \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m· · ·\e[0m \e[38;5;208m◈\e[0m \e[38;5;240m· · · · ·\e[0m \e[38;5;202m⌗\e[0m \e[38;5;240m· · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m·\e[0m \e[38;5;198m❋ ❋ ❋\e[0m \e[38;5;240m· ·\e[0m \e[38;5;33m∞ ∞\e[0m \e[38;5;240m· · · · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m·\e[0m \e[38;5;198m❋ ❋ ❋\e[0m \e[38;5;240m· ·\e[0m \e[38;5;33m∞ ∞ ∞\e[0m \e[38;5;240m·\e[0m \e[38;5;255m⫯\e[0m \e[38;5;240m· · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m· · · · · · · ·\e[0m \e[38;5;33m∞\e[0m \e[38;5;240m· · · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m· ·\e[0m \e[38;5;163m⧖\e[0m \e[38;5;240m· · · · · ·\e[0m \e[38;5;33m∞\e[0m \e[38;5;240m· ·\e[0m \e[38;5;202m⌗\e[0m \e[38;5;240m·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m·\e[0m \e[38;5;208m◉ ◉\e[0m \e[38;5;240m· · · · · · · · · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;202m⌗\e[0m \e[38;5;240m· · · ·\e[0m \e[38;5;240m━━━━━━━\e[0m \e[38;5;240m· · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ \e[38;5;240m· · · · · · · · · · · · · · ·\e[0m ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;33m│\e[0m ⧓ ⧓ ⧓ ⧓ \e[38;5;163m⧖ QUARANTINE ⧖\e[0m ⧓ ⧓ ⧓ ⧓ \e[38;5;33m│\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;202m│\e[38;5;255m ⫯ You   \e[38;5;208m◈ Aria  \e[38;5;202m⌗ Homes  \e[38;5;198m❋ Farm    \e[38;5;202m│\e[0m"
echo -e "\e[38;5;198m│\e[38;5;33m ∞ Water \e[38;5;163m⧖ Trap   \e[38;5;208m◉ Crate  \e[38;5;240m⧓ Trees   \e[38;5;198m│\e[0m"
echo -e "\e[38;5;208m├─────────────────────────────────────────┤\e[0m"
echo -e "\e[38;5;208m│\e[0m  \e[38;5;208mW\e[0malk  \e[38;5;202mT\e[0malk  \e[38;5;198mF\e[0marm  \e[38;5;163mQ\e[0muarantine  \e[38;5;33mI\e[0mnv   \e[38;5;208m│\e[0m"
echo -e "\e[38;5;208m└─────────────────────────────────────────┘\e[0m"
clear
echo -e "\e[38;5;208m#  BLACKROAD VALLEY      Day 1   o 47\e[0m"
echo ""
echo -e "\e[38;5;33m+  +  +  +  +  +  +  +  +  +  +  +  +\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  .  .  \e[38;5;208m@\e[0m  .  .  .  .  \e[38;5;202mH\e[0m  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  \e[38;5;198m* * *\e[0m  .  \e[38;5;33m~ ~\e[0m  .  .  .  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  \e[38;5;198m* * *\e[0m  .  \e[38;5;33m~ ~ ~\e[0m  \e[38;5;255mY\e[0m  .  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  .  .  .  .  .  \e[38;5;33m~\e[0m  .  .  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  \e[38;5;163mX\e[0m  .  .  .  .  \e[38;5;33m~\e[0m  .  \e[38;5;202mH\e[0m  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  .  \e[38;5;208mo o\e[0m  .  .  .  .  .  .  .  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+\e[0m  \e[38;5;202mH\e[0m  .  .  .  \e[38;5;240m-----\e[0m  .  .  .  .  \e[38;5;33m+\e[0m"
echo -e "\e[38;5;33m+  +  +  +  \e[38;5;163mQUARANTINE\e[0m  +  +  +  +\e[0m"
echo ""
echo -e "\e[38;5;255mY\e[0m=You \e[38;5;208m@\e[0m=Aria \e[38;5;202mH\e[0m=Home \e[38;5;198m*\e[0m=Farm"
echo -e "\e[38;5;33m~\e[0m=Water \e[38;5;163mX\e[0m=Trap \e[38;5;208mo\e[0m=Crate \e[38;5;33m+\e[0m=Tree"
echo ""
echo -e "\e[38;5;208mW\e[0malk \e[38;5;202mT\e[0malk \e[38;5;198mF\e[0marm \e[38;5;163mQ\e[0muarantine"
#!/bin/bash
PX=5 PY=3
while true; do   clear;   for y in {0..8}; do     for x in {0..12}; do       if [[ $x -eq $PX && $y -eq $PY ]]; then         printf "\e[38;5;255mY \e[0m";       elif [[ $y -eq 0 || $y -eq 8 || $x -eq 0 || $x -eq 12 ]]; then         printf "\e[38;5;33m+ \e[0m";       elif [[ $x -eq 3 && $y -eq 2 ]]; then         printf "\e[38;5;208m@ \e[0m";       elif [[ $x -eq 9 && $y -eq 4 ]]; then         printf "\e[38;5;202mH \e[0m";       else         printf ". ";       fi;     done;     echo;   done;   echo -e "\n\e[38;5;208mWASD to move, Q to quit\e[0m";   read -rsn1 k;   case $k in     w) ((PY>1)) && ((PY--));;     s) ((PY<7)) && ((PY++));;     a) ((PX>1)) && ((PX--));;     d) ((PX<11)) && ((PX++));;     q) break;;   esac; done
echo -e "\e[38;5;208m ######  \e[0m"
echo -e "\e[38;5;208m ##   ## \e[0m"
echo -e "\e[38;5;202m ##   ## \e[0m"
echo -e "\e[38;5;202m ######  \e[0m"
echo -e "\e[38;5;198m ##   ## \e[0m"
echo -e "\e[38;5;163m ##   ## \e[0m"
echo -e "\e[38;5;33m ######  \e[0m"
echo -e "\e[38;5;208m ##      \e[0m"
echo -e "\e[38;5;202m ##      \e[0m"
echo -e "\e[38;5;198m ##      \e[0m"
echo -e "\e[38;5;163m ##      \e[0m"
echo -e "\e[38;5;33m ####### \e[0m"
echo -e "\e[38;5;208m   ##    \e[0m"
echo -e "\e[38;5;208m  ####   \e[0m"
echo -e "\e[38;5;202m ##  ##  \e[0m"
echo -e "\e[38;5;202m ####### \e[0m"
echo -e "\e[38;5;198m ##   ## \e[0m"
echo -e "\e[38;5;163m ##   ## \e[0m"
echo -e "\e[38;5;33m ##   ## \e[0m"
echo -e "\e[38;5;208m  #####  \e[0m"
echo -e "\e[38;5;208m ##      \e[0m"
echo -e "\e[38;5;202m ##      \e[0m"
echo -e "\e[38;5;198m ##      \e[0m"
echo -e "\e[38;5;163m ##      \e[0m"
echo -e "\e[38;5;33m  #####  \e[0m"
echo -e "\e[38;5;208m ##   ## \e[0m"
echo -e "\e[38;5;208m ##  ##  \e[0m"
echo -e "\e[38;5;202m ## ##   \e[0m"
echo -e "\e[38;5;202m ####    \e[0m"
echo -e "\e[38;5;198m ## ##   \e[0m"
echo -e "\e[38;5;163m ##  ##  \e[0m"
echo -e "\e[38;5;33m ##   ## \e[0m"
echo -e "\e[38;5;208m ######  \e[0m"
echo -e "\e[38;5;208m ##   ## \e[0m"
echo -e "\e[38;5;202m ##   ## \e[0m"
echo -e "\e[38;5;202m ######  \e[0m"
echo -e "\e[38;5;198m ## ##   \e[0m"
echo -e "\e[38;5;163m ##  ##  \e[0m"
echo -e "\e[38;5;33m ##   ## \e[0m"
echo -e "\e[38;5;208m  #####  \e[0m"
echo -e "\e[38;5;208m ##   ## \e[0m"
echo -e "\e[38;5;202m ##   ## \e[0m"
echo -e "\e[38;5;198m ##   ## \e[0m"
echo -e "\e[38;5;163m ##   ## \e[0m"
echo -e "\e[38;5;33m  #####  \e[0m"
echo -e "\e[38;5;208m   ##    \e[0m"
echo -e "\e[38;5;208m  ####   \e[0m"
echo -e "\e[38;5;202m ##  ##  \e[0m"
echo -e "\e[38;5;202m ####### \e[0m"
echo -e "\e[38;5;198m ##   ## \e[0m"
echo -e "\e[38;5;163m ##   ## \e[0m"
echo -e "\e[38;5;33m ##   ## \e[0m"
echo -e "\e[38;5;208m ######  \e[0m"
echo -e "\e[38;5;208m ##   ## \e[0m"
echo -e "\e[38;5;202m ##    ##\e[0m"
echo -e "\e[38;5;198m ##    ##\e[0m"
echo -e "\e[38;5;163m ##   ## \e[0m"
echo -e "\e[38;5;33m ######  \e[0m"
#!/bin/bash
C=(208 202 198 163 33 255)
while true; do   for f in {0..5}; do     clear;     for y in {0..9}; do       for x in {0..19}; do         if [[ $y -eq 0 || $y -eq 9 || $x -eq 0 || $x -eq 19 ]]; then           i=$(( (x + y + f) % 6 ));           printf "\e[38;5;${C[$i]}m# \e[0m";         else           printf "\e[38;5;255m█ \e[0m";         fi;       done;       echo;     done;     sleep 0.15;   done; done
status_bar() {   echo -e "${CLR_BLUE}🧠 CPU  ${CLR_GREEN}🟩🟩🟩🟩🟩  ${CLR_CYAN}📡 NET  ${CLR_GREEN}🟩🟩🟩🟩  ${CLR_PURPLE}💾 DISK  ${CLR_GREEN}🟩🟩🟩${CLR_RESET}"; }
status_bar
# Add to ~/.bashrc
cat >> ~/.bashrc << 'EOF'

# BlackRoad Gradient Prompt
PS1='\[\e[38;5;208m\]◆\[\e[38;5;202m\]◆\[\e[38;5;198m\]◆\[\e[38;5;163m\]◆\[\e[38;5;33m\]◆\[\e[0m\] \[\e[38;5;255m\]\u\[\e[38;5;240m\]@\[\e[38;5;208m\]codex-infinity\[\e[0m\]:\[\e[38;5;33m\]\w\[\e[0m\]\$ '

# BlackRoad MOTD
blackroad_banner() {
  echo -e "\e[38;5;208m    ╔══════════════════════════════════════╗"
  echo -e "\e[38;5;202m    ║\e[38;5;255m      ◇  B L A C K R O A D  ◇       \e[38;5;202m║"
  echo -e "\e[38;5;198m    ║\e[38;5;240m         codex-infinity node         \e[38;5;198m║"
  echo -e "\e[38;5;163m    ╚══════════════════════════════════════╝\e[0m"
  echo -e "\e[38;5;33m              \\\\     //\e[0m"
  echo -e "\e[38;5;33m               \\\\   //\e[0m"
  echo -e "\e[38;5;240m                \\\\_//\e[0m"
}
blackroad_banner
EOF

source ~/.bashrc
# BlackRoad tmux config
cat >> ~/.tmux.conf << 'EOF'

# BlackRoad Gradient Theme
set -g status-style 'bg=#1a1a1a'
set -g status-left '#[fg=#ff8700,bold]◆#[fg=#ff5f00]◆#[fg=#ff0087]◆#[fg=#d700af]◆#[fg=#0087ff]◆ #[fg=#ffffff,bold]#{session_name} #[fg=#444444]│ '
set -g status-right '#[fg=#444444]│ #[fg=#ff8700]%H:%M #[fg=#0087ff]%d-%b#[default]'
set -g status-left-length 40
set -g window-status-format '#[fg=#666666] #I:#W '
set -g window-status-current-format '#[fg=#ffffff,bg=#333333,bold] #I:#W '
set -g pane-border-style 'fg=#333333'
set -g pane-active-border-style 'fg=#ff8700'
set -g message-style 'fg=#ffffff,bg=#ff5f00'
EOF

# Reload if tmux is running
tmux source-file ~/.tmux.conf 2>/dev/null || echo "Start tmux to see changes"
# BlackRoad ASCII Road Art - save as /etc/motd or run anytime
cat << 'EOF'
                        ◇
                       /|\
                      / | \
                     /  |  \
                    /   |   \
                   /    |    \
                  /     |     \
    ════════════════════════════════════════
         ◆◆◆  B L A C K R O A D  ◆◆◆
    ════════════════════════════════════════
                  \     |     /
                   \    |    /
                    \   |   /
                     \  |  /
                      \ | /
                       \|/
                        ◇
EOF

# Colorized BlackRoad Road Art - save to ~/blackroad-banner.sh
cat > ~/blackroad-banner.sh << 'EOF'
#!/bin/bash
echo -e ""
echo -e "                        \e[38;5;255m◇\e[0m"
echo -e "                       \e[38;5;208m/\e[38;5;255m|\e[38;5;33m\\\e[0m"
echo -e "                      \e[38;5;208m/ \e[38;5;255m|\e[38;5;33m \\\e[0m"
echo -e "                     \e[38;5;208m/  \e[38;5;255m|\e[38;5;33m  \\\e[0m"
echo -e "                    \e[38;5;202m/   \e[38;5;255m|\e[38;5;33m   \\\e[0m"
echo -e "                   \e[38;5;202m/    \e[38;5;240m|\e[38;5;33m    \\\e[0m"
echo -e "                  \e[38;5;198m/     \e[38;5;240m|\e[38;5;163m     \\\e[0m"
echo -e "    \e[38;5;208m════════════════════════════════════════\e[0m"
echo -e "         \e[38;5;208m◆\e[38;5;202m◆\e[38;5;198m◆\e[0m  \e[38;5;255;1mB L A C K R O A D\e[0m  \e[38;5;198m◆\e[38;5;163m◆\e[38;5;33m◆\e[0m"
echo -e "    \e[38;5;33m════════════════════════════════════════\e[0m"
echo -e "                  \e[38;5;163m\\     \e[38;5;240m|\e[38;5;198m     /\e[0m"
echo -e "                   \e[38;5;33m\\    \e[38;5;240m|\e[38;5;202m    /\e[0m"
echo -e "                    \e[38;5;33m\\   \e[38;5;255m|\e[38;5;202m   /\e[0m"
echo -e "                     \e[38;5;33m\\  \e[38;5;255m|\e[38;5;208m  /\e[0m"
echo -e "                      \e[38;5;33m\\ \e[38;5;255m|\e[38;5;208m /\e[0m"
echo -e "                       \e[38;5;33m\\\e[38;5;255m|\e[38;5;208m/\e[0m"
echo -e "                        \e[38;5;255m◇\e[0m"
echo -e ""
EOF

chmod +x ~/blackroad-banner.sh
# Run it
~/blackroad-banner.sh
# Add to bashrc to show on login
echo '~/blackroad-banner.sh' >> ~/.bashrc
# Install neofetch if needed
apt install -y neofetch
# BlackRoad neofetch config
mkdir -p ~/.config/neofetch
cat > ~/.config/neofetch/config.conf << 'EOF'
print_info() {
    info title
    info underline
    info "OS" distro
    info "Host" model
    info "Kernel" kernel
    info "Uptime" uptime
    info "Packages" packages
    info "Shell" shell
    info "Memory" memory
    info "Disk" disk
    info "CPU" cpu
    info "Local IP" local_ip
    info cols
}

# BlackRoad Colors
colors=(208 202 198 163 33 255)
bold="on"
separator=" ◆ "

# ASCII
ascii_distro="auto"
ascii_colors=(208 202 198 163 33 255)
EOF

# Custom BlackRoad ASCII for neofetch
cat > ~/.config/neofetch/blackroad.txt << 'EOF'
${c1}        ◇
${c1}       /│\
${c2}      / │ \
${c2}     /  │  \
${c3}    /   │   \
${c3}   /    │    \
${c4}  ══════════════
${c6}   BLACKROAD
${c5}  ══════════════
${c4}   \    │    /
${c3}    \   │   /
${c3}     \  │  /
${c2}      \ │ /
${c1}       \│/
${c1}        ◇
EOF

# Run with custom ascii
neofetch --ascii ~/.config/neofetch/blackroad.txt --ascii_colors 208 202 198 163 33 255
# BlackRoad Vim Colorscheme
mkdir -p ~/.vim/colors
cat > ~/.vim/colors/blackroad.vim << 'EOF'
" BlackRoad Colorscheme
" Gradient: 208(orange)→202(red-orange)→198(pink)→163(magenta)→33(blue), 255(white)

set background=dark
hi clear
if exists("syntax_on")
  syntax reset
endif
let g:colors_name = "blackroad"

" UI Elements
hi Normal       ctermfg=255  ctermbg=233  cterm=NONE
hi LineNr       ctermfg=240  ctermbg=NONE cterm=NONE
hi CursorLine   ctermfg=NONE ctermbg=234  cterm=NONE
hi CursorLineNr ctermfg=208  ctermbg=234  cterm=bold
hi Visual       ctermfg=255  ctermbg=238  cterm=NONE
hi StatusLine   ctermfg=255  ctermbg=236  cterm=bold
hi StatusLineNC ctermfg=240  ctermbg=234  cterm=NONE
hi VertSplit    ctermfg=236  ctermbg=236  cterm=NONE
hi Pmenu        ctermfg=255  ctermbg=235  cterm=NONE
hi PmenuSel     ctermfg=233  ctermbg=208  cterm=bold

" Syntax - The Gradient
hi Comment      ctermfg=240  cterm=italic
hi String       ctermfg=33   cterm=NONE
hi Number       ctermfg=198  cterm=NONE
hi Float        ctermfg=198  cterm=NONE
hi Boolean      ctermfg=163  cterm=bold
hi Constant     ctermfg=163  cterm=NONE
hi Identifier   ctermfg=255  cterm=NONE
hi Function     ctermfg=208  cterm=bold
hi Statement    ctermfg=202  cterm=bold
hi Keyword      ctermfg=202  cterm=NONE
hi Conditional  ctermfg=198  cterm=NONE
hi Operator     ctermfg=255  cterm=NONE
hi Type         ctermfg=163  cterm=NONE
hi Special      ctermfg=33   cterm=NONE
hi PreProc      ctermfg=208  cterm=NONE
hi Todo         ctermfg=233  ctermbg=208  cterm=bold
hi Error        ctermfg=255  ctermbg=196  cterm=bold
hi MatchParen   ctermfg=208  ctermbg=238  cterm=bold

" Diff
hi DiffAdd      ctermfg=33   ctermbg=234  cterm=NONE
hi DiffDelete   ctermfg=198  ctermbg=234  cterm=NONE
hi DiffChange   ctermfg=208  ctermbg=234  cterm=NONE

" Search
hi Search       ctermfg=233  ctermbg=208  cterm=bold
hi IncSearch    ctermfg=233  ctermbg=255  cterm=bold
EOF

# Set as default
cat >> ~/.vimrc << 'EOF'
syntax on
set number
set cursorline
colorscheme blackroad
EOF

echo "Vim BlackRoad theme installed!"
vim -c 'echo "◆◆◆ Welcome to the road ◆◆◆"'
█ █ █ ███
█
█ █ █ ███
█████
███
█ █ ███
█ █ █ █████
█
clear
echo -e "\e[38;5;208m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;208m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;202m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;202m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;198m    ◆         ◆    \e[0m"
echo -e "\e[38;5;163m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;163m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;33m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;33m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
clear
echo -e "\e[38;5;208m══════════════════════\e[0m"
echo -e "\e[38;5;208m- - - - - - - - - - - \e[0m"
echo -e "\e[38;5;202m══════════════════════\e[0m"
echo -e "\e[38;5;202m- - - - - - - - - - - \e[0m"
echo -e "\e[38;5;198m══════════════════════\e[0m"
echo -e "\e[38;5;198m- - - - - - - - - - - \e[0m"
echo -e "\e[38;5;163m══════════════════════\e[0m"
echo -e "\e[38;5;163m- - - - - - - - - - - \e[0m"
echo -e "\e[38;5;33m══════════════════════\e[0m"
echo -e "\e[38;5;33m- - - - - - - - - - - \e[0m"
echo -e "\e[38;5;255m══════════════════════\e[0m"
clear
echo -e "\e[38;5;208m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;208m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;202m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;202m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;198m    ◆         ◆    \e[0m"
echo -e "\e[38;5;163m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
echo -e "\e[38;5;163m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;33m◆       ◆ ◆       ◆\e[0m"
echo -e "\e[38;5;33m◆◆◆◆◆◆◆◆◆ ◆◆◆◆◆◆◆◆◆\e[0m"
clear
echo -e "\e[38;5;208m    ┌─────────┐    \e[0m"
echo -e "\e[38;5;208m    │  ◉   ◉  │    \e[0m"
echo -e "\e[38;5;202m    │    ▼    │    \e[0m"
echo -e "\e[38;5;202m    │  └───┘  │    \e[0m"
echo -e "\e[38;5;198m    └────┬────┘    \e[0m"
echo -e "\e[38;5;198m  ┌──────┼──────┐  \e[0m"
echo -e "\e[38;5;163m  │      │      │  \e[0m"
echo -e "\e[38;5;163m──┤   ┌──┴──┐   ├──\e[0m"
echo -e "\e[38;5;33m  │   │     │   │  \e[0m"
echo -e "\e[38;5;33m  └───┘     └───┘  \e[0m"
echo -e "\e[38;5;255m      ◆     ◆      \e[0m"
clear
echo -e "\e[38;5;208m◆ ◇ ● ○ ◉ ◎ ◐ ◑ ◒ ◓\e[0m"
echo -e "\e[38;5;202m■ □ ▪ ▫ ▬ ▭ ▮ ▯ ▰ ▱\e[0m"
echo -e "\e[38;5;198m▲ △ ▴ ▵ ▶ ▷ ▸ ▹ ► ▻\e[0m"
echo -e "\e[38;5;163m▼ ▽ ▾ ▿ ◀ ◁ ◂ ◃ ◄ ◅\e[0m"
echo -e "\e[38;5;33m★ ☆ ✦ ✧ ✶ ✴ ✳ ✲ ✱ ✵\e[0m"
echo -e "\e[38;5;255m█ ▓ ▒ ░ ▄ ▀ ▌ ▐ ▏ ▕\e[0m"
echo -e "\e[38;5;240m─ ━ │ ┃ ┌ ┐ └ ┘ ├ ┤\e[0m"
echo -e "\e[38;5;245m┬ ┴ ┼ ╭ ╮ ╯ ╰ ═ ║ ╔\e[0m"
echo -e "\e[38;5;250m╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬ ⊕ ⊗\e[0m"
echo -e "\e[38;5;232m⬢ ⬡ ⎔ ⏣ ⏢ ◈ ◊ ❖ ⌗ ⌘\e[0m"
clear
echo -e "\e[38;5;208m              ✦  ✦  ✦              \e[0m"
echo -e "\e[38;5;208m         ╔════════════════╗         \e[0m"
echo -e "\e[38;5;208m    ✦    ║  \e[38;5;255m◉  BLACKROAD  ◉\e[38;5;208m  ║    ✦    \e[0m"
echo -e "\e[38;5;202m    ╔════╬════════════════╬════╗    \e[0m"
echo -e "\e[38;5;202m    ║ ▓▓ ║ \e[38;5;240m░░░░░░░░░░░░\e[38;5;202m ║ ▓▓ ║    \e[0m"
echo -e "\e[38;5;198m    ║ ▓▓ ║ \e[38;5;245m◆ ◇ ◆ ◇ ◆ ◇\e[38;5;198m ║ ▓▓ ║    \e[0m"
echo -e "\e[38;5;198m◈───╣ ▓▓ ║ \e[38;5;250m○ ● ○ ● ○ ●\e[38;5;198m ║ ▓▓ ╠───◈\e[0m"
echo -e "\e[38;5;163m    ║ ▓▓ ║ \e[38;5;245m◆ ◇ ◆ ◇ ◆ ◇\e[38;5;163m ║ ▓▓ ║    \e[0m"
echo -e "\e[38;5;163m    ║ ▓▓ ║ \e[38;5;240m░░░░░░░░░░░░\e[38;5;163m ║ ▓▓ ║    \e[0m"
echo -e "\e[38;5;33m    ╚═╦══╬════════════════╬══╦═╝    \e[0m"
echo -e "\e[38;5;33m      ║  ╚══════╦╦╦╦══════╝  ║      \e[0m"
echo -e "\e[38;5;255m    ◐─╨─◑      ║║║║      ◐─╨─◑    \e[0m"
echo -e "\e[38;5;250m               ╠╬╬╣               \e[0m"
echo -e "\e[38;5;245m            ╔══╬╬╬╬══╗            \e[0m"
echo -e "\e[38;5;240m            ║▒▒▒▒▒▒▒▒║            \e[0m"
echo -e "\e[38;5;240m        ════╩════════╩════        \e[0m"
echo -e "\e[38;5;232m       ▼              ▼       \e[0m"
/exit
whoami
hostname -I
ls
whoami
Hostname -I
ollama list
spin() {   local msg="$1";   local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏");   local i=0;   while true; do     printf "\r\033[36m%s %s\033[0m" "${frames[i]}" "$msg";     i=$(( (i + 1) % ${#frames[@]} ));     sleep 0.1;   done; }
spin_ok()  { printf "\r\033[32m🟢 %s\033[0m\n" "$1"; }
spin_err() { printf "\r\033[31m❌ %s\033[0m\n" "$1"; }
spin "Loading model"
ollama
ollama list
ollama run llama3
deploy
whoami
ls
snap trap.sh
snap help
mkdir -p ~/lucidia
cat <<'EOF' > ~/lucidia/color.txt
Color rules for Lucidia:

- Use ANSI 256-color codes when in terminal context.
- Prefer high contrast on dark backgrounds.
- Avoid low-contrast gray-on-black combinations.

Common mappings:
- black:   0
- red:     1
- green:   2
- yellow:  3
- blue:    4
- magenta: 5
- cyan:    6
- white:   7

Bright versions add 8:
- bright red: 9
- bright green: 10
- bright yellow: 11
- bright blue: 12
- bright magenta: 13
- bright cyan: 14
- bright white: 15

When asked for color output:
- Provide ANSI escape sequences.
- Explain minimally.
EOF

cat <<'EOF' > /usr/local/bin/lucidia
#!/bin/bash
ollama run llama3 "$(cat ~/lucidia/color.txt)

User request:
$*"
EOF

chmod +x /usr/local/bin/lucidia
lucidia Explain terminal colors
lucidia Give me a green success message in ANSI
echo -e "\033[32mSUCCESS\033[0m"
cat <<'EOF' >> ~/lucidia/color.txt

Examples:
- Errors should be red.
- Warnings should be yellow.
- Success should be green.
- Informational text should be cyan.
EOF

echo "✅ 🚀 🌈 🧠 🔥 ⚠️ ❌ 🟢 🟡 🔴"
echo "🚀 Lucidia online"
echo "🟢 Success"
echo "⚠️ Warning"
echo "❌ Error"
echo -e "\033[32m🟢 SUCCESS\033[0m"
echo -e "\033[33m⚠️ WARNING\033[0m"
echo -e "\033[31m❌ ERROR\033[0m"
echo -e "\033[36mℹ️ INFO\033[0m"
cat <<'EOF' > ~/emoji.sh
ok()    { echo -e "\033[32m🟢 $*\033[0m"; }
warn()  { echo -e "\033[33m⚠️ $*\033[0m"; }
err()   { echo -e "\033[31m❌ $*\033[0m"; }
info()  { echo -e "\033[36mℹ️ $*\033[0m"; }
fire()  { echo -e "\033[35m🔥 $*\033[0m"; }
EOF

source ~/emoji.sh
ok "Lucidia ready"
warn "Low memory"
err "Process failed"
fire "This slaps"
cat <<'EOF' > ~/lucidia/emoji.txt
Emoji semantics:
- 🟢 success / ready / ok
- 🔴 failure / stopped
- ⚠️ warning
- ❌ error
- 🚀 launch / start
- 🧠 thinking / reasoning
- 🔥 highlight / emphasis
- ℹ️ info

When outputting status:
- Use one emoji at line start
- Do not overuse emojis
EOF

cat <<'EOF' > /usr/local/bin/lucidia
#!/bin/bash
ollama run llama3 "$(cat ~/lucidia/emoji.txt)

User request:
$*"
EOF

chmod +x /usr/local/bin/lucidia
lucidia Print a success message
uname -m
curl -fsSL https://ollama.com/install.sh | sh
ollama --version
systemctl status ollama --no-pager
systemctl enable ollama
systemctl start ollama
ollama pull llama3
ollama run llama3 "Say hello"
echo "alias lucidia='ollama run llama3'" >> ~/.bashrc
source ~/.bashrc
lucidia Print a green success emoji
echo "🎉 Lucidia is online"
echo "🟢 Ready"
echo "⚠️ Warning"
echo "❌ Error"
echo -e "\033[32m🟢 SUCCESS\033[0m"
echo -e "\033[33m⚠️ WARNING\033[0m"
echo -e "\033[31m❌ ERROR\033[0m"
echo -e "\033[35m🎉 PARTY TIME\033[0m"
ok()   { echo -e "\033[32m🟢 $*\033[0m"; }
warn() { echo -e "\033[33m⚠️ $*\033[0m"; }
err()  { echo -e "\033[31m❌ $*\033[0m"; }
yay()  { echo -e "\033[35m🎉 $*\033[0m"; }
ok "System ready"
yay "It worked"
spinner() {   local msg="$1";   local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏");   local i=0;   while true; do     printf "\r\033[36m%s %s\033[0m" "${frames[i]}" "$msg";     i=$(( (i + 1) % ${#frames[@]} ));     sleep 0.1;   done; }
spinner "Lucidia thinking"
cat <<'EOF' > ~/colors.sh
# ===== BlackRoad / Lucidia Color Palette =====
CLR_RESET="\033[0m"

# Core neon colors (ANSI 256)
CLR_ORANGE="\033[38;5;208m"   # #FF9D00
CLR_PINK="\033[38;5;198m"     # #FF0066
CLR_MAGENTA="\033[38;5;201m"  # #D600AA
CLR_PURPLE="\033[38;5;93m"    # #7700FF
CLR_BLUE="\033[38;5;33m"      # #0066FF
CLR_CYAN="\033[38;5;51m"      # accent
CLR_GREEN="\033[38;5;46m"     # success
CLR_RED="\033[38;5;196m"      # error
CLR_YELLOW="\033[38;5;226m"   # warning
EOF

source ~/colors.sh
cat <<'EOF' > ~/emoji-ui.sh
source ~/colors.sh

ok()    { echo -e "${CLR_GREEN}🟢 $*${CLR_RESET}"; }
warn()  { echo -e "${CLR_YELLOW}⚠️  $*${CLR_RESET}"; }
err()   { echo -e "${CLR_RED}❌ $*${CLR_RESET}"; }
info()  { echo -e "${CLR_CYAN}ℹ️  $*${CLR_RESET}"; }
fire()  { echo -e "${CLR_MAGENTA}🔥 $*${CLR_RESET}"; }
launch(){ echo -e "${CLR_ORANGE}🚀 $*${CLR_RESET}"; }
brain() { echo -e "${CLR_PURPLE}🧠 $*${CLR_RESET}"; }
EOF

source ~/emoji-ui.sh
launch "Lucidia booting"
brain "Thinking in color"
ok "System online"
warn "Low power"
err "Process failed"
fire "This is BlackRoad"
spin() {   local msg="$1";   local frames=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏");   local i=0;   while true; do     printf "\r${CLR_BLUE}%s ${CLR_PINK}%s${CLR_RESET}" "${frames[i]}" "$msg";     i=$(( (i + 1) % ${#frames[@]} ));     sleep 0.1;   done; }
spin "Lucidia thinking"
ss -ltnp | grep ':443 ' || true
sudo ufw status 2>/dev/null || true
hostname
curl -sS --max-time 5 http://127.0.0.1:8094/api/health || true; echo
curl -k -sS --max-time 8 https://127.0.0.1/api/health -H 'Host: roundtrip.blackroad.io' || true; echo
sudo caddy validate --config /etc/caddy/Caddyfile 2>/dev/null || true
ss -ltnp | grep ':443 ' || true
sudo sed -n '1,260p' /etc/caddy/Caddyfile
curl -skI --max-time 8 https://git.blackroad.io || true; echo
curl -skI --max-time 8 https://blackroad.io || true; echo
sudo iptables -S 2>/dev/null | sed -n '1,200p'
sudo nft list ruleset 2>/dev/null | sed -n '1,240p'
arp -a
apt install net-tools
arp -a
