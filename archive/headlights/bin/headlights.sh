#!/bin/bash
# Headlights CLI — Sovereign VR device management for Oculus Quest 2
# Usage: headlights.sh <command> [args]
# BlackRoad OS, Inc. — See the Road Ahead.

set -e

# BlackRoad color constants
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
WHITE='\033[1;37m'
DIM='\033[2m'
RESET='\033[0m'

SCREENSHOT_DIR="${HOME}/headlights/screenshots"
STREAM_PORT=8100

banner() {
    echo -e "${PINK}"
    echo "  _   _                _ _ _       _     _"
    echo " | | | | ___  __ _  __| | (_) __ _| |__ | |_ ___"
    echo " | |_| |/ _ \\/ _\` |/ _\` | | |/ _\` | '_ \\| __/ __|"
    echo " |  _  |  __/ (_| | (_| | | | (_| | | | | |_\\__ \\"
    echo " |_| |_|\\___|\\__,_|\\__,_|_|_|\\__, |_| |_|\\__|___/"
    echo "                              |___/"
    echo -e "${AMBER}  BlackRoad OS, Inc. — See the Road Ahead.${RESET}"
    echo ""
}

log_info() {
    echo -e "${BLUE}[headlights]${RESET} $1"
}

log_success() {
    echo -e "${GREEN}[headlights]${RESET} $1"
}

log_error() {
    echo -e "${RED}[headlights]${RESET} $1"
}

log_warn() {
    echo -e "${AMBER}[headlights]${RESET} $1"
}

check_adb() {
    if ! command -v adb &>/dev/null; then
        log_error "adb not found. Install Android platform-tools:"
        echo -e "  ${DIM}brew install android-platform-tools${RESET}"
        exit 1
    fi
}

check_device() {
    check_adb
    local devices
    devices=$(adb devices 2>/dev/null | grep -v "List" | grep -v "^$" | wc -l | tr -d ' ')
    if [ "$devices" -eq 0 ]; then
        log_error "No device connected. Connect Quest 2 via USB and enable developer mode."
        exit 1
    fi
}

cmd_status() {
    banner
    check_adb

    local devices
    devices=$(adb devices 2>/dev/null | grep -v "List" | grep -v "^$")

    if [ -z "$devices" ]; then
        log_error "No device connected."
        echo -e "  ${DIM}Connect Quest 2 via USB and enable developer mode.${RESET}"
        return 1
    fi

    log_success "Device connected"
    echo ""

    echo -e "${WHITE}  Device:${RESET}"
    local model
    model=$(adb shell getprop ro.product.model 2>/dev/null || echo "unknown")
    local manufacturer
    manufacturer=$(adb shell getprop ro.product.manufacturer 2>/dev/null || echo "unknown")
    echo -e "    ${PINK}Model:${RESET}        $manufacturer $model"

    local serial
    serial=$(adb get-serialno 2>/dev/null || echo "unknown")
    echo -e "    ${PINK}Serial:${RESET}       $serial"

    echo ""
    echo -e "${WHITE}  Battery:${RESET}"
    local battery_level
    battery_level=$(adb shell dumpsys battery 2>/dev/null | grep "level:" | awk '{print $2}' || echo "?")
    local battery_status
    battery_status=$(adb shell dumpsys battery 2>/dev/null | grep "status:" | awk '{print $2}' || echo "?")
    local battery_temp
    battery_temp=$(adb shell dumpsys battery 2>/dev/null | grep "temperature:" | awk '{print $2}' || echo "?")

    local battery_color="${GREEN}"
    if [ "$battery_level" -lt 20 ] 2>/dev/null; then
        battery_color="${RED}"
    elif [ "$battery_level" -lt 50 ] 2>/dev/null; then
        battery_color="${AMBER}"
    fi

    echo -e "    ${PINK}Level:${RESET}        ${battery_color}${battery_level}%${RESET}"

    local status_text="Unknown"
    case "$battery_status" in
        2) status_text="Charging" ;;
        3) status_text="Discharging" ;;
        4) status_text="Not charging" ;;
        5) status_text="Full" ;;
    esac
    echo -e "    ${PINK}Status:${RESET}       $status_text"

    if [ -n "$battery_temp" ] && [ "$battery_temp" != "?" ]; then
        local temp_c=$((battery_temp / 10))
        echo -e "    ${PINK}Temperature:${RESET}  ${temp_c}C"
    fi

    echo ""
    echo -e "${WHITE}  Storage:${RESET}"
    adb shell df /sdcard 2>/dev/null | tail -1 | awk '{
        total = $2; used = $3; avail = $4;
        printf "    Total:        %.1f GB\n", total/1048576;
        printf "    Used:         %.1f GB\n", used/1048576;
        printf "    Available:    %.1f GB\n", avail/1048576;
    }' || echo "    Could not read storage info"

    echo ""
    echo -e "${WHITE}  Android:${RESET}"
    local android_ver
    android_ver=$(adb shell getprop ro.build.version.release 2>/dev/null || echo "unknown")
    local sdk_ver
    sdk_ver=$(adb shell getprop ro.build.version.sdk 2>/dev/null || echo "unknown")
    echo -e "    ${PINK}Android:${RESET}      $android_ver (SDK $sdk_ver)"

    echo ""
}

