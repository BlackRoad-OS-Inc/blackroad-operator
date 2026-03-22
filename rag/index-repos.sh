#!/bin/bash
# Index all BlackRoad repos into the RAG system
# Scans repos, chunks code files, generates JSONL, then embeds into Qdrant
#
# Usage: ./index-repos.sh [--reindex] [--repo <name>]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
CYAN='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

RAG_DIR="$HOME/.blackroad-rag"
CHUNKS_FILE="$RAG_DIR/code-chunks.jsonl"
REPOS_DIR="$HOME/blackroad-repos"
OPERATOR_DIR="$HOME/blackroad-operator"

REINDEX=false
REPO_FILTER=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --reindex) REINDEX=true; shift ;;
        --repo) REPO_FILTER="$2"; shift 2 ;;
        *) echo "Unknown arg: $1"; exit 1 ;;
    esac
done

echo -e "${PINK}BlackRoad RAG — Repository Indexer${RESET}"
echo ""

# Collect repo paths
REPO_PATHS=()

# blackroad-repos/ directory
if [[ -d "$REPOS_DIR" ]]; then
    for repo in "$REPOS_DIR"/*/; do
        [[ -d "$repo/.git" ]] || continue
        name=$(basename "$repo")
        if [[ -n "$REPO_FILTER" && "$name" != "$REPO_FILTER" ]]; then
            continue
        fi
        REPO_PATHS+=("$repo|$name")
    done
fi

# blackroad-operator itself
if [[ -z "$REPO_FILTER" || "$REPO_FILTER" == "blackroad-operator" ]]; then
    REPO_PATHS+=("$OPERATOR_DIR|blackroad-operator")
fi

# Also scan ~/Desktop repos and other common locations
for dir in ~/Desktop/*/; do
    [[ -d "$dir/.git" ]] || continue
    name=$(basename "$dir")
    if [[ -n "$REPO_FILTER" && "$name" != "$REPO_FILTER" ]]; then
        continue
    fi
    REPO_PATHS+=("$dir|$name")
done

echo -e "  ${CYAN}Found ${#REPO_PATHS[@]} repos to index${RESET}"

if $REINDEX; then
    echo -e "  ${AMBER}Reindex mode — rebuilding chunks file${RESET}"
    > "$CHUNKS_FILE"
fi

# Chunk a single file into JSONL entries
chunk_file() {
    local file="$1"
    local repo="$2"
    local rel_path="$3"
    local file_type="$4"

    # Skip binary/large files
    local size
    size=$(wc -c < "$file" 2>/dev/null || echo 0)
    [[ "$size" -gt 500000 ]] && return  # Skip files > 500KB

    # Skip minified files
    local basename
    basename=$(basename "$file")
    [[ "$basename" == *.min.* ]] && return
    [[ "$basename" == *bundle* ]] && return
    [[ "$basename" == *chunk-* ]] && return

    # Read file and split into chunks of ~50 lines
    local line_num=1
    local chunk=""
    local chunk_start=1

    while IFS= read -r line || [[ -n "$line" ]]; do
        chunk+="$line"$'\n'

        if (( line_num % 50 == 0 )); then
            # Emit chunk
            local escaped
            escaped=$(echo -n "$chunk" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
            echo "{\"repo\":\"$repo\",\"file\":\"$rel_path\",\"line\":$chunk_start,\"type\":\"$file_type\",\"content\":$escaped}"
            chunk=""
            chunk_start=$((line_num + 1))
        fi

        line_num=$((line_num + 1))
    done < "$file"

    # Emit remaining chunk
    if [[ -n "$chunk" ]]; then
        local escaped
        escaped=$(echo -n "$chunk" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
        echo "{\"repo\":\"$repo\",\"file\":\"$rel_path\",\"line\":$chunk_start,\"type\":\"$file_type\",\"content\":$escaped}"
    fi
}

# Process each repo
total_chunks=0
for entry in "${REPO_PATHS[@]}"; do
    IFS='|' read -r repo_path repo_name <<< "$entry"
    echo -ne "  ${CYAN}Indexing ${repo_name}...${RESET}"

    repo_chunks=0

    # Find code files (skip node_modules, .git, dist, build, vendor, __pycache__)
    while IFS= read -r file; do
        rel_path="${file#$repo_path}"
        rel_path="${rel_path#/}"

        # Determine file type
        case "$file" in
            *.py)   file_type="python" ;;
            *.js)   file_type="javascript" ;;
            *.ts)   file_type="typescript" ;;
            *.tsx)  file_type="typescript" ;;
            *.jsx)  file_type="javascript" ;;
            *.sh)   file_type="shell" ;;
            *.rs)   file_type="rust" ;;
            *.go)   file_type="go" ;;
            *.rb)   file_type="ruby" ;;
            *.java) file_type="java" ;;
            *.md)   file_type="markdown" ;;
            *.yml|*.yaml) file_type="yaml" ;;
            *.json) file_type="json" ;;
            *.toml) file_type="toml" ;;
            *)      file_type="other" ;;
        esac

        chunk_file "$file" "$repo_name" "$rel_path" "$file_type" >> "$CHUNKS_FILE"
        repo_chunks=$((repo_chunks + 1))

    done < <(find "$repo_path" -type f \
        \( -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" \
           -o -name "*.sh" -o -name "*.rs" -o -name "*.go" -o -name "*.rb" \
           -o -name "*.java" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" \
           -o -name "*.json" -o -name "*.toml" \) \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/vendor/*" \
        ! -path "*/__pycache__/*" \
        ! -path "*/.next/*" \
        ! -path "*/coverage/*" \
        ! -path "*/.venv/*" \
        ! -path "*/venv/*" \
        2>/dev/null)

    echo -e " ${GREEN}${repo_chunks} files${RESET}"
    total_chunks=$((total_chunks + repo_chunks))
done

# Count actual chunks in JSONL
chunk_count=$(wc -l < "$CHUNKS_FILE" | tr -d ' ')
echo ""
echo -e "  ${GREEN}Total: ${total_chunks} files → ${chunk_count} chunks${RESET}"
echo -e "  ${CYAN}Chunks file: ${CHUNKS_FILE} ($(du -h "$CHUNKS_FILE" | cut -f1))${RESET}"

echo ""
echo -e "  ${PINK}Now run: python3 ~/.blackroad-rag/rag-engine.py index${RESET}"
echo -e "  ${PINK}To embed chunks into Qdrant on Alice${RESET}"
