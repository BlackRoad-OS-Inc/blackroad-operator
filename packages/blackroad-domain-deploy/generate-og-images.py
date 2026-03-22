#!/usr/bin/env python3
"""Generate OG images for all 19 BlackRoad domain sites."""

from PIL import Image, ImageDraw, ImageFont
import os, math

SITES_DIR = os.path.join(os.path.dirname(__file__), "sites")

# Brand gradient colors
GRADIENT = [(255,107,43), (255,34,85), (204,0,170), (136,68,255), (68,136,255), (0,212,255)]

DOMAINS = {
    "blackroad.io": {"title": "BlackRoad", "sub": "Sovereign Intelligence Infrastructure", "icon": "BR"},
    "blackroad.company": {"title": "BlackRoad", "sub": "Company", "icon": "BR"},
    "blackroad.me": {"title": "BlackRoad.me", "sub": "Sovereign Identity", "icon": "ID"},
    "blackroad.network": {"title": "BlackRoad", "sub": "Distributed Infrastructure", "icon": "NET"},
    "blackroad.systems": {"title": "BlackRoad", "sub": "Systems Status", "icon": "SYS"},
    "blackroadqi.com": {"title": "BlackRoad QI", "sub": "Quantum Intelligence", "icon": "QI"},
    "blackroadquantum.com": {"title": "BlackRoad Quantum", "sub": "Quantum Computing Hub", "icon": "Q"},
    "blackroadquantum.info": {"title": "BlackRoad Quantum", "sub": "Knowledge Base", "icon": "KB"},
    "blackroadquantum.net": {"title": "BlackRoad Quantum", "sub": "Distributed Quantum Network", "icon": "QN"},
    "blackroadquantum.shop": {"title": "BlackRoad Quantum", "sub": "Digital Products", "icon": "QS"},
    "blackroadquantum.store": {"title": "BlackRoad Quantum", "sub": "Software & Tools", "icon": "ST"},
    "lucidia.earth": {"title": "Lucidia", "sub": "Cognition. Memory. Presence.", "icon": "L"},
    "lucidia.studio": {"title": "Lucidia Studio", "sub": "Creative Intelligence", "icon": "LS"},
    "lucidiaqi.com": {"title": "Lucidia QI", "sub": "Quantum Intelligence Cognition", "icon": "LQ"},
    "roadchain.io": {"title": "RoadChain", "sub": "Sovereign Witnessing Ledger", "icon": "RC"},
    "roadcoin.io": {"title": "RoadCoin", "sub": "Sovereign Token Economy", "icon": "RD"},
    "blackroadai.com": {"title": "BlackRoad AI", "sub": "Sovereign Artificial Intelligence", "icon": "AI"},
    "blackboxprogramming.io": {"title": "BlackBox", "sub": "Developer Tools & Open Source", "icon": "BB"},
    "blackroadinc.us": {"title": "BlackRoad Inc.", "sub": "US Corporate", "icon": "US"},
}

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def gradient_color(x, width):
    """Get gradient color at position x across width."""
    pos = (x / width) * (len(GRADIENT) - 1)
    idx = int(pos)
    t = pos - idx
    if idx >= len(GRADIENT) - 1:
        return GRADIENT[-1]
    return lerp_color(GRADIENT[idx], GRADIENT[idx + 1], t)

def create_og_image(domain, info):
    """Create a 1200x630 OG image."""
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), (0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw gradient bar at top (6px)
    for x in range(W):
        color = gradient_color(x, W)
        draw.line([(x, 0), (x, 5)], fill=color)

    # Draw gradient bar at bottom (4px)
    for x in range(W):
        color = gradient_color(x, W)
        draw.line([(x, H-4), (x, H-1)], fill=color)

    # Draw subtle grid pattern
    for y in range(20, H-20, 40):
        draw.line([(60, y), (W-60, y)], fill=(15, 15, 15))
    for x in range(60, W-60, 40):
        draw.line([(x, 20), (x, H-20)], fill=(15, 15, 15))

    # Draw floating gradient dots (decorative)
    import random
    random.seed(hash(domain))
    for _ in range(25):
        dx = random.randint(60, W-60)
        dy = random.randint(40, H-40)
        dr = random.randint(2, 6)
        color = gradient_color(dx, W)
        alpha_color = tuple(int(c * 0.15) for c in color)
        draw.ellipse([dx-dr, dy-dr, dx+dr, dy+dr], fill=alpha_color)

    # Draw pulsing logo bars (left side)
    bar_x = 80
    bar_y_start = 180
    for i, color in enumerate(GRADIENT):
        bh = 50 - i * 3
        by = bar_y_start + i * (bh + 4) - 60
        faded = tuple(int(c * 0.7) for c in color)
        draw.rounded_rectangle([bar_x, by, bar_x + 5, by + bh], radius=2, fill=faded)

    # Title text - use default font at large size
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        domain_font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 18)
    except:
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()
        domain_font = ImageFont.load_default()

    # Title
    draw.text((120, 200), info["title"], fill=(245, 245, 245), font=title_font)

    # Subtitle with gradient-ish color
    draw.text((120, 290), info["sub"], fill=(115, 115, 115), font=sub_font)

    # Gradient line under subtitle
    for x in range(120, 500):
        color = gradient_color(x - 120, 380)
        faded = tuple(int(c * 0.6) for c in color)
        draw.point((x, 335), fill=faded)
        draw.point((x, 336), fill=faded)

    # Domain name at bottom
    draw.text((120, 540), domain, fill=(68, 68, 68), font=domain_font)

    # "BlackRoad" brand tag at bottom right
    draw.text((W - 280, 540), "blackroad.io", fill=(40, 40, 40), font=domain_font)

    # Icon/badge in top right
    badge_x, badge_y = W - 180, 60
    # Draw icon circle with gradient border
    for angle in range(360):
        rad = math.radians(angle)
        for r in range(38, 42):
            px = int(badge_x + r * math.cos(rad))
            py = int(badge_y + r * math.sin(rad))
            if 0 <= px < W and 0 <= py < H:
                color = gradient_color((angle / 360) * W, W)
                faded = tuple(int(c * 0.5) for c in color)
                draw.point((px, py), fill=faded)

    # Icon text
    try:
        icon_font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 22)
    except:
        icon_font = ImageFont.load_default()

    icon_text = info["icon"]
    bbox = draw.textbbox((0, 0), icon_text, font=icon_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text((badge_x - tw//2, badge_y - th//2), icon_text, fill=(200, 200, 200), font=icon_font)

    # Save
    out_path = os.path.join(SITES_DIR, domain, "og.png")
    img.save(out_path, "PNG", optimize=True)
    size = os.path.getsize(out_path)
    print(f"  {domain}/og.png ({size:,}B)")

print("Generating OG images...")
for domain, info in DOMAINS.items():
    create_og_image(domain, info)
print(f"Done — {len(DOMAINS)} images generated")
