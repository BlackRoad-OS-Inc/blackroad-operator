#!/usr/bin/env node
// Test context detection

const ContextManager = require('./context');

async function test() {
  const ctx = new ContextManager();
  const context = await ctx.detect();
  
  console.log('\n=== Context Detection Test ===\n');
  console.log(ctx.format(context));
  console.log('Raw context:');
  console.log(JSON.stringify(context, null, 2));
}

test();
