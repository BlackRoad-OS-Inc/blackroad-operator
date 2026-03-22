const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { getConfig, setConfig } = require('../config');
const { getGist, updateGist } = require('../gist');

async function update(options) {
  const config = getConfig();
  
  if (!config.token) {
    console.log(chalk.yellow('⚠ Not authenticated. Run:'), chalk.cyan('context login\n'));
    return;
  }

  if (!config.gistId) {
    console.log(chalk.yellow('⚠ No context initialized. Run:'), chalk.cyan('context init\n'));
    return;
  }

  const spinner = ora('Fetching current context...').start();

  try {
    const gist = await getGist();
    spinner.succeed(chalk.green('Context fetched'));

    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `context-${Date.now()}.md`);
    fs.writeFileSync(tempFile, gist.content);

    const editor = options.editor || process.env.EDITOR || 'vim';
    console.log(chalk.gray(`\nOpening in ${editor}... (save and close when done)\n`));

    try {
      execSync(`${editor} "${tempFile}"`, { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('\nEditor closed without saving.\n'));
      fs.unlinkSync(tempFile);
      return;
    }

    const newContent = fs.readFileSync(tempFile, 'utf-8');
    fs.unlinkSync(tempFile);

    if (newContent.trim() === gist.content.trim()) {
      console.log(chalk.yellow('No changes made.\n'));
      return;
    }

    const pushSpinner = ora('Pushing changes...').start();

    const result = await updateGist(newContent, options.message);
    
    setConfig('last_updated', new Date().toISOString());

    pushSpinner.succeed(chalk.green('Context updated!'));
    
    console.log(chalk.gray(`\nURL: ${result.url}`));
    console.log(chalk.gray(`Raw: ${result.rawUrl}\n`));
  } catch (error) {
    spinner.fail(chalk.red('Failed to update'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    process.exit(1);
  }
}

module.exports = update;
