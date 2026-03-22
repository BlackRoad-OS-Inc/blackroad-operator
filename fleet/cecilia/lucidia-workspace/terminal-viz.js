#!/usr/bin/env node
/**
 * Lucidia Workspace - Terminal Visualization
 * Watch zones switch in real-time with ASCII art!
 */

import { LucidiaBridge } from './dist/src/lucidia-bridge.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

// Zone ASCII art
const zoneArt = {
  plaza: `
    🏛️  ⛲ 🏛️
   🌳 👥 👥 🌳
    💼 💼 💼
  `,
  library: `
    📚 📚 📚
   🪑 👤 🪑
    📖 💡 📖
  `,
  dev_lab_4: `
    💻 ⚙️  💻
   🔧 👨‍💻 🔧
    🐳 ☸️  🐳
  `,
  comm_tower: `
    📡 📡 📡
   📊 📈 📊
    🔌 ⚡ 🔌
  `,
  innovation_park: `
    🌳 💡 🌳
   🎨 👩‍🔬 🧪
    🚀 ⚡ 🔬
  `
};

const zoneColors = {
  plaza: colors.cyan,
  library: colors.blue,
  dev_lab_4: colors.green,
  comm_tower: colors.yellow,
  innovation_park: colors.magenta
};

let currentZone = null;
let activityCount = 0;
let startTime = Date.now();

function clearScreen() {
  console.clear();
}

function drawHeader() {
  console.log(colors.bright + colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                  ║');
  console.log('║              🗺️  LUCIDIA WORKSPACE - LIVE VIEW 🗺️               ║');
  console.log('║                                                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

function drawZoneMap() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  console.log(colors.dim + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log();
  
  // Show current zone
  if (currentZone) {
    const color = zoneColors[currentZone.id] || colors.white;
    console.log(color + colors.bright + `  📍 CURRENT ZONE: ${currentZone.name.toUpperCase()}` + colors.reset);
    console.log(color + `  📝 ${currentZone.description}` + colors.reset);
    console.log();
    console.log(color + zoneArt[currentZone.id] + colors.reset);
  }
  
  console.log();
  console.log(colors.dim + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
}

function drawStats() {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  console.log();
  console.log(colors.bright + '  📊 STATS' + colors.reset);
  console.log(`  ⏱️  Uptime: ${uptime}s`);
  console.log(`  ⚡ Activities: ${activityCount}`);
  console.log(`  🗺️  Zones: 5`);
  console.log();
}

function drawZoneList() {
  console.log(colors.bright + '  🗺️  ALL ZONES:' + colors.reset);
  console.log();
  
  const zones = [
    { id: 'plaza', name: '🏛️  Central Plaza', capacity: 50, emoji: '🏛️' },
    { id: 'library', name: '📚 Research Library', capacity: 30, emoji: '📚' },
    { id: 'dev_lab_4', name: '💻 Dev Lab 4', capacity: 12, emoji: '💻' },
    { id: 'comm_tower', name: '📡 Comm Tower', capacity: 20, emoji: '📡' },
    { id: 'innovation_park', name: '🌳 Innovation Park', capacity: 15, emoji: '🌳' }
  ];
  
  zones.forEach(zone => {
    const isCurrent = currentZone && currentZone.id === zone.id;
    const color = isCurrent ? (zoneColors[zone.id] + colors.bright) : colors.dim;
    const arrow = isCurrent ? ' ◀──' : '';
    console.log(`  ${color}${zone.emoji} ${zone.name}${arrow}${colors.reset}`);
  });
  
  console.log();
}

function drawControls() {
  console.log(colors.dim + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
  console.log();
  console.log(colors.yellow + '  🎮 TRIGGER ACTIVITIES:' + colors.reset);
  console.log();
  console.log('  In another terminal, try:');
  console.log(colors.cyan + '    git commit -m "test"' + colors.dim + '  → Dev Lab 4' + colors.reset);
  console.log(colors.blue + '    grep -r "function" .' + colors.dim + '  → Library' + colors.reset);
  console.log(colors.magenta + '    echo "proto" > test' + colors.dim + '  → Innovation Park' + colors.reset);
  console.log();
  console.log('  Or with NATS:');
  console.log(colors.yellow + '    nats pub blackroad.zone.control \'{"action":"switch","zoneId":"comm_tower"}\'' + colors.reset);
  console.log();
  console.log(colors.dim + '  Press Ctrl+C to exit' + colors.reset);
  console.log();
}

function render() {
  clearScreen();
  drawHeader();
  drawZoneMap();
  drawStats();
  drawZoneList();
  drawControls();
}

async function main() {
  console.log('🚀 Starting Lucidia Terminal Visualization...\n');
  
  const bridge = new LucidiaBridge({
    enableNats: process.env.NATS_URL ? true : false,
    natsUrl: process.env.NATS_URL,
    defaultZone: 'dev_lab_4',
    debugMode: false
  });

  // Listen to events
  bridge.on('started', () => {
    const zoneManager = bridge.getZoneManager();
    currentZone = zoneManager.getCurrentZone();
    render();
  });

  bridge.on('zone_changed', (event) => {
    currentZone = event.to;
    activityCount++;
    
    // Show transition animation
    clearScreen();
    drawHeader();
    console.log();
    console.log(colors.bright + colors.yellow + '  ⚡ ZONE TRANSITION! ⚡' + colors.reset);
    console.log();
    console.log(`  ${colors.dim}From: ${event.from.name}${colors.reset}`);
    console.log(`  ${colors.bright}  ↓${colors.reset}`);
    console.log(`  ${colors.green}To: ${event.to.name}${colors.reset}`);
    if (event.reason) {
      console.log(`  ${colors.dim}Reason: ${event.reason}${colors.reset}`);
    }
    console.log();
    
    // Wait a moment then show full view
    setTimeout(() => {
      render();
    }, 1500);
  });

  bridge.on('activity', (event) => {
    activityCount++;
    // Just update stats without full redraw
    const stats = `⚡ ${activityCount} activities`;
    // Could add a status line here
  });

  // Start bridge
  await bridge.start();
  
  // Simulate some activities for demo
  setTimeout(() => {
    console.log('\n' + colors.yellow + '  💡 TIP: Open another terminal to trigger real activities!' + colors.reset);
  }, 3000);
  
  // Auto-demo mode if no NATS
  if (!process.env.NATS_URL) {
    setTimeout(() => {
      bridge.handlePixelEvent('git_commit', { message: 'feat: test' });
    }, 5000);
    
    setTimeout(() => {
      bridge.handlePixelEvent('search', { query: 'docs' });
    }, 10000);
    
    setTimeout(() => {
      bridge.handlePixelEvent('file_changed', { path: 'prototype.md' });
    }, 15000);
  }
  
  // Refresh display every 5 seconds
  setInterval(() => {
    render();
  }, 5000);

  // Handle Ctrl+C gracefully
  process.on('SIGINT', async () => {
    console.log('\n\n' + colors.yellow + '⏹️  Stopping Lucidia...' + colors.reset);
    await bridge.stop();
    console.log(colors.green + '✅ Goodbye!' + colors.reset + '\n');
    process.exit(0);
  });
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
