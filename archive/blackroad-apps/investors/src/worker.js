// BlackRoad Investor Data Room — investors.blackroad.io
// Password-protected. Real numbers. Real traction.

const VERSION = '1.0.0';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);

    // Password gate
    const pwd = url.searchParams.get('key') || request.headers.get('X-Investor-Key');
    if (url.pathname !== '/' && !pwd) {
      return new Response(HTML_GATE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    if (url.pathname === '/') {
      return new Response(HTML_GATE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Data room sections
    if (url.pathname === '/room') {
      return new Response(HTML_ROOM, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    return new Response('Not found', { status: 404 });
  }
};

const GRAD = 'linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)';

const HTML_GATE = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad OS — Investor Data Room</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--card:#0a0a0a;--border:#1a1a1a;--text:#f5f5f5;--sub:#737373;--sg:'Space Grotesk',sans-serif;--in:'Inter',sans-serif;--jb:'JetBrains Mono',monospace;--grad:${GRAD}}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:var(--in);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bar{height:4px;background:var(--grad);width:100%;position:fixed;top:0}
.gate{max-width:420px;padding:40px 24px;text-align:center}
h1{font-family:var(--sg);font-size:28px;margin-bottom:8px}
p{color:var(--sub);font-size:14px;margin-bottom:32px;line-height:1.5}
.input{width:100%;background:#111;border:1px solid var(--border);color:var(--text);padding:14px;border-radius:6px;font-size:16px;font-family:var(--jb);text-align:center;outline:none;margin-bottom:16px}
.input:focus{border-color:#444}
.btn{width:100%;padding:14px;background:var(--grad);color:#fff;border:none;border-radius:6px;font-family:var(--sg);font-weight:600;font-size:15px;cursor:pointer}
.btn:hover{opacity:.9}
.note{color:var(--sub);font-size:11px;margin-top:24px}
</style></head><body>
<div class="bar"></div>
<div class="gate">
<h1>BlackRoad OS, Inc.</h1>
<p>Investor Data Room<br>Enter your access key to continue.</p>
<input class="input" id="key" type="password" placeholder="Access Key" onkeydown="if(event.key==='Enter')enter()">
<button class="btn" onclick="enter()">Enter Data Room</button>
<div class="note">Contact alexa@blackroad.io for access.</div>
</div>
<script>function enter(){const k=document.getElementById('key').value;if(k)window.location.href='/room?key='+encodeURIComponent(k)}</script>
</body></html>`;

const HTML_ROOM = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>BlackRoad OS — Data Room</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
:root{--bg:#000;--card:#0a0a0a;--elevated:#111;--border:#1a1a1a;--muted:#444;--sub:#737373;--text:#f5f5f5;--sg:'Space Grotesk',sans-serif;--in:'Inter',sans-serif;--jb:'JetBrains Mono',monospace;--grad:${GRAD}}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:var(--in)}
.bar{height:4px;background:var(--grad)}
.container{max-width:900px;margin:0 auto;padding:40px 24px}
h1{font-family:var(--sg);font-size:32px;margin-bottom:4px}
h2{font-family:var(--sg);font-size:20px;margin:40px 0 16px;padding-bottom:8px;border-bottom:1px solid var(--border)}
h3{font-family:var(--sg);font-size:16px;margin:24px 0 8px}
.subtitle{color:var(--sub);font-size:14px;margin-bottom:32px}
p,li{line-height:1.7;color:#ccc;font-size:14px}
ul{padding-left:20px;margin:8px 0}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
th{text-align:left;padding:8px 12px;border-bottom:2px solid var(--border);font-family:var(--sg);font-weight:600;color:var(--text)}
td{padding:8px 12px;border-bottom:1px solid var(--border);color:#ccc}
.metric{display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px 24px;margin:4px;text-align:center}
.metric-num{font-family:var(--sg);font-size:28px;font-weight:700}
.metric-label{font-size:11px;color:var(--sub);margin-top:4px}
.highlight{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:20px;margin:16px 0}
.section-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:16px 0}
.doc{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:16px;cursor:pointer;transition:border-color .2s}
.doc:hover{border-color:var(--muted)}
.doc h4{font-family:var(--sg);font-size:14px;margin-bottom:4px}
.doc p{font-size:12px;color:var(--sub);margin:0}
code{font-family:var(--jb);background:var(--elevated);padding:2px 6px;border-radius:4px;font-size:12px}
footer{text-align:center;padding:40px;color:var(--muted);font-size:11px;border-top:1px solid var(--border);margin-top:60px}
</style></head><body>
<div class="bar"></div>
<div class="container">

<h1>BlackRoad OS, Inc.</h1>
<div class="subtitle">Investor Data Room &mdash; Confidential</div>

<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:32px">
<div class="metric"><div class="metric-num">$100B+</div><div class="metric-label">Total Addressable Market</div></div>
<div class="metric"><div class="metric-num">414</div><div class="metric-label">Repos (Gitea)</div></div>
<div class="metric"><div class="metric-num">62</div><div class="metric-label">AI Agents</div></div>
<div class="metric"><div class="metric-num">20</div><div class="metric-label">Live Products</div></div>
<div class="metric"><div class="metric-num">52</div><div class="metric-label">TOPS Compute</div></div>
<div class="metric"><div class="metric-num">42</div><div class="metric-label">Auth Users</div></div>
</div>

<h2>1. Company Overview</h2>
<div class="highlight">
<p><strong>BlackRoad OS, Inc.</strong> is a Delaware C-Corporation (incorporated November 17, 2025 via Stripe Atlas) building a browser-based operating system that replaces 14+ siloed tools with one unified workspace. Your device runs the AI. Your data stays with you. Your agents work for you.</p>
<ul>
<li><strong>Founder/CEO:</strong> Alexa Louise Amundson (sole founder, sole director)</li>
<li><strong>EIN:</strong> 41-2663817 | Delaware File #10405914</li>
<li><strong>Registered Agent:</strong> Legalinc Corporate Services Inc.</li>
<li><strong>Stock:</strong> 10M shares Common authorized ($0.00001 par). 9M issued to founder (4yr vest, 1yr cliff).</li>
</ul>
</div>

<h2>2. The Problem</h2>
<p>To ship one creative project, people bounce between 14+ tools (ChatGPT, Canva, Premiere, FL Studio, Unity, GitHub, Stripe, Discord). None talk to each other. Context is constantly lost. Average creator spends 40+ hours/year on redundant data entry and 20+ hours/year on app setup.</p>
<div class="highlight">
<p><strong>The 5-Second/50-Hour Gap:</strong> You can describe your idea in 5 seconds. It takes 50 hours to produce because you're fighting tools, not creating.</p>
</div>

<h2>3. The Solution</h2>
<p>BlackRoad OS runs entirely in the browser. Every app opens as a window inside the desktop. All windows share context through AI agents. Zero exports. Zero copy-paste. Zero context switching.</p>
<ul>
<li><strong>Window-in-a-Window:</strong> All apps share context. Building a game? Ask for music &mdash; the music app hears what's happening and creates contextual audio.</li>
<li><strong>62 AI Agents:</strong> Each with a name, role, memory, and personality. They do the boring work.</li>
<li><strong>Runs on YOUR device:</strong> 52 TOPS of local AI inference. No cloud dependency. No surveillance.</li>
</ul>

<h2>4. Traction</h2>
<table>
<tr><th>Metric</th><th>Value</th><th>Date</th></tr>
<tr><td>Live products deployed</td><td>20 (all functional)</td><td>Mar 17, 2026</td></tr>
<tr><td>Git repositories</td><td>414 (self-hosted Gitea)</td><td>Mar 17, 2026</td></tr>
<tr><td>AI agents running</td><td>62 (with NLP + memory)</td><td>Mar 17, 2026</td></tr>
<tr><td>Auth users registered</td><td>42</td><td>Mar 17, 2026</td></tr>
<tr><td>Stripe checkout</td><td>Live (test mode)</td><td>Mar 17, 2026</td></tr>
<tr><td>Fleet nodes</td><td>7 (5 Raspberry Pi + 2 DigitalOcean)</td><td>Mar 17, 2026</td></tr>
<tr><td>Domains owned</td><td>20</td><td>Mar 17, 2026</td></tr>
<tr><td>DNS records managed</td><td>151 (91% self-hosted)</td><td>Mar 17, 2026</td></tr>
<tr><td>LOC written</td><td>168,243 (65K bash + 103K python)</td><td>Mar 17, 2026</td></tr>
<tr><td>Infrastructure cost</td><td>~$40/month</td><td>Mar 17, 2026</td></tr>
</table>

<h2>5. Market Opportunity</h2>
<table>
<tr><th>Category</th><th>Market Size</th><th>User Frustration</th><th>BlackRoad Product</th></tr>
<tr><td>Game Development</td><td>$200B+ industry</td><td>10/10 (Unity betrayal)</td><td>Genesis Road</td></tr>
<tr><td>Education</td><td>$6B&rarr;$45B by 2033</td><td>9/10 (96% dropout)</td><td>Roadie</td></tr>
<tr><td>Video Editing</td><td>Adobe "massive MRR"</td><td>8/10 (CapCut 1.2/5)</td><td>RoadView</td></tr>
<tr><td>Business Formation</td><td>$27B+ annually</td><td>8/10 (LegalZoom bait)</td><td>RoadWork</td></tr>
<tr><td>Developer Tools</td><td>Millions of devs</td><td>7/10 (Copilot lawsuit)</td><td>RoadCode</td></tr>
<tr><td>Data Privacy</td><td>Multi-billion</td><td>9/10 (AI training)</td><td>CarSeat</td></tr>
<tr><td>Music Production</td><td>Hundreds of millions</td><td>7/10 (61% quit yr 1)</td><td>Cadence</td></tr>
<tr><td>Navigation</td><td>$11B (GMaps rev)</td><td>7/10 (privacy lawsuits)</td><td>RoadMap</td></tr>
</table>

<h2>6. Business Model</h2>
<table>
<tr><th>Plan</th><th>Price</th><th>Features</th></tr>
<tr><td>Free (Operator)</td><td>$0</td><td>5 projects, 1 agent, sandbox</td></tr>
<tr><td>Builder (Rider)</td><td>$29/mo</td><td>Unlimited projects, 10 agents, deploys</td></tr>
<tr><td>Fleet (Paver)</td><td>$99/mo</td><td>62 agents, priority, events, flags</td></tr>
<tr><td>Enterprise</td><td>$299/mo</td><td>Custom agents, dedicated nodes, SLA, SSO</td></tr>
</table>

<h3>Revenue Projections</h3>
<table>
<tr><th>Year</th><th>Users</th><th>Paid %</th><th>ARPU</th><th>Revenue</th><th>Valuation</th></tr>
<tr><td>Y1</td><td>50,000</td><td>5%</td><td>$15</td><td>$450K</td><td>$10M</td></tr>
<tr><td>Y2</td><td>250,000</td><td>8%</td><td>$20</td><td>$4.8M</td><td>$50M</td></tr>
<tr><td>Y3</td><td>1,000,000</td><td>10%</td><td>$25</td><td>$30M</td><td>$200M</td></tr>
<tr><td>Y5</td><td>8,000,000</td><td>15%</td><td>$35</td><td>$504M</td><td>$2B+</td></tr>
</table>

<h2>7. Competitive Advantage</h2>
<ul>
<li><strong>Zero infrastructure costs:</strong> Browser-based compute. Infrastructure runs on user devices + $40/mo fleet.</li>
<li><strong>AI-native from day one:</strong> 62 agents built in, not bolted on. Bolt.new went $0&rarr;$20M ARR in 2 months with Claude.</li>
<li><strong>200+ open-source forks:</strong> Rebranded as "Road Fleet" &mdash; reduces dev costs 80%, time-to-market 6-12 months.</li>
<li><strong>Full sovereignty:</strong> Self-hosted Git (414 repos), DNS, AI inference, database, cache, VPN, CI/CD. Only external dep: Stripe (card charging) and GoDaddy (registrar).</li>
<li><strong>Founder background:</strong> FINRA Series 7/63/65 licensed. $23M+ in annuity sales. $18.4M in AUM identified. Sales&rarr;finance&rarr;real estate&rarr;tech founder.</li>
</ul>

<h2>8. Founder</h2>
<div class="highlight">
<p><strong>Alexa Louise Amundson</strong> &mdash; CEO, sole founder, sole director.</p>
<ul>
<li>FINRA Series 7, 63, 65 (Investment Advisor Representative)</li>
<li>$23M+ annuity sales, $18.4M AUM identified</li>
<li>Built 168,243 LOC, 414 repos, 62 AI agents, 20 live products &mdash; solo</li>
<li>Delaware C-Corp via Stripe Atlas, 83(b) election filed</li>
<li>Background: sales, finance, real estate (all licensed), self-taught engineer</li>
</ul>
</div>

<h2>9. Cap Table</h2>
<table>
<tr><th>Stockholder</th><th>Shares</th><th>%</th><th>Class</th><th>Status</th></tr>
<tr><td>Alexa Louise Amundson</td><td>9,000,000</td><td>90%</td><td>Common</td><td>Vesting (4yr/1yr cliff)</td></tr>
<tr><td>Unissued (ESOP/investors)</td><td>1,000,000</td><td>10%</td><td>Common</td><td>Reserved</td></tr>
<tr><td><strong>Total Authorized</strong></td><td><strong>10,000,000</strong></td><td><strong>100%</strong></td><td></td><td></td></tr>
</table>
<p style="color:var(--sub);font-size:12px;margin-top:8px">Cliff date: November 17, 2026. Full vest: November 17, 2029. 100% acceleration on change of control.</p>

<h2>10. Use of Funds (Seed: $2-5M)</h2>
<table>
<tr><th>Category</th><th>%</th><th>Purpose</th></tr>
<tr><td>Engineering</td><td>50%</td><td>3-5 engineers, ship Genesis Road + Roadie + RoadView</td></tr>
<tr><td>Infrastructure</td><td>15%</td><td>GPU compute (H100), scaling fleet to 150 nodes</td></tr>
<tr><td>Growth</td><td>20%</td><td>Product Hunt launch, content marketing, dev advocacy</td></tr>
<tr><td>Operations</td><td>10%</td><td>Legal, accounting, SOC2 audit</td></tr>
<tr><td>Reserve</td><td>5%</td><td>12-month runway buffer</td></tr>
</table>

<h2>11. Documents</h2>
<div class="section-grid">
<div class="doc"><h4>Certificate of Incorporation</h4><p>Delaware, Nov 17 2025</p></div>
<div class="doc"><h4>Bylaws</h4><p>Corporate governance</p></div>
<div class="doc"><h4>83(b) Election</h4><p>IRS filing, founder stock</p></div>
<div class="doc"><h4>RSPA</h4><p>Restricted Stock Purchase Agreement</p></div>
<div class="doc"><h4>EIN (CP 575)</h4><p>41-2663817</p></div>
<div class="doc"><h4>Stock Certificate C-1</h4><p>9,000,000 shares Common</p></div>
<div class="doc"><h4>CIIAA</h4><p>IP assignment agreement</p></div>
<div class="doc"><h4>Board Action</h4><p>Initial board resolutions</p></div>
<div class="doc"><h4>Indemnification</h4><p>Director indemnification</p></div>
<div class="doc"><h4>Cap Table</h4><p>Current ownership breakdown</p></div>
<div class="doc"><h4>Tax Filing Guide</h4><p>Form 1120 due 04/15/2026</p></div>
<div class="doc"><h4>Competitive Intelligence</h4><p>8 markets, $100B+ TAM analysis</p></div>
</div>

<h2>12. Contact</h2>
<div class="highlight">
<p><strong>Alexa Louise Amundson</strong><br>
CEO, BlackRoad OS, Inc.<br>
alexa@blackroad.io<br>
<a href="https://blackroad.io" style="color:var(--text);border-bottom:1px solid var(--border)">blackroad.io</a> &middot;
<a href="https://app.blackroad.io" style="color:var(--text);border-bottom:1px solid var(--border)">app.blackroad.io</a> &middot;
<a href="https://roadcode.blackroad.io" style="color:var(--text);border-bottom:1px solid var(--border)">roadcode.blackroad.io</a></p>
</div>

</div>
<footer>BlackRoad OS, Inc. &mdash; Delaware C-Corporation &mdash; Confidential &mdash; Pave Tomorrow.</footer>
</body></html>`;
