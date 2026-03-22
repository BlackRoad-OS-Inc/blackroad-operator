const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const { getConfig, setConfig } = require('../config');
const { createGist } = require('../gist');

async function init(options) {
  console.log(chalk.bold.cyan('\n🌉 Create Your Context\n'));

  const config = getConfig();
  
  if (!config.token) {
    console.log(chalk.yellow('⚠ Not authenticated. Please run:'), chalk.cyan('context login\n'));
    return;
  }

  if (config.gistId) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'You already have a context. Create a new one?',
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.gray('Cancelled.\n'));
      return;
    }
  }

  const templates = [
    { name: 'Blank (start from scratch)', value: 'blank' },
    { name: 'Software Developer', value: 'developer' },
    { name: 'Product Manager', value: 'pm' },
    { name: 'Designer', value: 'designer' },
    { name: 'Writer', value: 'writer' },
    { name: 'Student', value: 'student' },
    { name: 'Entrepreneur', value: 'entrepreneur' }
  ];

  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Choose a template:',
      choices: templates,
      default: options.template || 'blank'
    }
  ]);

  const { name, role, project } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your name:',
      default: config.name
    },
    {
      type: 'input',
      name: 'role',
      message: 'Your role/title:',
      when: template !== 'blank'
    },
    {
      type: 'input',
      name: 'project',
      message: 'Current project/focus:',
      when: template !== 'blank'
    }
  ]);

  let content;
  if (template === 'blank') {
    content = generateBlankContext(name);
  } else {
    const templatePath = path.join(__dirname, '../../templates', `${template}.md`);
    if (fs.existsSync(templatePath)) {
      content = fs.readFileSync(templatePath, 'utf-8');
      // Safe replacement - no regex special chars issues
      content = content
        .split('[NAME]').join(name || 'Your Name')
        .split('[ROLE]').join(role || 'Your role')
        .split('[PROJECT]').join(project || 'Your current project')
        .split('[DATE]').join(new Date().toISOString().split('T')[0]);
    } else {
      console.log(chalk.yellow(`⚠ Template not found: ${template}`));
      content = generateBlankContext(name);
    }
  }

  const spinner = ora('Creating your context...').start();

  try {
    const gist = await createGist(content);
    
    setConfig('gist_id', gist.id);
    setConfig('gist_url', gist.url);
    setConfig('raw_url', gist.rawUrl);
    setConfig('last_updated', new Date().toISOString());
    setConfig('template', template);
    setConfig('name', name);

    spinner.succeed(chalk.green('Context created!'));
    
    console.log(chalk.bold('\n📋 Your Context URLs:\n'));
    console.log(`${chalk.gray('Gist:')} ${chalk.cyan(gist.url)}`);
    console.log(`${chalk.gray('Raw:')}  ${chalk.cyan(gist.rawUrl)}`);
    
    console.log(chalk.bold('\n💡 How to use:\n'));
    console.log(`1. ${chalk.cyan('context view')} - View your context`);
    console.log(`2. ${chalk.cyan('context update')} - Edit and push changes`);
    console.log(`3. ${chalk.cyan('context url')} - Get shareable URL`);
    console.log(`\n4. In any AI chat, say: ${chalk.green(`"Read ${gist.rawUrl} first"`)}`);
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Failed to create context'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    process.exit(1);
  }
}

function generateBlankContext(name) {
  const date = new Date().toISOString().split('T')[0];
  
  return `# ${name}'s Context

**Last Updated**: ${date}
**Active Work**: [Your current project]
**Status**: [Current status]

## Who I Am
- **Name**: ${name}
- **Role**: [Your role]

## Current Project
- **Project**: [Project name]
- **Stack**: [Technologies]
- **Goal**: [What you're building]

## My Preferences
- [How you like to work with AI]
- [Communication style]
- [Technical preferences]

## What I'm Working On Now
[Current task or focus]

## Recent Context
[What happened in last session]

## For AI Continuity
Read this file at the start of every conversation.
Update it at the end of each session with:
- What was completed
- What's next
- Current blockers

---
*Created with [Context Bridge](https://context-bridge.pages.dev)*
`;
}

module.exports = init;
