# ⚠️ BLACKROAD BRAND SYSTEM - MANDATORY READING

**CRITICAL:** Every Claude agent MUST read this file BEFORE making any design changes.

## 🎨 Brand Colors (EXACT VALUES - DO NOT DEVIATE)

```css
--black: #000000;
--white: #FFFFFF;
--amber: #F5A623;
--orange: #F26522;
--hot-pink: #FF1D6C;
--magenta: #E91E63;
--electric-blue: #2979FF;
--sky-blue: #448AFF;
--violet: #9C27B0;
--deep-purple: #5E35B1;
```

## 🌈 Gradient (EXACT FORMULA)

```css
--gradient-brand: linear-gradient(135deg, var(--amber) 0%, var(--hot-pink) 38.2%, var(--violet) 61.8%, var(--electric-blue) 100%);
```

**Golden Ratio Stops:** 0%, 38.2%, 61.8%, 100%

## 📏 Spacing System (Fibonacci-Based)

```css
--phi: 1.618;
--space-xs: 8px;
--space-sm: 13px;
--space-md: 21px;
--space-lg: 34px;
--space-xl: 55px;
--space-2xl: 89px;
--space-3xl: 144px;
```

## 🎭 Easing Functions

```css
--ease: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

## 🔤 Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
```

**Line Height:**
```css
line-height: 1.618; /* Golden ratio */
```

## ✨ Key Design Elements

### Logo Animation
- Spinning road dashes: `20s linear infinite`
- Transform origin: `50px 50px`

### Background Grid
- Grid size: `55px 55px`
- Color: `rgba(255,255,255,0.03)`
- Animation: moves diagonally

### Floating Particles
- Colors: amber, hot-pink, electric-blue, violet
- Random sizes: 3px - 7px
- Float from bottom to top with rotation

### Glowing Orbs
- Blur: `100px - 150px`
- Opacity: `0.08 - 0.15`
- Slow drift animations

## 🚦 Button Styles

### Primary Button
- Background: `var(--white)`
- Color: `var(--black)`
- Hover: gradient overlay with lift effect
- Shadow on hover: `0 12px 40px rgba(255, 29, 108, 0.4)`

### Secondary Button
- Background: `rgba(255, 255, 255, 0.08)`
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Hover: lighter background + hot-pink border

## 📋 Component Patterns

### Cards
- Background: `rgba(255, 255, 255, 0.03)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Border radius: `16px - 24px`
- Hover: `translateY(-4px)` with border brightening

### Input Fields
- Background: `rgba(255, 255, 255, 0.03)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Focus border: `var(--hot-pink)`
- Border radius: `6px - 10px`

## 🎬 Animation Principles

1. **Fade Up**: Default entry animation
   - Opacity: 0 → 1
   - Transform: `translateY(30px)` → `translateY(0)`
   - Duration: `0.8s`
   - Easing: `var(--ease-out)`
   - Stagger delays: 0.2s increments

2. **Hover Interactions**:
   - Lift: `translateY(-3px to -4px)`
   - Spring easing: `var(--ease-spring)`
   - Duration: `0.3s - 0.4s`

3. **Background Animations**:
   - Grid movement: `20s - 30s linear infinite`
   - Orb drift: `25s - 30s ease-in-out infinite`
   - Particle float: `11s - 24s linear infinite`

## 🎨 Official Templates

All design MUST match these official templates:

1. **Homepage:** `/Users/alexa/Downloads/files(4)/blackroad-template-01-homepage.html`
2. **Pricing:** `/Users/alexa/Downloads/files(4)/blackroad-template-03-pricing.html`
3. **Auth:** `/Users/alexa/Downloads/files(4)/blackroad-template-09-auth.html`
4. **Motion Gallery:** `/Users/alexa/Desktop/blackroad-mega-motion-gallery.html`

## ❌ FORBIDDEN PRACTICES

1. **DO NOT** use random colors outside the brand palette
2. **DO NOT** use different spacing values (only use the Fibonacci sequence)
3. **DO NOT** create custom gradients (only use `--gradient-brand`)
4. **DO NOT** use different fonts
5. **DO NOT** ignore the golden ratio (1.618) in layouts
6. **DO NOT** create designs without reading this file first

## ✅ CHECKLIST BEFORE ANY DESIGN WORK

- [ ] Read this entire file
- [ ] Reference official template files
- [ ] Use exact color values from brand palette
- [ ] Use Fibonacci spacing system
- [ ] Apply gradient-brand for accents
- [ ] Test animations with correct easing
- [ ] Ensure golden ratio proportions
- [ ] Match component styles from templates

---

**Last Updated:** 2025-12-28
**Source of Truth:** Official BlackRoad brand templates
**Enforcement:** MANDATORY for all Claude agents