cmd_mirror() {
    banner
    check_device

    if ! command -v scrcpy &>/dev/null; then
        log_error "scrcpy not found. Install it:"
        echo -e "  ${DIM}brew install scrcpy${RESET}"
        exit 1
    fi

    log_info "Launching Quest 2 mirror via scrcpy..."
    echo -e "  ${DIM}Press Ctrl+C to stop${RESET}"
    echo ""
    scrcpy --crop 1832:1920:0:0 --max-fps 60 --bit-rate 8M --window-title "Headlights -- Quest 2 Mirror"
}

cmd_install() {
    banner
    check_device

    local apk_path="$1"
    if [ -z "$apk_path" ]; then
        log_error "Usage: headlights install <path-to-apk>"
        exit 1
    fi

    if [ ! -f "$apk_path" ]; then
        log_error "APK not found: $apk_path"
        exit 1
    fi

    log_info "Sideloading APK: $(basename "$apk_path")"
    adb install -r "$apk_path"
    log_success "Installed: $(basename "$apk_path")"
}

cmd_screenshot() {
    banner
    check_device

    mkdir -p "$SCREENSHOT_DIR"

    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    local remote_path="/sdcard/headlights-${timestamp}.png"
    local local_path="${SCREENSHOT_DIR}/headlights-${timestamp}.png"

    log_info "Capturing screenshot..."
    adb shell screencap -p "$remote_path"
    adb pull "$remote_path" "$local_path"
    adb shell rm "$remote_path"

    log_success "Screenshot saved: $local_path"
    echo -e "  ${DIM}Open: open \"$local_path\"${RESET}"
}

