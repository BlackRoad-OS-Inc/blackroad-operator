import { z } from "zod";

const lineageSchema = z
  .object({
    mentors: z.array(z.string().min(1)).default([]),
    ancestry_depth: z.number().int().min(0),
    memory: z.string().min(1),
    guardian: z.string().min(1),
    relay: z.string().min(1),
  })
  .strict();

const traitsSchema = z
  .object({
    kindness_index: z.number(),
    creativity_bias: z.number(),
    reflection_frequency: z.union([z.string(), z.number()]),
  })
  .strict();

export const manifestSchema = z
  .object({
    id: z.string().min(1),
    cluster: z.string().min(1),
    generation: z.enum(["seed", "apprentice", "hybrid", "elder"]),
    parent: z.string().min(1),
    lineage: lineageSchema,
    traits: traitsSchema,
    covenants: z.array(z.string().min(1)),
    ethos: z.string().min(1),
  })
  .strict();

export type ManifestInput = z.input<typeof manifestSchema>;
