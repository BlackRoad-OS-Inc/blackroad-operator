#!/bin/bash
# Create GitHub repos for all BlackRoad domains
# Categorized: Landing pages vs Next.js apps

set -e

ORG="BlackRoad-OS"
PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PINK}   🛣️  BLACKROAD DOMAIN REPOS CREATION${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to create landing page repo
create_landing_repo() {
    local repo=$1
    local domain=$2
    local desc=$3

    echo -e "${BLUE}→${NC} Creating landing page repo: $repo"

    # Create repo
    gh repo create "$ORG/$repo" \
        --public \
        --description "$desc" \
        --clone 2>/dev/null || echo "  Repo may exist, cloning..."

    cd "/tmp/$repo" 2>/dev/null || gh repo clone "$ORG/$repo" "/tmp/$repo"
    cd "/tmp/$repo"

    # Create landing page structure
    mkdir -p public

    # Create index.html with BlackRoad branding
    cat > index.html << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${domain} | BlackRoad OS</title>
    <meta name="description" content="${desc}">
    <link rel="icon" href="https://blackroad.io/favicon.ico">
    <style>
        :root {
            --hot-pink: #FF1D6C;
            --amber: #F5A623;
            --electric-blue: #2979FF;
            --violet: #9C27B0;
            --black: #000000;
            --white: #FFFFFF;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: var(--black);
            color: var(--white);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            line-height: 1.618;
        }

        .container {
            text-align: center;
            padding: 34px;
            max-width: 800px;
        }

        .logo {
            font-size: 55px;
            font-weight: 700;
            background: linear-gradient(135deg, var(--amber) 0%, var(--hot-pink) 38.2%, var(--violet) 61.8%, var(--electric-blue) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 21px;
        }

        .tagline {
            font-size: 21px;
            color: rgba(255,255,255,0.8);
            margin-bottom: 34px;
        }

        .domain {
            font-size: 34px;
            color: var(--hot-pink);
            margin-bottom: 21px;
        }

        .cta {
            display: inline-block;
            padding: 13px 34px;
            background: linear-gradient(135deg, var(--hot-pink) 0%, var(--violet) 100%);
            color: var(--white);
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 21px rgba(255, 29, 108, 0.3);
        }

        .footer {
            margin-top: 55px;
            font-size: 13px;
            color: rgba(255,255,255,0.5);
        }

        .footer a {
            color: var(--hot-pink);
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🛣️ BlackRoad</div>
        <div class="domain">${domain}</div>
        <p class="tagline">${desc}</p>
        <a href="https://blackroad.io" class="cta">Explore BlackRoad OS →</a>
        <div class="footer">
            © 2026 <a href="https://blackroad.io">BlackRoad OS, Inc.</a> |
            <a href="https://github.com/BlackRoad-OS">GitHub</a>
        </div>
    </div>
</body>
</html>
HTMLEOF

    # Create _headers for Cloudflare
    cat > public/_headers << 'HEADERSEOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
HEADERSEOF

    # Create _redirects
    cat > public/_redirects << 'REDIRECTSEOF'
# Redirects
/home  /  301
REDIRECTSEOF

    # Commit and push
    git add -A
    git commit -m "Initial landing page for ${domain}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || true
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || true

    echo -e "${GREEN}  ✅ Created $repo${NC}"
    cd /tmp
}

# Function to create Next.js app repo
create_nextjs_repo() {
    local repo=$1
    local domain=$2
    local desc=$3

    echo -e "${BLUE}→${NC} Creating Next.js app repo: $repo"

    # Create repo
    gh repo create "$ORG/$repo" \
        --public \
        --description "$desc" \
        --clone 2>/dev/null || echo "  Repo may exist, cloning..."

    cd "/tmp/$repo" 2>/dev/null || gh repo clone "$ORG/$repo" "/tmp/$repo"
    cd "/tmp/$repo"

    # Create package.json
    cat > package.json << PKGEOF
{
  "name": "${repo}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
PKGEOF

    # Create tsconfig.json
    cat > tsconfig.json << 'TSEOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
TSEOF

    # Create next.config.js
    cat > next.config.js << 'NEXTEOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
}
module.exports = nextConfig
NEXTEOF

    # Create app directory structure
    mkdir -p app

    # Create layout.tsx
    cat > app/layout.tsx << LAYOUTEOF
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${domain} | BlackRoad OS',
  description: '${desc}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
      }}>
        {children}
      </body>
    </html>
  )
}
LAYOUTEOF

    # Create page.tsx
    cat > app/page.tsx << PAGEEOF
