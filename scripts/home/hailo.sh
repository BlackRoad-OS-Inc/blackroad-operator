#!/usr/bin/env bash
# BlackRoad Hailo-8 AI Accelerator Manager
# Manage 2x Hailo-8 (52 TOPS total) across Cecilia + Octavia
# Usage: ./hailo.sh [scan|status|benchmark|models|info]
set -eo pipefail

source "$HOME/.blackroad/config/nodes.sh" 2>/dev/null || true

# Hailo nodes
HAILO_NODES=(cecilia octavia)

cmd_scan() {
  printf '%bScanning for Hailo-8 devices across fleet...%b\n\n' "$PINK" "$RESET"
  for node in "${HAILO_NODES[@]}"; do
    local ip="${NODE_IP[$node]:-}"
    local user="${NODE_USER[$node]:-}"
    [[ -z "$ip" ]] && continue

    printf '%b=== %s (%s) ===%b\n' "$BLUE" "$node" "$ip" "$RESET"
    if ! br_ping "$node" 2>/dev/null; then
      printf '  %bOFFLINE%b\n\n' "$RED" "$RESET"
      continue
    fi

    local hailo_info
    hailo_info=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "${user}@${ip}" "
      if [ -e /dev/hailo0 ]; then
        echo 'DEVICE: /dev/hailo0 FOUND'
        hailortcli fw-control identify 2>/dev/null || echo 'hailortcli not available'
      else
        echo 'NO HAILO DEVICE'
      fi
    " 2>/dev/null) || hailo_info="SSH failed"

    if echo "$hailo_info" | grep -q "FOUND"; then
      printf '  %bHailo-8 detected%b (26 TOPS)\n' "$GREEN" "$RESET"
      echo "$hailo_info" | grep -v "DEVICE:" | sed 's/^/  /'
    else
      printf '  %bNo Hailo device%b\n' "$AMBER" "$RESET"
    fi
    echo
  done
}

cmd_status() {
  printf '%b╔══════════════════════════════════════════╗%b\n' "$PINK" "$RESET"
  printf '%b║        Hailo-8 AI Accelerator Status      ║%b\n' "$PINK" "$RESET"
  printf '%b╚══════════════════════════════════════════╝%b\n\n' "$PINK" "$RESET"

  printf '  %bTotal capacity: 52 TOPS (2x Hailo-8 @ 26 TOPS each)%b\n\n' "$GREEN" "$RESET"

  printf '  %-12s %-8s %-24s %-10s\n' "NODE" "STATUS" "SERIAL" "TOPS"
  printf '  %-12s %-8s %-24s %-10s\n' "────" "──────" "──────" "────"

  for node in "${HAILO_NODES[@]}"; do
    local ip="${NODE_IP[$node]:-}"
    local user="${NODE_USER[$node]:-}"
    [[ -z "$ip" ]] && continue

    printf '  %-12s ' "$node"

    if ! br_ping "$node" 2>/dev/null; then
      printf '%b%-8s%b %-24s %-10s\n' "$RED" "OFFLINE" "$RESET" "—" "—"
      continue
    fi

    local serial
    serial=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "${user}@${ip}" \
      "hailortcli fw-control identify 2>/dev/null | grep -i serial | awk '{print \$NF}'" 2>/dev/null)

    if [[ -n "$serial" ]]; then
      printf '%b%-8s%b %-24s %-10s\n' "$GREEN" "ACTIVE" "$RESET" "$serial" "26"
    else
      local has_dev
      has_dev=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "${user}@${ip}" \
        "test -e /dev/hailo0 && echo yes || echo no" 2>/dev/null)
      if [[ "$has_dev" == "yes" ]]; then
        printf '%b%-8s%b %-24s %-10s\n' "$AMBER" "DEVICE" "$RESET" "(no hailortcli)" "26"
      else
        printf '%b%-8s%b %-24s %-10s\n' "$RED" "NONE" "$RESET" "—" "—"
      fi
    fi
  done
  echo
}

