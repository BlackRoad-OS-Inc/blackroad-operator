#!/bin/bash
# BlackRoad Mesh Network Auto-Join
# Automatically connects any device to the BlackRoad mesh network

set -e

VERSION="1.0.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
HEADSCALE_URL="https://headscale.blackroad.io.blackroad.systems"
PRE_AUTH_KEY="237ea39d43b4a69a3c98de277a9494e89567b5a11d60e8f7"

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

detect_os() {
    case "$(uname -s)" in
        Darwin*)    echo "macos";;
        Linux*)     echo "linux";;
        *)          echo "unknown";;
    esac
}

install_tailscale_macos() {
    log_info "Installing Tailscale on macOS..."

    if ! command -v brew &> /dev/null; then
        log_error "Homebrew not found. Install from https://brew.sh first."
        exit 1
    fi

    brew install tailscale
    log_success "Tailscale installed"
}

install_tailscale_linux() {
    log_info "Installing Tailscale on Linux..."

    # Detect Linux distro
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    else
        log_error "Cannot detect Linux distribution"
        exit 1
    fi

    case $DISTRO in
        ubuntu|debian|raspbian)
            curl -fsSL https://tailscale.com/install.sh | sh
            ;;
        fedora|rhel|centos)
            sudo dnf install -y tailscale
            ;;
        arch)
            sudo pacman -S tailscale
            ;;
        *)
            log_error "Unsupported Linux distribution: $DISTRO"
            log_info "Visit https://tailscale.com/download for manual installation"
            exit 1
            ;;
    esac

    log_success "Tailscale installed"
}

start_tailscale_daemon() {
    local os=$1

    log_info "Starting Tailscale daemon..."

    case $os in
        macos)
            # Check if already running
            if ! pgrep -x "tailscaled" > /dev/null; then
                sudo brew services start tailscale
                sleep 5
            fi
            ;;
        linux)
            sudo systemctl enable --now tailscaled
            sleep 2
            ;;
    esac

    log_success "Tailscale daemon started"
}

join_mesh() {
    log_info "Joining BlackRoad mesh network..."
    log_info "Server: $HEADSCALE_URL"

    # Join the network
    sudo tailscale up \
        --login-server="$HEADSCALE_URL" \
        --authkey="$PRE_AUTH_KEY" \
        --accept-routes \
        --accept-dns=false

    log_success "Connected to BlackRoad mesh!"
    echo ""
}

show_status() {
    log_info "Mesh Network Status:"
    echo ""

    # Get mesh IP
    MESH_IP=$(tailscale ip -4 2>/dev/null || echo "N/A")
    MESH_IPV6=$(tailscale ip -6 2>/dev/null || echo "N/A")

    echo "  Mesh IPv4: $MESH_IP"
    echo "  Mesh IPv6: $MESH_IPV6"
    echo ""

    log_info "Connected devices:"
    tailscale status
}

verify_connection() {
    log_info "Verifying mesh connectivity..."

    # Try to ping alice-pi (headscale server)
    if timeout 5 tailscale ping alice-pi &> /dev/null; then
        log_success "Successfully connected to mesh! Can reach alice-pi"
    else
        log_warning "Connected to mesh but cannot reach alice-pi yet (might take a minute)"
    fi
}

main() {
    cat << "EOF"
🛣️ BlackRoad Mesh Network Auto-Join

Connecting you to the BlackRoad mesh network...
All devices will be able to communicate securely via encrypted tunnel.

EOF

    # Detect OS
    OS=$(detect_os)
    log_info "Detected OS: $OS"

    if [ "$OS" = "unknown" ]; then
        log_error "Unsupported operating system"
        exit 1
    fi

    # Check if Tailscale is installed
    if ! command -v tailscale &> /dev/null; then
        log_warning "Tailscale not found. Installing..."

        case $OS in
            macos)
                install_tailscale_macos
                ;;
            linux)
                install_tailscale_linux
                ;;
        esac
    else
        log_success "Tailscale already installed"
    fi

    # Start daemon
    start_tailscale_daemon "$OS"

    # Check if already connected
    if tailscale status &> /dev/null && tailscale status | grep -q "100.64"; then
        log_warning "Already connected to a Tailscale network"
        log_info "Current status:"
        tailscale status
        echo ""
        read -p "Do you want to reconnect to BlackRoad mesh? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Keeping existing connection"
            exit 0
        fi

        log_info "Disconnecting from current network..."
        sudo tailscale down
        sleep 2
    fi

    # Join mesh
    join_mesh

    # Wait a moment for connection to stabilize
    sleep 3

    # Verify
    verify_connection

    # Show status
    echo ""
    show_status

    echo ""
    log_success "🎉 Welcome to the BlackRoad mesh network!"
    echo ""
    echo "You can now:"
    echo "  • SSH to devices using mesh IPs (100.64.x.x)"
    echo "  • Access internal services securely"
    echo "  • Connect from anywhere in the world"
    echo ""
    echo "Useful commands:"
    echo "  tailscale status    - Show connected devices"
    echo "  tailscale ip        - Show your mesh IP"
    echo "  tailscale ping NAME - Ping another device"
    echo ""
}

# Run
main
