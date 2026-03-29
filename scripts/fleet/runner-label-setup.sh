#!/bin/bash
# runner-label-setup.sh — Configure enterprise runner labels for device-targeted workflows
# Maps each self-hosted runner to its physical device with proper labels
# Usage: ./runner-label-setup.sh [--apply] [--generate-keys] [--verify]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

ENTERPRISE="blackroad-os"

# Device → Runner mapping
declare -A RUNNERS=(
  ["alice"]="alice-pi"
  ["cecilia"]="cecilia-pi"
  ["octavia"]="octavia-pi"
  ["aria"]="aria-pi"
  ["lucidia"]="lucidia-pi"
  ["gematria"]="gematria"
  ["anastasia"]="anastasia"
)

# Device → SSH connection
declare -A SSH_TARGETS=(
  ["alice"]="pi@192.168.4.49"
  ["cecilia"]="blackroad@192.168.4.96"
  ["octavia"]="pi@192.168.4.101"
  ["aria"]="blackroad@192.168.4.98"
  ["lucidia"]="blackroad@192.168.4.38"
  ["gematria"]="root@gematria"
  ["anastasia"]="root@anastasia"
)

# Device → Labels to apply
declare -A LABELS=(
  ["alice"]="self-hosted,linux,ARM64,pi,alice,gateway,nginx,dns"
  ["cecilia"]="self-hosted,linux,ARM64,pi,cecilia,inference,ollama,hailo"
  ["octavia"]="self-hosted,linux,ARM64,pi,octavia,gitea,docker,nats,hailo"
  ["aria"]="self-hosted,linux,ARM64,pi,aria,monitoring,tunnels"
  ["lucidia"]="self-hosted,linux,ARM64,pi,lucidia,apps,ollama,runner"
  ["gematria"]="self-hosted,linux,X64,droplet,gematria,edge,caddy,dns"
  ["anastasia"]="self-hosted,linux,X64,droplet,anastasia,backup,edge"
)

# Bot identities for @mention routing
declare -A BOT_EMAILS=(
  ["alice"]="alice@blackroad.io"
  ["cecilia"]="cecilia@blackroad.io"
  ["octavia"]="octavia@blackroad.io"
  ["aria"]="aria@blackroad.io"
  ["lucidia"]="lucidia@blackroad.io"
  ["gematria"]="gematria@blackroad.io"
  ["anastasia"]="anastasia@blackroad.io"
  ["agents"]="agents@blackroad.io"
  ["gaia"]="gaia@blackroad.io"
  ["cadence"]="cadence@blackroad.io"
)

show_status() {
  echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${PINK}║${RESET}  ${CYAN}BlackRoad Fleet Runner Configuration${RESET}                  ${PINK}║${RESET}"
  echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""

  echo -e "${CYAN}Enterprise:${RESET} ${ENTERPRISE}"
  echo -e "${CYAN}Runners:${RESET} ${#RUNNERS[@]}"
  echo ""

  # Get current runner status from API
  echo -e "${AMBER}Current Runner Status:${RESET}"
  echo "────────────────────────────────────────────────────"
  printf "%-15s %-12s %-8s %s\n" "DEVICE" "RUNNER" "STATUS" "LABELS"
  echo "────────────────────────────────────────────────────"

  for device in alice cecilia octavia aria lucidia gematria anastasia; do
    runner="${RUNNERS[$device]}"
    status=$(gh api "/enterprises/${ENTERPRISE}/actions/runners" --paginate -q ".runners[] | select(.name==\"${runner}\") | .status" 2>/dev/null || echo "unknown")
    current_labels=$(gh api "/enterprises/${ENTERPRISE}/actions/runners" --paginate -q ".runners[] | select(.name==\"${runner}\") | [.labels[].name] | join(\",\")" 2>/dev/null || echo "none")

    if [ "$status" = "online" ]; then
      status_icon="${GREEN}online${RESET}"
    else
      status_icon="${RED}${status:-offline}${RESET}"
    fi

    printf "%-15s %-12s " "$device" "$runner"
    echo -e "${status_icon}  ${current_labels}"
  done
  echo ""
}

