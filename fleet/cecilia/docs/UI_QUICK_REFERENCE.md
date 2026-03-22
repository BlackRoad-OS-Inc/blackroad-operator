# BlackRoad UI Quick Reference Guide

## 🚀 Quick Start

### Import Components
```tsx
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { colors, gradients } from '@/components/design-tokens'
```

### Import CSS Animations
```tsx
import '@/app/globals.css'

<div className="animate-fade-in">Content</div>
```

## 🎨 Components

### Button
```tsx
// Primary button (default)
<Button variant="primary">Click Me</Button>

// Secondary button
<Button variant="secondary" size="lg">Get Started</Button>

// Link button
<Button variant="tertiary" href="/pricing">Pricing</Button>

// Ghost button
<Button variant="ghost">Learn More</Button>

// Disabled
<Button disabled>Can't Click</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `onClick`: () => void
- `href`: string (makes it a link)

### Card
```tsx
// Default card
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>

// Elevated card with hover
<Card variant="elevated" hoverable>
  Content
</Card>

// Glass morphism card
<Card variant="glass">
  Frosted glass effect
</Card>

// With gradient
<Card gradient={gradients.primary}>
  Purple gradient background
</Card>
```

**Props**:
- `variant`: 'default' | 'elevated' | 'outlined' | 'glass'
- `gradient`: string (CSS gradient)
- `hoverable`: boolean (enables hover animation)
- `onClick`: () => void

## 🎨 Design Tokens

### Colors
```tsx
import { colors } from '@/components/design-tokens'

colors.primary.purple        // #667eea
colors.primary.deepPurple    // #764ba2
colors.primary.pink          // #f093fb
colors.primary.red           // #f5576c
colors.secondary.cyan        // #4facfe
colors.neutral.black         // #0a0a0a
colors.neutral.darkGray      // #1a1a1a
colors.semantic.success      // #4ade80
colors.semantic.error        // #ef4444
```

### Gradients
```tsx
import { gradients } from '@/components/design-tokens'

gradients.primary     // Purple gradient
gradients.secondary   // Pink gradient
gradients.tertiary    // Cyan gradient
gradients.warm        // Peach gradient
gradients.cool        // Teal gradient
gradients.rainbow     // Multi-color
```

### Spacing
```tsx
import { spacing } from '@/components/design-tokens'

spacing.xs      // 0.25rem (4px)
spacing.sm      // 0.5rem (8px)
spacing.md      // 1rem (16px)
spacing.lg      // 1.5rem (24px)
spacing.xl      // 2rem (32px)
spacing['2xl']  // 3rem (48px)
spacing['3xl']  // 4rem (64px)
```

### Border Radius
```tsx
import { borderRadius } from '@/components/design-tokens'

borderRadius.sm    // 4px
borderRadius.md    // 8px
borderRadius.lg    // 12px
borderRadius.xl    // 16px
borderRadius['2xl'] // 24px
borderRadius.full  // 9999px
```

### Shadows
```tsx
import { shadows } from '@/components/design-tokens'

shadows.sm      // Subtle shadow
shadows.md      // Medium shadow
shadows.lg      // Large shadow
shadows.xl      // Extra large
shadows['2xl']  // 2X large
shadows.glow    // Purple glow
```

### Typography
```tsx
import { typography } from '@/components/design-tokens'

// Font sizes
typography.fontSize.xs       // 0.75rem
typography.fontSize.base     // 1rem
typography.fontSize['4xl']   // 2.25rem
typography.fontSize['7xl']   // 4.5rem

// Font weights
typography.fontWeight.normal    // 400
typography.fontWeight.bold      // 700
typography.fontWeight.black     // 900
```

## ✨ CSS Animations

### Fade In
```tsx
<div className="animate-fade-in">
  Smooth fade-in on load
</div>
```

### Slide In
```tsx
<div className="animate-slide-in">
  Slides from left
</div>
```

### Pulse
```tsx
<div className="animate-pulse">
  Subtle pulsing effect
</div>
```

### Skeleton Loader
```tsx
<div className="skeleton" style={{ 
  width: '100%', 
  height: '20px', 
  borderRadius: '4px' 
}}>
</div>
```

## 📱 Responsive Utilities

### Hide on Mobile
```tsx
<div className="hide-mobile">
  Only visible on desktop
</div>
```

### Hide on Desktop
```tsx
<div className="hide-desktop">
  Only visible on mobile
</div>
```

## 🎯 Common Patterns

### Hero Section
```tsx
<div style={{
  background: gradients.rainbow,
  padding: spacing['3xl'],
  borderRadius: borderRadius['2xl']
}}>
  <h1 className="animate-fade-in">Welcome to BlackRoad</h1>
  <Button variant="primary" size="lg">Get Started</Button>
</div>
```

### Feature Card Grid
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: spacing.xl
}}>
  <Card variant="elevated" hoverable>
    <h3>Feature 1</h3>
    <p>Description</p>
  </Card>
  <Card variant="elevated" hoverable>
    <h3>Feature 2</h3>
    <p>Description</p>
  </Card>
</div>
```

### CTA Section
```tsx
<Card gradient={gradients.primary} style={{ 
  color: 'white', 
  textAlign: 'center',
  padding: spacing['2xl']
}}>
  <h2>Ready to get started?</h2>
  <Button variant="secondary" size="lg">
    Start Free Trial
  </Button>
</Card>
```

### Loading State
```tsx
<Card>
  <div className="skeleton" style={{ 
    height: '20px', 
    marginBottom: spacing.md 
  }} />
  <div className="skeleton" style={{ 
    height: '60px', 
    marginBottom: spacing.sm 
  }} />
  <div className="skeleton" style={{ 
    height: '20px', 
    width: '60%' 
  }} />
</Card>
```

## 🔧 Customization

### Override Button Styles
```tsx
<Button 
  variant="primary"
  style={{ 
    fontSize: '1.5rem',
    padding: '2rem 4rem'
  }}
>
  Custom Size
</Button>
```

### Custom Gradient Card
```tsx
<Card gradient="linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)">
  Custom gradient
</Card>
```

### Inline Styles with Tokens
```tsx
<div style={{
  background: colors.neutral.darkGray,
  padding: spacing.xl,
  borderRadius: borderRadius.lg,
  boxShadow: shadows.glow,
  color: colors.neutral.offWhite
}}>
  Consistent styling
</div>
```

## 📚 Resources

- Full Documentation: `UI_ENHANCEMENT_COMPLETE.md`
- Component Source: `shared/components/`
- Design Tokens: `shared/styles/design-tokens.ts`
- Examples: Each service's `app/page.tsx`

## 🐛 Troubleshooting

### Components not found
Make sure components are in your service:
```bash
ls services/[your-service]/components/
```

### CSS not applying
Import globals.css in your layout:
```tsx
import './globals.css'
```

### Type errors
Components use TypeScript, ensure your project has:
- `next.config.js` with TypeScript enabled
- `tsconfig.json` configured

---

**Version**: 1.0.0  
**Updated**: February 3, 2026
