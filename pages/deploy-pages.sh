#!/usr/bin/env bash
set -euo pipefail

# BlackRoad GitHub Pages Operator
# Deploys GitHub Pages sites to all 16 organizations from blackroad-operator
#
# Usage:
#   ./deploy-pages.sh list              # List all org pages
#   ./deploy-pages.sh status            # Check Pages status across orgs
#   ./deploy-pages.sh deploy <org>      # Deploy a single org's pages
#   ./deploy-pages.sh deploy-all        # Deploy all org pages
#   ./deploy-pages.sh init <org>        # Initialize .github.io repo for org
#   ./deploy-pages.sh init-all          # Initialize all .github.io repos

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; PINK='\033[38;5;205m'; NC='\033[0m'

PAGES_DIR="$(cd "$(dirname "$0")" && pwd)"
SHARED_DIR="${PAGES_DIR}/_shared"

# All organizations and their GitHub org names
declare -A ORGS=(
  ["blackroad-os-inc"]="BlackRoad-OS-Inc"
  ["blackroad-os"]="BlackRoad-OS"
  ["blackroad-ai"]="BlackRoad-AI"
  ["blackroad-cloud"]="BlackRoad-Cloud"
  ["blackroad-security"]="BlackRoad-Security"
  ["blackroad-labs"]="BlackRoad-Labs"
  ["blackroad-media"]="BlackRoad-Media"
  ["blackroad-foundation"]="BlackRoad-Foundation"
  ["blackroad-hardware"]="BlackRoad-Hardware"
  ["blackroad-studio"]="BlackRoad-Studio"
  ["blackroad-education"]="BlackRoad-Education"
  ["blackroad-interactive"]="BlackRoad-Interactive"
  ["blackroad-ventures"]="BlackRoad-Ventures"
  ["blackroad-gov"]="BlackRoad-Gov"
  ["blackbox-enterprises"]="Blackbox-Enterprises"
  ["blackroad-archive"]="BlackRoad-Archive"
)