cmd_benchmark() {
  local node="${1:-cecilia}"
  local ip="${NODE_IP[$node]:-}"
  local user="${NODE_USER[$node]:-}"

  printf '%bRunning inference benchmark on %s...%b\n\n' "$AMBER" "$node" "$RESET"

  if ! br_ping "$node" 2>/dev/null; then
    printf '%b%s is offline%b\n' "$RED" "$node" "$RESET"
    return 1
  fi

  ssh -o ConnectTimeout=10 -o BatchMode=yes "${user}@${ip}" "
    echo '=== Hailo-8 Benchmark ==='
    echo ''

    # Find a HEF model to benchmark
    HEF=\$(find /usr/share/hailo-models/ /opt/hailo/ ~/hailo-models/ -name '*.hef' 2>/dev/null | head -1)

    if [ -n \"\$HEF\" ]; then
      echo \"Model: \$HEF\"
      echo ''
      hailortcli benchmark --hef \"\$HEF\" 2>/dev/null || echo 'Benchmark failed'
    else
      echo 'No HEF models found for benchmarking'
      echo 'Check: /usr/share/hailo-models/ or ~/hailo-models/'
    fi
  " 2>/dev/null || printf '%bSSH failed to %s%b\n' "$RED" "$node" "$RESET"
}

cmd_models() {
  printf '%bHailo HEF Models:%b\n\n' "$BLUE" "$RESET"
  for node in "${HAILO_NODES[@]}"; do
    local ip="${NODE_IP[$node]:-}"
    local user="${NODE_USER[$node]:-}"
    [[ -z "$ip" ]] && continue

    printf '%b=== %s ===%b\n' "$AMBER" "$node" "$RESET"
    if br_ping "$node" 2>/dev/null; then
      ssh -o ConnectTimeout=5 -o BatchMode=yes "${user}@${ip}" \
        "find /usr/share/hailo-models/ /opt/hailo/ ~/hailo-models/ -name '*.hef' 2>/dev/null | while read f; do echo \"  \$(basename \"\$f\") (\$(du -h \"\$f\" | cut -f1))\"; done" 2>/dev/null || \
        echo "  (no models found)"
    else
      printf '  %boffline%b\n' "$RED" "$RESET"
    fi
    echo
  done
}

cmd_info() {
  local node="${1:-cecilia}"
  local ip="${NODE_IP[$node]:-}"
  local user="${NODE_USER[$node]:-}"

  printf '%bHailo-8 detailed info on %s:%b\n\n' "$BLUE" "$node" "$RESET"

  ssh -o ConnectTimeout=5 -o BatchMode=yes "${user}@${ip}" "
    echo '--- Device ---'
    ls -la /dev/hailo* 2>/dev/null || echo 'No /dev/hailo*'
    echo ''
    echo '--- Firmware ---'
    hailortcli fw-control identify 2>/dev/null || echo 'hailortcli unavailable'
    echo ''
    echo '--- Packages ---'
    dpkg -l 2>/dev/null | grep -i hailo || echo 'No hailo packages'
    echo ''
    echo '--- Power ---'
    vcgencmd get_throttled 2>/dev/null
    vcgencmd measure_volts 2>/dev/null
    vcgencmd measure_temp 2>/dev/null
  " 2>/dev/null || printf '%bFailed to reach %s%b\n' "$RED" "$node" "$RESET"
}

usage() {
  cat <<EOF
${PINK}hailo${RESET} - BlackRoad Hailo-8 AI Accelerator Manager

${BLUE}COMMANDS:${RESET}
  scan                    Scan all nodes for Hailo devices
  status                  Show accelerator status table
  benchmark [node]        Run inference benchmark (default: cecilia)
  models                  List available HEF models
  info [node]             Detailed device info

${AMBER}FLEET:${RESET}
  Cecilia  — Hailo-8 (HLLWM2B233704667) 26 TOPS
  Octavia  — Hailo-8 (HLLWM2B233704606) 26 TOPS
  Total:   52 TOPS
EOF
}

case "${1:-status}" in
  scan)      cmd_scan ;;
  status|s)  cmd_status ;;
  benchmark|bench|b) cmd_benchmark "${2:-cecilia}" ;;
  models|m)  cmd_models ;;
  info|i)    cmd_info "${2:-cecilia}" ;;
  -h|--help|help) usage ;;
  *)         echo "Unknown: $1"; usage; exit 1 ;;
esac
