#!/usr/bin/env bash
# BlackRoad OS Repository Enhancement Script
# Adds standardized documentation to each repository

set -e

TEMPLATES_DIR="/Users/alexa/.copilot/session-state/30b63bc6-2854-4c07-ab88-b97fde63a123/files/templates"
LOG_DIR="/Users/alexa/.copilot/session-state/30b63bc6-2854-4c07-ab88-b97fde63a123/files/logs"
PROGRESS_FILE="$LOG_DIR/enhancement_progress.txt"

mkdir -p "$LOG_DIR"

# Initialize or load progress
if [ ! -f "$PROGRESS_FILE" ]; then
    echo "0" > "$PROGRESS_FILE"
fi

REPOS_PROCESSED=$(cat "$PROGRESS_FILE")

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/enhancement.log"
}

enhance_repo() {
    local REPO_NAME="$1"
    local REPO_FULL="BlackRoad-OS/$REPO_NAME"
    
    log "Enhancing $REPO_FULL..."
    
    # Clone repo to temp directory
    local TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    if ! gh repo clone "$REPO_FULL" .; then
        log "ERROR: Failed to clone $REPO_FULL"
        cd - > /dev/null
        rm -rf "$TEMP_DIR"
        return 1
    fi
    
    local CHANGES=0
    
    # Get repo description
    REPO_DESC=$(gh repo view "$REPO_FULL" --json description -q .description || echo "No description available")
    
    # Add README if missing
    if [ ! -f "README.md" ]; then
        log "  Adding README.md"
        # Escape special characters in description for sed
        REPO_DESC_ESCAPED=$(echo "$REPO_DESC" | sed 's/[\/&]/\\&/g')
        sed "s/{{REPO_NAME}}/$REPO_NAME/g" "$TEMPLATES_DIR/README_TEMPLATE.md" | \
        sed "s/{{REPO_DESCRIPTION}}/$REPO_DESC_ESCAPED/g" > README.md
        git add README.md
        CHANGES=1
    fi
    
    # Add LICENSE if missing
    if [ ! -f "LICENSE" ]; then
        log "  Adding LICENSE"
        cp "$TEMPLATES_DIR/LICENSE" LICENSE
        git add LICENSE
        CHANGES=1
    fi
    
    # Add CONTRIBUTING.md if missing
    if [ ! -f "CONTRIBUTING.md" ]; then
        log "  Adding CONTRIBUTING.md"
        sed "s/{{REPO_NAME}}/$REPO_NAME/g" "$TEMPLATES_DIR/CONTRIBUTING.md" > CONTRIBUTING.md
        git add CONTRIBUTING.md
        CHANGES=1
    fi
    
    # Add CODE_OF_CONDUCT.md if missing
    if [ ! -f "CODE_OF_CONDUCT.md" ]; then
        log "  Adding CODE_OF_CONDUCT.md"
        cp "$TEMPLATES_DIR/CODE_OF_CONDUCT.md" CODE_OF_CONDUCT.md
        git add CODE_OF_CONDUCT.md
        CHANGES=1
    fi
    
    # Add .github templates if missing
    if [ ! -d ".github" ]; then
        log "  Adding .github templates"
        mkdir -p .github/ISSUE_TEMPLATE
        cp -r "$TEMPLATES_DIR/.github/"* .github/
        git add .github
        CHANGES=1
    fi
    
    # Commit and push if there are changes
    if [ "$CHANGES" -eq 1 ]; then
        git config user.name "BlackRoad OS Bot"
        git config user.email "blackroad.systems@gmail.com"
        git commit -m "docs: Add standardized documentation and templates

- Add README.md with BlackRoad branding
- Add LICENSE (MIT)
- Add CONTRIBUTING.md with contribution guidelines
- Add CODE_OF_CONDUCT.md
- Add GitHub issue and PR templates

Part of the BlackRoad OS standardization initiative."
        
        if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
            log "  ✅ Successfully enhanced $REPO_FULL"
        else
            log "  ⚠️  Failed to push changes to $REPO_FULL"
        fi
    else
        log "  ℹ️  No changes needed for $REPO_FULL"
    fi
    
    # Cleanup
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    # Update progress
    REPOS_PROCESSED=$((REPOS_PROCESSED + 1))
    echo "$REPOS_PROCESSED" > "$PROGRESS_FILE"
}

# Main execution
log "Starting BlackRoad OS repository enhancement"
log "Templates directory: $TEMPLATES_DIR"

# Get list of all repos (starting from current progress)
REPOS=$(gh repo list BlackRoad-OS --limit 1141 --json name -q '.[].name' | tail -n +$((REPOS_PROCESSED + 1)))

TOTAL=$(echo "$REPOS" | wc -l)
log "Found $TOTAL repositories to process (starting from #$((REPOS_PROCESSED + 1)))"

# Process each repository
CURRENT=0
for REPO in $REPOS; do
    CURRENT=$((CURRENT + 1))
    log "[$CURRENT/$TOTAL] Processing $REPO"
    
    enhance_repo "$REPO"
    
    # Rate limiting: pause every 50 repos
    if [ $((CURRENT % 50)) -eq 0 ]; then
        log "Processed 50 repos, pausing for 60 seconds..."
        sleep 60
    else
        # Small delay between repos
        sleep 2
    fi
done

log "✅ Enhancement complete! Processed $REPOS_PROCESSED repositories."
