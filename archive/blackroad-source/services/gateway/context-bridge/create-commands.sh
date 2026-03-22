#!/bin/bash

# login.js
cat > lib/commands/login.js << 'EOF'
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { Octokit } = require('@octokit/rest');
const { setConfig } = require('../config');

async function login() {
  console.log(chalk.bold.cyan('\n🔐 GitHub Authentication\n'));
  
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to authenticate?',
      choices: [
        { name: 'Personal Access Token (recommended)', value: 'token' },
        { name: 'GitHub CLI (gh)', value: 'gh' }
      ]
    }
  ]);

  if (method === 'token') {
    console.log(chalk.gray('\nCreate a token at: https://github.com/settings/tokens/new'));
    console.log(chalk.gray('Required scope: gist\n'));
    
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your GitHub token:',
        mask: '*'
      }
    ]);

    const spinner = ora('Verifying token...').start();

    try {
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.users.getAuthenticated();
      
      setConfig('github_token', token);
      
      spinner.succeed(chalk.green(`Authenticated as ${user.login}`));
      console.log(chalk.gray(`\nToken saved to ~/.context-bridge/config.json`));
      console.log(chalk.cyan(`\nNext: Run ${chalk.bold('context init')} to create your context\n`));
    } catch (error) {
      spinner.fail(chalk.red('Authentication failed'));
      console.log(chalk.red(`Error: ${error.message}\n`));
      process.exit(1);
    }
  } else {
    const { execSync } = require('child_process');
    
    const spinner = ora('Getting token from GitHub CLI...').start();
    
    try {
      const token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.users.getAuthenticated();
      
      setConfig('github_token', token);
      
      spinner.succeed(chalk.green(`Authenticated as ${user.login}`));
      console.log(chalk.cyan(`\nNext: Run ${chalk.bold('context init')} to create your context\n`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to get token from GitHub CLI'));
      console.log(chalk.red(`Make sure GitHub CLI is installed and authenticated.\n`));
      process.exit(1);
    }
  }
}

module.exports = login;
EOF

# view.js
cat > lib/commands/view.js << 'EOF'
const chalk = require('chalk');
const ora = require('ora');
const { getConfig } = require('../config');
const { getGist } = require('../gist');

async function view(options) {
  const config = getConfig();
  
  if (!config.token) {
    console.log(chalk.yellow('⚠ Not authenticated. Run:'), chalk.cyan('context login\n'));
    return;
  }

  if (!config.gistId) {
    console.log(chalk.yellow('⚠ No context initialized. Run:'), chalk.cyan('context init\n'));
    return;
  }

  const spinner = ora('Fetching context...').start();

  try {
    const gist = await getGist();
    spinner.stop();

    if (options.raw) {
      console.log(gist.content);
    } else {
      console.log(chalk.bold.cyan('\n📄 Your Context\n'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(gist.content);
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.gray(`\nLast updated: ${new Date(gist.updatedAt).toLocaleString()}`));
      console.log(chalk.gray(`Revisions: ${gist.revisions}`));
      console.log(chalk.gray(`URL: ${gist.url}\n`));
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch context'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    process.exit(1);
  }
}

module.exports = view;
EOF

# url.js
cat > lib/commands/url.js << 'EOF'
const chalk = require('chalk');
const { exec } = require('child_process');
const { getConfig } = require('../config');

async function url(options) {
  const config = getConfig();
  
  if (!config.gistId) {
    console.log(chalk.yellow('⚠ No context initialized. Run:'), chalk.cyan('context init\n'));
    return;
  }

  const targetUrl = options.raw ? config.rawUrl : config.gistUrl;

  console.log(chalk.bold.cyan('\n🔗 Your Context URL\n'));
  console.log(chalk.green(targetUrl));
  
  if (options.copy) {
    try {
      const platform = process.platform;
      let command;
      
      if (platform === 'darwin') {
        command = `echo "${targetUrl}" | pbcopy`;
      } else if (platform === 'win32') {
        command = `echo ${targetUrl} | clip`;
      } else {
        command = `echo "${targetUrl}" | xclip -selection clipboard`;
      }
      
      exec(command, (error) => {
        if (!error) {
          console.log(chalk.gray('✓ Copied to clipboard'));
        }
      });
    } catch (error) {
      // Silently fail
    }
  }

  console.log(chalk.bold('\n💡 How to use:\n'));
  console.log(`In any AI chat, say: ${chalk.green(`"Read ${targetUrl} first"`)}`);
  console.log();
}

module.exports = url;
EOF

# history.js
cat > lib/commands/history.js << 'EOF'
const chalk = require('chalk');
const ora = require('ora');
const { getConfig } = require('../config');
const { getGistHistory } = require('../gist');

async function history(options) {
  const config = getConfig();
  
  if (!config.token) {
    console.log(chalk.yellow('⚠ Not authenticated. Run:'), chalk.cyan('context login\n'));
    return;
  }

  if (!config.gistId) {
    console.log(chalk.yellow('⚠ No context initialized. Run:'), chalk.cyan('context init\n'));
    return;
  }

  const spinner = ora('Fetching history...').start();

  try {
    const limit = parseInt(options.number) || 10;
    const history = await getGistHistory(limit);
    
    spinner.succeed(chalk.green('History fetched'));

    console.log(chalk.bold.cyan(`\n📜 Version History (${history.length} most recent)\n`));

    history.forEach((rev, index) => {
      const date = new Date(rev.committedAt);
      const ago = getTimeAgo(date);
      
      console.log(chalk.bold(`${index + 1}. ${date.toLocaleString()}`), chalk.gray(`(${ago})`));
      console.log(chalk.gray(`   Version: ${rev.version.substring(0, 8)}`));
      console.log(chalk.gray(`   By: ${rev.user}`));
      console.log(chalk.gray(`   Changes: +${rev.changeStatus.additions} -${rev.changeStatus.deletions}`));
      console.log();
    });

    console.log(chalk.gray(`Run ${chalk.cyan('context view')} to see current version\n`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to fetch history'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    process.exit(1);
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

module.exports = history;
EOF

echo "Created command files"
