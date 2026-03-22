#!/usr/bin/env python3
"""Add mouse interaction to sites that already have constellation lines."""

import os

SITES_DIR = os.path.join(os.path.dirname(__file__), "sites")

MOUSE_CODE = """let mx=-1,my=-1;document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});document.addEventListener('mouseleave',()=>{mx=-1;my=-1});
"""

CURSOR_GLOW = """if(mx>0){P.forEach(p=>{const dx=p.x-mx,dy=p.y-my,dist=Math.sqrt(dx*dx+dy*dy);if(dist<150){const f=.02*(1-dist/150);p.vx+=dx*f;p.vy+=dy*f}p.vx*=.99;p.vy*=.99});const grd=cx.createRadialGradient(mx,my,0,mx,my,120);grd.addColorStop(0,'rgba(136,68,255,.06)');grd.addColorStop(.5,'rgba(0,212,255,.03)');grd.addColorStop(1,'rgba(0,0,0,0)');cx.globalAlpha=1;cx.fillStyle=grd;cx.fillRect(mx-120,my-120,240,240)}"""

SHIMMER_CSS = """.hero h1{background:linear-gradient(90deg,#f5f5f5 0%,#f5f5f5 40%,#CC00AA 60%,#4488FF 80%,#00D4FF 100%);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fu .6s ease .1s both,shimmer 8s ease-in-out infinite}
@keyframes shimmer{0%,100%{background-position:100% 0}50%{background-position:0% 0}}
"""

HOVER_CSS = """.sw-card,.product,.article,.svc,.uptime-card,.node-card,.feature-card,.stat-card,.tool-card,.member-card,.token-card,.chain-card,.cat-card,.domain-card,.agent-card,.event-card{transition:border-color .2s,transform .2s,box-shadow .2s}
.sw-card:hover,.product:hover,.article:hover,.uptime-card:hover,.node-card:hover,.feature-card:hover,.stat-card:hover,.tool-card:hover,.member-card:hover,.token-card:hover,.chain-card:hover,.cat-card:hover,.domain-card:hover,.agent-card:hover,.event-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(136,68,255,.06)}
"""

DOMAINS = ["blackroad.io", "blackroad.company", "blackroad.network",
           "roadchain.io", "blackroadai.com", "lucidia.earth"]

for domain in DOMAINS:
    filepath = os.path.join(SITES_DIR, domain, "index.html")
    if not os.path.exists(filepath):
        continue

    with open(filepath, 'r') as f:
        html = f.read()

    if 'mousemove' in html:
        print(f"  SKIP {domain} — already has mouse")
        continue

    modified = False

    # Add mouse tracking before the draw function
    if 'function draw()' in html and 'mousemove' not in html:
        html = html.replace('function draw(){', MOUSE_CODE + 'function draw(){')
        modified = True

    # Add cursor glow before the last requestAnimationFrame
    if 'requestAnimationFrame(draw)}draw()' in html and 'grd' not in html:
        html = html.replace('requestAnimationFrame(draw)}draw()',
                          CURSOR_GLOW + 'requestAnimationFrame(draw)}draw()')
        modified = True
    elif 'cx.globalAlpha=1;requestAnimationFrame(draw)}draw()' in html and 'grd' not in html:
        html = html.replace('cx.globalAlpha=1;requestAnimationFrame(draw)}draw()',
                          CURSOR_GLOW + 'cx.globalAlpha=1;requestAnimationFrame(draw)}draw()')
        modified = True

    # Add shimmer CSS
    if 'shimmer' not in html:
        html = html.replace('</style>', SHIMMER_CSS + HOVER_CSS + '</style>')
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(html)
        size = os.path.getsize(filepath)
        print(f"  OK {domain} ({size:,}B)")
    else:
        print(f"  UNCHANGED {domain}")
