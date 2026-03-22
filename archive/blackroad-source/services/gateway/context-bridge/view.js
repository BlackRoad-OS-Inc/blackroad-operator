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
