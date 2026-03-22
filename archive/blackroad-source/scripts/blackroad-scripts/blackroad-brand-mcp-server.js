#!/usr/bin/env node
/**
 * BlackRoad Brand System MCP Server
 * Provides brand standards, templates, and compliance checking
 */

const fs = require('fs');
const path = require('path');

// Paths
const BRAND_DOC = path.join(process.env.HOME, 'BLACKROAD_BRAND_SYSTEM.md');
const STARTER_TEMPLATE = path.join(process.env.HOME, 'blackroad-template-starter.html');

// Brand System Data
const BRAND_COLORS = {
  black: '#000000',
  white: '#FFFFFF',
  amber: '#F5A623',
  orange: '#F26522',
  hotPink: '#FF1D6C',
  magenta: '#E91E63',
  electricBlue: '#2979FF',
  skyBlue: '#448AFF',
  violet: '#9C27B0',
  deepPurple: '#5E35B1'
};

const BRAND_GRADIENT = 'linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)';

const GOLDEN_RATIO_SPACING = {
  xs: 8,
  sm: 13,
  md: 21,
  lg: 34,
  xl: 55,
  '2xl': 89,
  '3xl': 144
};

const LOGO_SVG = `<svg viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="44" stroke="#FF1D6C" stroke-width="6"/>
    <g class="road-dashes">
        <rect x="47" y="4" width="6" height="12" fill="#000" rx="2"/>
        <rect x="47" y="84" width="6" height="12" fill="#000" rx="2"/>
        <rect x="84" y="47" width="12" height="6" fill="#000" rx="2"/>
        <rect x="4" y="47" width="12" height="6" fill="#000" rx="2"/>
        <rect x="75" y="18" width="6" height="10" fill="#000" rx="2" transform="rotate(45 78 23)"/>
        <rect x="19" y="72" width="6" height="10" fill="#000" rx="2" transform="rotate(45 22 77)"/>
        <rect x="72" y="72" width="6" height="10" fill="#000" rx="2" transform="rotate(-45 75 77)"/>
        <rect x="22" y="18" width="6" height="10" fill="#000" rx="2" transform="rotate(-45 25 23)"/>
    </g>
    <path d="M50 10C27.9 10 10 27.9 10 50H90C90 27.9 72.1 10 50 10Z" fill="#F5A623"/>
    <path d="M10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50H10Z" fill="#2979FF"/>
    <circle cx="50" cy="50" r="14" fill="#000"/>
</svg>`;

// Tool Handlers
const tools = {
  get_brand_colors: () => {
    return {
      colors: BRAND_COLORS,
      css: Object.entries(BRAND_COLORS).map(([key, value]) =>
        `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
      ).join('\n'),
      primaryAccent: '#FF1D6C'
    };
  },

  get_brand_spacing: () => {
    return {
      spacing: GOLDEN_RATIO_SPACING,
      css: Object.entries(GOLDEN_RATIO_SPACING).map(([key, value]) =>
        `--space-${key}: ${value}px;`
      ).join('\n'),
      phi: 1.618,
      sequence: 'Fibonacci: 8, 13, 21, 34, 55, 89, 144'
    };
  },

  get_brand_gradient: () => {
    return {
      gradient: BRAND_GRADIENT,
      css: `--gradient-brand: ${BRAND_GRADIENT};`,
      stops: {
        amber: '0%',
        hotPink: '38.2%',
        violet: '61.8%',
        electricBlue: '100%'
      },
      goldenRatioStops: true
    };
  },

  get_logo_svg: () => {
    return {
      svg: LOGO_SVG,
      animation: `@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.road-dashes {
  animation: logo-spin 20s linear infinite;
  transform-origin: 50px 50px;
}`,
      usage: 'Include in navigation, 36px × 36px recommended'
    };
  },

  get_starter_template: () => {
    if (!fs.existsSync(STARTER_TEMPLATE)) {
      return { error: 'Starter template not found' };
    }
    return {
      html: fs.readFileSync(STARTER_TEMPLATE, 'utf-8'),
      path: STARTER_TEMPLATE,
      usage: 'Copy this template as base for new projects'
    };
  },

  get_brand_documentation: () => {
    if (!fs.existsSync(BRAND_DOC)) {
      return { error: 'Brand documentation not found' };
    }
    return {
      markdown: fs.readFileSync(BRAND_DOC, 'utf-8'),
      path: BRAND_DOC
    };
  },

  validate_brand_compliance: (params) => {
    const content = params.content || '';
    const issues = [];
    let score = 100;

    // Check for required colors
    if (!content.includes('--hot-pink: #FF1D6C')) {
      issues.push('Missing hot-pink color (#FF1D6C)');
      score -= 10;
    }
    if (!content.includes('--amber: #F5A623')) {
      issues.push('Missing amber color (#F5A623)');
      score -= 10;
    }
    if (!content.includes('--gradient-brand')) {
      issues.push('Missing brand gradient');
      score -= 15;
    }

    // Check for spacing
    if (!content.includes('--space-xs: 8px')) {
      issues.push('Missing Golden Ratio spacing');
      score -= 10;
    }

    // Check for logo
    if (!content.includes('road-dashes') || !content.includes('logo-spin')) {
      issues.push('Missing BlackRoad logo or animation');
      score -= 15;
    }

    // Check for scroll progress bar
    if (!content.includes('scroll-progress')) {
      issues.push('Missing scroll progress bar');
      score -= 10;
    }

    // Check for typography
    if (!content.includes('-apple-system') || !content.includes('line-height: 1.618')) {
      issues.push('Missing SF Pro Display font stack or Golden Ratio line-height');
      score -= 10;
    }

    // Check for background effects
    const hasGrid = content.includes('grid-move');
    const hasOrbs = content.includes('orb');
    if (!hasGrid && !hasOrbs) {
      issues.push('Missing background effects (grid or orbs)');
      score -= 10;
    }

    // Check for gradient stops
    if (content.includes('gradient') && (!content.includes('38.2%') || !content.includes('61.8%'))) {
      issues.push('Gradient missing Golden Ratio stops (38.2%, 61.8%)');
      score -= 10;
    }

    const compliance = score >= 90 ? 'COMPLIANT' : score >= 70 ? 'NEEDS IMPROVEMENT' : 'NON-COMPLIANT';

    return {
      score,
      compliance,
      issues,
      requiredFixes: issues.length,
      recommendation: score >= 90 ? 'Ready to deploy' : 'Fix issues before deploying'
    };
  }
};

// MCP Server Protocol
function handleRequest(request) {
  const { method, params } = request;

  if (tools[method]) {
    return {
      result: tools[method](params)
    };
  }

  return {
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  };
}

// STDIO Protocol Handler
process.stdin.on('data', (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({
      error: {
        code: -32700,
        message: 'Parse error: ' + error.message
      }
    }) + '\n');
  }
});

console.error('BlackRoad Brand System MCP Server started');
