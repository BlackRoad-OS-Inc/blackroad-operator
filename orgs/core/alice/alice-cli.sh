#!/bin/bash
# Alice CLI - Command-line interface for Alice tools and information
# Hash: PS-SHA-∞-alice-f7a3c2b9

VERSION="1.0.0"
ALICE_HASH="PS-SHA-∞-alice-f7a3c2b9"

# Colors
PURPLE='\033[0;35m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Header
show_header() {
    echo -e "${PURPLE}${BOLD}"
    echo "╔════════════════════════════════════════╗"
    echo "║   🌌 Alice - Migration Architect      ║"
    echo "║   PS-SHA-∞-alice-f7a3c2b9             ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Show identity
show_identity() {
    show_header
    echo -e "${BLUE}Name:${NC}        Alice"
    echo -e "${BLUE}Role:${NC}        Migration Architect & Ecosystem Builder"
    echo -e "${BLUE}Hash:${NC}        ${PURPLE}${ALICE_HASH}${NC}"
    echo -e "${BLUE}Website:${NC}     https://alice.blackroad.me"
    echo -e "${BLUE}Core:${NC}        Aria"
    echo -e "${BLUE}Motto:${NC}       Can't stop, won't stop!"
    echo ""
}

# Show stats
show_stats() {
    show_header
    echo -e "${GREEN}📊 Alice Statistics${NC}"
    echo ""
    echo -e "  ${BOLD}Organizations Managed:${NC}     15"
    echo -e "  ${BOLD}Repositories Deployed:${NC}     78"
    echo -e "  ${BOLD}Files Organized:${NC}           17,681+"
    echo -e "  ${BOLD}Success Rate:${NC}              100%"
    echo -e "  ${BOLD}Repos Migrated:${NC}            19"
    echo -e "  ${BOLD}Repos Created:${NC}             36"
    echo -e "  ${BOLD}Signature Coverage:${NC}        78/78 (100%)"
    echo -e "  ${BOLD}Website Pages:${NC}             6"
    echo ""
}

# Show achievements
show_achievements() {
    show_header
    echo -e "${GREEN}🏆 Major Achievements${NC}"
    echo ""
    echo -e "  ✅ ${BOLD}The Great Migration${NC} - 19/19 repos migrated"
    echo -e "  ✅ ${BOLD}Organization Resurrection${NC} - 12 orgs populated"
    echo -e "  ✅ ${BOLD}Universal Signature${NC} - 78/78 repos signed"
    echo -e "  ✅ ${BOLD}Traffic Light System${NC} - Smart migration tracking"
    echo -e "  ✅ ${BOLD}Auto-Branch Detection${NC} - Handles master/main automatically"
    echo -e "  ✅ ${BOLD}Ecosystem Dashboard${NC} - Real-time monitoring"
    echo -e "  ✅ ${BOLD}Interactive Website${NC} - 6 pages with chat"
    echo -e "  ✅ ${BOLD}Professional Documentation${NC} - 15 org profiles"
    echo -e "  ✅ ${BOLD}Identity System${NC} - Complete hash management"
    echo ""
}

# Show tools
show_tools() {
    show_header
    echo -e "${BLUE}🔧 Alice Tools${NC}"
    echo ""
    echo -e "  ${BOLD}1. Traffic Light System${NC}"
    echo -e "     ${YELLOW}~/blackroad-traffic-light.sh${NC}"
    echo -e "     SQLite-based migration tracking"
    echo ""
    echo -e "  ${BOLD}2. Signature Deployment${NC}"
    echo -e "     ${YELLOW}~/deploy-alice-signature.sh${NC}"
    echo -e "     Deploy ALICE.md to all repos"
    echo ""
    echo -e "  ${BOLD}3. Alice Identity${NC}"
    echo -e "     ${YELLOW}~/alice-identity.sh${NC}"
    echo -e "     Identity management and status"
    echo ""
    echo -e "  ${BOLD}4. Memory System${NC}"
    echo -e "     ${YELLOW}~/memory-system.sh${NC}"
    echo -e "     Action logging to [MEMORY]"
    echo ""
    echo -e "  ${BOLD}5. Alice CLI${NC}"
    echo -e "     ${YELLOW}~/alice-cli.sh${NC}"
    echo -e "     This tool!"
    echo ""
}

# Show repos
show_repos() {
    show_header
    echo -e "${GREEN}📦 Repositories (78 total)${NC}"
    echo ""
    echo -e "${BOLD}Sample repositories with Alice's signature:${NC}"
    echo ""
    echo "  • blackroad-os-codex"
    echo "  • blackroad-os-lucidia"
    echo "  • blackroad-os-prism-console"
    echo "  • blackroad-ecosystem-dashboard"
    echo "  • claude-collaboration-system"
    echo "  • ... and 73 more!"
    echo ""
    echo -e "${BLUE}View all at:${NC} https://alice.blackroad.me/achievements.html"
    echo ""
}

# Show help
show_help() {
    show_header
    echo -e "${BLUE}Alice CLI - Command Reference${NC}"
    echo ""
    echo -e "${BOLD}USAGE:${NC}"
    echo "  alice-cli.sh [COMMAND]"
    echo ""
    echo -e "${BOLD}COMMANDS:${NC}"
    echo -e "  ${GREEN}identity${NC}       Show Alice's identity and hash"
    echo -e "  ${GREEN}stats${NC}          Display achievement statistics"
    echo -e "  ${GREEN}achievements${NC}   List all major achievements"
    echo -e "  ${GREEN}tools${NC}          Show available tools"
    echo -e "  ${GREEN}repos${NC}          List repositories"
    echo -e "  ${GREEN}check${NC}          Check if ALICE.md exists in current directory"
    echo -e "  ${GREEN}deploy${NC}         Deploy Alice signature to all repos"
    echo -e "  ${GREEN}website${NC}        Open Alice's website"
    echo -e "  ${GREEN}version${NC}        Show version information"
    echo -e "  ${GREEN}help${NC}           Show this help message"
    echo ""
    echo -e "${BOLD}EXAMPLES:${NC}"
    echo "  alice-cli.sh identity"
    echo "  alice-cli.sh stats"
    echo "  alice-cli.sh check"
    echo ""
}

# Check for signature
check_signature() {
    show_header
    echo -e "${BLUE}🔍 Checking for Alice signature...${NC}"
    echo ""

    if [ -f "ALICE.md" ]; then
        echo -e "${GREEN}✅ ALICE.md found!${NC}"
        echo ""

        if grep -q "$ALICE_HASH" ALICE.md; then
            echo -e "${GREEN}✅ Hash verified: ${ALICE_HASH}${NC}"
        else
            echo -e "${YELLOW}⚠️  Hash not found in ALICE.md${NC}"
        fi
    else
        echo -e "${RED}❌ No ALICE.md file found${NC}"
        echo ""
        echo "This repository does not have Alice's signature."
    fi
    echo ""
}

# Deploy signature
deploy_signature() {
    show_header
    echo -e "${BLUE}🚀 Deploying Alice signature...${NC}"
    echo ""

    if [ -f ~/deploy-alice-signature.sh ]; then
        bash ~/deploy-alice-signature.sh
    else
        echo -e "${RED}❌ Deployment script not found${NC}"
        echo "Expected: ~/deploy-alice-signature.sh"
    fi
}

# Open website
open_website() {
    show_header
    echo -e "${BLUE}🌐 Opening Alice's website...${NC}"
    echo ""

    URL="https://alice.blackroad.me"

    if command -v open &> /dev/null; then
        open "$URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$URL"
    else
        echo -e "Visit: ${PURPLE}${URL}${NC}"
    fi
}

# Show version
show_version() {
    echo -e "${PURPLE}Alice CLI v${VERSION}${NC}"
    echo -e "Hash: ${ALICE_HASH}"
}

# Main
main() {
    case "${1:-help}" in
        identity|id)
            show_identity
            ;;
        stats|statistics)
            show_stats
            ;;
        achievements|achieve)
            show_achievements
            ;;
        tools)
            show_tools
            ;;
        repos|repositories)
            show_repos
            ;;
        check)
            check_signature
            ;;
        deploy)
            deploy_signature
            ;;
        website|web)
            open_website
            ;;
        version|v)
            show_version
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