apply_labels() {
  echo -e "${CYAN}Applying device labels to runners...${RESET}"
  echo ""

  for device in alice cecilia octavia aria lucidia gematria anastasia; do
    runner="${RUNNERS[$device]}"
    target_labels="${LABELS[$device]}"

    echo -e "  ${AMBER}${device}${RESET} (${runner})"

    # Get runner ID
    runner_id=$(gh api "/enterprises/${ENTERPRISE}/actions/runners" --paginate -q ".runners[] | select(.name==\"${runner}\") | .id" 2>/dev/null)

    if [ -z "$runner_id" ]; then
      echo -e "    ${RED}Runner not found — skipping${RESET}"
      continue
    fi

    # Build labels JSON array
    IFS=',' read -ra LABEL_ARRAY <<< "$target_labels"
    labels_json="["
    for i in "${!LABEL_ARRAY[@]}"; do
      if [ $i -gt 0 ]; then labels_json+=","; fi
      labels_json+="{\"name\":\"${LABEL_ARRAY[$i]}\"}"
    done
    labels_json+="]"

    # Apply labels via API
    if gh api -X PUT "/enterprises/${ENTERPRISE}/actions/runners/${runner_id}/labels" \
      --input - <<< "{\"labels\":${labels_json}}" > /dev/null 2>&1; then
      echo -e "    ${GREEN}Labels applied:${RESET} ${target_labels}"
    else
      echo -e "    ${RED}Failed to apply labels${RESET}"
      # Try org-level fallback
      echo -e "    ${AMBER}Trying org-level API...${RESET}"
      for org in BlackRoad-OS-Inc BlackRoad-OS; do
        org_runner_id=$(gh api "/orgs/${org}/actions/runners" --paginate -q ".runners[] | select(.name==\"${runner}\") | .id" 2>/dev/null)
        if [ -n "$org_runner_id" ]; then
          gh api -X PUT "/orgs/${org}/actions/runners/${org_runner_id}/labels" \
            --input - <<< "{\"labels\":${labels_json}}" > /dev/null 2>&1 && \
            echo -e "    ${GREEN}Labels applied via ${org}${RESET}" && break
        fi
      done
    fi
  done
  echo ""
}

generate_keys() {
  echo -e "${CYAN}Generating SSH keys for bot identities...${RESET}"
  echo ""

  KEY_DIR="$HOME/.blackroad/fleet-keys"
  mkdir -p "$KEY_DIR"
  chmod 700 "$KEY_DIR"

  for device in alice cecilia octavia aria lucidia gematria anastasia; do
    key_file="${KEY_DIR}/${device}_ed25519"
    email="${BOT_EMAILS[$device]}"

    if [ -f "$key_file" ]; then
      echo -e "  ${device}: ${AMBER}key exists${RESET} (${key_file})"
    else
      ssh-keygen -t ed25519 -C "${email}" -f "$key_file" -N "" > /dev/null 2>&1
      chmod 600 "$key_file"
      echo -e "  ${device}: ${GREEN}key generated${RESET} (${key_file})"
    fi
  done

  echo ""
  echo -e "${CYAN}Deploying public keys to devices...${RESET}"
  for device in alice octavia aria lucidia; do
    target="${SSH_TARGETS[$device]}"
    key_file="${KEY_DIR}/${device}_ed25519.pub"

    if [ -f "$key_file" ]; then
      if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$target" "echo ok" 2>/dev/null; then
        pub_key=$(cat "$key_file")
        ssh -o ConnectTimeout=5 "$target" "
          grep -qF '${pub_key}' ~/.ssh/authorized_keys 2>/dev/null || echo '${pub_key}' >> ~/.ssh/authorized_keys
        " 2>/dev/null && echo -e "  ${device}: ${GREEN}key deployed${RESET}" || echo -e "  ${device}: ${RED}deploy failed${RESET}"
      else
        echo -e "  ${device}: ${RED}unreachable${RESET}"
      fi
    fi
  done
  echo ""
}

verify() {
  echo -e "${CYAN}Verifying fleet connectivity and git config...${RESET}"
  echo ""

  for device in alice octavia aria lucidia gematria anastasia; do
    target="${SSH_TARGETS[$device]}"
    echo -ne "  ${device} (${target}): "

    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$target" "echo ok" 2>/dev/null; then
      git_ver=$(ssh -o ConnectTimeout=5 "$target" "git --version" 2>/dev/null | awk '{print $3}')
      git_user=$(ssh -o ConnectTimeout=5 "$target" "git config --global user.name" 2>/dev/null || echo "NOT SET")
      git_email=$(ssh -o ConnectTimeout=5 "$target" "git config --global user.email" 2>/dev/null || echo "NOT SET")

      echo -e "${GREEN}UP${RESET} git=${git_ver} user=${git_user} email=${git_email}"

      # Set git identity if not configured
      if [ "$git_user" = "NOT SET" ] || [ "$git_email" = "NOT SET" ]; then
        echo -ne "    Setting git identity... "
        email="${BOT_EMAILS[$device]}"
        ssh -o ConnectTimeout=5 "$target" "
          git config --global user.name 'BlackRoad ${device^}'
          git config --global user.email '${email}'
          git config --global init.defaultBranch main
        " 2>/dev/null && echo -e "${GREEN}done${RESET}" || echo -e "${RED}failed${RESET}"
      fi
    else
      echo -e "${RED}DOWN${RESET}"
    fi
  done
  echo ""
}

case "${1:-status}" in
  --apply)     show_status; apply_labels ;;
  --generate-keys) generate_keys ;;
  --verify)    verify ;;
  --all)       show_status; apply_labels; generate_keys; verify ;;
  status|*)    show_status ;;
esac
