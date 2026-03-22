# BlackRoad Brand Design System

## Color Palette

### Primary Brand Gradient
```css
background: linear-gradient(135deg,
  #F5A623 0%,        /* Amber */
  #FF1D6C 38.2%,     /* Hot Pink — Golden ratio */
  #9C27B0 61.8%,     /* Violet — Golden ratio */
  #2979FF 100%       /* Electric Blue */
);
```

### Core Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Black | `#000000` | 0, 0, 0 | Backgrounds, text |
| White | `#FFFFFF` | 255, 255, 255 | Text on dark |
| Amber | `#F5A623` | 245, 166, 35 | Warm accent |
| Hot Pink | `#FF1D6C` | 255, 29, 108 | **Primary brand** |
| Violet | `#9C27B0` | 156, 39, 176 | AI/agent accent |
| Electric Blue | `#2979FF` | 41, 121, 255 | Interactive/links |

### ❌ Forbidden Colors (Legacy — DO NOT USE)
```
#FF9D00  #FF6B00  #FF0066  #FF006B  #D600AA  #7700FF  #0066FF
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
             "Helvetica Neue", Arial, sans-serif;
```

### Scale (Golden Ratio φ = 1.618)
| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | 10px | Labels, captions |
| `--text-sm` | 13px | Body secondary |
| `--text-md` | 16px | Body |
| `--text-lg` | 21px | Subheadings |
| `--text-xl` | 34px | Headings |
| `--text-2xl` | 55px | Hero titles |

```css
line-height: 1.618; /* Always golden ratio */
```

---

## Spacing

```css
--space-xs: 8px;
--space-sm: 13px;   /* 8 × φ */
--space-md: 21px;   /* 13 × φ */
--space-lg: 34px;   /* 21 × φ */
--space-xl: 55px;   /* 34 × φ */
--space-2xl: 89px;  /* 55 × φ */
```

---

## Animation

```css
--ease: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

### Duration
| Token | Value | Use |
|-------|-------|-----|
| `--duration-fast` | 100ms | Hover states |
| `--duration-base` | 200ms | Most transitions |
| `--duration-slow` | 400ms | Page transitions |
| `--duration-slower` | 800ms | Complex animations |

---

## Component Patterns

### Card
```tsx
<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
  ...
</div>
```

### Brand Button
```tsx
<button
  style={{
    background: "linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)",
    border: "none",
    color: "white",
    padding: "13px 34px",
    borderRadius: "8px",
    fontWeight: 600,
  }}
>
  Get Started
</button>
```

### Agent Color Map
| Agent | Color | Hex |
|-------|-------|-----|
| LUCIDIA | Red | `#FF3B5C` |
| ALICE | Green | `#00E676` |
| OCTAVIA | Purple | `#9C27B0` |
| PRISM | Yellow | `#FFD740` |
| ECHO | Blue | `#2979FF` |
| CIPHER | Slate | `#B0BEC5` |

---

## Logo

The BlackRoad OS logo uses the brand gradient applied to "BlackRoad OS" text with the "OS" portion receiving the full gradient treatment. No logo images — always rendered via CSS gradient text.

```tsx
<span>BlackRoad </span>
<span style={{ background: "linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
  OS
</span>
```

---

*© 2026 BlackRoad OS, Inc. — Brand guidelines v1.0*
