#!/usr/bin/env bash
# Generate a GitHub Pages index.html for a BlackRoad organization
# Usage: ./generate-org-page.sh <dir> <org-name> <display-name> <icon> <color> <desc> <repo-count> <fork-count> <focus> <key-repos>

set -euo pipefail

DIR="$1"
ORG="$2"
DISPLAY="$3"
ICON="$4"
COLOR="$5"
DESC="$6"
REPOS="$7"
FORKS="$8"
FOCUS="$9"
KEY_REPOS="${10}"

cat > "${DIR}/index.html" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${DISPLAY} — BlackRoad OS</title>
  <meta name="description" content="${DISPLAY} — ${DESC}">
  <link rel="stylesheet" href="../_shared/design.css">
  <style>
    .hero { min-height: 70vh; display: flex; flex-direction: column; justify-content: center; padding-top: 80px; }
    .hero-icon { font-size: 4rem; margin-bottom: var(--sp-md); }
    .hero-sub { font-size: 1.1rem; color: var(--subtle); max-width: 640px; margin-top: var(--sp-md); }
    .accent-bar { height: 3px; width: 80px; background: ${COLOR}; margin-bottom: var(--sp-lg); border-radius: 2px; }
    .tag { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 20px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--subtle); margin: 2px; }
    .repo-item { padding: var(--sp-md); border-bottom: 1px solid var(--border); }
    .repo-item:last-child { border-bottom: none; }
    .repo-name { font-family: var(--font-mono); font-weight: 600; color: var(--white); }
    .parent-link { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border: 1px solid var(--border); border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--subtle); transition: all 0.2s; margin-top: var(--sp-md); }
    .parent-link:hover { border-color: var(--pink); color: var(--white); }
  </style>
</head>
<body class="dot-bg">
  <div class="scroll-progress" id="progress"></div>

  <nav>
    <div class="nav-logo"><span style="color: ${COLOR};">${ICON}</span> <span class="grad-text">${DISPLAY}</span></div>
    <div class="nav-links">
      <a href="../blackroad-os-inc/index.html">Inc</a>
      <a href="../blackroad-os/index.html">Core</a>
      <a href="https://github.com/${ORG}">GitHub</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-icon">${ICON}</div>
    <div class="accent-bar"></div>
    <div class="section-label">${FOCUS}</div>
    <h1><span class="grad-text">${DISPLAY}</span></h1>
    <p class="hero-sub">${DESC}</p>
    <a href="../blackroad-os-inc/index.html" class="parent-link">&larr; BlackRoad OS, Inc.</a>
  </section>

  <section>
    <div class="stat-strip">
      <div class="stat-item"><div class="stat-value">${REPOS}</div><div class="stat-label">Repositories</div></div>
      <div class="stat-item"><div class="stat-value">${FORKS}</div><div class="stat-label">Forks</div></div>
      <div class="stat-item"><div class="stat-value" style="background: ${COLOR}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ACTIVE</div><div class="stat-label">Status</div></div>
    </div>
  </section>

  <section>
    <div class="section-label">Focus Areas</div>
    <h2>${FOCUS}</h2>
    <div style="margin-top: var(--sp-md);">
$(echo "${KEY_REPOS}" | tr '|' '\n' | while read -r repo; do
  echo "      <span class=\"tag\">${repo}</span>"
done)
    </div>
  </section>

  <section>
    <div class="section-label">Links</div>
    <h2>Resources</h2>
    <div class="grid-2" style="margin-top: var(--sp-lg);">
      <a href="https://github.com/${ORG}" class="card">
        <h3>GitHub Organization</h3>
        <p style="font-size: 0.85rem;">github.com/${ORG}</p>
      </a>
      <a href="../blackroad-os-inc/index.html" class="card">
        <h3>Parent Organization</h3>
        <p style="font-size: 0.85rem;">BlackRoad OS, Inc. Corporate Hub</p>
      </a>
    </div>
  </section>

  <footer>
    <span>&copy; 2026 BlackRoad OS, Inc. All rights reserved.</span>
    <a href="../blackroad-os-inc/index.html" style="color: var(--subtle);">blackroad-os-inc</a>
  </footer>

  <script>
    window.addEventListener('scroll', () => {
      const p = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      document.getElementById('progress').style.width = p + '%';
    });
  </script>
</body>
</html>
HTMLEOF

echo "Generated: ${DIR}/index.html"
