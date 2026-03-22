# BlackRoad Design System

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗           ║
║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝           ║
║   ██████╔╝██║     ███████║██║     █████╔╝            ║
║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗            ║
║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗           ║
║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝           ║
║                                                       ║
║   ██████╗  ██████╗  █████╗ ██████╗                   ║
║   ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗                  ║
║   ██████╔╝██║   ██║███████║██║  ██║                  ║
║   ██╔══██╗██║   ██║██╔══██║██║  ██║                  ║
║   ██║  ██║╚██████╔╝██║  ██║██████╔╝                  ║
║   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝                   ║
║                                                       ║
║            UNIFIED DESIGN SYSTEM v1.0.0               ║
║              BUILD 2025.11.08                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

SPECTRUM INITIALIZED.
```

A retro-futuristic design system combining Y2K aesthetics, Matrix vibes, and modern web capabilities. Perfect for creating next-level interfaces with that classic 90s/98 terminal feel.

## 🚀 Quick Start

### Installation

Include the CSS and JavaScript files in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="assets/blackroad.css" />
</head>
<body>
  <!-- Your content here -->

  <script src="assets/blackroad.js"></script>
</body>
</html>
```

That's it! The BlackRoad system will auto-initialize and be ready to use.

## 🌈 Color Spectrum

The BlackRoad palette flows from warm to cool colors, creating a vibrant retro-futuristic experience:

- **Gold**: `#fdba2d` - `var(--spectrum-gold)`
- **Orange**: `#ff6b35` - `var(--spectrum-orange)`
- **Pink**: `#ff4fd8` - `var(--spectrum-pink)`
- **Purple**: `#c753ff` - `var(--spectrum-purple)`
- **Indigo**: `#6366f1` - `var(--spectrum-indigo)`
- **Blue**: `#3b82f6` - `var(--spectrum-blue)`
- **Cyan**: `#06b6d4` - `var(--spectrum-cyan)`
- **Green**: `#10b981` - `var(--spectrum-green)`

### Gradients

```css
.bg-gradient-spectrum     /* Full spectrum gradient */
.bg-gradient-warm         /* Gold → Orange → Pink */
.bg-gradient-cool         /* Cyan → Blue → Purple */
.bg-gradient-retro        /* Cyan → Purple → Pink */
```

## 🎯 Components

### Buttons

```html
<!-- Spectrum button with gradient -->
<button class="btn btn-spectrum">Spectrum Button</button>

<!-- Retro CRT-style button -->
<button class="btn btn-retro">Retro Button</button>

<!-- Matrix-themed button -->
<button class="btn btn-matrix">Matrix Button</button>

<!-- Ghost transparent button -->
<button class="btn btn-ghost">Ghost Button</button>

<!-- Outline button -->
<button class="btn btn-outline">Outline Button</button>

<!-- Size variants -->
<button class="btn btn-spectrum btn-sm">Small</button>
<button class="btn btn-spectrum btn-lg">Large</button>
```

### Cards

```html
<!-- Standard card -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>

<!-- Retro CRT-style card -->
<div class="card card-retro">
  Terminal-style content
</div>

<!-- Glass morphism card -->
<div class="card card-glass">
  Frosted glass effect
</div>

<!-- Gradient background card -->
<div class="card card-gradient">
  Spectrum gradient background
</div>

<!-- Elevated card with shadow -->
<div class="card card-elevated">
  Floating appearance
</div>
```

### Input Fields

```html
<!-- Standard input -->
<input type="text" class="input" placeholder="Enter text..." />

<!-- Retro terminal-style input -->
<input type="text" class="input-retro" placeholder="TERMINAL INPUT..." />
```

### Badges

```html
<span class="badge badge-spectrum">Spectrum</span>
<span class="badge badge-pink">Pink</span>
<span class="badge badge-cyan">Cyan</span>
<span class="badge badge-gold">Gold</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-matrix">MATRIX</span>
```

### Avatars

```html
<div class="avatar avatar-sm avatar-spectrum">S</div>
<div class="avatar avatar-md avatar-spectrum">M</div>
<div class="avatar avatar-lg avatar-spectrum">L</div>
<div class="avatar avatar-xl avatar-spectrum">XL</div>
<div class="avatar avatar-lg avatar-retro">R</div>
```

### Progress Bars

```html
<div class="progress-bar">
  <div class="progress-fill progress-retro" style="width: 75%;"></div>
</div>
```

## 📝 Typography

### Text Sizes

```html
<div class="text-xs">Extra Small</div>
<div class="text-sm">Small</div>
<div class="text-base">Base</div>
<div class="text-lg">Large</div>
<div class="text-xl">Extra Large</div>
<div class="text-2xl">2XL</div>
<div class="text-3xl">3XL</div>
<div class="text-4xl">4XL</div>
```

