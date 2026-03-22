#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const pkg = require('../package.json');

// Commands
const init = require('../lib/commands/init');
const update = require('../lib/commands/update');
const view = require('../lib/commands/view');
const history = require('../lib/commands/history');
const url = require('../lib/commands/url');
const login = require('../lib/commands/login');

program
  .name('context')
  .description('Manage your AI context files across conversations')
  .version(pkg.version);

program
  .command('login')
  .description('Authenticate with GitHub')
  .action(login);

program
  .command('init')
  .description('Create a new context file')
  .option('-t, --template <name>', 'Use a template (developer, designer, pm, writer, student, entrepreneur)')
  .action(init);

program
  .command('update')
  .description('Edit and push your context to gist')
  .option('-m, --message <msg>', 'Commit message')
  .option('-e, --editor <editor>', 'Editor to use (vim, nano, code, etc)')
  .action(update);

program
  .command('view')
  .description('Show your current context')
  .option('-r, --raw', 'Show raw markdown')
  .action(view);

program
  .command('history')
  .description('Show version history')
  .option('-n, --number <n>', 'Number of versions to show', '10')
  .action(history);

program
  .command('url')
  .description('Get your shareable context URL')
  .option('-c, --copy', 'Copy to clipboard')
  .option('-r, --raw', 'Get raw URL instead of gist URL')
  .action(url);

program
  .command('status')
  .description('Show context status and health')
  .action(async () => {
    const { getConfig } = require('../lib/config');
    const config = getConfig();
    
    if (!config.gistId) {
      console.log(chalk.yellow('⚠ No context initialized. Run'), chalk.cyan('context init'));
      return;
    }
    
    console.log(chalk.bold('\n📊 Context Status\n'));
    console.log(`${chalk.gray('Gist ID:')} ${config.gistId}`);
    console.log(`${chalk.gray('URL:')} ${config.gistUrl || 'N/A'}`);
    console.log(`${chalk.gray('Last updated:')} ${config.lastUpdated || 'Never'}`);
    
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: config.token });
    
    try {
      const { data } = await octokit.gists.get({ gist_id: config.gistId });
      console.log(`${chalk.gray('Status:')} ${chalk.green('✓ Active')}`);
      console.log(`${chalk.gray('Revisions:')} ${data.history.length}`);
      console.log(`${chalk.gray('Size:')} ${Object.values(data.files)[0].size} bytes`);
    } catch (error) {
      console.log(`${chalk.gray('Status:')} ${chalk.red('✗ Not found')}`);
    }
    
    console.log();
  });

program.action(() => {
  console.log(chalk.bold.cyan('\n🌉 Context Bridge CLI\n'));
  console.log('Manage your AI context files across conversations.\n');
  console.log('Commands:');
  console.log(`  ${chalk.cyan('context login')}     Authenticate with GitHub`);
  console.log(`  ${chalk.cyan('context init')}      Create a new context`);
  console.log(`  ${chalk.cyan('context update')}    Edit and push changes`);
  console.log(`  ${chalk.cyan('context view')}      Show current context`);
  console.log(`  ${chalk.cyan('context history')}   Show version history`);
  console.log(`  ${chalk.cyan('context url')}       Get shareable URL`);
  console.log(`  ${chalk.cyan('context status')}    Show context health`);
  console.log(`\nRun ${chalk.cyan('context --help')} for more information.\n`);
});

program.parse(process.argv);
