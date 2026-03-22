import type { PsShaInfinity } from "../identity/identityTypes";
import type { IdentityHash } from "../identity/registry";

export interface RoadChainBlock {
  height: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  journalEntryIds: PsShaInfinity[];

  // Identity anchoring (Genesis Block 0)
  authorizedBy: IdentityHash; // Identity that authorized this block
  witnessedBy?: IdentityHash[]; // Additional witnessing identities
}