### Text Effects

```html
<!-- Gradient text -->
<div class="text-gradient">Gradient Text</div>

<!-- Glowing text -->
<div class="text-glow-pink">Pink Glow</div>
<div class="text-glow-cyan">Cyan Glow</div>
<div class="text-glow-gold">Gold Glow</div>
<div class="text-glow-purple">Purple Glow</div>

<!-- Matrix green text -->
<div class="text-matrix">Matrix Text</div>

<!-- Neon effect -->
<div class="neon-text">Neon Text</div>

<!-- Terminal style -->
<div class="terminal-text">Terminal Text</div>
```

### Fonts

```html
<div class="font-system">System Font</div>
<div class="font-mono">Monospace Font</div>
```

## ✨ Visual Effects

### CRT Screen Effect

```html
<div class="crt-screen">
  <div class="crt-vignette"></div>
  <div class="terminal-text">
    > System initialized
    > Ready_<span class="cursor"></span>
  </div>
</div>
```

### Matrix Background

```html
<div class="matrix-bg">
  <div class="text-matrix">
    Matrix-style content
  </div>
</div>
```

### Holographic Effect

```html
<div class="holographic">
  Shimmering holographic effect
</div>
```

### Special Effects

```html
<!-- Blinking cursor -->
<span class="cursor"></span>

<!-- Glow box -->
<div class="glow-box">Content with inner glow</div>

<!-- RGB split text (requires data-text attribute) -->
<div class="rgb-split" data-text="GLITCH">GLITCH</div>

<!-- Glitch animation -->
<div class="glitch">Glitchy element</div>
```

## 🎬 Animations

### Built-in Animations

```html
<div class="animate-fadeIn">Fade In</div>
<div class="animate-slideUp">Slide Up</div>
<div class="animate-slideDown">Slide Down</div>
<div class="animate-slideLeft">Slide Left</div>
<div class="animate-slideRight">Slide Right</div>
<div class="animate-pulse">Pulsing</div>
<div class="animate-spin">Spinning</div>
<div class="animate-bounce">Bouncing</div>
<div class="animate-glow">Glowing</div>
```

### Interactive Effects

```html
<div class="hover-lift">Lifts on hover</div>
<div class="hover-scale">Scales on hover</div>
<div class="hover-glow">Glows on hover</div>
```

## 🎮 JavaScript API

### Audio

```javascript
// Retro sound effects
BlackRoad.Audio.beep(frequency, duration, volume);
BlackRoad.Audio.click();
BlackRoad.Audio.success();
BlackRoad.Audio.error();
BlackRoad.Audio.powerUp();
```

### Visual Effects

```javascript
// Screen flash
BlackRoad.Effects.flash('var(--spectrum-pink)', 150);

// Glitch effect
BlackRoad.Effects.glitch(element, 500);

// Matrix-style text reveal
BlackRoad.Effects.matrixReveal(element, 'The Matrix has you...', 50);

// Typewriter effect
BlackRoad.Effects.typewriter(element, 'Text here...', 50, callback);

// Particle burst
BlackRoad.Effects.particleBurst(x, y, color, count);

// RGB split effect
BlackRoad.Effects.addRGBSplit(element);
```

### Terminal

```javascript
// Create a terminal
const terminal = BlackRoad.Terminal.create({
  parent: document.body,
  prefix: '> ',
  color: 'var(--spectrum-cyan)'
});

// Write to terminal
terminal.write('Hello, world!');
terminal.writeLine('No prefix line');
terminal.type('Animated typing...', 50);
terminal.clear();
```

### Toast Notifications

```javascript
BlackRoad.Toast.success('Operation successful!');
BlackRoad.Toast.error('Something went wrong!');
BlackRoad.Toast.warning('Warning message!');
BlackRoad.Toast.info('Info notification!');

// Custom duration
BlackRoad.Toast.success('Message', 5000);
```

### Loading Indicators

```javascript
// Show loading overlay
BlackRoad.Loading.show('Loading data...');

// Hide loading overlay
BlackRoad.Loading.hide();
```

### Colors

```javascript
// Get random spectrum color
const color = BlackRoad.Colors.random();

// Interpolate between colors
const midColor = BlackRoad.Colors.interpolate('#ff0000', '#0000ff', 0.5);

// Cycle through spectrum colors
const interval = BlackRoad.Colors.cycle(element, 'color', 100);
```

### Animations

```javascript
// Smooth scroll to element
BlackRoad.Animate.scrollTo(element, offset, duration);

// Count up animation
BlackRoad.Animate.countUp(element, targetNumber, duration);
```

### Keyboard Shortcuts

