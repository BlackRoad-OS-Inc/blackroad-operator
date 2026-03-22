import fs from 'node:fs';
import path from 'node:path';
import { loadPromptPreset, dispatchPrompt } from '../agents/generate_prompt.js';
import { renderCanvaBatch, sendToCanva } from '../agents/render_canva.js';
import { renderTemplate } from '../lib/template.js';

const args = process.argv.slice(2);
const command = args[0];

const list = (): void => {
  try {
    const prompts = fs
      .readdirSync(path.join(process.cwd(), 'prompts'))
      .filter((file) => file.endsWith('.yml'));
    const workflows = fs
      .readdirSync(path.join(process.cwd(), 'workflows'))
      .filter((file) => file.endsWith('.json.hbs'));
    console.log('Prompts:');
    prompts.forEach((prompt) => console.log(`- ${prompt.replace('.yml', '')}`));
    console.log('\nWorkflows:');
    workflows.forEach((flow) => console.log(`- ${flow.replace('.json.hbs', '')}`));
  } catch (error) {
    console.error('Error listing resources:', (error as Error).message);
    console.error('Make sure the prompts/ and workflows/ directories exist.');
    process.exit(1);
  }
};

const runPrompt = async (slug: string, agentName: string): Promise<void> => {
  try {
    const preset = loadPromptPreset(slug);
    const response = await dispatchPrompt(preset, agentName);
    console.log(response);
  } catch (error) {
    console.error(`Error running prompt '${slug}':`, (error as Error).message);
    console.error(`Make sure the file prompts/${slug}.yml exists and is valid.`);
    process.exit(1);
  }
};

const renderWorkflow = async (templateName: string): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), 'workflows', `${templateName}.json.hbs`);
    const source = fs.readFileSync(filePath, 'utf-8');
    const payload = renderTemplate(source, {
      input: 'input.mp4',
      output: 'output.mp4',
      filters: ['scale=1280:-1', 'format=yuv420p'],
      bitrate: '6M',
    });
    console.log(payload);
  } catch (error) {
    console.error(`Error rendering workflow '${templateName}':`, (error as Error).message);
    console.error(`Make sure the file workflows/${templateName}.json.hbs exists.`);
    process.exit(1);
  }
};

const renderCanva = async (templateName: string): Promise<void> => {
  try {
    const payload = renderCanvaBatch(templateName, {
      brand: 'Blackroad',
      assets: ['cover.png', 'thumbnail.png'],
      agent: process.env.CREATOR_AGENT || 'lucidia',
    });
    const response = await sendToCanva(payload);
    console.log(response);
  } catch (error) {
    console.error(`Error rendering Canva template '${templateName}':`, (error as Error).message);
    console.error(`Make sure the file workflows/${templateName}.json.hbs exists.`);
    process.exit(1);
  }
};

const usage = () => {
  console.log('Usage: br-create <command>');
  console.log('Commands:');
  console.log('  list');
  console.log('  run <prompt> [--agent name]');
  console.log('  render <workflow>');
  console.log('  render-canva <workflow>');
};

const main = async () => {
  switch (command) {
    case 'list':
      list();
      break;
    case 'run': {
      const slug = args[1];
      if (!slug) {
        console.error('Error: Missing prompt name.');
        console.error('Usage: br-create run <prompt> [--agent name]');
        process.exit(1);
      }
      const agentFlagIndex = args.indexOf('--agent');
      const agentName =
        agentFlagIndex >= 0 && args[agentFlagIndex + 1]
          ? args[agentFlagIndex + 1]
          : process.env.CREATOR_AGENT || 'lucidia';
      await runPrompt(slug, agentName);
      break;
    }
    case 'render':
      if (!args[1]) {
        console.error('Error: Missing workflow name.');
        console.error('Usage: br-create render <workflow>');
        process.exit(1);
      }
      await renderWorkflow(args[1]);
      break;
    case 'render-canva':
      if (!args[1]) {
        console.error('Error: Missing workflow name.');
        console.error('Usage: br-create render-canva <workflow>');
        process.exit(1);
      }
      await renderCanva(args[1]);
      break;
    default:
      usage();
  }
};

main().catch((error) => {
  console.error('An unexpected error occurred while running the command.');
  console.error('Error details:', (error as Error).message);
  if ((error as Error).stack) {
    console.error('\nStack trace:', (error as Error).stack);
  }
  process.exit(1);
});
