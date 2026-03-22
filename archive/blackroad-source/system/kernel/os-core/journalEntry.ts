import type { DomainEvent } from "./domainEvent";
import type { PsShaInfinity } from "../identity/identityTypes";

export interface JournalEntry {
  id: PsShaInfinity;
  event: DomainEvent;
  hash: string;
  previousHash: string;
  timestamp: string;
}