```javascript
// Initialize keyboard handler
BlackRoad.Keyboard.init();

// Bind a keyboard shortcut
BlackRoad.Keyboard.bind('ctrl+k', (e) => {
  console.log('Ctrl+K pressed!');
});

// Unbind a shortcut
BlackRoad.Keyboard.unbind('ctrl+k');
```

### DOM Utilities

```javascript
// Create element
const el = BlackRoad.DOM.create('div', {
  class: 'card',
  textContent: 'Hello!',
  onClick: () => console.log('Clicked!')
});

// Query shortcuts
const element = BlackRoad.DOM.$('.my-class');
const elements = BlackRoad.DOM.$$('.my-class');
```

### Random Utilities

```javascript
BlackRoad.Random.int(1, 100);
BlackRoad.Random.float(0, 1);
BlackRoad.Random.choice([1, 2, 3, 4]);
BlackRoad.Random.shuffle([1, 2, 3, 4]);
```

## 🔧 Utility Classes

### Spacing

```html
<!-- Margin -->
<div class="m-xs m-sm m-md m-lg m-xl"></div>

<!-- Padding -->
<div class="p-xs p-sm p-md p-lg p-xl"></div>
```

### Flexbox

```html
<div class="flex flex-col items-center justify-between gap-md">
  Flex container
</div>
```

### Grid

```html
<div class="grid grid-cols-2 gap-lg">
  Grid layout
</div>
```

### Borders

```html
<div class="border rounded-lg">Bordered & rounded</div>
```

### Shadows & Glows

```html
<div class="shadow-lg">Box shadow</div>
<div class="glow-pink">Pink glow</div>
<div class="glow-cyan">Cyan glow</div>
```

### Display

```html
<div class="block inline-block hidden"></div>
```

### Position

```html
<div class="relative absolute fixed sticky"></div>
```

## 🎨 CSS Custom Properties

You can customize the design system by overriding CSS variables:

```css
:root {
  /* Override spectrum colors */
  --spectrum-pink: #your-color;

  /* Override spacing */
  --space-lg: 20px;

  /* Override transitions */
  --transition-base: 0.3s ease;
}
```

## 📱 Responsive Design

The design system includes responsive utilities:

```css
@media (max-width: 768px) {
  .mobile-hidden { display: none; }
  .mobile-block { display: block; }
}
```

## 🎯 Best Practices

1. **Use semantic HTML**: The design system enhances, not replaces, proper HTML structure
2. **Combine utility classes**: Mix and match utilities for custom designs
3. **Leverage CSS variables**: Use `var(--spectrum-pink)` for consistent theming
4. **Audio feedback**: Add sound effects to enhance user interactions
5. **Performance**: Effects are optimized but use sparingly on mobile
6. **Accessibility**: Add proper ARIA labels and focus states

## 🚀 Examples

### Retro Terminal Interface

```html
<div class="crt-screen" style="min-height: 400px; padding: 2rem;">
  <div class="crt-vignette"></div>
  <div class="terminal-text">
    <div>> BLACKROAD OS v1.0.0</div>
    <div>> INITIALIZING...</div>
    <div>> READY_<span class="cursor"></span></div>
  </div>
</div>
```

### Modern Card Grid

```html
<div class="grid grid-cols-3 gap-lg">
  <div class="card hover-lift">
    <h3 class="text-gradient">Feature 1</h3>
    <p class="text-secondary">Description</p>
  </div>
  <div class="card hover-lift">
    <h3 class="text-gradient">Feature 2</h3>
    <p class="text-secondary">Description</p>
  </div>
  <div class="card hover-lift">
    <h3 class="text-gradient">Feature 3</h3>
    <p class="text-secondary">Description</p>
  </div>
</div>
```

### Interactive Button with Effects

```html
<button
  class="btn btn-spectrum"
  onclick="
    BlackRoad.Audio.powerUp();
    BlackRoad.Effects.flash('var(--spectrum-pink)');
    BlackRoad.Toast.success('Action completed!');
  ">
  Click Me!
</button>
```

## 📖 View the Showcase

Check out `blackroad-showcase.html` for a comprehensive demo of all components and features!

## 🎮 Configuration

### Disable Auto-initialization

```html
<script>
  // Set before loading blackroad.js
  window.blackroadAutoInit = false;
</script>
<script src="assets/blackroad.js"></script>
<script>
  // Manually initialize with options
  BlackRoad.init({
    keyboard: true,      // Enable keyboard shortcuts
    cursorTrail: false   // Disable cursor trail effect
  });
</script>
```

## 🌟 Credits

Built with love for the retro-futuristic aesthetic. Inspired by:
- Classic CRT terminals
- The Matrix (1999)
- Y2K design trends
- Modern glassmorphism
- Cyberpunk aesthetics

---

**Version**: 1.0.0
**Build**: 2025.11.08
**Status**: SPECTRUM INITIALIZED ✨

```
SYSTEM READY_█
```