log()   { echo -e "${GREEN}+${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
error() { echo -e "${RED}x${NC} $1" >&2; }
info()  { echo -e "${CYAN}>${NC} $1"; }
pink()  { echo -e "${PINK}*${NC} $1"; }

banner() {
  echo ""
  echo -e "${PINK}  ____  _            _    ____                 _ ${NC}"
  echo -e "${PINK} | __ )| | __ _  ___| | _|  _ \\ ___  __ _  __| |${NC}"
  echo -e "${PINK} |  _ \\| |/ _\` |/ __| |/ / |_) / _ \\/ _\` |/ _\` |${NC}"
  echo -e "${PINK} | |_) | | (_| | (__|   <|  _ < (_) | (_| | (_| |${NC}"
  echo -e "${PINK} |____/|_|\\__,_|\\___|_|\\_\\_| \\_\\___/ \\__,_|\\__,_|${NC}"
  echo -e "${CYAN}  GitHub Pages Operator${NC}"
  echo ""
}

# List all organizations and their page directories
cmd_list() {
  banner
  echo -e "${CYAN}Organization Pages (${#ORGS[@]} total):${NC}"
  echo ""
  printf "  ${PINK}%-30s${NC} %-25s %s\n" "Directory" "GitHub Org" "Pages URL"
  echo "  $(printf '%.0s-' {1..85})"

  for dir in $(echo "${!ORGS[@]}" | tr ' ' '\n' | sort); do
    github_org="${ORGS[$dir]}"
    pages_url="${github_org,,}.github.io"
    has_page=" "
    if [ -f "${PAGES_DIR}/${dir}/index.html" ]; then
      has_page="${GREEN}+${NC}"
    else
      has_page="${RED}x${NC}"
    fi
    printf "  ${has_page} %-29s %-25s https://%s\n" "$dir" "$github_org" "$pages_url"
  done
  echo ""
  info "Shared design system: ${SHARED_DIR}/design.css"
}

# Check GitHub Pages status for all orgs
cmd_status() {
  banner
  echo -e "${CYAN}Checking GitHub Pages status...${NC}"
  echo ""

  for dir in $(echo "${!ORGS[@]}" | tr ' ' '\n' | sort); do
    github_org="${ORGS[$dir]}"
    repo="${github_org,,}.github.io"

    # Check if the .github.io repo exists
    if gh repo view "${github_org}/${repo}" &>/dev/null 2>&1; then
      # Check if Pages is enabled
      pages_status=$(gh api "repos/${github_org}/${repo}/pages" --jq '.status' 2>/dev/null || echo "not-found")
      if [ "$pages_status" = "built" ]; then
        log "${github_org}/${repo} — ${GREEN}LIVE${NC}"
      elif [ "$pages_status" = "not-found" ]; then
        warn "${github_org}/${repo} — ${YELLOW}repo exists, Pages not enabled${NC}"
      else
        info "${github_org}/${repo} — status: ${pages_status}"
      fi
    else
      error "${github_org}/${repo} — ${RED}repo not found${NC}"
    fi
  done
}

# Initialize a .github.io repository for an organization
cmd_init() {
  local dir="$1"
  if [ -z "${ORGS[$dir]+x}" ]; then
    error "Unknown org: $dir"
    echo "Valid: ${!ORGS[*]}"
    exit 1
  fi

  local github_org="${ORGS[$dir]}"
  local repo="${github_org,,}.github.io"

  pink "Initializing ${github_org}/${repo}..."

  # Check if repo already exists
  if gh repo view "${github_org}/${repo}" &>/dev/null 2>&1; then
    warn "Repo ${github_org}/${repo} already exists"
  else
    log "Creating ${github_org}/${repo}..."
    gh repo create "${github_org}/${repo}" \
      --public \
      --description "${github_org} — GitHub Pages site" \
      --homepage "https://${repo}" || {
        error "Failed to create repo. Check gh auth and org permissions."
        return 1
      }
  fi

  # Clone, copy pages, push
  local tmp_dir=$(mktemp -d)
  git clone "https://github.com/${github_org}/${repo}.git" "${tmp_dir}/${repo}" 2>/dev/null || {
    cd "${tmp_dir}"
    mkdir "${repo}" && cd "${repo}"
    git init
    git remote add origin "https://github.com/${github_org}/${repo}.git"
  }

  cd "${tmp_dir}/${repo}"

  # Copy the page files
  cp "${PAGES_DIR}/${dir}/index.html" ./index.html
  mkdir -p _shared
  cp "${SHARED_DIR}/design.css" ./_shared/design.css

  # Fix relative paths for standalone deployment
  sed -i 's|href="../_shared/design.css"|href="_shared/design.css"|g' ./index.html
  sed -i "s|href=\"\\.\\./.*/index.html\"|href=\"https://${github_org,,}.github.io\"|g" ./index.html

  # Add CNAME if we have a custom domain mapping
  # (can be configured per-org later)

  git add -A
  git commit -m "Deploy GitHub Pages for ${github_org}" || true
  git branch -M main
  git push -u origin main || {
    error "Failed to push. Check permissions."
    rm -rf "${tmp_dir}"
    return 1
  }

  # Enable GitHub Pages
  gh api "repos/${github_org}/${repo}/pages" \
    --method POST \
    -f "source[branch]=main" \
    -f "source[path]=/" 2>/dev/null || {
      warn "Pages API call failed — may need manual enablement"
    }

  rm -rf "${tmp_dir}"
  log "Deployed: https://${repo}"
}

# Initialize all org repos
cmd_init_all() {
  banner
  pink "Initializing GitHub Pages for all ${#ORGS[@]} organizations..."
  echo ""

  for dir in $(echo "${!ORGS[@]}" | tr ' ' '\n' | sort); do
    cmd_init "$dir"
    echo ""
  done

  log "All organizations initialized!"
}

# Deploy pages to an existing .github.io repo
cmd_deploy() {
  local dir="$1"
  if [ -z "${ORGS[$dir]+x}" ]; then
    error "Unknown org: $dir"
    echo "Valid: ${!ORGS[*]}"
    exit 1
  fi

  local github_org="${ORGS[$dir]}"
  local repo="${github_org,,}.github.io"

  pink "Deploying pages to ${github_org}/${repo}..."

  local tmp_dir=$(mktemp -d)
  git clone "https://github.com/${github_org}/${repo}.git" "${tmp_dir}/${repo}" || {
    error "Failed to clone ${github_org}/${repo}"
    rm -rf "${tmp_dir}"
    return 1
  }

  cd "${tmp_dir}/${repo}"

  # Copy updated files
  cp "${PAGES_DIR}/${dir}/index.html" ./index.html
  mkdir -p _shared
  cp "${SHARED_DIR}/design.css" ./_shared/design.css

  # Fix relative paths
  sed -i 's|href="../_shared/design.css"|href="_shared/design.css"|g' ./index.html
  sed -i "s|href=\"\\.\\./.*/index.html\"|href=\"https://${github_org,,}.github.io\"|g" ./index.html

  if git diff --quiet && git diff --cached --quiet; then
    info "No changes for ${github_org}/${repo}"
  else
    git add -A
    git commit -m "Update GitHub Pages — $(date +%Y-%m-%d)"
    git push origin main
    log "Deployed: https://${repo}"
  fi

  rm -rf "${tmp_dir}"
}

# Deploy all
cmd_deploy_all() {
  banner
  pink "Deploying GitHub Pages to all ${#ORGS[@]} organizations..."
  echo ""

  for dir in $(echo "${!ORGS[@]}" | tr ' ' '\n' | sort); do
    cmd_deploy "$dir"
    echo ""
  done

  log "All deployments complete!"
}

# Help
show_help() {
  banner
  echo "Usage: $0 <command> [args]"
  echo ""
  echo "Commands:"
  echo "  list              List all org pages and their status"
  echo "  status            Check GitHub Pages status across all orgs"
  echo "  deploy <org>      Deploy pages for a single organization"
  echo "  deploy-all        Deploy pages to all organizations"
  echo "  init <org>        Initialize .github.io repo for an org"
  echo "  init-all          Initialize .github.io repos for all orgs"
  echo ""
  echo "Organizations:"
  for dir in $(echo "${!ORGS[@]}" | tr ' ' '\n' | sort); do
    echo "  ${dir} → ${ORGS[$dir]}"
  done
  echo ""
  echo "Examples:"
  echo "  $0 list"
  echo "  $0 deploy blackroad-ai"
  echo "  $0 init-all"
}

# Main router
case "${1:-help}" in
  list)        cmd_list ;;
  status)      cmd_status ;;
  deploy)      cmd_deploy "${2:?Usage: $0 deploy <org-dir>}" ;;
  deploy-all)  cmd_deploy_all ;;
  init)        cmd_init "${2:?Usage: $0 init <org-dir>}" ;;
  init-all)    cmd_init_all ;;
  help|--help|-h) show_help ;;
  *)           error "Unknown command: $1"; show_help; exit 1 ;;
esac
