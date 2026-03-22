#!/usr/bin/env node
/**
 * Simple test script for Lucidia Bridge
 */

import { LucidiaBridge } from './dist/src/lucidia-bridge.js';

async function test() {
  console.log('🧪 Testing Lucidia Bridge...\n');

  const bridge = new LucidiaBridge({
    enableNats: false, // Test without NATS first
    defaultZone: 'dev_lab_4',
    debugMode: true
  });

  // Listen to events
  bridge.on('started', () => {
    console.log('\n✅ Bridge started successfully!\n');
  });

  bridge.on('zone_changed', (event) => {
    console.log(`\n📍 Zone changed: ${event.from.name} → ${event.to.name}`);
    if (event.reason) {
      console.log(`   Reason: ${event.reason}`);
    }
  });

  bridge.on('activity', (event) => {
    console.log(`\n⚡ Activity detected: ${event.activity.type}`);
    console.log(`   Current zone: ${event.currentZone.name}`);
  });

  // Start bridge
  await bridge.start();

  // Simulate some activities
  console.log('\n📝 Simulating activities...\n');

  setTimeout(() => {
    console.log('1️⃣  Simulating git commit...');
    bridge.handlePixelEvent('git_commit', {
      message: 'feat: add kubernetes deployment',
      files: ['infra/k8s/deployment.yaml']
    });
  }, 1000);

  setTimeout(() => {
    console.log('\n2️⃣  Simulating file search...');
    bridge.handlePixelEvent('search', {
      query: 'documentation',
      results: 42
    });
  }, 2000);

  setTimeout(() => {
    console.log('\n3️⃣  Simulating file change...');
    bridge.handlePixelEvent('file_changed', {
      path: '/Users/test/README.md',
      type: 'modified'
    });
  }, 3000);

  setTimeout(() => {
    console.log('\n4️⃣  Simulating deploy...');
    bridge.handlePixelEvent('terminal_command', {
      command: 'kubectl apply -f deployment.yaml'
    });
  }, 4000);

  // Show stats after activities
  setTimeout(() => {
    console.log('\n📊 Final Stats:');
    console.log(JSON.stringify(bridge.getStats(), null, 2));
    
    console.log('\n✨ Test complete!\n');
    bridge.stop();
  }, 5000);
}

test().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
