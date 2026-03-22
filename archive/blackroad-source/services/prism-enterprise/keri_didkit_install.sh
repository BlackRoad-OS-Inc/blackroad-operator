#!/usr/bin/env bash
set -euo pipefail

KERI_VERSION="1.1.17"
KERIA_VERSION="0.1.3"
DIDKIT_VERSION="0.5.0"
INSTALL_PREFIX="/opt/keri"
DIDKIT_TARBALL=""
DIDKIT_SHA256=""
NON_INTERACTIVE=0

usage() {
  cat <<'USAGE'
Usage: keri_didkit_install.sh [options]

Options:
  --keri-version <version>      Pin the keri python package version (default: ${KERI_VERSION})
  --keria-version <version>     Pin the keria python package version (default: ${KERIA_VERSION})
  --didkit-version <version>    Pin the DIDKit release version (default: ${DIDKIT_VERSION})
  --install-prefix <path>       Root directory for the managed installation (default: ${INSTALL_PREFIX})
  --didkit-tarball <path|url>   Provide a local path or URL to a pre-downloaded DIDKit archive
  --didkit-sha256 <hash>        Expected SHA256 for the DIDKit archive (optional integrity check)
  --non-interactive             Skip apt confirmation prompts
  -h, --help                    Show this message and exit
USAGE
}

log() {
  printf '[%s] %s\n' "$(date --iso-8601=seconds)" "$*"
}

fatal() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    fatal "This installer must be run as root"
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --keri-version)
        KERI_VERSION="$2"; shift 2 ;;
      --keria-version)
        KERIA_VERSION="$2"; shift 2 ;;
      --didkit-version)
        DIDKIT_VERSION="$2"; shift 2 ;;
      --install-prefix)
        INSTALL_PREFIX="$2"; shift 2 ;;
      --didkit-tarball)
        DIDKIT_TARBALL="$2"; shift 2 ;;
      --didkit-sha256)
        DIDKIT_SHA256="$2"; shift 2 ;;
      --non-interactive)
        NON_INTERACTIVE=1; shift ;;
      -h|--help)
        usage; exit 0 ;;
      *)
        fatal "Unknown argument: $1" ;;
    esac
  done
}

ensure_packages() {
  local packages=(python3 python3-venv python3-pip git curl jq ca-certificates libsodium23 libsodium-dev pkg-config build-essential libssl-dev libffi-dev unzip)
  if command -v apt-get >/dev/null 2>&1; then
    log "Installing system dependencies via apt-get"
    local apt_flags=(-y)
    if (( NON_INTERACTIVE )); then
      export DEBIAN_FRONTEND=noninteractive
      apt_flags+=(-o Dpkg::Options::=--force-confnew -o Dpkg::Options::=--force-confdef)
    else
      unset DEBIAN_FRONTEND
    fi
    apt-get update
    apt-get install "${apt_flags[@]}" "${packages[@]}"
  else
    fatal "apt-get not found. This installer targets Debian/Ubuntu derived systems such as Raspberry Pi OS and Jetson Linux."
  fi
}

create_system_user() {
  if ! id -u keri >/dev/null 2>&1; then
    log "Creating service account 'keri'"
    useradd --system --home /var/lib/keri --create-home --shell /usr/sbin/nologin keri
  fi
}

setup_directories() {
  install -d -o root -g root -m 0755 "${INSTALL_PREFIX}"
  install -d -o root -g root -m 0755 "${INSTALL_PREFIX}/bin"
  install -d -o keri -g keri -m 0750 /var/lib/keri
  install -d -o keri -g keri -m 0750 /var/lib/keri/logs
  install -d -o keri -g keri -m 0750 /var/lib/keri/tmp
  install -d -o keri -g keri -m 0750 /identity/keri
  install -d -o keri -g keri -m 0750 /identity/vc
  install -d -o keri -g keri -m 0750 /identity/status
  install -d -o root -g root -m 0755 /etc/keri
}

setup_python() {
  if [[ ! -d "${INSTALL_PREFIX}/venv" ]]; then
    log "Creating Python virtual environment"
    python3 -m venv "${INSTALL_PREFIX}/venv"
  fi
  # shellcheck disable=SC1090
  source "${INSTALL_PREFIX}/venv/bin/activate"
  pip install --upgrade pip wheel setuptools
  log "Installing keri==${KERI_VERSION} and keria==${KERIA_VERSION}"
  pip install "keri==${KERI_VERSION}" "keria==${KERIA_VERSION}"
  deactivate
}

