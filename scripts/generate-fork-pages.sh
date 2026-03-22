#!/bin/bash
# Generate index.html landing pages for BlackRoad forks
# Usage: source this file, then call generate_page "repo" "tagline" "description" "why_forked" "features_json" "integration"

set -e

generate_page() {
  local REPO="$1"
  local TAGLINE="$2"
  local DESC="$3"
  local WHY="$4"
  local FEAT1_TITLE="$5"
  local FEAT1_DESC="$6"
  local FEAT2_TITLE="$7"
  local FEAT2_DESC="$8"
  local FEAT3_TITLE="$9"
  local FEAT3_DESC="${10}"
  local FEAT4_TITLE="${11}"
  local FEAT4_DESC="${12}"
  local FEAT5_TITLE="${13}"
  local FEAT5_DESC="${14}"
  local FEAT6_TITLE="${15}"
  local FEAT6_DESC="${16}"
  local INT_NODE="${17}"
  local INT_AGENT="${18}"
  local INT_DESC="${19}"
  local INT_PORT="${20}"

  cat << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
HTMLEOF

  echo "<title>${REPO} — BlackRoad OS</title>"
  echo "<meta name=\"description\" content=\"${DESC}\">"

  cat << 'HTMLEOF'
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #0a0a0a;
  --card: #131313;
  --border: #1a1a1a;
  --text: #e0e0e0;
  --text-dim: #888;
  --text-bright: #fff;
  --pink: #ff1d6c;
  --amber: #f5a623;
  --blue: #2979ff;
  --violet: #9c27b0;
  --green: #4caf50;
  --gradient: linear-gradient(90deg, #ff1d6c, #f5a623, #2979ff, #9c27b0);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}

.gradient-bar {
  height: 2px;
  background: var(--gradient);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid var(--border);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spectrum-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gradient);
  position: relative;
}

.spectrum-mark::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 6px;
  background: var(--bg);
}

.nav-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-bright);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.nav-links a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--text-bright); }

.hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 2rem 4rem;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  padding: 0.35rem 1rem;
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-bottom: 2rem;
  font-family: 'JetBrains Mono', monospace;
}

.hero h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  color: var(--text-bright);
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-tagline {
  font-size: 1.5rem;
  color: var(--text-dim);
  margin-bottom: 1rem;
  font-family: 'Space Grotesk', sans-serif;
}

.hero p {
  font-size: 1.15rem;
  color: var(--text-dim);
  max-width: 640px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}

.hero-why {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-align: left;
}

.hero-why h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: var(--amber);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.hero-why p {
  font-size: 0.95rem;
  color: var(--text);
  margin: 0;
  max-width: none;
}

.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.feature-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.75rem;
  transition: border-color 0.2s;
}

.feature-card:hover {
  border-color: #2a2a2a;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  background: var(--bg);
}

.feature-card h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-bright);
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-dim);
  line-height: 1.6;
}

.integration {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.integration-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

@media (max-width: 768px) {
  .integration-card { grid-template-columns: 1fr; gap: 2rem; }
}

.integration-info h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  color: var(--text-bright);
  margin-bottom: 1rem;
}

.integration-info p {
  color: var(--text-dim);
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.integration-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.meta-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  min-width: 60px;
}

.meta-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-bright);
}

