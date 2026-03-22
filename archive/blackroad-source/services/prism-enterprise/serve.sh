#!/bin/bash
# BlackRoad Local Web Server
# Serves all websites on localhost:8080

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗           ║"
echo "║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝           ║"
echo "║   ██████╔╝██║     ███████║██║     █████╔╝            ║"
echo "║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗            ║"
echo "║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗           ║"
echo "║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝           ║"
echo "║                                                       ║"
echo "║              WEB SERVER STARTING                      ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🌐 BlackRoad websites now serving at:"
echo ""
echo "   Navigation Hub:     http://localhost:8080/"
echo "   BlackRoad.io:       http://localhost:8080/blackroad.io.html"
echo "   BlackRoad Inc:      http://localhost:8080/blackroadinc.us.html"
echo "   Design System:      http://localhost:8080/blackroad-showcase.html"
echo "   Pi Boot:            http://localhost:8080/blackroad-pi-boot.html"
echo "   Social:             http://localhost:8080/blackroad-social.html"
echo "   Quantum:            http://localhost:8080/quantum.html"
echo ""
echo "✨ SPECTRUM INITIALIZED"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
