#!/usr/bin/env python3
"""Upgrade canvas animations across all 19 sites for viral-worthy visuals."""

import os, re

SITES_DIR = os.path.join(os.path.dirname(__file__), "sites")

# The OLD basic particle system (minified patterns to match)
OLD_PARTICLE_PATTERNS = [
    # Match the basic particle draw function
    r"function draw\(\)\{cx\.clearRect\(0,0,W,H\);P\.forEach\(p=>\{p\.x\+=p\.vx;p\.y\+=p\.vy;if\(p\.x<0\)p\.x=W;if\(p\.x>W\)p\.x=0;if\(p\.y<0\)p\.y=H;if\(p\.y>H\)p\.y=0;cx\.beginPath\(\);cx\.arc\(p\.x,p\.y,p\.r,0,6\.28\);cx\.fillStyle=p\.c;cx\.globalAlpha=p\.a;cx\.fill\(\)\}\);cx\.globalAlpha=1;requestAnimationFrame\(draw\)\}draw\(\);",
]

# Enhanced particle system with constellation lines, mouse interaction, and cursor glow
NEW_PARTICLE_SYSTEM = """let mx=-1,my=-1;document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});document.addEventListener('mouseleave',()=>{mx=-1;my=-1});
function draw(){cx.clearRect(0,0,W,H);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;if(mx>0){const dx=p.x-mx,dy=p.y-my,dist=Math.sqrt(dx*dx+dy*dy);if(dist<150){const f=.02*(1-dist/150);p.vx+=dx*f;p.vy+=dy*f}p.vx*=.99;p.vy*=.99}});for(let i=0;i<P.length;i++){for(let j=i+1;j<P.length;j++){const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=dx*dx+dy*dy;if(d<22500){cx.beginPath();cx.moveTo(P[i].x,P[i].y);cx.lineTo(P[j].x,P[j].y);cx.strokeStyle=P[i].c;cx.globalAlpha=.03*(1-d/22500);cx.lineWidth=.5;cx.stroke()}}}P.forEach(p=>{cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fillStyle=p.c;cx.globalAlpha=p.a;cx.fill();cx.beginPath();cx.arc(p.x,p.y,p.r*3,0,6.28);cx.fillStyle=p.c;cx.globalAlpha=p.a*.3;cx.fill()});if(mx>0){const grd=cx.createRadialGradient(mx,my,0,mx,my,120);grd.addColorStop(0,'rgba(136,68,255,.06)');grd.addColorStop(.5,'rgba(0,212,255,.03)');grd.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=1;cx.fillStyle=grd;cx.fillRect(mx-120,my-120,240,240)}cx.globalAlpha=1;requestAnimationFrame(draw)}draw();"""

# Additional CSS for enhanced effects
EXTRA_CSS = """
.hero h1{background:linear-gradient(90deg,#f5f5f5 0%,#f5f5f5 40%,#CC00AA 60%,#4488FF 80%,#00D4FF 100%);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fu .6s ease .1s both,shimmer 8s ease-in-out infinite}
@keyframes shimmer{0%,100%{background-position:100% 0}50%{background-position:0% 0}}
.sw-card,.product,.article,.svc,.uptime-card,.node-card,.feature-card,.stat-card,.tool-card,.member-card,.token-card,.chain-card,.cat-card{transition:border-color .2s,transform .2s,box-shadow .2s}
.sw-card:hover,.product:hover,.article:hover,.uptime-card:hover,.node-card:hover,.feature-card:hover,.stat-card:hover,.tool-card:hover,.member-card:hover,.token-card:hover,.chain-card:hover,.cat-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(136,68,255,.06)}
"""

# Counter animation script for stats
COUNTER_SCRIPT = """
document.querySelectorAll('[data-count]').forEach(el=>{const target=parseInt(el.dataset.count);const obs2=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){let current=0;const step=target/60;const timer=setInterval(()=>{current+=step;if(current>=target){current=target;clearInterval(timer)}el.textContent=Math.floor(current).toLocaleString()},16);obs2.unobserve(el)}})},{threshold:.5});obs2.observe(el)});
"""

def upgrade_site(domain):
    filepath = os.path.join(SITES_DIR, domain, "index.html")
    if not os.path.exists(filepath):
        return False

    with open(filepath, 'r') as f:
        html = f.read()

    # Skip if already upgraded
    if 'mousemove' in html and 'shimmer' in html:
        print(f"  SKIP {domain} — already upgraded")
        return True

    modified = False

    # 1. Replace basic particle draw with enhanced version
    old_draw = "function draw(){cx.clearRect(0,0,W,H);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fillStyle=p.c;cx.globalAlpha=p.a;cx.fill()});cx.globalAlpha=1;requestAnimationFrame(draw)}draw();"
    if old_draw in html:
        html = html.replace(old_draw, NEW_PARTICLE_SYSTEM)
        modified = True

    # 2. Add shimmer CSS before </style>
    if 'shimmer' not in html:
        html = html.replace('</style>', EXTRA_CSS + '</style>')
        modified = True

    # 3. Add counter animation before </script>
    if 'data-count' not in html:
        html = html.replace('</script>', COUNTER_SCRIPT + '</script>', 1)  # Only first script tag
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(html)
        size = os.path.getsize(filepath)
        print(f"  OK {domain} ({size:,}B)")
    else:
        print(f"  UNCHANGED {domain}")
    return True

DOMAINS = [
    "blackroad.io", "blackroad.company", "blackroad.me", "blackroad.network",
    "blackroad.systems", "blackroadqi.com", "blackroadquantum.com",
    "blackroadquantum.info", "blackroadquantum.net", "blackroadquantum.shop",
    "blackroadquantum.store", "lucidia.earth", "lucidia.studio", "lucidiaqi.com",
    "roadchain.io", "roadcoin.io", "blackroadai.com", "blackboxprogramming.io",
    "blackroadinc.us"
]

print("Upgrading animations across all 19 sites...")
for domain in DOMAINS:
    upgrade_site(domain)
print("Done")
