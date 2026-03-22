#!/bin/bash
# Update all domain repos with official BlackRoad OS branding
# Uses grayscale-first design with gradient accent strip

set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

TEMPLATE=$(cat ~/blackroad-landing-template.html)

echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${PINK}   🛣️  UPDATING REPOS WITH OFFICIAL BRANDING${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo ""

update_landing_repo() {
    local repo=$1
    local domain=$2
    local title=$3
    local desc=$4

    echo -e "${BLUE}→${NC} Updating $repo with official branding..."

    cd /tmp
    rm -rf "/tmp/$repo" 2>/dev/null || true
    gh repo clone "BlackRoad-OS/$repo" "/tmp/$repo" 2>/dev/null || true
    cd "/tmp/$repo"

    # Generate index.html from template
    echo "$TEMPLATE" | \
        sed "s/{{DOMAIN}}/$domain/g" | \
        sed "s/{{TITLE}}/$title/g" | \
        sed "s/{{DESCRIPTION}}/$desc/g" > index.html

    # Commit and push
    git add -A
    git commit -m "Update to official BlackRoad OS design system

- Grayscale-first with accent gradient strip
- Golden ratio spacing
- SF Mono typography
- Minimal color usage

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "  No changes"
    git push 2>/dev/null || true

    echo -e "${GREEN}  ✅ Updated $repo${NC}"
}

update_nextjs_repo() {
    local repo=$1
    local domain=$2
    local title=$3
    local desc=$4

    echo -e "${BLUE}→${NC} Updating $repo with official branding..."

    cd /tmp
    rm -rf "/tmp/$repo" 2>/dev/null || true
    gh repo clone "BlackRoad-OS/$repo" "/tmp/$repo" 2>/dev/null || true
    cd "/tmp/$repo"

    # Update layout.tsx with official colors
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
      <head>
        <link rel="icon" href="https://blackroad.io/favicon.ico" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
      }}>
        {/* Accent gradient strip */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)',
        }} />
        {children}
      </body>
    </html>
  )
}
LAYOUTEOF

    # Update page.tsx with official design
    cat > app/page.tsx << PAGEEOF
export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav style={{
        background: '#0a0a0a',
        borderBottom: '1px solid #2a2a2a',
        padding: '0 34px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
          <a href="https://blackroad.io" style={{
            fontFamily: 'SF Mono, Fira Code, monospace',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
          }}>BlackRoad OS</a>
          <span style={{
            fontFamily: 'SF Mono, monospace',
            fontSize: '10px',
            color: '#555',
            background: '#1a1a1a',
            padding: '2px 8px',
            borderRadius: '3px',
          }}>v2.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#4ade80',
          }} />
          <span style={{
            fontFamily: 'SF Mono, monospace',
            fontSize: '11px',
            color: '#555',
          }}>Operational</span>
        </div>
      </nav>

      {/* Main */}
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '89px 34px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'SF Mono, monospace',
          fontSize: '11px',
          color: '#555',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          padding: '5px 13px',
          borderRadius: '4px',
          marginBottom: '34px',
        }}>
          ${domain}
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 700,
          letterSpacing: '-1px',
          marginBottom: '21px',
          background: 'linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ${title}
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#777',
          maxWidth: '560px',
          lineHeight: 1.618,
          marginBottom: '55px',
        }}>
          ${desc}
        </p>

        <div style={{ display: 'flex', gap: '13px' }}>
          <a href="https://blackroad.io" style={{
            fontFamily: 'SF Mono, monospace',
            fontSize: '13px',
            padding: '13px 34px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 500,
            background: '#fff',
            color: '#000',
          }}>
            Explore BlackRoad OS
          </a>
          <a href="https://github.com/BlackRoad-OS/${repo}" style={{
            fontFamily: 'SF Mono, monospace',
            fontSize: '13px',
            padding: '13px 34px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 500,
            background: 'transparent',
            color: '#777',
            border: '1px solid #2a2a2a',
          }}>
            View Source
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: '#2a2a2a',
          marginTop: '89px',
          maxWidth: '600px',
          width: '100%',
        }}>
          {[
            { label: 'REPOS', value: '200+' },
            { label: 'DOMAINS', value: '20' },
            { label: 'AI AGENTS', value: '∞' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#111',
              padding: '34px',
              textAlign: 'left',
            }}>
              <div style={{
                fontFamily: 'SF Mono, monospace',
                fontSize: '11px',
                color: '#555',
                marginBottom: '8px',
              }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 600 }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        borderTop: '1px solid #2a2a2a',
        padding: '21px 34px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'SF Mono, monospace',
          fontSize: '11px',
          color: '#555',
        }}>© 2026 BlackRoad OS, Inc.</span>
        <div style={{ display: 'flex', gap: '21px' }}>
          {['Privacy', 'Terms', 'GitHub'].map((link) => (
            <a key={link} href="#" style={{
              fontFamily: 'SF Mono, monospace',
              fontSize: '11px',
              color: '#555',
              textDecoration: 'none',
            }}>{link}</a>
          ))}
        </div>
      </footer>
    </>
  )
}
PAGEEOF

    # Commit and push
    git add -A
    git commit -m "Update to official BlackRoad OS design system

