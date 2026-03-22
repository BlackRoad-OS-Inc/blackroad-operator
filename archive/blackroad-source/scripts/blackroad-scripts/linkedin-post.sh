#!/bin/bash
# BlackRoad OS LinkedIn CLI
# Post to BlackRoad OS, Inc. company page from terminal
# Usage: ./linkedin-post.sh "Your post text here"

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ORG_URN="urn:li:organization:111783522"
TOKEN_FILE="${HOME}/.blackroad/linkedin-token"
CONFIG_FILE="${HOME}/.blackroad/linkedin-config"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Load configuration
load_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "Configuration file not found: $CONFIG_FILE"
        log_info "Run: ./linkedin-post.sh setup"
        exit 1
    fi
    source "$CONFIG_FILE"
}

# Load token
load_token() {
    if [[ ! -f "$TOKEN_FILE" ]]; then
        log_error "Access token not found: $TOKEN_FILE"
        log_info "Run: ./linkedin-post.sh auth"
        exit 1
    fi
    ACCESS_TOKEN=$(cat "$TOKEN_FILE")
}

# Setup configuration
setup() {
    log_info "Setting up LinkedIn CLI configuration..."
    
    mkdir -p "${HOME}/.blackroad"
    
    echo -e "${BLUE}Enter your LinkedIn App credentials:${NC}"
    read -p "Client ID: " CLIENT_ID
    read -sp "Client Secret: " CLIENT_SECRET
    echo
    
    cat > "$CONFIG_FILE" << EOF
# BlackRoad OS LinkedIn Configuration
CLIENT_ID="$CLIENT_ID"
CLIENT_SECRET="$CLIENT_SECRET"
REDIRECT_URI="http://localhost:8080"
EOF
    
    chmod 600 "$CONFIG_FILE"
    log_success "Configuration saved to $CONFIG_FILE"
    log_info "Next step: ./linkedin-post.sh auth"
}

# Authenticate and get token
authenticate() {
    load_config
    
    log_info "Opening browser for LinkedIn OAuth..."
    
    AUTH_URL="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=w_organization_social%20r_organization_social"
    
    # Open browser
    if command -v open &> /dev/null; then
        open "$AUTH_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$AUTH_URL"
    else
        echo "$AUTH_URL"
    fi
    
    echo
    log_info "After approving, you'll be redirected to: http://localhost:8080/?code=..."
    read -p "Paste the authorization code: " AUTH_CODE
    
    log_info "Exchanging code for access token..."
    
    RESPONSE=$(curl -s -X POST https://www.linkedin.com/oauth/v2/accessToken \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=authorization_code" \
        -d "code=$AUTH_CODE" \
        -d "redirect_uri=$REDIRECT_URI" \
        -d "client_id=$CLIENT_ID" \
        -d "client_secret=$CLIENT_SECRET")
    
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
    EXPIRES_IN=$(echo "$RESPONSE" | jq -r '.expires_in')
    
    if [[ "$ACCESS_TOKEN" == "null" || -z "$ACCESS_TOKEN" ]]; then
        log_error "Failed to get access token"
        echo "$RESPONSE" | jq .
        exit 1
    fi
    
    echo "$ACCESS_TOKEN" > "$TOKEN_FILE"
    chmod 600 "$TOKEN_FILE"
    
    EXPIRES_DATE=$(date -v+${EXPIRES_IN}S +"%Y-%m-%d %H:%M:%S" 2>/dev/null || date -d "+${EXPIRES_IN} seconds" +"%Y-%m-%d %H:%M:%S")
    
    log_success "Access token saved to $TOKEN_FILE"
    log_info "Token expires: $EXPIRES_DATE (${EXPIRES_IN} seconds)"
    log_info "You can now post: ./linkedin-post.sh \"Your message\""
}

