/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║                  BLACKROAD.JS v1.0.0                  ║
 * ║           JavaScript Utilities & Effects              ║
 * ╚═══════════════════════════════════════════════════════╝
 */

const BlackRoad = (function() {
  'use strict';

  /* ==========================================
     🎵 AUDIO & SOUND EFFECTS
     ========================================== */

  const Audio = {
    context: null,

    init() {
      if (window.AudioContext || window.webkitAudioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioCtx();
      }
    },

    // Retro beep sound
    beep(frequency = 880, duration = 150, volume = 0.3) {
      if (!this.context) return;

      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);

      oscillator.connect(gain);
      gain.connect(this.context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration / 1000 + 0.1);
    },

    // Terminal click sound
    click() {
      this.beep(1200, 50, 0.1);
    },

    // Success sound
    success() {
      this.beep(800, 100, 0.2);
      setTimeout(() => this.beep(1000, 150, 0.15), 100);
    },

    // Error sound
    error() {
      this.beep(300, 200, 0.25);
    },

    // Power up sound
    powerUp() {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => this.beep(400 + i * 200, 80, 0.15), i * 80);
      }
    }
  };

  /* ==========================================
     ✨ VISUAL EFFECTS
     ========================================== */

  const Effects = {
    // Screen flash effect
    flash(element, color = 'var(--spectrum-pink)', duration = 150) {
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed;
        inset: 0;
        background: radial-gradient(ellipse at center, ${color} 0%, transparent 70%);
        opacity: 0;
        pointer-events: none;
        z-index: 9999;
        transition: opacity ${duration}ms;
      `;
      document.body.appendChild(flash);

      requestAnimationFrame(() => {
        flash.style.opacity = '0.4';
        setTimeout(() => {
          flash.style.opacity = '0';
          setTimeout(() => flash.remove(), duration);
        }, duration / 2);
      });
    },

    // Glitch effect on element
    glitch(element, duration = 500) {
      element.classList.add('glitch');
      setTimeout(() => element.classList.remove('glitch'), duration);
    },

    // Matrix-style text reveal
    matrixReveal(element, text, speed = 50) {
      const chars = '01アイウエオカキクケコサシスセソタチツテト';
      const finalText = text;
      let iterations = 0;

      const interval = setInterval(() => {
        element.textContent = finalText
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return finalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iterations >= finalText.length) {
          clearInterval(interval);
        }

        iterations += 1 / 3;
      }, speed);
    },

    // RGB split on hover
    addRGBSplit(element) {
      element.dataset.text = element.textContent;
      element.classList.add('rgb-split');
    },

    // Typewriter effect
    typewriter(element, text, speed = 50, callback) {
      let i = 0;
      element.textContent = '';

      const interval = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          Audio.click();
          i++;
        } else {
          clearInterval(interval);
          if (callback) callback();
        }
      }, speed);

      return interval;
    },

    // Particle burst
    particleBurst(x, y, color = 'var(--spectrum-pink)', count = 20) {
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 2 + Math.random() * 2;

        particle.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: 4px;
          height: 4px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          box-shadow: 0 0 10px ${color};
        `;

        document.body.appendChild(particle);

        let dx = Math.cos(angle) * velocity;
        let dy = Math.sin(angle) * velocity;
        let opacity = 1;

        const animate = () => {
          const rect = particle.getBoundingClientRect();
          particle.style.left = rect.left + dx + 'px';
          particle.style.top = rect.top + dy + 'px';
          opacity -= 0.02;
          particle.style.opacity = opacity;

          dy += 0.1; // gravity

          if (opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            particle.remove();
          }
        };

        requestAnimationFrame(animate);
      }
    }
  };

  /* ==========================================
     🖥️ TERMINAL UTILITIES
     ========================================== */

  const Terminal = {
    // Create a terminal element
    create(options = {}) {
      const {
        parent = document.body,
        prefix = '> ',
        color = 'var(--spectrum-cyan)'
      } = options;

      const terminal = document.createElement('div');
      terminal.className = 'crt-screen terminal-text';
      terminal.style.cssText = `
        padding: 20px;
        font-family: var(--font-mono);
        color: ${color};
        min-height: 200px;
      `;

      const output = document.createElement('div');
      terminal.appendChild(output);

      parent.appendChild(terminal);

      return {
        element: terminal,
        output: output,
        prefix: prefix,

        write(text, color) {
          const line = document.createElement('div');
          line.textContent = this.prefix + text;
          if (color) line.style.color = color;
          this.output.appendChild(line);
          Audio.click();
          this.scrollToBottom();
        },

        writeLine(text, color) {
          const line = document.createElement('div');
          line.textContent = text;
          if (color) line.style.color = color;
          this.output.appendChild(line);
          this.scrollToBottom();
        },

        clear() {
          this.output.innerHTML = '';
        },

        scrollToBottom() {
          terminal.scrollTop = terminal.scrollHeight;
        },

        async type(text, speed = 50) {
          const line = document.createElement('div');
          line.textContent = this.prefix;
          this.output.appendChild(line);

          for (let i = 0; i < text.length; i++) {
            await new Promise(resolve => setTimeout(resolve, speed));
            line.textContent += text[i];
            Audio.click();
            this.scrollToBottom();
          }
        }
      };
    }
  };

  /* ==========================================
     🎨 COLOR UTILITIES
     ========================================== */

  const Colors = {
    spectrum: [
      '#fdba2d', // gold
      '#ff6b35', // orange
      '#ff4fd8', // pink
      '#c753ff', // purple
      '#6366f1', // indigo
      '#3b82f6', // blue
      '#06b6d4', // cyan
      '#10b981'  // green
    ],

    random() {
      return this.spectrum[Math.floor(Math.random() * this.spectrum.length)];
    },

    interpolate(start, end, factor) {
      const s = parseInt(start.slice(1), 16);
      const e = parseInt(end.slice(1), 16);

      const r1 = (s >> 16) & 0xff;
      const g1 = (s >> 8) & 0xff;
      const b1 = s & 0xff;

      const r2 = (e >> 16) & 0xff;
      const g2 = (e >> 8) & 0xff;
      const b2 = e & 0xff;

      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);

      return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    },

    cycle(element, property = 'color', speed = 100) {
      let index = 0;
      return setInterval(() => {
        element.style[property] = this.spectrum[index];
        index = (index + 1) % this.spectrum.length;
      }, speed);
    }
  };

  /* ==========================================
     🎯 CURSOR EFFECTS
     ========================================== */

  const Cursor = {
    trail: [],
    maxTrail: 20,

    init() {
      document.addEventListener('mousemove', (e) => {
        this.addTrailParticle(e.clientX, e.clientY);
      });
    },

    addTrailParticle(x, y) {
      const particle = document.createElement('div');
      particle.className = 'cursor-trail';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: ${Colors.random()};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.8;
        transition: opacity 0.5s, transform 0.5s;
        box-shadow: 0 0 10px currentColor;
      `;

      document.body.appendChild(particle);
      this.trail.push(particle);

      if (this.trail.length > this.maxTrail) {
        const old = this.trail.shift();
        old.style.opacity = '0';
        old.style.transform = 'scale(0)';
        setTimeout(() => old.remove(), 500);
      }

      setTimeout(() => {
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0)';
      }, 100);
    }
  };

  /* ==========================================
     🎪 TOAST NOTIFICATIONS
     ========================================== */

  const Toast = {
    container: null,

    init() {
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        `;
        document.body.appendChild(this.container);
      }
    },

    show(message, type = 'info', duration = 3000) {
      this.init();

      const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--spectrum-cyan)'
      };

      const toast = document.createElement('div');
      toast.className = 'card animate-slideLeft';
      toast.style.cssText = `
        padding: 16px 20px;
        background: var(--bg-secondary);
        border: 2px solid ${colors[type]};
        border-radius: var(--radius-md);
        color: ${colors[type]};
        box-shadow: 0 0 20px ${colors[type]};
        pointer-events: auto;
        max-width: 300px;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
      `;
      toast.textContent = message;

      this.container.appendChild(toast);
      Audio.beep(type === 'success' ? 1000 : type === 'error' ? 400 : 800);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    success(message, duration) {
      this.show(message, 'success', duration);
    },

    error(message, duration) {
      this.show(message, 'error', duration);
    },

    warning(message, duration) {
      this.show(message, 'warning', duration);
    },

    info(message, duration) {
      this.show(message, 'info', duration);
    }
  };

  /* ==========================================
     ⚡ LOADING INDICATORS
     ========================================== */

  const Loading = {
    overlay: null,

    show(message = 'Loading...') {
      this.overlay = document.createElement('div');
      this.overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        z-index: 10000;
      `;

      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 3px solid var(--bg-tertiary);
        border-top-color: var(--spectrum-pink);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      `;

      const text = document.createElement('div');
      text.className = 'text-glow-cyan font-mono';
      text.textContent = message;

      this.overlay.appendChild(spinner);
      this.overlay.appendChild(text);
      document.body.appendChild(this.overlay);
    },

    hide() {
      if (this.overlay) {
        this.overlay.style.opacity = '0';
        setTimeout(() => this.overlay.remove(), 300);
        this.overlay = null;
      }
    }
  };

  /* ==========================================
     🎲 RANDOM UTILITIES
     ========================================== */

  const Random = {
    int(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    float(min, max) {
      return Math.random() * (max - min) + min;
    },

    choice(array) {
      return array[Math.floor(Math.random() * array.length)];
    },

    shuffle(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  };

  /* ==========================================
     🔧 DOM UTILITIES
     ========================================== */

  const DOM = {
    // Create element with properties
    create(tag, props = {}, children = []) {
      const el = document.createElement(tag);

      Object.entries(props).forEach(([key, value]) => {
        if (key === 'class') {
          el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          el[key] = value;
        }
      });

      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else {
          el.appendChild(child);
        }
      });

      return el;
    },

    // Query shorthand
    $(selector, parent = document) {
      return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
      return Array.from(parent.querySelectorAll(selector));
    }
  };

  /* ==========================================
     🎬 ANIMATION UTILITIES
     ========================================== */

  const Animate = {
    // Smooth scroll to element
    scrollTo(element, offset = 0, duration = 500) {
      const start = window.pageYOffset;
      const target = element.getBoundingClientRect().top + start - offset;
      const distance = target - start;
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, start + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    },

    // Count up animation
    countUp(element, target, duration = 1000) {
      const start = parseInt(element.textContent) || 0;
      const increment = (target - start) / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (
          (increment > 0 && current >= target) ||
          (increment < 0 && current <= target)
        ) {
          element.textContent = Math.round(target);
          clearInterval(timer);
        } else {
          element.textContent = Math.round(current);
        }
      }, 16);
    }
  };

  /* ==========================================
     🎮 KEYBOARD SHORTCUTS
     ========================================== */

  const Keyboard = {
    bindings: new Map(),

    init() {
      document.addEventListener('keydown', (e) => {
        const key = this.getKeyCombo(e);
        const callback = this.bindings.get(key);
        if (callback) {
          e.preventDefault();
          callback(e);
        }
      });
    },

    getKeyCombo(e) {
      const parts = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      if (e.metaKey) parts.push('meta');
      parts.push(e.key.toLowerCase());
      return parts.join('+');
    },

    bind(combo, callback) {
      this.bindings.set(combo.toLowerCase(), callback);
    },

    unbind(combo) {
      this.bindings.delete(combo.toLowerCase());
    }
  };

  /* ==========================================
     🚀 INITIALIZATION
     ========================================== */

  function init(options = {}) {
    console.log(`
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
║              SPECTRUM INITIALIZED                     ║
║                 BUILD 2025.11.08                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    Audio.init();

    if (options.keyboard !== false) {
      Keyboard.init();
    }

    if (options.cursorTrail) {
      Cursor.init();
    }

    // Add utility CSS for animations if not already present
    if (!document.getElementById('blackroad-animations')) {
      const style = document.createElement('style');
      style.id = 'blackroad-animations';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return {
      version: '1.0.0',
      initialized: true
    };
  }

  /* ==========================================
     📤 PUBLIC API
     ========================================== */

  return {
    init,
    Audio,
    Effects,
    Terminal,
    Colors,
    Cursor,
    Toast,
    Loading,
    Random,
    DOM,
    Animate,
    Keyboard
  };
})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.blackroadAutoInit !== false) {
      BlackRoad.init();
    }
  });
} else if (window.blackroadAutoInit !== false) {
  BlackRoad.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlackRoad;
}

/*
 * ╔═══════════════════════════════════════════════════════╗
 * ║              SPECTRUM INITIALIZED                     ║
 * ║                 BUILD 2025.11.08                      ║
 * ╚═══════════════════════════════════════════════════════╝
 */
