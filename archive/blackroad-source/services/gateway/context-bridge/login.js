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