.integration-diagram {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.diagram-node {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}

.diagram-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.diagram-dot.pink { background: var(--pink); }
.diagram-dot.amber { background: var(--amber); }
.diagram-dot.blue { background: var(--blue); }
.diagram-dot.green { background: var(--green); }

.diagram-connector {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin-left: 1.6rem;
}

footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-brand {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: var(--text-dim);
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.footer-links a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.footer-links a:hover { color: var(--text-bright); }
</style>
</head>
<body>
<div class="gradient-bar"></div>

<nav>
  <div class="nav-left">
    <div class="spectrum-mark"></div>
HTMLEOF

  echo "    <span class=\"nav-title\">${REPO}</span>"

  cat << 'HTMLEOF'
  </div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#integration">Integration</a></li>
    <li><a href="https://blackroad.io">BlackRoad OS</a></li>
HTMLEOF

  echo "    <li><a href=\"https://github.com/blackboxprogramming/${REPO}\">GitHub</a></li>"

  cat << 'HTMLEOF'
  </ul>
</nav>

<section class="hero">
HTMLEOF

  echo "  <div class=\"hero-badge\">BlackRoad OS Fork</div>"
  echo "  <h1>${REPO}</h1>"
  echo "  <p class=\"hero-tagline\">${TAGLINE}</p>"
  echo "  <p>${DESC}</p>"
  echo "  <div class=\"hero-why\">"
  echo "    <h3>Why BlackRoad Forked This</h3>"
  echo "    <p>${WHY}</p>"
  echo "  </div>"

  cat << 'HTMLEOF'
</section>

<section class="section" id="features">
  <div class="section-title">What Makes This Fork Special</div>
  <div class="features-grid">
HTMLEOF

  # Feature cards
  local icons=("&#9670;" "&#9674;" "&#9632;" "&#9654;" "&#9650;" "&#9660;")
  local colors=("pink" "amber" "blue" "green" "pink" "violet")

  local i=0
  for feat_title_var in "$FEAT1_TITLE" "$FEAT2_TITLE" "$FEAT3_TITLE" "$FEAT4_TITLE" "$FEAT5_TITLE" "$FEAT6_TITLE"; do
    local feat_desc_var
    case $i in
      0) feat_desc_var="$FEAT1_DESC" ;;
      1) feat_desc_var="$FEAT2_DESC" ;;
      2) feat_desc_var="$FEAT3_DESC" ;;
      3) feat_desc_var="$FEAT4_DESC" ;;
      4) feat_desc_var="$FEAT5_DESC" ;;
      5) feat_desc_var="$FEAT6_DESC" ;;
    esac
    if [ -n "$feat_title_var" ]; then
      echo "    <div class=\"feature-card\">"
      echo "      <div class=\"feature-icon\">${icons[$i]}</div>"
      echo "      <h3>${feat_title_var}</h3>"
      echo "      <p>${feat_desc_var}</p>"
      echo "    </div>"
    fi
    i=$((i + 1))
  done

  cat << 'HTMLEOF'
  </div>
</section>

<section class="integration" id="integration">
  <div class="section-title">BlackRoad OS Integration</div>
  <div class="integration-card">
    <div class="integration-info">
      <h2>Part of the Fleet</h2>
HTMLEOF

  echo "      <p>${INT_DESC}</p>"

  echo "      <div class=\"integration-meta\">"
  echo "        <div class=\"meta-item\">"
  echo "          <span class=\"meta-label\">Node</span>"
  echo "          <span class=\"meta-value\">${INT_NODE}</span>"
  echo "        </div>"
  echo "        <div class=\"meta-item\">"
  echo "          <span class=\"meta-label\">Agent</span>"
  echo "          <span class=\"meta-value\">${INT_AGENT}</span>"
  echo "        </div>"
  if [ -n "$INT_PORT" ]; then
    echo "        <div class=\"meta-item\">"
    echo "          <span class=\"meta-label\">Port</span>"
    echo "          <span class=\"meta-value\">${INT_PORT}</span>"
    echo "        </div>"
  fi

  cat << 'HTMLEOF'
      </div>
    </div>
    <div class="integration-diagram">
      <div class="diagram-node">
        <div class="diagram-dot pink"></div>
HTMLEOF

  echo "        <span>${REPO}</span>"

  cat << 'HTMLEOF'
      </div>
      <div class="diagram-connector"></div>
      <div class="diagram-node">
        <div class="diagram-dot amber"></div>
        <span>BlackRoad Agent Mesh</span>
      </div>
      <div class="diagram-connector"></div>
      <div class="diagram-node">
        <div class="diagram-dot blue"></div>
HTMLEOF

  echo "        <span>${INT_NODE} (Pi Fleet)</span>"

  cat << 'HTMLEOF'
      </div>
      <div class="diagram-connector"></div>
      <div class="diagram-node">
        <div class="diagram-dot green"></div>
        <span>blackroad.io</span>
      </div>
    </div>
  </div>
</section>

<footer>
HTMLEOF

  echo "  <span class=\"footer-brand\">&copy; 2025-2026 BlackRoad OS, Inc. &mdash; Pave Tomorrow.</span>"

  cat << 'HTMLEOF'
  <ul class="footer-links">
    <li><a href="https://blackroad.io">Home</a></li>
    <li><a href="https://github.com/BlackRoad-OS-Inc">GitHub</a></li>
    <li><a href="https://hq.blackroad.io">HQ</a></li>
  </ul>
</footer>

</body>
</html>
HTMLEOF
}
