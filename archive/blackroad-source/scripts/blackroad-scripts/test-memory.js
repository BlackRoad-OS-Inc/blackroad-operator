#!/usr/bin/env node
// Test memory system

const Memory = require('./memory');

async function test() {
  const memory = new Memory();
  
  // Save a test session
  console.log('\n=== Memory System Test ===\n');
  
  const session = await memory.saveSession({
    task: 'Write a hello world function',
    models: [
      { model: 'qwen2.5-coder:7b', response: 'function hello() { return "Hello!"; }' }
    ],
    selected: 0
  });
  
  console.log('✅ Saved session:', session.id);
  
  // List recent sessions
  const sessions = await memory.listSessions(5);
  console.log(`\n📚 Recent sessions: ${sessions.length}`);
  sessions.forEach(s => {
    console.log(`  - ${s.id.substring(0, 19)}: ${s.task.substring(0, 40)}...`);
  });
  
  // Get stats
  const stats = await memory.getStats();
  console.log(`\n📊 Stats:`);
  console.log(`  Total sessions: ${stats.total_sessions}`);
  console.log(`  Total size: ${(stats.total_size / 1024).toFixed(2)} KB`);
}

test();
