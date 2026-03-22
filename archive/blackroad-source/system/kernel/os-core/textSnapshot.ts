import type { PsShaInfinity } from "../identity/identityTypes";

export interface TextSnapshot {
  id: PsShaInfinity;
  createdAt: string;
  sourceSystem: string;
  authorId?: PsShaInfinity;
  content: string;
  hash: string;
  metadata?: Record<string, unknown>;
}
