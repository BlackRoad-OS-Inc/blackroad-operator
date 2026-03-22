#!/usr/bin/env bash
# Create new projects from templates
set -euo pipefail

TEMPLATE="${1:-nextjs}"
PROJECT_NAME="${2:-my-new-project}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$HOME/$PROJECT_NAME"

echo -e "${BLUE}[TEMPLATE]${NC} Creating $PROJECT_NAME from $TEMPLATE template..."

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

case "$TEMPLATE" in
  nextjs)
    cat > package.json <<'PKG'
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
PKG
    sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" package.json
    
    mkdir -p app
    cat > app/page.tsx <<'PAGE'
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🚀 Welcome to PROJECT_NAME</h1>
      <p>Built with BlackRoad Auto-Deploy</p>
      <ul>
        <li>✅ Auto-deploy enabled</li>
        <li>✅ Watch mode ready</li>
        <li>✅ CI/CD configured</li>
      </ul>
    </main>
  )
}
PAGE
    sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" app/page.tsx
    
    cat > app/layout.tsx <<'LAYOUT'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
LAYOUT
    ;;
    
  python)
    cat > main.py <<'PY'
#!/usr/bin/env python3
"""
PROJECT_NAME - BlackRoad Auto-Deploy Project
"""

def main():
    print("🚀 Welcome to PROJECT_NAME")
    print("✅ Auto-deploy enabled")
    print("✅ Watch mode ready")

if __name__ == "__main__":
    main()
PY
    sed -i '' "s/PROJECT_NAME/$PROJECT_NAME/g" main.py
    chmod +x main.py
    
    cat > requirements.txt <<'REQ'
# Add your dependencies here
REQ
    ;;
    
  *)
    echo "Unknown template: $TEMPLATE"
    echo "Available: nextjs, python"
    exit 1
    ;;
esac

# Initialize git
git init
git branch -M main

# Add auto-deploy
~/scripts/memory-git-auto.sh "$PROJECT_DIR"

# Generate README
~/scripts/auto-readme-generator.sh "$PROJECT_DIR"

# Initial commit
git add -A
git commit -m "🚀 Initial commit from $TEMPLATE template"

# Create GitHub repo
gh repo create "$PROJECT_NAME" --private --source=. --push 2>/dev/null || echo "Repo may already exist"

echo ""
echo -e "${GREEN}✅ Project created: $PROJECT_DIR${NC}"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_DIR"
if [[ "$TEMPLATE" == "nextjs" ]]; then
  echo "  npm install"
  echo "  npm run dev"
else
  echo "  python main.py"
fi
