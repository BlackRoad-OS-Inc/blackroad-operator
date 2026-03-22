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
