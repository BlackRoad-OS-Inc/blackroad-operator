WORLDS_DIR="$HOME/.blackroad/worlds"
REPO_DIR="$HOME/blackroad-worlds"
BRANCH="main"

mkdir -p "$WORLDS_DIR"
mkdir -p "$REPO_DIR/alice-worlds"

while true; do
    # Check for new worlds files
    count=0
    for f in "$WORLDS_DIR"/*.md; do
        [ -f "$f" ] || continue
        fname="$(basename $f)"
        dest="$REPO_DIR/alice-worlds/$fname"
        if [ ! -f "$dest" ]; then
            cp "$f" "$dest"
            count=$((count + 1))
        fi
    done
    
    if [ $count -gt 0 ]; then
        cd "$REPO_DIR"
        git pull origin main -q 2>/dev/null || true
        git add alice-worlds/
        git commit -m "🌍 alice: $count new world artifact(s) [$(date -u +%H:%M UTC)]" 2>/dev/null
        git push origin HEAD:main -q 2>/dev/null && echo "✅ Pushed $count alice artifacts"
    fi
    
    sleep 90
done