cmd_info() {
    banner
    check_device

    echo -e "${WHITE}  Full Device Info${RESET}"
    echo -e "${DIM}  ----------------------------------------${RESET}"

    echo ""
    echo -e "${PINK}  Hardware${RESET}"
    echo -e "    Model:         $(adb shell getprop ro.product.model 2>/dev/null)"
    echo -e "    Manufacturer:  $(adb shell getprop ro.product.manufacturer 2>/dev/null)"
    echo -e "    Board:         $(adb shell getprop ro.product.board 2>/dev/null)"
    echo -e "    Platform:      $(adb shell getprop ro.board.platform 2>/dev/null)"
    echo -e "    CPU ABI:       $(adb shell getprop ro.product.cpu.abi 2>/dev/null)"
    echo -e "    Serial:        $(adb get-serialno 2>/dev/null)"

    echo ""
    echo -e "${PINK}  Software${RESET}"
    echo -e "    Android:       $(adb shell getprop ro.build.version.release 2>/dev/null)"
    echo -e "    SDK:           $(adb shell getprop ro.build.version.sdk 2>/dev/null)"
    echo -e "    Build:         $(adb shell getprop ro.build.display.id 2>/dev/null)"
    echo -e "    Security:      $(adb shell getprop ro.build.version.security_patch 2>/dev/null)"

    echo ""
    echo -e "${PINK}  Display${RESET}"
    echo -e "    Resolution:    $(adb shell wm size 2>/dev/null | awk '{print $NF}')"
    echo -e "    Density:       $(adb shell wm density 2>/dev/null | awk '{print $NF}')"

    echo ""
    echo -e "${PINK}  Memory${RESET}"
    adb shell cat /proc/meminfo 2>/dev/null | head -3 | while read -r line; do
        echo -e "    $line"
    done

    echo ""
    echo -e "${PINK}  Network${RESET}"
    echo -e "    WiFi IP:       $(adb shell ip route 2>/dev/null | grep "src" | head -1 | awk '{print $NF}')"
    echo -e "    WiFi SSID:     $(adb shell dumpsys wifi 2>/dev/null | grep "mWifiInfo" | head -1 | sed 's/.*SSID: //' | sed 's/,.*//')"

    echo ""
    echo -e "${PINK}  Installed VR Apps${RESET}"
    adb shell pm list packages 2>/dev/null | grep -i "oculus\|meta\|quest\|vr" | sed 's/package:/    /' | sort

    echo ""
}

cmd_stream() {
    banner
    check_device

    if ! command -v scrcpy &>/dev/null; then
        log_error "scrcpy not found. Install it:"
        echo -e "  ${DIM}brew install scrcpy${RESET}"
        exit 1
    fi

    log_info "Starting Quest 2 stream on http://localhost:${STREAM_PORT}"
    echo -e "  ${DIM}Dashboard will show the stream preview${RESET}"
    echo -e "  ${DIM}Press Ctrl+C to stop${RESET}"
    echo ""

    # Start scrcpy recording to a v4l2 sink or use --record for file-based streaming
    # For now, start scrcpy with recording and serve the dashboard
    local record_file="${HOME}/headlights/stream-latest.mp4"
    scrcpy --record "$record_file" --max-fps 30 --bit-rate 4M --window-title "Headlights -- Quest 2 Stream" &
    SCRCPY_PID=$!

    log_info "scrcpy recording to: $record_file (PID: $SCRCPY_PID)"
    log_info "Open dashboard at: http://localhost:${STREAM_PORT}/dashboard.html"

    # Wait for scrcpy to finish
    wait $SCRCPY_PID 2>/dev/null || true
    log_info "Stream ended."
}

cmd_help() {
    banner
    echo -e "${WHITE}  Commands:${RESET}"
    echo ""
    echo -e "    ${PINK}status${RESET}             Check device connection, battery, model"
    echo -e "    ${PINK}mirror${RESET}             Launch scrcpy to mirror the Quest screen"
    echo -e "    ${PINK}install${RESET} ${DIM}<apk>${RESET}      Sideload an APK to the Quest"
    echo -e "    ${PINK}screenshot${RESET}         Capture and pull a screenshot"
    echo -e "    ${PINK}info${RESET}               Full device info dump"
    echo -e "    ${PINK}stream${RESET}             Start streaming view to local web server"
    echo -e "    ${PINK}help${RESET}               Show this help message"
    echo ""
}

# Main dispatch
case "${1:-help}" in
    status)     cmd_status ;;
    mirror)     cmd_mirror ;;
    install)    cmd_install "$2" ;;
    screenshot) cmd_screenshot ;;
    info)       cmd_info ;;
    stream)     cmd_stream ;;
    help|--help|-h) cmd_help ;;
    *)
        log_error "Unknown command: $1"
        cmd_help
        exit 1
        ;;
esac
