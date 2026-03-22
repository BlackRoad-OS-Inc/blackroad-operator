import { z } from 'zod';

export const promptStepSchema = z.object({
  text: z.string(),
});

export const promptPresetSchema = z.object({
  title: z.string(),
  description: z.string(),
  model: z.string(),
  tags: z.array(z.string()),
  steps: z.array(promptStepSchema),
  notes: z.string().optional(),
});

export const workflowTemplateSchema = z.object({
  id: z.string(),
  description: z.string(),
  engine: z.enum(['canva', 'ffmpeg']),
  template: z.unknown(),
});

export type PromptPreset = z.infer<typeof promptPresetSchema>;
export type WorkflowTemplate = z.infer<typeof workflowTemplateSchema>;
