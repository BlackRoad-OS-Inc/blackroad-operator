#!/bin/bash
# BlackRoad Sovereign DNS Manager
# Manage PowerDNS zones and records across ns1/ns2.blackroad.io from CLI
# Usage: br dns <command> [args]
#
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.

set -e

# ─── BlackRoad Brand Colors ──────────────────────────────────────────────────
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;51m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Infrastructure ──────────────────────────────────────────────────────────
NS1_HOST="root@gematria"         # 159.65.43.12
NS2_HOST="root@anastasia"       # 174.138.44.45
NS1_ADDR="159.65.43.12"
NS2_ADDR="174.138.44.45"
NS1_NAME="ns1.blackroad.io"
NS2_NAME="ns2.blackroad.io"
PDNS_API_PORT="8081"
PDNS_API_URL="http://127.0.0.1:${PDNS_API_PORT}/api/v1/servers/localhost"

GODADDY_CREDS_FILE="$HOME/.blackroad/godaddy-credentials"

# ─── Helpers ──────────────────────────────────────────────────────────────────

log_info()    { printf "  ${BLUE}[info]${RESET}  %s\n" "$*"; }
log_success() { printf "  ${GREEN}[ok]${RESET}    %s\n" "$*"; }
log_warn()    { printf "  ${AMBER}[warn]${RESET}  %s\n" "$*"; }
log_error()   { printf "  ${RED}[err]${RESET}   %s\n" "$*"; }

header() {
    printf "\n"
    printf "  ${PINK}${BOLD}%s${RESET}\n" "$1"
    printf "  ${DIM}%s${RESET}\n\n" "$2"
}

divider() {
    printf "  ${DIM}────────────────────────────────────────────────────────────${RESET}\n"
}

banner() {
    printf "\n"
    printf "  ${PINK}╔══════════════════════════════════════════════════════╗${RESET}\n"
    printf "  ${PINK}║${RESET}  ${BOLD}BlackRoad Sovereign DNS${RESET}                              ${PINK}║${RESET}\n"
    printf "  ${PINK}║${RESET}  ${DIM}PowerDNS on ns1 (Gematria) + ns2 (Anastasia)${RESET}        ${PINK}║${RESET}\n"
    printf "  ${PINK}╚══════════════════════════════════════════════════════╝${RESET}\n"
    printf "\n"
}

# ─── API Key Retrieval ────────────────────────────────────────────────────────
# Fetches the PowerDNS API key from the remote server's pdns.conf
# Caches locally in /tmp for the session to avoid repeated SSH calls

get_api_key() {
    local host="$1"
    local cache_file="/tmp/.br-dns-apikey-$(echo "$host" | tr '@' '_')"

    # Use cached key if fresh (< 1 hour old)
    if [[ -f "$cache_file" ]]; then
        local age
        if [[ "$(uname)" == "Darwin" ]]; then
            age=$(( $(date +%s) - $(stat -f %m "$cache_file") ))
        else
            age=$(( $(date +%s) - $(stat -c %Y "$cache_file") ))
        fi
        if (( age < 3600 )); then
            cat "$cache_file"
            return 0
        fi
    fi

    local key
    key=$(ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$host" \
        "grep -E '^api-key=' /etc/powerdns/pdns.conf 2>/dev/null | cut -d= -f2 | tr -d ' '" 2>/dev/null)

    if [[ -z "$key" ]]; then
        log_error "Failed to retrieve PowerDNS API key from $host"
        log_error "Ensure /etc/powerdns/pdns.conf has api-key= set"
        return 1
    fi

    echo "$key" > "$cache_file"
    chmod 600 "$cache_file"
    echo "$key"
}

# ─── PowerDNS API Calls ──────────────────────────────────────────────────────
# All API calls are tunneled through SSH to the target nameserver

pdns_api() {
    local host="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"

    local api_key
    api_key=$(get_api_key "$host") || return 1

    local curl_cmd="curl -s -X ${method} '${PDNS_API_URL}${endpoint}' -H 'X-API-Key: ${api_key}' -H 'Content-Type: application/json'"

    if [[ -n "$data" ]]; then
        # Escape data for safe SSH transport using base64
        local b64_data
        b64_data=$(echo "$data" | base64)
        curl_cmd="curl -s -X ${method} '${PDNS_API_URL}${endpoint}' -H 'X-API-Key: ${api_key}' -H 'Content-Type: application/json' -d \"\$(echo '${b64_data}' | base64 -d)\""
    fi

    ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$host" "$curl_cmd" 2>/dev/null
}

pdns_ns1() { pdns_api "$NS1_HOST" "$@"; }
pdns_ns2() { pdns_api "$NS2_HOST" "$@"; }

# ─── Ensure zone name has trailing dot ────────────────────────────────────────
normalize_zone() {
    local zone="$1"
    [[ "$zone" != *. ]] && zone="${zone}."
    echo "$zone"
}

# ─── SUBCOMMAND: list ────────────────────────────────────────────────────────
# List all zones and record counts on ns1

cmd_list() {
    banner
    header "DNS Zones" "All zones on ns1 (Gematria)"

    local zones_json
    zones_json=$(pdns_ns1 GET "/zones") || { log_error "Failed to query ns1"; return 1; }

    printf "  ${BOLD}%-35s %8s %10s   %-10s${RESET}\n" "ZONE" "RECORDS" "SERIAL" "KIND"
    divider

    echo "$zones_json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
total_zones = 0
total_records = 0
for z in sorted(data, key=lambda x: x.get('name','')):
    name = z.get('name','').rstrip('.')
    count = z.get('rrsets', z.get('rrset_count', 0))
    if isinstance(count, list):
        count = len(count)
    serial = z.get('serial', z.get('edited_serial', 0))
    kind = z.get('kind', 'Native')
    total_zones += 1
    total_records += int(count) if isinstance(count, int) else 0
    print(f'  \033[38;5;205m{name:<35}\033[0m {count:>8}   {serial:>10}   {kind:<10}')
print()
print(f'  \033[38;5;82mTotal: {total_zones} zones, {total_records} records\033[0m')
" 2>/dev/null || {
        echo "$zones_json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for z in sorted(data, key=lambda x: x.get('name','')):
    name = z.get('name','').rstrip('.')
    kind = z.get('kind', '?')
    print(f'  {name:<35} {kind}')
print(f'\n  Total: {len(data)} zones')
"
    }
    printf "\n"
}

