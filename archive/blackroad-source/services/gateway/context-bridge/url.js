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
