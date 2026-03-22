#!/usr/bin/env bash
# Test deployment to GitHub + Cloudflare
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_DIR="$HOME/blackroad-test-deploy-$(date +%s)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo -e "${BLUE}[TEST-DEPLOY]${NC} Creating test project..."

# Create a simple Next.js app
cat > package.json <<'PKG'
{
  "name": "blackroad-auto-deploy-test",
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

mkdir -p app
cat > app/page.tsx <<'PAGE'
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>🛣️ BlackRoad Auto-Deploy Test</h1>
      <p>Deployed: {new Date().toISOString()}</p>
      <p>✅ GitHub → Cloudflare pipeline working!</p>
    </main>
  )
}
PAGE

cat > app/layout.tsx <<'LAYOUT'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
LAYOUT

# Create README
cat > README.md <<'README'
# BlackRoad Auto-Deploy Test

Auto-deployed via memory system!

- GitHub: Auto-commit enabled
- Cloudflare: Pages connected
- Memory: Session tracked

Generated: $(date)
README

echo -e "${GREEN}✓${NC} Test project created!"
echo -e "${BLUE}[TEST-DEPLOY]${NC} Project at: $TEST_DIR"