# ─── SUBCOMMAND: records ─────────────────────────────────────────────────────
# List all records for a specific zone

cmd_records() {
    local zone="$1"
    if [[ -z "$zone" ]]; then
        log_error "Usage: br dns records <zone>"
        log_error "Example: br dns records blackroad.io"
        return 1
    fi

    zone=$(normalize_zone "$zone")
    banner
    header "Records for ${zone%.}" "Zone detail from ns1 (Gematria)"

    local zone_json
    zone_json=$(pdns_ns1 GET "/zones/${zone}") || { log_error "Failed to query zone $zone"; return 1; }

    echo "$zone_json" | python3 -c "
import sys, json

data = json.load(sys.stdin)
rrsets = data.get('rrsets', [])

colors = {
    'A':     '\033[38;5;82m',
    'AAAA':  '\033[38;5;51m',
    'CNAME': '\033[38;5;135m',
    'MX':    '\033[38;5;69m',
    'TXT':   '\033[38;5;214m',
    'NS':    '\033[38;5;205m',
    'SOA':   '\033[2m',
    'SRV':   '\033[38;5;69m',
    'CAA':   '\033[38;5;214m',
    'PTR':   '\033[38;5;135m',
}
reset = '\033[0m'
bold = '\033[1m'

print(f'  {bold}{\"TYPE\":<8} {\"NAME\":<40} {\"TTL\":>6}  CONTENT{reset}')
print(f'  \033[2m{\"─\"*78}\033[0m')

count = 0
for rr in sorted(rrsets, key=lambda x: (x.get('type',''), x.get('name',''))):
    rtype = rr.get('type', '?')
    name = rr.get('name', '?').rstrip('.')
    records = rr.get('records', [])
    ttl = rr.get('ttl', 0)
    color = colors.get(rtype, '')
    for rec in records:
        content = rec.get('content', '?')
        disabled = rec.get('disabled', False)
        status = '\033[2m[disabled]\033[0m ' if disabled else ''
        print(f'  {color}{rtype:<8}{reset} {name:<40} {ttl:>6}  {status}{content}')
        count += 1

print(f'\n  \033[38;5;82mTotal: {count} records in {len(rrsets)} rrsets\033[0m')
" 2>/dev/null || {
        log_error "Failed to parse zone data"
        echo "$zone_json" | python3 -m json.tool 2>/dev/null | head -50
    }
    printf "\n"
}

# ─── SUBCOMMAND: add ─────────────────────────────────────────────────────────
# Add a DNS record to a zone

cmd_add() {
    local zone="$1"
    local rtype="$2"
    local name="$3"
    local content="$4"
    shift 4 2>/dev/null || true

    local ttl=3600
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --ttl) ttl="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    if [[ -z "$zone" || -z "$rtype" || -z "$name" || -z "$content" ]]; then
        log_error "Usage: br dns add <zone> <type> <name> <content> [--ttl 3600]"
        log_error "Example: br dns add blackroad.io A app 159.65.43.12"
        log_error "Example: br dns add blackroad.io CNAME www blackroad.io --ttl 300"
        return 1
    fi

    rtype=$(echo "$rtype" | tr '[:lower:]' '[:upper:]')
    zone=$(normalize_zone "$zone")

    # Build the fully qualified domain name
    local fqdn
    if [[ "$name" == "@" || "$name" == "${zone%.}" || "$name" == "$zone" ]]; then
        fqdn="$zone"
    else
        fqdn="${name}.${zone}"
        fqdn=$(echo "$fqdn" | sed 's/\.\././g')
    fi

    # CNAME, MX, NS content needs trailing dot for FQDNs
    if [[ "$rtype" == "CNAME" || "$rtype" == "MX" || "$rtype" == "NS" ]]; then
        [[ "$content" != *. && "$content" == *.* ]] && content="${content}."
    fi

    log_info "Adding ${rtype} record: ${fqdn%.} -> ${content}"

    local payload
    payload=$(python3 -c "
import json
data = {
    'rrsets': [{
        'name': '${fqdn}',
        'type': '${rtype}',
        'ttl': ${ttl},
        'changetype': 'REPLACE',
        'records': [{
            'content': '${content}',
            'disabled': False
        }]
    }]
}
print(json.dumps(data))
")

    local result
    result=$(pdns_ns1 PATCH "/zones/${zone}" "$payload") || {
        log_error "Failed to add record"
        return 1
    }

    if [[ -z "$result" ]]; then
        log_success "Record added: ${rtype} ${fqdn%.} -> ${content} (TTL: ${ttl})"
        log_info "Run 'br dns sync' to replicate to ns2"
    else
        echo "$result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print(f'  \033[38;5;196m[err]\033[0m   {data[\"error\"]}')
    else:
        print(f'  \033[38;5;82m[ok]\033[0m    Record added')
except:
    pass
" 2>/dev/null
    fi
}

