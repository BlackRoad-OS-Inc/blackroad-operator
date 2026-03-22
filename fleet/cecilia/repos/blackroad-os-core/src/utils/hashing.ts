import { createHash } from "crypto";
import type { JournalEntry } from "../events/journalEntry";

export type HashableJournalEntry = Omit<JournalEntry, "hash">;

export function hashJournalEntry(entry: HashableJournalEntry): string {
  const serialized = JSON.stringify(entry);
  return createHash("sha256").update(serialized).digest("hex");
}

export function withJournalHash(entry: HashableJournalEntry): JournalEntry {
  const hash = hashJournalEntry(entry);
  return { ...entry, hash };
}
