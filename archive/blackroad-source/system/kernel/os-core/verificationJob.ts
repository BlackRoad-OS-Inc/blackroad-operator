import type { PsShaInfinity } from "../identity/identityTypes";
import type { IdentityHash } from "../identity/registry";

export type VerificationKind =
  | "factual_consistency"
  | "policy_compliance"
  | "safety"
  | "classification"
  | "custom";

export type VerificationStatus = "pending" | "running" | "completed" | "failed";

export interface VerificationJob {
  id: PsShaInfinity;
  createdAt: string;
  snapshotId: PsShaInfinity;
  kind: VerificationKind;
  status: VerificationStatus;
  requestedBy: string;
  parameters?: Record<string, unknown>;
  ledgerTxId?: string;

  // Identity anchoring (Genesis Block 0)
  authorizedBy: IdentityHash; // Must be genesis principal, operator, or delegated agent
  authorityChain?: IdentityHash[]; // Full delegation chain back to genesis
}