# ─── SUBCOMMAND: remove ──────────────────────────────────────────────────────
# Remove a DNS record from a zone

cmd_remove() {
    local zone="$1"
    local rtype="$2"
    local name="$3"

    if [[ -z "$zone" || -z "$rtype" || -z "$name" ]]; then
        log_error "Usage: br dns remove <zone> <type> <name>"
        log_error "Example: br dns remove blackroad.io A app"
        return 1
    fi

    rtype=$(echo "$rtype" | tr '[:lower:]' '[:upper:]')
    zone=$(normalize_zone "$zone")

    local fqdn
    if [[ "$name" == "@" || "$name" == "${zone%.}" ]]; then
        fqdn="$zone"
    else
        fqdn="${name}.${zone}"
        fqdn=$(echo "$fqdn" | sed 's/\.\././g')
    fi

    log_info "Removing ${rtype} record for ${fqdn%.}"

    local payload
    payload=$(python3 -c "
import json
data = {
    'rrsets': [{
        'name': '${fqdn}',
        'type': '${rtype}',
        'changetype': 'DELETE'
    }]
}
print(json.dumps(data))
")

    local result
    result=$(pdns_ns1 PATCH "/zones/${zone}" "$payload") || {
        log_error "Failed to remove record"
        return 1
    }

    if [[ -z "$result" ]]; then
        log_success "Record removed: ${rtype} ${fqdn%.}"
        log_info "Run 'br dns sync' to replicate deletion to ns2"
    else
        echo "$result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print(f'  \033[38;5;196m[err]\033[0m   {data[\"error\"]}')
except:
    pass
" 2>/dev/null
    fi
}

# ─── SUBCOMMAND: sync ────────────────────────────────────────────────────────
# Replicate all zones and records from ns1 to ns2

cmd_sync() {
    banner
    header "DNS Sync" "Replicating ns1 (Gematria) -> ns2 (Anastasia)"

    local zones_json
    zones_json=$(pdns_ns1 GET "/zones") || { log_error "Failed to query ns1"; return 1; }

    local zone_names
    zone_names=$(echo "$zones_json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for z in data:
    print(z.get('name', ''))
" 2>/dev/null)

    if [[ -z "$zone_names" ]]; then
        log_error "No zones found on ns1"
        return 1
    fi

    local total=0
    local synced=0
    local failed=0

    while IFS= read -r zone; do
        [[ -z "$zone" ]] && continue
        total=$((total + 1))
        local zone_display="${zone%.}"

        printf "  ${BLUE}[sync]${RESET}  %-35s " "$zone_display"

        # Get full zone data from ns1
        local zone_data
        zone_data=$(pdns_ns1 GET "/zones/${zone}") || {
            printf "${RED}FAILED (read)${RESET}\n"
            failed=$((failed + 1))
            continue
        }

        # Check if zone exists on ns2
        local ns2_check
        ns2_check=$(pdns_ns2 GET "/zones/${zone}" 2>/dev/null)

        local ns2_has_zone
        ns2_has_zone=$(echo "$ns2_check" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('yes' if 'name' in data else 'no')
except:
    print('no')
" 2>/dev/null)

        if [[ "$ns2_has_zone" != "yes" ]]; then
            # Create zone on ns2 with all records from ns1
            local create_payload
            create_payload=$(echo "$zone_data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
create = {
    'name': data['name'],
    'kind': 'Native',
    'nameservers': [],
    'rrsets': data.get('rrsets', [])
}
for rr in create['rrsets']:
    rr['changetype'] = 'REPLACE'
print(json.dumps(create))
" 2>/dev/null)

            local create_result
            create_result=$(pdns_ns2 POST "/zones" "$create_payload" 2>/dev/null)

            local create_ok
            create_ok=$(echo "$create_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('yes' if 'name' in data else 'no')
except:
    print('no')
" 2>/dev/null)

            if [[ "$create_ok" == "yes" ]]; then
                printf "${GREEN}CREATED${RESET}\n"
                synced=$((synced + 1))
            else
                printf "${RED}FAILED (create)${RESET}\n"
                failed=$((failed + 1))
            fi
        else
            # Zone exists -- patch all rrsets
            local patch_payload
            patch_payload=$(echo "$zone_data" | python3 -c "
import sys, json
data = json.load(sys.stdin)
rrsets = data.get('rrsets', [])
for rr in rrsets:
    rr['changetype'] = 'REPLACE'
patch = {'rrsets': rrsets}
print(json.dumps(patch))
" 2>/dev/null)

            local patch_result
            patch_result=$(pdns_ns2 PATCH "/zones/${zone}" "$patch_payload" 2>/dev/null)

            if [[ -z "$patch_result" ]]; then
                printf "${GREEN}SYNCED${RESET}\n"
                synced=$((synced + 1))
            else
                local has_error
                has_error=$(echo "$patch_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('yes' if 'error' in data else 'no')
except:
    print('no')
" 2>/dev/null)
                if [[ "$has_error" == "yes" ]]; then
                    printf "${RED}FAILED (patch)${RESET}\n"
                    failed=$((failed + 1))
                else
                    printf "${GREEN}SYNCED${RESET}\n"
                    synced=$((synced + 1))
                fi
            fi
        fi
    done <<< "$zone_names"

    printf "\n"
    divider
    printf "  ${BOLD}Sync complete:${RESET} ${GREEN}${synced} synced${RESET}"
    [[ $failed -gt 0 ]] && printf ", ${RED}${failed} failed${RESET}"
    printf " ${DIM}(${total} total zones)${RESET}\n\n"
}

# ─── SUBCOMMAND: check ───────────────────────────────────────────────────────
# Health check both nameservers by comparing dig results

cmd_check() {
    banner
    header "DNS Health Check" "Comparing ns1 and ns2 responses"

    if ! command -v dig &>/dev/null; then
        log_error "'dig' command not found. Install with: brew install bind"
        return 1
    fi

    # Test nameserver reachability
    printf "  ${BOLD}Nameserver Reachability${RESET}\n"
    divider

    for ns_info in "${NS1_ADDR}:${NS1_NAME}" "${NS2_ADDR}:${NS2_NAME}"; do
        local addr="${ns_info%%:*}"
        local name="${ns_info##*:}"

        printf "  %-30s " "$name ($addr)"

        local dig_result
        dig_result=$(dig @"$addr" +short +time=3 +tries=1 SOA blackroad.io 2>/dev/null)

        if [[ -n "$dig_result" ]]; then
            printf "${GREEN}ONLINE${RESET}\n"
        else
            printf "${RED}UNREACHABLE${RESET}\n"
        fi
    done

    printf "\n"

    # Test resolution consistency across zones
    printf "  ${BOLD}Resolution Consistency${RESET}\n"
    divider

    # Get zone list from ns1 for comprehensive testing
    local test_zones
    test_zones=$(pdns_ns1 GET "/zones" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for z in sorted(data, key=lambda x: x.get('name',''))[:20]:
        name = z.get('name','').rstrip('.')
        if name:
            print(name)
except:
    pass
" 2>/dev/null)

    # Fall back to known domains if API is unreachable
    if [[ -z "$test_zones" ]]; then
        test_zones="blackroad.io
blackroad.systems
blackroadai.com"
    fi

    local consistent=0
    local inconsistent=0
    local total_checks=0

    while IFS= read -r domain; do
        [[ -z "$domain" ]] && continue
        for rtype in A NS; do
            total_checks=$((total_checks + 1))
            printf "  %-30s %-6s " "$domain" "$rtype"

            local ns1_result ns2_result
            ns1_result=$(dig @"$NS1_ADDR" +short +time=3 +tries=1 "$rtype" "$domain" 2>/dev/null | sort)
            ns2_result=$(dig @"$NS2_ADDR" +short +time=3 +tries=1 "$rtype" "$domain" 2>/dev/null | sort)

            if [[ -z "$ns1_result" && -z "$ns2_result" ]]; then
                printf "${DIM}no records${RESET}\n"
                consistent=$((consistent + 1))
            elif [[ "$ns1_result" == "$ns2_result" ]]; then
                local preview
                preview=$(echo "$ns1_result" | head -1)
                printf "${GREEN}MATCH${RESET}  ${DIM}%s${RESET}\n" "$preview"
                consistent=$((consistent + 1))
            else
                printf "${RED}MISMATCH${RESET}\n"
                printf "      ${DIM}ns1: %s${RESET}\n" "${ns1_result:-(empty)}"
                printf "      ${DIM}ns2: %s${RESET}\n" "${ns2_result:-(empty)}"
                inconsistent=$((inconsistent + 1))
            fi
        done
    done <<< "$test_zones"

    printf "\n"

    # PowerDNS API health
    printf "  ${BOLD}PowerDNS API Status${RESET}\n"
    divider

    for host_info in "${NS1_HOST}:ns1" "${NS2_HOST}:ns2"; do
        local host="${host_info%%:*}"
        local label="${host_info##*:}"

        printf "  %-10s " "$label"

        local api_result
        api_result=$(pdns_api "$host" GET "" 2>/dev/null)

        if [[ -n "$api_result" ]]; then
            local version
            version=$(echo "$api_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('version', data.get('daemon_type', 'running')))
except:
    print('ok')
" 2>/dev/null)
            printf "${GREEN}API OK${RESET}  ${DIM}(${version})${RESET}\n"
        else
            printf "${RED}API DOWN${RESET}\n"
        fi
    done

    printf "\n"
    divider
    printf "  ${BOLD}Results:${RESET} ${GREEN}${consistent}/${total_checks} consistent${RESET}"
    [[ $inconsistent -gt 0 ]] && printf ", ${RED}${inconsistent} mismatches${RESET}"
    printf "\n"

    if [[ $inconsistent -gt 0 ]]; then
        log_warn "Run 'br dns sync' to fix mismatches"
    fi
    printf "\n"
}

# ─── SUBCOMMAND: export ──────────────────────────────────────────────────────
# Export a zone to BIND format

cmd_export() {
    local zone="$1"
    if [[ -z "$zone" ]]; then
        log_error "Usage: br dns export <zone>"
        log_error "Example: br dns export blackroad.io"
        return 1
    fi

    zone=$(normalize_zone "$zone")

    # PowerDNS has a native zone export endpoint
    local export_result
    export_result=$(pdns_ns1 GET "/zones/${zone}/export") || {
        log_error "Failed to export zone ${zone%.}"
        return 1
    }

    if [[ -n "$export_result" ]]; then
        # Check if response is an error JSON blob
        local is_error
        is_error=$(echo "$export_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('yes' if 'error' in data else 'no')
except:
    print('no')
" 2>/dev/null)

        if [[ "$is_error" == "yes" ]]; then
            log_error "Export failed:"
            echo "$export_result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  {data.get(\"error\", \"unknown error\")}')
" 2>/dev/null
            return 1
        fi

        # Output with BIND header
        printf "; Zone file for %s\n" "${zone%.}"
        printf "; Exported from ns1 (Gematria) at %s\n" "$(date -u '+%Y-%m-%d %H:%M:%S UTC')"
        printf "; BlackRoad Sovereign DNS\n"
        printf ";\n"
        echo "$export_result"

        log_success "Exported ${zone%.} in BIND format" >&2
        log_info "Redirect to file: br dns export ${zone%.} > ${zone%.}.zone" >&2
    else
        log_error "Empty response from ns1"
        return 1
    fi
}

# ─── SUBCOMMAND: import ──────────────────────────────────────────────────────
# Import a BIND zone file

cmd_import() {
    local file="$1"
    if [[ -z "$file" || ! -f "$file" ]]; then
        log_error "Usage: br dns import <file>"
        log_error "Example: br dns import blackroad.io.zone"
        [[ -n "$file" && ! -f "$file" ]] && log_error "File not found: $file"
        return 1
    fi

    banner
    header "Import Zone File" "$file"

    # Parse BIND zone file to extract zone name and records
    local parse_result
    parse_result=$(python3 << PYEOF
import json, sys, re

zone_file = "$file"
records = {}  # (name, type) -> {ttl, records: []}
origin = None
default_ttl = 3600
last_name = None

with open(zone_file) as f:
    for line in f:
        line = line.split(';')[0].strip()  # strip comments
        if not line:
            continue
        if line.startswith('\$ORIGIN'):
            origin = line.split()[-1]
            if not origin.endswith('.'):
                origin += '.'
            continue
        if line.startswith('\$TTL'):
            try:
                default_ttl = int(line.split()[-1])
            except ValueError:
                pass
            continue

        parts = line.split(None, 4)
        if len(parts) < 3:
            continue

        idx = 0

        # Detect name (starts in column 1) or continuation (starts with whitespace)
        if line[0].isspace() or line[0] == '\t':
            name = last_name if last_name else (origin or '.')
        else:
            name = parts[idx]; idx += 1
            last_name = name

        # Check for TTL (numeric)
        ttl = default_ttl
        if idx < len(parts) and parts[idx].isdigit():
            ttl = int(parts[idx]); idx += 1

        # Check for class (IN, CH, HS)
        if idx < len(parts) and parts[idx].upper() in ('IN', 'CH', 'HS'):
            idx += 1

        if idx >= len(parts):
            continue

        rtype = parts[idx].upper(); idx += 1
        if idx >= len(parts):
            continue
        content = ' '.join(parts[idx:])

        # Skip SOA (managed by PowerDNS)
        if rtype == 'SOA':
            continue

        # Expand @ to origin
        if name == '@' and origin:
            name = origin

        # Make relative names absolute
        if origin and not name.endswith('.'):
            name = name + '.' + origin

        key = (name, rtype)
        if key not in records:
            records[key] = {
                'name': name,
                'type': rtype,
                'ttl': ttl,
                'changetype': 'REPLACE',
                'records': []
            }

        records[key]['records'].append({'content': content, 'disabled': False})

result = {
    'origin': origin or '',
    'rrsets': list(records.values()),
    'count': sum(len(r['records']) for r in records.values())
}
print(json.dumps(result))
PYEOF
) || {
        log_error "Failed to parse zone file"
        return 1
    }

    local zone_name
    zone_name=$(echo "$parse_result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('origin', ''))
" 2>/dev/null)

    local record_count
    record_count=$(echo "$parse_result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('count', 0))
" 2>/dev/null)

    local rrsets_json
    rrsets_json=$(echo "$parse_result" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(json.dumps({'rrsets': data.get('rrsets', [])}))
" 2>/dev/null)

    if [[ -z "$zone_name" ]]; then
        log_error "Could not determine zone name from file"
        log_error "Ensure the file has a \$ORIGIN directive or SOA record"
        return 1
    fi

    log_info "Detected zone: ${zone_name%.}"
    log_info "Parsed ${record_count} records"

    # Check if zone exists on ns1
    local zone_check
    zone_check=$(pdns_ns1 GET "/zones/${zone_name}" 2>/dev/null)
    local zone_exists
    zone_exists=$(echo "$zone_check" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('yes' if 'name' in data else 'no')
except:
    print('no')
" 2>/dev/null)

    if [[ "$zone_exists" != "yes" ]]; then
        log_info "Creating zone ${zone_name%.} on ns1"
        local create_payload
        create_payload=$(echo "$rrsets_json" | python3 -c "
import sys, json
rrsets = json.load(sys.stdin)
create = {
    'name': '${zone_name}',
    'kind': 'Native',
    'nameservers': ['ns1.blackroad.io.', 'ns2.blackroad.io.'],
    'rrsets': rrsets.get('rrsets', [])
}
print(json.dumps(create))
" 2>/dev/null)

        local create_result
        create_result=$(pdns_ns1 POST "/zones" "$create_payload") || {
            log_error "Failed to create zone"
            return 1
        }
        log_success "Zone ${zone_name%.} created with ${record_count} records"
    else
        log_info "Updating existing zone ${zone_name%.}"
        local patch_result
        patch_result=$(pdns_ns1 PATCH "/zones/${zone_name}" "$rrsets_json") || {
            log_error "Failed to update zone"
            return 1
        }

        if [[ -z "$patch_result" ]]; then
            log_success "Zone ${zone_name%.} updated with ${record_count} records"
        else
            local has_error
            has_error=$(echo "$patch_result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print(data['error'])
    else:
        print('')
except:
    print('')
" 2>/dev/null)
            if [[ -n "$has_error" ]]; then
                log_error "$has_error"
                return 1
            else
                log_success "Zone ${zone_name%.} updated with ${record_count} records"
            fi
        fi
    fi

    log_info "Run 'br dns sync' to replicate to ns2"
}

# ─── SUBCOMMAND: godaddy-ns ──────────────────────────────────────────────────
# Change a GoDaddy domain's nameservers to ns1/ns2.blackroad.io

cmd_godaddy_ns() {
    local domain="$1"
    if [[ -z "$domain" ]]; then
        log_error "Usage: br dns godaddy-ns <domain>"
        log_error "Example: br dns godaddy-ns blackroad.io"
        return 1
    fi

    banner
    header "GoDaddy NS Update" "Setting nameservers for $domain"

    # Load credentials
    local gd_key gd_secret
    if [[ -f "$GODADDY_CREDS_FILE" ]]; then
        gd_key=$(grep -E '^GODADDY_KEY=' "$GODADDY_CREDS_FILE" 2>/dev/null | cut -d= -f2 | tr -d ' "'"'"'')
        gd_secret=$(grep -E '^GODADDY_SECRET=' "$GODADDY_CREDS_FILE" 2>/dev/null | cut -d= -f2 | tr -d ' "'"'"'')
    fi

    if [[ -z "$gd_key" || -z "$gd_secret" ]]; then
        log_error "GoDaddy API credentials not found"
        printf "\n"
        printf "  ${BOLD}Setup instructions:${RESET}\n\n"
        printf "  ${DIM}1. Go to https://developer.godaddy.com/keys${RESET}\n"
        printf "  ${DIM}2. Create a Production API key${RESET}\n"
        printf "  ${DIM}3. Save credentials:${RESET}\n\n"
        printf "  ${CYAN}mkdir -p ~/.blackroad${RESET}\n"
        printf "  ${CYAN}cat > ~/.blackroad/godaddy-credentials << 'EOF'${RESET}\n"
        printf "  ${CYAN}GODADDY_KEY=your_api_key_here${RESET}\n"
        printf "  ${CYAN}GODADDY_SECRET=your_api_secret_here${RESET}\n"
        printf "  ${CYAN}EOF${RESET}\n"
        printf "  ${CYAN}chmod 600 ~/.blackroad/godaddy-credentials${RESET}\n\n"
        return 1
    fi

    local auth="sso-key ${gd_key}:${gd_secret}"

    # Show current nameservers
    log_info "Current nameservers for $domain:"
    local current_ns
    current_ns=$(curl -s -X GET "https://api.godaddy.com/v1/domains/${domain}" \
        -H "Authorization: ${auth}" \
        -H "Content-Type: application/json" 2>/dev/null)

    echo "$current_ns" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    ns = data.get('nameServers', [])
    for n in ns:
        print(f'    {n}')
    if not ns:
        print('    (none found)')
except Exception as e:
    print(f'    Error reading domain info: {e}')
" 2>/dev/null

    printf "\n"
    log_info "Setting nameservers to: ${NS1_NAME}, ${NS2_NAME}"

    local ns_payload='["ns1.blackroad.io","ns2.blackroad.io"]'

    local result
    result=$(curl -s -w "\n%{http_code}" -X PUT \
        "https://api.godaddy.com/v1/domains/${domain}/nameservers" \
        -H "Authorization: ${auth}" \
        -H "Content-Type: application/json" \
        -d "$ns_payload" 2>/dev/null)

    local http_code
    http_code=$(echo "$result" | tail -1)
    local body
    body=$(echo "$result" | sed '$d')

    if [[ "$http_code" == "200" || "$http_code" == "204" ]]; then
        log_success "Nameservers updated for $domain"
        log_info "  ns1.blackroad.io (${NS1_ADDR})"
        log_info "  ns2.blackroad.io (${NS2_ADDR})"
        log_warn "DNS propagation may take 24-48 hours"
    else
        log_error "GoDaddy API returned HTTP ${http_code}"
        if [[ -n "$body" ]]; then
            echo "$body" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    msg = data.get('message', data.get('error', str(data)))
    print(f'    {msg}')
except:
    for line in sys.stdin:
        print(f'    {line.rstrip()}')
" 2>/dev/null
        fi
    fi
    printf "\n"
}

# ─── SUBCOMMAND: status ──────────────────────────────────────────────────────
# Full status dashboard

cmd_status() {
    banner

    # ── NS1 ──
    printf "  ${BOLD}${PINK}ns1${RESET} ${DIM}(Gematria -- ${NS1_ADDR})${RESET}\n"
    divider

    local ns1_dns="DOWN"
    if dig @"$NS1_ADDR" +short +time=2 +tries=1 SOA blackroad.io &>/dev/null; then
        ns1_dns="UP"
    fi

    local ns1_api="DOWN"
    local ns1_version=""
    local ns1_zone_count=0
    local ns1_zones_json
    ns1_zones_json=$(pdns_ns1 GET "/zones" 2>/dev/null)
    if [[ -n "$ns1_zones_json" ]]; then
        ns1_api="UP"
        ns1_zone_count=$(echo "$ns1_zones_json" | python3 -c "
import sys, json
try: print(len(json.load(sys.stdin)))
except: print(0)
" 2>/dev/null)
        local ns1_config
        ns1_config=$(pdns_ns1 GET "" 2>/dev/null)
        ns1_version=$(echo "$ns1_config" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('version','?'))
except: print('?')
" 2>/dev/null)
    fi

    [[ "$ns1_dns" == "UP" ]] && printf "  DNS:    ${GREEN}ONLINE${RESET}\n" || printf "  DNS:    ${RED}OFFLINE${RESET}\n"
    [[ "$ns1_api" == "UP" ]] && printf "  API:    ${GREEN}ONLINE${RESET} ${DIM}(PowerDNS ${ns1_version})${RESET}\n" || printf "  API:    ${RED}OFFLINE${RESET}\n"
    printf "  Zones:  ${BOLD}${ns1_zone_count}${RESET}\n\n"

    # ── NS2 ──
    printf "  ${BOLD}${VIOLET}ns2${RESET} ${DIM}(Anastasia -- ${NS2_ADDR})${RESET}\n"
    divider

    local ns2_dns="DOWN"
    if dig @"$NS2_ADDR" +short +time=2 +tries=1 SOA blackroad.io &>/dev/null; then
        ns2_dns="UP"
    fi

    local ns2_api="DOWN"
    local ns2_version=""
    local ns2_zone_count=0
    local ns2_zones_json
    ns2_zones_json=$(pdns_ns2 GET "/zones" 2>/dev/null)
    if [[ -n "$ns2_zones_json" ]]; then
        ns2_api="UP"
        ns2_zone_count=$(echo "$ns2_zones_json" | python3 -c "
import sys, json
try: print(len(json.load(sys.stdin)))
except: print(0)
" 2>/dev/null)
        local ns2_config
        ns2_config=$(pdns_ns2 GET "" 2>/dev/null)
        ns2_version=$(echo "$ns2_config" | python3 -c "
import sys, json
try: print(json.load(sys.stdin).get('version','?'))
except: print('?')
" 2>/dev/null)
    fi

    [[ "$ns2_dns" == "UP" ]] && printf "  DNS:    ${GREEN}ONLINE${RESET}\n" || printf "  DNS:    ${RED}OFFLINE${RESET}\n"
    [[ "$ns2_api" == "UP" ]] && printf "  API:    ${GREEN}ONLINE${RESET} ${DIM}(PowerDNS ${ns2_version})${RESET}\n" || printf "  API:    ${RED}OFFLINE${RESET}\n"
    printf "  Zones:  ${BOLD}${ns2_zone_count}${RESET}\n\n"

    # ── Sync status ──
    printf "  ${BOLD}Sync Status${RESET}\n"
    divider

    if [[ "$ns1_zone_count" -eq "$ns2_zone_count" && "$ns1_zone_count" -gt 0 ]]; then
        printf "  ${GREEN}IN SYNC${RESET} -- both nameservers have ${BOLD}${ns1_zone_count}${RESET} zones\n"
    elif [[ "$ns1_zone_count" -gt 0 && "$ns2_zone_count" -gt 0 ]]; then
        printf "  ${AMBER}OUT OF SYNC${RESET} -- ns1: ${ns1_zone_count} zones, ns2: ${ns2_zone_count} zones\n"
        log_warn "Run 'br dns sync' to replicate"
    elif [[ "$ns1_zone_count" -gt 0 ]]; then
        printf "  ${RED}ns2 EMPTY${RESET} -- ns1 has ${ns1_zone_count} zones, ns2 has none\n"
        log_warn "Run 'br dns sync' to replicate"
    else
        printf "  ${DIM}Cannot determine sync status${RESET}\n"
    fi
    printf "\n"

    # ── Quick dig ──
    printf "  ${BOLD}Quick Resolution Test${RESET}\n"
    divider

    local test_domain="blackroad.io"
    local ns1_a ns2_a
    ns1_a=$(dig @"$NS1_ADDR" +short +time=2 +tries=1 A "$test_domain" 2>/dev/null | head -1)
    ns2_a=$(dig @"$NS2_ADDR" +short +time=2 +tries=1 A "$test_domain" 2>/dev/null | head -1)

    printf "  ${test_domain} A:\n"
    printf "    ns1: ${BOLD}%s${RESET}\n" "${ns1_a:-(no response)}"
    printf "    ns2: ${BOLD}%s${RESET}\n" "${ns2_a:-(no response)}"

    if [[ -n "$ns1_a" && "$ns1_a" == "$ns2_a" ]]; then
        printf "    ${GREEN}MATCH${RESET}\n"
    elif [[ -n "$ns1_a" || -n "$ns2_a" ]]; then
        printf "    ${AMBER}MISMATCH${RESET}\n"
    fi
    printf "\n"

    # ── GoDaddy creds ──
    printf "  ${BOLD}GoDaddy API${RESET}\n"
    divider
    if [[ -f "$GODADDY_CREDS_FILE" ]]; then
        printf "  Credentials: ${GREEN}found${RESET} ${DIM}(${GODADDY_CREDS_FILE})${RESET}\n"
    else
        printf "  Credentials: ${AMBER}not configured${RESET} ${DIM}(run 'br dns godaddy-ns' for setup)${RESET}\n"
    fi
    printf "\n"
}

# ─── SUBCOMMAND: help ─────────────────────────────────────────────────────────

cmd_help() {
    banner
    printf "  ${BOLD}Commands:${RESET}\n\n"
    printf "  ${PINK}list${RESET}                                        List all zones and record counts\n"
    printf "  ${PINK}records${RESET} ${DIM}<zone>${RESET}                            List all records for a zone\n"
    printf "  ${PINK}add${RESET} ${DIM}<zone> <type> <name> <content>${RESET}        Add/replace a record ${DIM}[--ttl 3600]${RESET}\n"
    printf "  ${PINK}remove${RESET} ${DIM}<zone> <type> <name>${RESET}               Remove a record\n"
    printf "  ${PINK}sync${RESET}                                        Replicate ns1 -> ns2\n"
    printf "  ${PINK}check${RESET}                                       Health check both nameservers\n"
    printf "  ${PINK}export${RESET} ${DIM}<zone>${RESET}                             Export zone to BIND format\n"
    printf "  ${PINK}import${RESET} ${DIM}<file>${RESET}                             Import BIND zone file\n"
    printf "  ${PINK}godaddy-ns${RESET} ${DIM}<domain>${RESET}                       Point GoDaddy NS to blackroad\n"
    printf "  ${PINK}status${RESET}                                      Full status dashboard\n"
    printf "  ${PINK}help${RESET}                                        Show this help\n"
    printf "\n"
    printf "  ${BOLD}Examples:${RESET}\n\n"
    printf "  ${DIM}br dns list${RESET}\n"
    printf "  ${DIM}br dns records blackroad.io${RESET}\n"
    printf "  ${DIM}br dns add blackroad.io A app 159.65.43.12${RESET}\n"
    printf "  ${DIM}br dns add blackroad.io CNAME www blackroad.io --ttl 300${RESET}\n"
    printf "  ${DIM}br dns add blackroad.io MX @ 'mx.zoho.com' --ttl 3600${RESET}\n"
    printf "  ${DIM}br dns remove blackroad.io A app${RESET}\n"
    printf "  ${DIM}br dns export blackroad.io > blackroad.io.zone${RESET}\n"
    printf "  ${DIM}br dns import blackroad.io.zone${RESET}\n"
    printf "  ${DIM}br dns godaddy-ns blackroad.io${RESET}\n"
    printf "  ${DIM}br dns sync${RESET}\n"
    printf "  ${DIM}br dns check${RESET}\n"
    printf "  ${DIM}br dns status${RESET}\n"
    printf "\n"
    printf "  ${BOLD}Aliases:${RESET} ${DIM}ls=list, rec=records, rm/del=remove, gd=godaddy-ns, st=status${RESET}\n\n"
    printf "  ${BOLD}Infrastructure:${RESET}\n\n"
    printf "  ns1: ${CYAN}Gematria${RESET}   ${DIM}${NS1_ADDR}${RESET}   PowerDNS API :${PDNS_API_PORT}\n"
    printf "  ns2: ${CYAN}Anastasia${RESET}  ${DIM}${NS2_ADDR}${RESET}   PowerDNS API :${PDNS_API_PORT}\n\n"
}

# ─── Main Router ─────────────────────────────────────────────────────────────

main() {
    local cmd="${1:-help}"
    shift 2>/dev/null || true

    case "$cmd" in
        list|ls)        cmd_list "$@" ;;
        records|rec)    cmd_records "$@" ;;
        add)            cmd_add "$@" ;;
        remove|rm|del)  cmd_remove "$@" ;;
        sync)           cmd_sync "$@" ;;
        check)          cmd_check "$@" ;;
        export)         cmd_export "$@" ;;
        import)         cmd_import "$@" ;;
        godaddy-ns|gd)  cmd_godaddy_ns "$@" ;;
        status|st)      cmd_status "$@" ;;
        help|-h|--help) cmd_help ;;
        *)
            log_error "Unknown command: $cmd"
            cmd_help
            return 1
            ;;
    esac
}

main "$@"
