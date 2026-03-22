import type { z } from "zod";
import { manifestSchema } from "./schema";

export type Manifest = z.infer<typeof manifestSchema>;

export type AgentSummary = Pick<Manifest, "id" | "cluster" | "generation" | "ethos"> & {
  covenants: Manifest["covenants"];
};