# Verify access
verify() {
    load_config
    load_token
    
    log_info "Verifying organization access..."
    
    RESPONSE=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee)
    
    if echo "$RESPONSE" | jq -e '.elements[] | select(.organization == "'"$ORG_URN"'")' > /dev/null; then
        log_success "Access verified for BlackRoad OS, Inc. ($ORG_URN)"
    else
        log_error "No access to organization"
        echo "$RESPONSE" | jq .
        exit 1
    fi
}

# Post to LinkedIn
post() {
    local TEXT="$1"
    
    load_config
    load_token
    
    log_info "Posting to BlackRoad OS, Inc. LinkedIn page..."
    
    PAYLOAD=$(jq -n --arg text "$TEXT" '{
        author: "urn:li:organization:111783522",
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: $text },
                shareMediaCategory: "NONE"
            }
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }')
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://api.linkedin.com/v2/ugcPosts \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [[ "$HTTP_CODE" == "201" ]]; then
        POST_ID=$(echo "$BODY" | jq -r '.id')
        log_success "Post published successfully!"
        log_info "Post ID: $POST_ID"
    else
        log_error "Failed to post (HTTP $HTTP_CODE)"
        echo "$BODY" | jq .
        exit 1
    fi
}

# Post with media (article link)
post_with_link() {
    local TEXT="$1"
    local LINK_URL="$2"
    
    load_config
    load_token
    
    log_info "Posting with link to BlackRoad OS, Inc. LinkedIn page..."
    
    PAYLOAD=$(jq -n --arg text "$TEXT" --arg url "$LINK_URL" '{
        author: "urn:li:organization:111783522",
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: $text },
                shareMediaCategory: "ARTICLE",
                media: [{
                    status: "READY",
                    originalUrl: $url
                }]
            }
        },
        visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }')
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://api.linkedin.com/v2/ugcPosts \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [[ "$HTTP_CODE" == "201" ]]; then
        POST_ID=$(echo "$BODY" | jq -r '.id')
        log_success "Post with link published successfully!"
        log_info "Post ID: $POST_ID"
    else
        log_error "Failed to post (HTTP $HTTP_CODE)"
        echo "$BODY" | jq .
        exit 1
    fi
}

# Show help
show_help() {
    cat << EOF
${BLUE}BlackRoad OS LinkedIn CLI${NC}

${GREEN}Setup:${NC}
  ./linkedin-post.sh setup          Configure LinkedIn App credentials
  ./linkedin-post.sh auth            Authenticate and get access token
  ./linkedin-post.sh verify          Verify organization access

${GREEN}Posting:${NC}
  ./linkedin-post.sh post "Text"     Post text-only update
  ./linkedin-post.sh link "Text" URL Post with article link

${GREEN}Examples:${NC}
  ./linkedin-post.sh post "BlackRoad OS is now live!"
  ./linkedin-post.sh link "Check out our new docs" "https://blackroad.io/docs"

${GREEN}Files:${NC}
  ~/.blackroad/linkedin-config       App credentials (Client ID/Secret)
  ~/.blackroad/linkedin-token        Access token (expires in 60 days)

${GREEN}API Limits:${NC}
  • Access token valid for 60 days
  • Re-authenticate with: ./linkedin-post.sh auth
  • Organization posts only (no personal posts)

${BLUE}BlackRoad OS, Inc.${NC}
Organization URN: urn:li:organization:111783522
EOF
}

# Main
main() {
    case "${1:-}" in
        setup)
            setup
            ;;
        auth)
            authenticate
            ;;
        verify)
            verify
            ;;
        post)
            if [[ -z "${2:-}" ]]; then
                log_error "Usage: ./linkedin-post.sh post \"Your message\""
                exit 1
            fi
            post "$2"
            ;;
        link)
            if [[ -z "${2:-}" || -z "${3:-}" ]]; then
                log_error "Usage: ./linkedin-post.sh link \"Message\" \"URL\""
                exit 1
            fi
            post_with_link "$2" "$3"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

main "$@"