- Grayscale-first with accent gradient strip
- Golden ratio spacing
- SF Mono typography
- Minimal color usage

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "  No changes"
    git push 2>/dev/null || true

    echo -e "${GREEN}  ✅ Updated $repo${NC}"
}

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  LANDING PAGES${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

update_landing_repo "blackroad-company" "blackroad.company" "BlackRoad Company" "Corporate headquarters for BlackRoad OS - building the sovereign AI infrastructure of tomorrow."
update_landing_repo "blackroad-me" "blackroad.me" "BlackRoad Me" "Personal portal for the BlackRoad ecosystem. Your sovereign digital identity."
update_landing_repo "blackroad-network" "blackroad.network" "BlackRoad Network" "Distributed infrastructure powering the BlackRoad ecosystem across 8 devices and 52 TOPS of AI compute."
update_landing_repo "blackroad-systems" "blackroad.systems" "BlackRoad Systems" "Enterprise-grade systems architecture. 200+ repositories, infinite scalability."
update_landing_repo "blackroadinc-us" "blackroadinc.us" "BlackRoad Inc." "Official US entity for BlackRoad OS, Inc. Delaware C-Corp."
update_landing_repo "blackroadquantum-info" "blackroadquantum.info" "Quantum Information" "Research and documentation for BlackRoad Quantum computing initiatives."
update_landing_repo "blackroadquantum-net" "blackroadquantum.net" "Quantum Network" "Quantum-safe network infrastructure for the post-quantum era."
update_landing_repo "blackboxprogramming-io" "blackboxprogramming.io" "BlackBox Programming" "Advanced software engineering and AI development studio."

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  NEXT.JS APPS${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

update_nextjs_repo "blackroadai-com" "blackroadai.com" "BlackRoad AI" "Sovereign AI platform. Deploy, train, and run AI models on your own infrastructure."
update_nextjs_repo "blackroadqi-com" "blackroadqi.com" "BlackRoad QI" "Quantum Intelligence platform bridging classical and quantum computing."
update_nextjs_repo "blackroadquantum-com" "blackroadquantum.com" "BlackRoad Quantum" "Next-generation quantum computing platform for enterprise applications."
update_nextjs_repo "blackroadquantum-shop" "blackroadquantum.shop" "Quantum Shop" "Hardware and software for quantum computing enthusiasts and professionals."
update_nextjs_repo "blackroadquantum-store" "blackroadquantum.store" "Quantum Store" "Enterprise quantum solutions and licensing portal."
update_nextjs_repo "lucidia-studio" "lucidia.studio" "Lucidia Studio" "Creative AI tools for artists, designers, and dreamers."
update_nextjs_repo "lucidiaqi-com" "lucidiaqi.com" "Lucidia QI" "Quantum-inspired intelligence for creative applications."
update_nextjs_repo "roadchain-io" "roadchain.io" "RoadChain" "Decentralized infrastructure protocol for the sovereign web."
update_nextjs_repo "roadcoin-io" "roadcoin.io" "RoadCoin" "The native cryptocurrency of the BlackRoad ecosystem."
update_nextjs_repo "aliceqi-com" "aliceqi.com" "AliceQI" "Your quantum-native AI assistant for the modern age."

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ ALL REPOS UPDATED WITH OFFICIAL BRANDING!${NC}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${NC}"
