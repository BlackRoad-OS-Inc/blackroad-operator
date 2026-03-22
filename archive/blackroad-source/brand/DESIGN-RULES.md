# BlackRoad Design System Rules
## Canonical reference: brand.blackroad.io

## The Two Laws of Text
1. **Text is ONLY white or black** — no colored text ever
2. **Black text = white background, White text = black background** — always

## Container Rules
- Containers: **outlined** (border) with `border-radius` per component type
- Background: `--card: #0a0a0a` or `--elevated: #111` — never bright color fills
- Card hover: `border-color: #333`

## Border Radius (per brand.blackroad.io)
- **Cards**: `10px`
- **Buttons**: `6px` (sm: `5px`, lg: `8px`)
- **Inputs/textarea/select**: `6px`
- **Badges**: `4px`
- **Nav bar**: `10px`
- **Avatars**: `50%`
- **Dots**: `50%`
- **Dividers**: `1-2px`
- **Icons (btn-icon)**: `8px`

## Color Rules
- Shapes, animations, decorative elements: **full color**
- Primary gradient: `#FF6B2B → #FF2255 → #CC00AA → #8844FF → #4488FF → #00D4FF`
- Solid accent colors allowed for non-text decorative elements
- Gradient bars, glows, borders, icons, illustrations = colorful

## Typography
- Display/Headings: Space Grotesk (700/600)
- Body: Space Grotesk or Inter (400)
- Code/Mono: JetBrains Mono (400/500)

## CSS Variables
```css
--bg: #000;  --card: #0a0a0a;  --elevated: #111;  --hover: #181818;
--border: #1a1a1a;  --muted: #444;  --sub: #737373;  --text: #f5f5f5;
--sg: 'Space Grotesk';  --jb: 'JetBrains Mono';  --in: 'Inter';
--grad: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF);
--radius-sm: 4px;  --radius: 6px;  --radius-md: 8px;  --radius-lg: 10px;
```

## Summary
```
TEXT        → white (#f5f5f5) or black only
BACKGROUNDS → #000, #0a0a0a (card), #111 (elevated) — never bright fills
CONTAINERS  → outlined, border-radius per component, card bg #0a0a0a
BUTTONS     → 6px radius, gradient or outline
EVERYTHING ELSE → colorful (gradient, solids, full spectrum)
```