install_didkit() {
  local archive="${DIDKIT_TARBALL}"
  if [[ -z "${archive}" ]]; then
    local arch arch_label
    arch=$(uname -m)
    case "${arch}" in
      aarch64|arm64) arch_label="aarch64" ;;
      armv7l|armhf) arch_label="armv7" ;;
      x86_64|amd64) arch_label="x86_64" ;;
      *) fatal "Unsupported architecture ${arch}. Provide --didkit-tarball pointing to a compatible build." ;;
    esac
    archive="https://github.com/spruceid/didkit/releases/download/v${DIDKIT_VERSION}/didkit-v${DIDKIT_VERSION}-linux-${arch_label}.tar.gz"
  fi

  local tmp_archive
  tmp_archive=$(mktemp)
  log "Fetching DIDKit archive"
  if [[ "${archive}" =~ ^https?:// ]]; then
    curl --fail --location --show-error "${archive}" -o "${tmp_archive}"
  else
    cp "${archive}" "${tmp_archive}"
  fi

  if [[ -n "${DIDKIT_SHA256}" ]]; then
    log "Verifying DIDKit archive integrity"
    echo "${DIDKIT_SHA256}  ${tmp_archive}" | sha256sum --check --status || fatal "DIDKit archive failed SHA256 verification"
  fi

  rm -rf "${INSTALL_PREFIX}/didkit"
  install -d -m 0755 "${INSTALL_PREFIX}/didkit"
  tar -xzf "${tmp_archive}" --strip-components=1 -C "${INSTALL_PREFIX}/didkit"
  rm -f "${tmp_archive}"
  install -m 0755 "${INSTALL_PREFIX}/didkit/bin/didkit" "${INSTALL_PREFIX}/bin/didkit"
  ln -sf "${INSTALL_PREFIX}/bin/didkit" /usr/local/bin/didkit
}

write_wrappers() {
  cat <<EOF > "${INSTALL_PREFIX}/bin/kli"
#!/usr/bin/env bash
set -euo pipefail
source "${INSTALL_PREFIX}/venv/bin/activate"
exec "${INSTALL_PREFIX}/venv/bin/kli" "\$@"
EOF
  chmod 0755 "${INSTALL_PREFIX}/bin/kli"
  ln -sf "${INSTALL_PREFIX}/bin/kli" /usr/local/bin/kli

  cat <<EOF > "${INSTALL_PREFIX}/bin/keria"
#!/usr/bin/env bash
set -euo pipefail
source "${INSTALL_PREFIX}/venv/bin/activate"
exec "${INSTALL_PREFIX}/venv/bin/keria" "\$@"
EOF
  chmod 0755 "${INSTALL_PREFIX}/bin/keria"
  ln -sf "${INSTALL_PREFIX}/bin/keria" /usr/local/bin/keria
}

ensure_passcode() {
  local pass_file="/etc/keri/passcode.txt"
  if [[ ! -f "${pass_file}" ]]; then
    umask 077
    openssl rand -hex 16 > "${pass_file}"
    chown root:keri "${pass_file}"
    chmod 0640 "${pass_file}"
    umask 022
  fi
}

write_env_files() {
  ensure_passcode
  if [[ ! -f /etc/keri/keria.env ]]; then
    cat <<'ENV' > /etc/keri/keria.env
KERIA_NAME=field-agent
KERIA_BASE_DIR=/var/lib/keri
KERIA_CONFIG_DIR=/etc/keri
KERIA_ADMIN_PORT=3901
KERIA_HTTP_PORT=3902
KERIA_PASSCODE_FILE=/etc/keri/passcode.txt
KERIA_BOOT_URL=
KERIA_WITNESS_AIDS=
ENV
    chown root:keri /etc/keri/keria.env
    chmod 0640 /etc/keri/keria.env
  fi

  if [[ ! -f /etc/keri/statuslist.env ]]; then
    cat <<'ENV' > /etc/keri/statuslist.env
STATUSLIST_SOURCE=
STATUSLIST_SIGNATURE=
STATUSLIST_DEST=/identity/status/statuslist-2021.json
STATUSLIST_TMPDIR=/var/lib/keri/tmp
ENV
    chown root:keri /etc/keri/statuslist.env
    chmod 0640 /etc/keri/statuslist.env
  fi
}

write_helper_scripts() {
  cat <<EOF > "${INSTALL_PREFIX}/bin/keria-agent.sh"
#!/usr/bin/env bash
set -euo pipefail
# shellcheck disable=SC1091
source "${INSTALL_PREFIX}/venv/bin/activate"
if [[ -f /etc/keri/keria.env ]]; then
  # shellcheck disable=SC1091
  source /etc/keri/keria.env
fi

PASS_ARGS=()
if [[ -n "\${KERIA_PASSCODE:-}" ]]; then
  PASS_ARGS=(--passcode "\${KERIA_PASSCODE}")
elif [[ -n "\${KERIA_PASSCODE_FILE:-}" && -f "\${KERIA_PASSCODE_FILE}" ]]; then
  PASS_ARGS=(--passcode "\$(<"\${KERIA_PASSCODE_FILE}")")
fi

BOOT_ARGS=()
if [[ -n "\${KERIA_BOOT_URL:-}" ]]; then
  BOOT_ARGS=(--boot "\${KERIA_BOOT_URL}")
fi

WITNESS_ARGS=()
if [[ -n "\${KERIA_WITNESS_AIDS:-}" ]]; then
  IFS=',' read -r -a aids <<< "\${KERIA_WITNESS_AIDS}"
  for aid in "\${aids[@]}"; do
    WITNESS_ARGS+=(--witness "\${aid}")
  done
fi

CMD=(
  "${INSTALL_PREFIX}/venv/bin/keria"
  start
  --name "\${KERIA_NAME:-field-agent}"
  --base "\${KERIA_BASE_DIR:-/var/lib/keri}"
  --config-dir "\${KERIA_CONFIG_DIR:-/etc/keri}"
  --admin-http-port "\${KERIA_ADMIN_PORT:-3901}"
  --http "\${KERIA_HTTP_PORT:-3902}"
)
CMD+=("\${PASS_ARGS[@]}")
CMD+=("\${BOOT_ARGS[@]}")
CMD+=("\${WITNESS_ARGS[@]}")
exec "\${CMD[@]}"
EOF
  chmod 0755 "${INSTALL_PREFIX}/bin/keria-agent.sh"

  cat <<'EOF' > "${INSTALL_PREFIX}/bin/statuslist-refresh.sh"
#!/usr/bin/env bash
set -euo pipefail

if [[ -f /etc/keri/statuslist.env ]]; then
  # shellcheck disable=SC1091
  source /etc/keri/statuslist.env
fi

DEST="${STATUSLIST_DEST:-/identity/status/statuslist-2021.json}"
TMPDIR="${STATUSLIST_TMPDIR:-/var/lib/keri/tmp}"
mkdir -p "$(dirname "${DEST}")"
mkdir -p "${TMPDIR}"

if [[ -z "${STATUSLIST_SOURCE:-}" ]]; then
  echo "STATUSLIST_SOURCE not set; skipping refresh" >&2
  exit 0
fi

TMP_FILE="${TMPDIR}/statuslist-$(date +%s).json"
fetch_file() {
  local source="$1"
  local output="$2"
  if [[ "$source" =~ ^https?:// ]]; then
    curl --fail --location --show-error "$source" -o "$output"
  else
    cp "$source" "$output"
  fi
}

fetch_file "${STATUSLIST_SOURCE}" "${TMP_FILE}"

if command -v didkit >/dev/null 2>&1; then
  if ! didkit vc-verify-credential --credential "${TMP_FILE}" >/dev/null; then
    echo "didkit verification failed" >&2
    rm -f "${TMP_FILE}"
    exit 1
  fi
fi

if [[ -n "${STATUSLIST_SIGNATURE:-}" ]]; then
  TMP_SIG="${TMP_FILE}.sig"
  fetch_file "${STATUSLIST_SIGNATURE}" "${TMP_SIG}"
  mv "${TMP_SIG}" "${DEST}.sig"
  chmod 0640 "${DEST}.sig"
fi

mv "${TMP_FILE}" "${DEST}"
chmod 0640 "${DEST}"
chown keri:keri "${DEST}" "${DEST}.sig" 2>/dev/null || true
EOF
  chmod 0755 "${INSTALL_PREFIX}/bin/statuslist-refresh.sh"
}


install_systemd_units() {
  cat <<EOF > /etc/systemd/system/keria-agent.service
[Unit]
Description=KERI Signify agent controller
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=keri
Group=keri
EnvironmentFile=-/etc/keri/keria.env
ExecStart=${INSTALL_PREFIX}/bin/keria-agent.sh
Restart=on-failure
RestartSec=5s
WorkingDirectory=/var/lib/keri
RuntimeDirectory=keria
RuntimeDirectoryMode=0750

[Install]
WantedBy=multi-user.target
EOF

  cat <<EOF > /etc/systemd/system/statuslist-refresh.service
[Unit]
Description=Refresh cached StatusList2021 credential
After=network-online.target

[Service]
Type=oneshot
User=keri
Group=keri
EnvironmentFile=-/etc/keri/statuslist.env
ExecStart=${INSTALL_PREFIX}/bin/statuslist-refresh.sh

[Install]
WantedBy=multi-user.target
EOF

  cat <<'TIMER' > /etc/systemd/system/statuslist-refresh.timer
[Unit]
Description=Periodic StatusList2021 refresh

[Timer]
OnBootSec=10min
OnUnitActiveSec=12h
Persistent=true

[Install]
WantedBy=timers.target
TIMER

  systemctl daemon-reload
  systemctl enable keria-agent.service statuslist-refresh.timer >/dev/null 2>&1 || true
}

print_summary() {
  cat <<SUMMARY
KERI + DIDKit deployment complete.

Key locations:
  * Python virtualenv: ${INSTALL_PREFIX}/venv
  * DIDKit binary:     ${INSTALL_PREFIX}/bin/didkit
  * Agent config:      /etc/keri/keria.env
  * Identity storage:  /identity/keri, /identity/vc, /identity/status

Next steps:
  1. Edit /etc/keri/keria.env to set witness AIDs, boot URL, and other policy knobs.
  2. Update /etc/keri/statuslist.env with the URI or path to your signed StatusList2021 credential.
  3. Start the agent with: systemctl enable --now keria-agent.service
  4. Verify operation: journalctl -u keria-agent.service -f
SUMMARY
}

main() {
  parse_args "$@"
  require_root
  ensure_packages
  create_system_user
  setup_directories
  setup_python
  install_didkit
  write_wrappers
  write_env_files
  write_helper_scripts
  install_systemd_units
  print_summary
}

main "$@"