export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '34px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '55px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '21px',
      }}>
        🛣️ BlackRoad
      </h1>
      <h2 style={{
        fontSize: '34px',
        color: '#FF1D6C',
        marginBottom: '21px',
      }}>
        ${domain}
      </h2>
      <p style={{
        fontSize: '21px',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: '34px',
        maxWidth: '600px',
      }}>
        ${desc}
      </p>
      <a
        href="https://blackroad.io"
        style={{
          display: 'inline-block',
          padding: '13px 34px',
          background: 'linear-gradient(135deg, #FF1D6C 0%, #9C27B0 100%)',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Explore BlackRoad OS →
      </a>
      <footer style={{
        marginTop: '55px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.5)',
      }}>
        © 2026 BlackRoad OS, Inc.
      </footer>
    </main>
  )
}
PAGEEOF

    # Create .gitignore
    cat > .gitignore << 'GITIGNOREEOF'
node_modules
.next
out
.DS_Store
*.log
GITIGNOREEOF

    # Commit and push
    git add -A
    git commit -m "Initial Next.js app for ${domain}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || true
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || true

    echo -e "${GREEN}  ✅ Created $repo${NC}"
    cd /tmp
}

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  1. LANDING PAGE REPOS (Info/Corporate Sites)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

create_landing_repo "blackroad-company" "blackroad.company" "BlackRoad OS Corporate Information"
create_landing_repo "blackroad-me" "blackroad.me" "BlackRoad Personal Portal"
create_landing_repo "blackroad-network" "blackroad.network" "BlackRoad Network Infrastructure"
create_landing_repo "blackroad-systems" "blackroad.systems" "BlackRoad Systems & Architecture"
create_landing_repo "blackroadinc-us" "blackroadinc.us" "BlackRoad Inc. US Entity"
create_landing_repo "blackroadquantum-info" "blackroadquantum.info" "BlackRoad Quantum Information Portal"
create_landing_repo "blackroadquantum-net" "blackroadquantum.net" "BlackRoad Quantum Network"
create_landing_repo "blackboxprogramming-io" "blackboxprogramming.io" "BlackBox Programming Portfolio"

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  2. NEXT.JS APP REPOS (Platforms/Stores)${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

create_nextjs_repo "blackroadai-com" "blackroadai.com" "BlackRoad AI Platform - Sovereign AI Solutions"
create_nextjs_repo "blackroadqi-com" "blackroadqi.com" "BlackRoad Quantum Intelligence Platform"
create_nextjs_repo "blackroadquantum-com" "blackroadquantum.com" "BlackRoad Quantum Computing Platform"
create_nextjs_repo "blackroadquantum-shop" "blackroadquantum.shop" "BlackRoad Quantum Shop - Hardware & Software"
create_nextjs_repo "blackroadquantum-store" "blackroadquantum.store" "BlackRoad Quantum Store - Enterprise Solutions"
create_nextjs_repo "lucidia-studio" "lucidia.studio" "Lucidia Studio - Creative AI Tools"
create_nextjs_repo "lucidiaqi-com" "lucidiaqi.com" "Lucidia Quantum Intelligence"
create_nextjs_repo "roadchain-io" "roadchain.io" "RoadChain - Decentralized Infrastructure"
create_nextjs_repo "roadcoin-io" "roadcoin.io" "RoadCoin - BlackRoad Cryptocurrency"
create_nextjs_repo "aliceqi-com" "aliceqi.com" "AliceQI - Quantum AI Assistant"

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ALL REPOS CREATED!${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Landing Pages (8): Simple HTML/CSS branded sites"
echo "Next.js Apps (10): Full app scaffolding ready for development"
echo ""
echo "Next: Connect to Cloudflare Pages for deployment"
