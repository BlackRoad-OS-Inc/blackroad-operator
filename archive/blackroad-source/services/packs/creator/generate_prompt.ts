import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { promptPresetSchema, PromptPreset } from '../lib/schema.js';

export const loadPromptPreset = (slug: string): PromptPreset => {
  const filePath = path.join(process.cwd(), 'prompts', `${slug}.yml`);
  const file = fs.readFileSync(filePath, 'utf-8');
  const data = yaml.load(file);
  const parsed = promptPresetSchema.parse(data);
  return parsed;
};

export const renderPrompt = (preset: PromptPreset, agentName: string): string => {
  const steps = preset.steps.map((step, index) => `${index + 1}. ${step.text}`).join('\n');
  const header = `# ${preset.title}\nmodel: ${preset.model}\nagent: ${agentName}`;
  const notes = preset.notes ? `\n\nNotes:\n${preset.notes}` : '';
  return `${header}\n\n${preset.description}\n\nSteps:\n${steps}${notes}`;
};

export const dispatchPrompt = async (preset: PromptPreset, agentName: string): Promise<string> => {
  const promptText = renderPrompt(preset, agentName);
  // Placeholder for SDK call to OpenAI or internal agent.
  // TODO(creator-pack-next): Stream completions to file for downstream workflows.
  return Promise.resolve(`Sent to ${agentName}:\n${promptText}`);
};
