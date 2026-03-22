import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderTemplate } from '../lib/template.js';

interface CanvaJobContext {
  brand: string;
  assets: string[];
  agent: string;
}

export const renderCanvaBatch = (templateName: string, context: CanvaJobContext): string => {
  const filePath = path.join(process.cwd(), 'workflows', `${templateName}.json.hbs`);
  const source = readFileSync(filePath, 'utf-8');
  const rendered = renderTemplate(source, context);
  return rendered;
};

export const sendToCanva = async (payload: string): Promise<string> => {
  const token = process.env.CANVA_API_TOKEN || 'unset-token';
  // Placeholder for Canva API call.
  return Promise.resolve(`POST /canva with token=${token}\n${payload}`);
};
