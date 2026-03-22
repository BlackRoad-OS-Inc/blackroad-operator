const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RoadCode — Source Code You Actually Own</title>
<meta name="description" content="RoadCode is BlackRoad's sovereign source code platform. Your code, your hardware, your rules. No corporate middleman.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--pink:#FF1D6C;--amber:#F5A623;--blue:#2979FF;--violet:#9C27B0;--green:#00E676;--red:#FF3D00;--bg:#000;--surface:#0a0a0a;--border:#1a1a1a;--text:#fff;--muted:#888}
body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;line-height:1.6;overflow-x:hidden}
a{color:var(--pink);text-decoration:none}
a:hover{text-decoration:underline}
.hero{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:2rem;position:relative}
.hero::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(255,29,108,0.08) 0%,transparent 70%);pointer-events:none}
.hero h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(3rem,8vw,6rem);font-weight:700;letter-spacing:-0.03em;margin-bottom:0.5rem}
.hero h1 span{background:linear-gradient(135deg,var(--pink),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero .sub{font-size:clamp(1.1rem,2.5vw,1.5rem);color:var(--muted);max-width:700px;margin:0 auto 2rem}
.hero .tagline{font-family:'JetBrains Mono',monospace;font-size:0.95rem;color:var(--pink);letter-spacing:0.05em;margin-bottom:3rem}
.compare{max-width:1100px;margin:0 auto;padding:4rem 2rem}
.compare h2{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;text-align:center;margin-bottom:1rem}
.compare .lead{text-align:center;color:var(--muted);font-size:1.1rem;margin-bottom:3rem;max-width:700px;margin-left:auto;margin-right:auto}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:0.95rem}
th{font-family:'Space Grotesk',sans-serif;padding:1rem;text-align:left;border-bottom:2px solid var(--border);font-weight:600}
th:first-child{width:40%}
th:nth-child(2){color:var(--pink);font-size:1.1rem}
th:nth-child(3){color:var(--muted)}
td{padding:0.85rem 1rem;border-bottom:1px solid var(--border);vertical-align:top}
td:nth-child(2){color:var(--green);font-weight:500}
td:nth-child(3){color:var(--muted)}
tr:hover td{background:rgba(255,29,108,0.03)}
.yes{color:var(--green)}
.no{color:var(--red)}
.partial{color:var(--amber)}
.features{max-width:1100px;margin:0 auto;padding:4rem 2rem}
.features h2{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;text-align:center;margin-bottom:3rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem;transition:border-color 0.3s}
.card:hover{border-color:var(--pink)}
.card h3{font-family:'Space Grotesk',sans-serif;font-size:1.3rem;margin-bottom:0.75rem}
.card p{color:var(--muted);font-size:0.95rem}
.card .icon{font-size:2rem;margin-bottom:1rem;display:block}
.numbers{max-width:1100px;margin:0 auto;padding:4rem 2rem;text-align:center}
.numbers h2{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;margin-bottom:3rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem}
.stat .num{font-family:'Space Grotesk',sans-serif;font-size:3rem;font-weight:700;background:linear-gradient(135deg,var(--pink),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat .label{color:var(--muted);font-size:0.95rem;margin-top:0.25rem}
.why{max-width:900px;margin:0 auto;padding:4rem 2rem}
.why h2{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;text-align:center;margin-bottom:2rem}
.why .block{margin-bottom:2.5rem}
.why .block h3{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;margin-bottom:0.5rem;color:var(--pink)}
.why .block p{color:var(--muted);font-size:1.05rem;line-height:1.7}
.cta{text-align:center;padding:6rem 2rem;position:relative}
.cta::before{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(circle,rgba(156,39,176,0.06) 0%,transparent 70%);pointer-events:none}
.cta h2{font-family:'Space Grotesk',sans-serif;font-size:2.5rem;margin-bottom:1rem}
.cta p{color:var(--muted);font-size:1.1rem;margin-bottom:2rem}
.btn{display:inline-block;padding:0.9rem 2.5rem;background:linear-gradient(135deg,var(--pink),var(--violet));color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:1.05rem;border-radius:8px;transition:transform 0.2s,box-shadow 0.2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,29,108,0.3);text-decoration:none}
footer{text-align:center;padding:3rem 2rem;border-top:1px solid var(--border);color:var(--muted);font-size:0.85rem}
footer strong{color:var(--text)}
</style>
</head>
<body>
<section class="hero">
  <div class="tagline">BLACKROAD OS, INC. — PROPRIETARY SOFTWARE</div>
  <h1><span>RoadCode</span></h1>
  <p class="sub">Source code you actually own. Self-hosted. Sovereign. No corporate middleman deciding what happens to your repositories.</p>
</section>
<section class="compare">
  <h2>RoadCode vs GitHub</h2>
  <p class="lead">GitHub is a product you rent. RoadCode is infrastructure you own.</p>
  <div class="table-wrap">
  <table>
    <thead><tr><th></th><th>RoadCode</th><th>GitHub</th></tr></thead>
    <tbody>
      <tr><td><strong>Who owns your code?</strong></td><td class="yes">You. On your hardware.</td><td class="no">Microsoft. On their servers.</td></tr>
      <tr><td><strong>Can they suspend your account?</strong></td><td class="yes">No. You control access.</td><td class="no">Yes. Automated flags, DMCA, ToS changes.</td></tr>
      <tr><td><strong>AI training on your code</strong></td><td class="yes">Never. Your code stays local.</td><td class="no">Copilot trains on your repos by default.</td></tr>
      <tr><td><strong>Private repos</strong></td><td class="yes">Unlimited. No tier gating.</td><td class="partial">Limited on free. Pay for features.</td></tr>
      <tr><td><strong>CI/CD</strong></td><td class="yes">RoadCode Actions. Unlimited minutes.</td><td class="partial">2,000 min/month free. Then you pay.</td></tr>
      <tr><td><strong>Package registry</strong></td><td class="yes">Built-in. No bandwidth limits.</td><td class="partial">500MB free. Then pricing tiers.</td></tr>
      <tr><td><strong>Code search</strong></td><td class="yes">FTS5 + AI-powered answers.</td><td class="partial">Basic. Advanced search is paid.</td></tr>
      <tr><td><strong>Self-hosted option</strong></td><td class="yes">Always. That is the whole point.</td><td class="no">GitHub Enterprise: $21/user/month.</td></tr>
      <tr><td><strong>Data residency</strong></td><td class="yes">Your country. Your rack. Your decision.</td><td class="no">US data centers. Microsoft jurisdiction.</td></tr>
      <tr><td><strong>Uptime dependency</strong></td><td class="yes">Your network. If your LAN works, RoadCode works.</td><td class="no">Their infrastructure. Their outages are your problem.</td></tr>
      <tr><td><strong>API rate limits</strong></td><td class="yes">None. It is your server.</td><td class="no">5,000 req/hour. 60 unauthenticated.</td></tr>
      <tr><td><strong>Terms of Service changes</strong></td><td class="yes">You write the terms.</td><td class="no">They change terms. You comply or leave.</td></tr>
      <tr><td><strong>Export your data</strong></td><td class="yes">It is already on your disk.</td><td class="partial">Migration tools exist. But it is work.</td></tr>
      <tr><td><strong>AI code review</strong></td><td class="yes">Built-in. Runs on local models. Private.</td><td class="partial">Copilot. Sends code to Microsoft.</td></tr>
      <tr><td><strong>Price for 50 users</strong></td><td class="yes">$0/month. You already own the hardware.</td><td class="no">$200-$1,050/month depending on tier.</td></tr>
    </tbody>
  </table>
  </div>
</section>
<section class="features">
  <h2>What RoadCode Does</h2>
  <div class="grid">
    <div class="card"><span class="icon">&#x1F512;</span><h3>Sovereign Git Hosting</h3><p>Full Git server with pull requests, issues, milestones, labels, wikis, and org management. Runs on a Raspberry Pi or a rack server. Your hardware, your rules.</p></div>
    <div class="card"><span class="icon">&#x1F916;</span><h3>AI Code Review</h3><p>Every PR gets reviewed by local AI models running on your own compute. No code leaves your network. No per-seat AI licensing. Private by default.</p></div>
    <div class="card"><span class="icon">&#x26A1;</span><h3>RoadCode Actions</h3><p>CI/CD pipelines with unlimited minutes. Build, test, deploy — all on your infrastructure. No waiting for shared runners. No minute caps.</p></div>
    <div class="card"><span class="icon">&#x1F310;</span><h3>GitHub Mirror</h3><p>Two-way sync with GitHub when you want visibility. RoadCode is primary, GitHub is the mirror. You choose what is public and what stays internal.</p></div>
    <div class="card"><span class="icon">&#x1F4E6;</span><h3>Package Registry</h3><p>Host npm, PyPI, Docker, Maven, NuGet, and more. No bandwidth limits, no storage caps, no surprise bills. Packages live next to your code.</p></div>
    <div class="card"><span class="icon">&#x1F50D;</span><h3>Full-Text Code Search</h3><p>FTS5-powered search across every repo, every branch, every file. Plus AI-powered answers that understand your codebase context.</p></div>
    <div class="card"><span class="icon">&#x1F3E2;</span><h3>Multi-Org Management</h3><p>8 organizations, 239+ repositories, teams, permissions, branch protection — all the enterprise features, none of the enterprise pricing.</p></div>
    <div class="card"><span class="icon">&#x1F6E1;</span><h3>Zero Trust Access</h3><p>Behind your WireGuard mesh. No public attack surface unless you choose it. SSH keys, 2FA, IP allowlists — security you configure, not security you are sold.</p></div>
    <div class="card"><span class="icon">&#x1F4CA;</span><h3>Fleet Integration</h3><p>RoadCode connects to every Road Fleet component — CarPool for messaging, OneWay for TLS, PitStop for DNS. One mesh, one platform, one owner: you.</p></div>
  </div>
</section>
<section class="numbers">
  <h2>Running Right Now</h2>
  <div class="stats">
    <div class="stat"><div class="num">239+</div><div class="label">Repositories hosted</div></div>
    <div class="stat"><div class="num">8</div><div class="label">Organizations</div></div>
    <div class="stat"><div class="num">$0</div><div class="label">Per month to Microsoft</div></div>
    <div class="stat"><div class="num">100%</div><div class="label">Uptime on your LAN</div></div>
  </div>
</section>
<section class="why">
  <h2>Why This Matters</h2>
  <div class="block"><h3>GitHub is a landlord.</h3><p>You build on their platform. You follow their rules. They change the terms whenever they want. They train AI on your code. They suspend accounts based on automated flags. They charge more every year for features that should be free. And if you ever want to leave, migrating 200 repos is a project, not a click.</p></div>
  <div class="block"><h3>RoadCode is ownership.</h3><p>Your repositories live on your hardware. Your CI runs on your compute. Your packages are stored on your disk. No one can suspend your account because there is no account — there is just your server, running your code, on your network. The concept of downtime is limited to your own power grid.</p></div>
  <div class="block"><h3>Public code is not the same as giving it away.</h3><p>BlackRoad makes source code publicly visible for transparency, security review, and collaboration. But we do not hand Microsoft the right to train AI on it. We do not let a platform decide who can see it. We host it ourselves, mirror what we choose, and retain every right. That is the difference between open access and open source.</p></div>
</section>
<section class="cta">
  <h2>Your code deserves better.</h2>
  <p>RoadCode is part of the BlackRoad Road Fleet — sovereign infrastructure you own and operate.</p>
  <a href="https://blackroad.io" class="btn">Learn about BlackRoad OS</a>
</section>
<footer>
  <p><strong>RoadCode</strong> — Proprietary Software by <strong>BlackRoad OS, Inc.</strong></p>
  <p style="margin-top:0.5rem">Delaware C-Corp. Founded November 17, 2025. All rights reserved.</p>
  <p style="margin-top:1rem"><strong>BlackRoad OS — Pave Tomorrow.</strong></p>
</footer>
</body>
</html>`;

export default {
  async fetch(request) {
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
      },
    });
  },
};
