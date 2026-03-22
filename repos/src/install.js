/**
 * Pixel Agent Desk - Auto Installation Script
 *
 * Automatically registers HTTP hooks in the Claude CLI config.
 * Runs automatically during npm install.
 *
 * Delegates actual registration logic to hookRegistration.js.
 */

const { registerClaudeHooks } = require('./main/hookRegistration');

/**
 * Main entry point
 */
function main() {
  console.log('=================================');
  console.log('Pixel Agent Desk - Install Script');
  console.log('=================================\n');

  const debugLog = (msg) => console.log(msg);
  const success = registerClaudeHooks(debugLog);

  if (success) {
    console.log('\n=================================');
    console.log('Installation complete!');
    console.log('=================================\n');
    console.log('Run the app with:');
    console.log('  npm start\n');
  } else {
    console.log('\n⚠️  Hook registration failed.');
    console.log('Please manually edit ~/.claude/settings.json.');
    process.exit(1);
  }
}

// Run
main();
