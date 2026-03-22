import { z } from "zod";
import { trust, inCovenant } from "./trust.js";
import { canEmit } from "./emit.js";

export const vitalsSchema = z.object({
  id: z.string(),
  C: z.number(),
  Tr: z.number(),
  S: z.number(),
  tags: z.array(z.string()).default([]),
});

export function handleIngest(body: unknown) {
  const v = vitalsSchema.parse(body);
  const T = trust(v.C, v.Tr, v.S);
  const allowed = canEmit(inCovenant(v.tags), T);
  return { id: v.id, T, allowed };
}
